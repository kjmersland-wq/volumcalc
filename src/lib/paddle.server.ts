import { Environment, Paddle, EventName } from '@paddle/paddle-node-sdk';

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not configured`);
  return value;
};

export { EventName };

// Only the live Paddle account is used. The type keeps its old shape so the
// webhook handlers (which pass the environment around) did not need rewriting.
export type PaddleEnv = 'sandbox' | 'live';

const PADDLE_API_BASE_URL = 'https://api.paddle.com';

function assertLive(env: PaddleEnv): void {
  if (env !== 'live') throw new Error('Only the live Paddle environment is configured');
}

export function getConnectionApiKey(env: PaddleEnv): string {
  assertLive(env);
  return getEnv('PADDLE_LIVE_API_KEY');
}

/** Paddle SDK client talking directly to api.paddle.com with the server-side API key. */
export function getPaddleClient(env: PaddleEnv): Paddle {
  return new Paddle(getConnectionApiKey(env), { environment: Environment.production });
}

// For Paddle REST API calls not supported by the SDK (e.g. external_id filtering).
export async function paddleFetch(env: PaddleEnv, path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${PADDLE_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getConnectionApiKey(env)}`,
      ...init?.headers,
    },
  });
}

/** Paddle.js client-side token. It is public by design, but must be a live token. */
export function getPaddleClientToken(): string {
  const token =
    process.env['PADDLE_CLIENT_TOKEN'] ||
    process.env['VITE_PADDLE_CLIENT_TOKEN'] ||
    process.env['VITE_PAYMENTS_CLIENT_TOKEN'];
  if (!token) throw new Error('PADDLE_CLIENT_TOKEN is not configured');
  if (!token.startsWith('live_')) throw new Error('PADDLE_CLIENT_TOKEN must be a live token (live_…)');
  return token;
}

export function getWebhookSecret(env: PaddleEnv): string {
  assertLive(env);
  const secret = process.env['PADDLE_WEBHOOK_SECRET'] || process.env['PAYMENTS_LIVE_WEBHOOK_SECRET'];
  if (!secret) throw new Error('PADDLE_WEBHOOK_SECRET is not configured');
  return secret;
}

export async function verifyWebhook(req: Request, env: PaddleEnv) {
  const signature = req.headers.get('paddle-signature');
  const body = await req.text();
  const secret = getWebhookSecret(env);

  if (!signature || !body) {
    throw new Error('Missing signature or body');
  }

  const paddle = getPaddleClient(env);
  // IMPORTANT: unmarshal is async
  return await paddle.webhooks.unmarshal(body, secret, signature);
}
