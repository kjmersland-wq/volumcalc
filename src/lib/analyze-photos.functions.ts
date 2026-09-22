import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { catalogForRoom } from "./volume-database";
import { roomTemplateForName } from "./rooms";
import { callAIGatewayVisionJson, GEMINI_3_8_FLASH_MODEL } from "./ai-gateway.server";

/**
 * Confirms the signed-in caller holds the 'admin' or 'unlimited' role.
 * Same pattern as assertAdmin() in admin.functions.ts: the role is read
 * through the caller's own RLS-scoped client, so it can never be spoofed.
 * There is no automated way today for a paying company to receive
 * 'unlimited' beyond this manually-seeded role (no Stripe webhook wires a
 * subscription to it), so this intentionally only ever grants access to
 * accounts an operator has explicitly assigned the role to — never free by
 * default for an ordinary visitor.
 */
async function assertUnlimitedOrAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .in("role", ["admin", "unlimited"]);
  if (error || !data || data.length === 0) {
    throw new Error("AI photo analysis is not available on this account");
  }
}

const analyzeSchema = z.object({
  room: z.string().trim().min(1).max(50),
  photo_urls: z.array(z.string().trim().url().max(2000)).min(1).max(10),
});

const suggestedItemSchema = z.object({
  key: z.string(),
  quantity: z.number().int().min(0).max(50),
});

/**
 * Suggests quantities for catalog items recognized in a room's photos, using
 * Gemini 3.8 Flash via the AI Gateway (see ai-gateway.server.ts for the
 * unverified wire-contract caveat). This never writes to the database and
 * never touches manual_items/createEstimate — it only returns suggestions
 * for the client to pre-fill into the existing quantities state, which the
 * visitor can still freely adjust. The model may only choose from this
 * room's actual catalog keys (never invents new items), and the response is
 * re-validated server-side against that same catalog before being returned,
 * regardless of what the model claims.
 */
export const analyzeRoomPhotos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => analyzeSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertUnlimitedOrAdmin(context as any);

    const template = roomTemplateForName(data.room);
    const catalog = catalogForRoom(template);
    const catalogKeys = catalog.map((item) => item.key);

    const systemPrompt =
      "You identify furniture and household items visible in room photos, for a moving-volume estimate. " +
      "You may ONLY use item keys from the catalog list given to you — never invent new items or keys. " +
      "Only include an item if you can see it with reasonable confidence.";
    const userPrompt =
      `Catalog for this room (choose only from these keys):\n` +
      catalog.map((item) => `- ${item.key}: ${item.name}`).join("\n") +
      `\n\nFor each catalog item you can identify in the photo(s), report how many you see.`;

    const jsonSchema = {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              key: { type: "string", enum: catalogKeys },
              quantity: { type: "integer", minimum: 0, maximum: 50 },
            },
            required: ["key", "quantity"],
            additionalProperties: false,
          },
        },
      },
      required: ["items"],
      additionalProperties: false,
    };

    // Caught here (rather than left to throw across the server-fn RPC
    // boundary) so the exact diagnostic message — status code, response
    // body, etc. — reaches the client unmodified instead of risking being
    // generalized by the framework's error serialization, same reasoning as
    // createCheckoutSession's error handling in payments.functions.ts.
    let result: unknown;
    try {
      result = await callAIGatewayVisionJson({
        model: GEMINI_3_8_FLASH_MODEL,
        systemPrompt,
        userPrompt,
        imageUrls: data.photo_urls,
        jsonSchemaName: "room_items",
        jsonSchema,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("analyzeRoomPhotos: AI Gateway call failed", message);
      return { error: message };
    }

    const parsed = z.object({ items: z.array(suggestedItemSchema) }).safeParse(result);
    if (!parsed.success) {
      const message = `AI response did not match the expected format: ${JSON.stringify(result).slice(0, 300)}`;
      console.error("analyzeRoomPhotos:", message);
      return { error: message };
    }

    // TEMPORARY diagnostic logging — remove once the low/zero-match issue is resolved.
    console.error(
      "analyzeRoomPhotos: raw AI suggestions for room",
      data.room,
      "(catalog keys offered:",
      catalogKeys,
      ") ->",
      JSON.stringify(parsed.data.items),
    );

    // Defense in depth: even though the schema's enum already restricts this,
    // never trust model output blindly — drop anything not in this room's
    // actual catalog and anything with a non-positive quantity.
    const catalogKeySet = new Set(catalogKeys);
    const suggestions = parsed.data.items.filter(
      (item) => catalogKeySet.has(item.key) && item.quantity > 0,
    );

    // TEMPORARY: raw model output + the catalog keys it was constrained to,
    // returned to the client so it's visible in the browser console during
    // this investigation without needing Lovable Cloud's function logs.
    return { suggestions, debug_raw_items: parsed.data.items, debug_catalog_keys: catalogKeys };
  });
