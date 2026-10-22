import { createServerFn } from "@tanstack/react-start";

/**
 * Hands the public Paddle.js client token to the browser at runtime, so the
 * token can live in a plain server environment variable (PADDLE_CLIENT_TOKEN)
 * instead of being baked into the build as a VITE_* value.
 */
export const getPaddleClientToken = createServerFn({ method: "GET" }).handler(async () => {
  const { getPaddleClientToken: readToken } = await import("./paddle.server");
  return { token: readToken() };
});
