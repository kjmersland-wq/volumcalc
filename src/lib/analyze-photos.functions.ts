import { createServerFn } from "@tanstack/react-start";
import { requireOwner } from "@/lib/owner-middleware";
import { z } from "zod";
import { catalogForRoom } from "./volume-database";
import { roomTemplateForName } from "./rooms";
import {
  AIGatewayError,
  callAIGatewayVisionJson,
  GEMINI_3_8_FLASH_MODEL,
  type AIFailureKind,
} from "./ai-gateway.server";

/**
 * Confirms the signed-in caller holds the 'admin'/'unlimited' role, OR has
 * an active paid plan (payments/webhook.ts grants these via
 * grant_estimate_credits after a real Stripe payment): unlimited_until in
 * the future (Business/Enterprise), or at least one remaining credit
 * (single/3-estimate one-time purchases). Both reads go through the
 * caller's own RLS-scoped client, so neither can be spoofed. Role is
 * checked first and short-circuits — admin/unlimited accounts never touch
 * user_credits at all.
 */
async function assertUnlimitedOrAdmin(context: { supabase: any; userId: string }) {
  const { data: roles, error: rolesError } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .in("role", ["admin", "unlimited"]);
  if (!rolesError && roles && roles.length > 0) return;

  const { data: credits } = await context.supabase
    .from("user_credits")
    .select("credits, unlimited_until")
    .eq("user_id", context.userId)
    .maybeSingle();
  const isUnlimited = Boolean(credits?.unlimited_until && new Date(credits.unlimited_until) > new Date());
  const hasCredits = Boolean(credits?.credits && credits.credits > 0);
  if (!isUnlimited && !hasCredits) {
    throw new AIGatewayError("access", "AI photo analysis is not available on this account");
  }
}

const analyzeSchema = z.object({
  room: z.string().trim().min(1).max(50),
  photo_urls: z.array(z.string().trim().url().max(2000)).min(1),
});

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

/**
 * Confirms each photo URL is reachable from the public internet (the same
 * way the external Gateway will fetch it), is an image, and isn't huge.
 * Unreachable photos are dropped; the failure reasons are returned for logs.
 */
async function filterReachableImages(urls: string[]) {
  const checks = await Promise.all(
    urls.map(async (url) => {
      try {
        let res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) });
        if (res.status === 405 || res.status === 501) {
          res = await fetch(url, { headers: { Range: "bytes=0-0" }, signal: AbortSignal.timeout(8000) });
        }
        if (!res.ok && res.status !== 206) return { url, ok: false, reason: `HTTP ${res.status}` };
        const type = res.headers.get("content-type") ?? "";
        if (!type.startsWith("image/")) return { url, ok: false, reason: `not an image (${type || "no content-type"})` };
        const length = Number(res.headers.get("content-length") ?? 0);
        if (length > MAX_IMAGE_BYTES) return { url, ok: false, reason: `too large (${length} bytes)` };
        return { url, ok: true as const, reason: "" };
      } catch (error) {
        return { url, ok: false, reason: String(error) };
      }
    }),
  );
  return {
    reachable: checks.filter((c) => c.ok).map((c) => c.url),
    problems: checks.filter((c) => !c.ok).map((c) => `${c.url.split("?")[0]}: ${c.reason}`),
  };
}

export type AnalyzeFailureKind = AIFailureKind;

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
  .middleware([requireOwner])
  .inputValidator((data: unknown) => analyzeSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      return await runAnalysis(data, context);
    } catch (error) {
      // Always return a structured failure instead of throwing across the
      // server-fn boundary, so the client can show a specific reason.
      const kind: AnalyzeFailureKind = error instanceof AIGatewayError ? error.kind : "unknown";
      const message = error instanceof Error ? error.message : String(error);
      console.error(`analyzeRoomPhotos failed [${kind}]:`, message);
      return { error: message, kind };
    }
  });

async function runAnalysis(
  data: z.infer<typeof analyzeSchema>,
  context: { isOwner?: boolean; supabase: any; userId: string },
) {
    if (!context.isOwner) await assertUnlimitedOrAdmin(context);

    const { reachable, problems } = await filterReachableImages(data.photo_urls);
    if (problems.length > 0) console.error("analyzeRoomPhotos: unusable photos:", problems.join(" | "));
    if (reachable.length === 0) {
      throw new AIGatewayError("images", `None of the photos could be fetched: ${problems.join(" | ")}`);
    }

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

    const result = await callAIGatewayVisionJson({
      model: GEMINI_3_8_FLASH_MODEL,
      systemPrompt,
      userPrompt,
      imageUrls: reachable,
      jsonSchemaName: "room_items",
      jsonSchema,
    });

    const parsed = z.object({ items: z.array(suggestedItemSchema) }).safeParse(result);
    if (!parsed.success) {
      throw new AIGatewayError(
        "bad_response",
        `AI response did not match the expected format: ${JSON.stringify(result).slice(0, 300)}`,
      );
    }

    // Defense in depth: even though the schema's enum already restricts this,
    // never trust model output blindly — drop anything not in this room's
    // actual catalog and anything with a non-positive quantity.
    const catalogKeySet = new Set(catalogKeys);
    const suggestions = parsed.data.items.filter(
      (item) => catalogKeySet.has(item.key) && item.quantity > 0,
    );

    return { suggestions };
}
