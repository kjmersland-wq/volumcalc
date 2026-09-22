import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAIGatewayVisionJson, GEMINI_3_8_FLASH_MODEL } from "./ai-gateway.server";

/**
 * Generic vision -> structured JSON endpoint.
 * Sends an image URL plus a caller-supplied JSON schema to the AI Gateway
 * (Gemini 3.8 Flash) and returns the parsed, schema-shaped JSON.
 * Auth is required so the workspace's AI credits can't be spent anonymously.
 */
const inputSchema = z.object({
  image_url: z.string().trim().url().max(4000),
  prompt: z.string().trim().min(1).max(4000).optional(),
  system_prompt: z.string().trim().min(1).max(4000).optional(),
  schema_name: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_-]{1,64}$/)
    .default("structured_output"),
  json_schema: z.record(z.string(), z.unknown()),
});

export const extractStructuredJsonFromImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const result = await callAIGatewayVisionJson({
        model: GEMINI_3_8_FLASH_MODEL,
        systemPrompt:
          data.system_prompt ??
          "You extract structured data from images. Reply only with JSON matching the given schema. " +
            "Never invent values you cannot see; use null or omit-safe defaults instead.",
        userPrompt: data.prompt ?? "Extract the structured data described by the schema from this image.",
        imageUrls: [data.image_url],
        jsonSchemaName: data.schema_name,
        jsonSchema: data.json_schema,
      });

      return { ok: true as const, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI Gateway request failed";
      // 402/403 credit or policy blocks are terminal - surface, never retry.
      const isCredits = /\((402|403)\)/.test(message) || /credit/i.test(message);
      return {
        ok: false as const,
        error: isCredits ? "payment_required" : "gateway_error",
        message,
      };
    }
  });
