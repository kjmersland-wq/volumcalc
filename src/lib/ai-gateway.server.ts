/**
 * UNVERIFIED CONTRACT — read before touching this file.
 *
 * Lovable's public docs (docs.lovable.dev/features/ai) confirm the AI
 * Gateway connector exists, lists its model catalog, and state calls are
 * billed through the Lovable workspace with no separate API key — but they
 * do not publish the actual endpoint path or request/response shape.
 *
 * This mirrors the one proven pattern in this codebase for a Lovable
 * connector — stripe.server.ts's connector-gateway.lovable.dev + a
 * `Lovable-API-Key`/`LOVABLE_API_KEY` header — and assumes an
 * OpenAI Chat-Completions-compatible request/response shape, since that is
 * the common convention multi-provider AI gateways use so callers can swap
 * models by only changing the `model` string. Neither the base URL nor the
 * request shape has been confirmed against a live call yet.
 *
 * If this 404s/401s or the response doesn't parse, the fix is almost
 * certainly this file alone (the URL, header name, or body shape) — not the
 * server function that calls it.
 */

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not configured`);
  return value;
};

const AI_GATEWAY_URL = "https://connector-gateway.lovable.dev/openai/v1/chat/completions";

export const GEMINI_3_8_FLASH_MODEL = "google/gemini-3.8-flash";

type ChatCompletionResponse = {
  choices?: { message?: { content?: string } }[];
};

/**
 * Sends a vision + structured-JSON-output request to the AI Gateway.
 * Returns the parsed JSON the model produced. Throws on any HTTP error, a
 * missing response body, or a body that isn't valid JSON.
 */
export async function callAIGatewayVisionJson(params: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  imageUrls: string[];
  jsonSchemaName: string;
  jsonSchema: Record<string, unknown>;
}): Promise<unknown> {
  const lovableApiKey = getEnv("LOVABLE_API_KEY");

  const response = await fetch(AI_GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": lovableApiKey,
    },
    body: JSON.stringify({
      model: params.model,
      messages: [
        { role: "system", content: params.systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: params.userPrompt },
            ...params.imageUrls.map((url) => ({ type: "image_url", image_url: { url } })),
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: params.jsonSchemaName, schema: params.jsonSchema, strict: true },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`AI Gateway request failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const payload = (await response.json()) as ChatCompletionResponse;
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI Gateway returned no content");

  try {
    return JSON.parse(content);
  } catch {
    throw new Error("AI Gateway response was not valid JSON");
  }
}
