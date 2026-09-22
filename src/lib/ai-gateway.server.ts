/**
 * Confirmed working contract (verified via a live call, generated/tested by
 * Lovable's own in-editor AI assistant — the endpoint at
 * ai.gateway.lovable.dev, not connector-gateway.lovable.dev, was the fix).
 * OpenAI Chat-Completions-compatible request/response shape, authenticated
 * with a `Lovable-API-Key` header — no separate provider API key needed.
 */

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not configured`);
  return value;
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

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

  let response: Response;
  try {
    response = await fetch(AI_GATEWAY_URL, {
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
  } catch (error) {
    console.error(`AI Gateway fetch() itself failed for ${AI_GATEWAY_URL}:`, error);
    throw new Error(`Could not reach the AI Gateway at ${AI_GATEWAY_URL}: ${String(error)}`);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const message = `AI Gateway request failed (${response.status} ${response.statusText}) at ${AI_GATEWAY_URL}: ${body.slice(0, 500)}`;
    console.error(message);
    throw new Error(message);
  }

  const payload = (await response.json()) as ChatCompletionResponse;
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    const raw = JSON.stringify(payload).slice(0, 500);
    console.error("AI Gateway returned no content. Full response:", raw);
    throw new Error(`AI Gateway returned no content. Full response: ${raw}`);
  }

  try {
    return JSON.parse(content);
  } catch {
    console.error("AI Gateway response was not valid JSON. Raw content:", content.slice(0, 500));
    throw new Error(`AI Gateway response was not valid JSON: ${content.slice(0, 200)}`);
  }
}
