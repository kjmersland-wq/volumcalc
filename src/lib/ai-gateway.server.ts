/**
 * Confirmed working contract (verified via a live call, generated/tested by
 * Lovable's own in-editor AI assistant — the endpoint at
 * ai.gateway.lovable.dev, not connector-gateway.lovable.dev, was the fix).
 * OpenAI Chat-Completions-compatible request/response shape, authenticated
 * with a `Lovable-API-Key` header — no separate provider API key needed.
 */

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Overridable without a code change if the gateway renames/retires the model.
export const GEMINI_3_8_FLASH_MODEL = process.env["AI_VISION_MODEL"] || "google/gemini-3.8-flash";

type ChatCompletionResponse = {
  choices?: { message?: { content?: string } }[];
};

export type AIFailureKind =
  | "temporary" // 5xx / network / rate limit after retries
  | "rate_limit"
  | "no_credits"
  | "auth" // missing/invalid LOVABLE_API_KEY
  | "model" // model name rejected
  | "images" // images inaccessible, too large or rejected
  | "timeout"
  | "bad_response"
  | "access" // account may not use AI analysis
  | "unknown";

export class AIGatewayError extends Error {
  constructor(
    public kind: AIFailureKind,
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "AIGatewayError";
  }
}

const REQUEST_TIMEOUT_MS = 45_000;
const MAX_ATTEMPTS = 3; // 1 try + 2 retries
const RETRY_DELAY_MS = 1_500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function classifyHttpError(status: number, body: string): AIGatewayError {
  const detail = `AI Gateway ${status} at ${AI_GATEWAY_URL}: ${body.slice(0, 500)}`;
  const lower = body.toLowerCase();
  if (status === 402 || lower.includes("credit") || lower.includes("payment required")) {
    return new AIGatewayError("no_credits", detail, status);
  }
  if (status === 401 || status === 403) return new AIGatewayError("auth", detail, status);
  if (status === 429) return new AIGatewayError("rate_limit", detail, status);
  if (status === 408 || status === 504) return new AIGatewayError("timeout", detail, status);
  if (status >= 500) return new AIGatewayError("temporary", detail, status);
  if (status === 404 || (lower.includes("model") && (lower.includes("not found") || lower.includes("invalid") || lower.includes("unsupported")))) {
    return new AIGatewayError("model", detail, status);
  }
  if (status === 413 || lower.includes("image") || lower.includes("url") || lower.includes("fetch")) {
    return new AIGatewayError("images", detail, status);
  }
  return new AIGatewayError("unknown", detail, status);
}

const isRetryable = (error: AIGatewayError) =>
  error.kind === "temporary" || error.kind === "rate_limit" || error.kind === "timeout";

async function attemptOnce(apiKey: string, requestBody: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
      body: requestBody,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    throw new AIGatewayError(
      timedOut ? "timeout" : "temporary",
      timedOut
        ? `AI Gateway did not answer within ${REQUEST_TIMEOUT_MS / 1000}s`
        : `Could not reach the AI Gateway at ${AI_GATEWAY_URL}: ${String(error)}`,
    );
  }

  if (!response.ok) {
    throw classifyHttpError(response.status, await response.text().catch(() => ""));
  }

  const payload = (await response.json().catch(() => null)) as ChatCompletionResponse | null;
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new AIGatewayError("bad_response", `AI Gateway returned no content: ${JSON.stringify(payload).slice(0, 500)}`);
  }
  try {
    return JSON.parse(content);
  } catch {
    throw new AIGatewayError("bad_response", `AI Gateway response was not valid JSON: ${content.slice(0, 200)}`);
  }
}

/**
 * Sends a vision + structured-JSON-output request to the AI Gateway, with a
 * per-attempt timeout and up to 2 retries (short delay) for transient errors
 * (5xx, network, timeout, 429). Throws AIGatewayError with a `kind` the
 * caller can turn into a specific user-facing message.
 */
export async function callAIGatewayVisionJson(params: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  imageUrls: string[];
  jsonSchemaName: string;
  jsonSchema: Record<string, unknown>;
}): Promise<unknown> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AIGatewayError("auth", "LOVABLE_API_KEY is not configured in this environment");

  const requestBody = JSON.stringify({
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
  });

  let lastError: AIGatewayError | undefined;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await attemptOnce(apiKey, requestBody);
    } catch (error) {
      const gatewayError =
        error instanceof AIGatewayError ? error : new AIGatewayError("unknown", String(error));
      lastError = gatewayError;
      console.error(
        `AI Gateway attempt ${attempt}/${MAX_ATTEMPTS} failed [${gatewayError.kind}] model=${params.model} images=${params.imageUrls.length}: ${gatewayError.message}`,
      );
      if (!isRetryable(gatewayError) || attempt === MAX_ATTEMPTS) break;
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  throw lastError!;
}
