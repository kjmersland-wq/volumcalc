import { PADDLE_PRICE_IDS, type PlanKey } from "@/lib/paddle-prices";

const clientToken = import.meta.env["VITE_PAYMENTS_CLIENT_TOKEN"];

declare global {
  interface Window {
    Paddle: any;
  }
}

// Single source of truth for which Paddle environment the client is in.
// Derived from the token prefix so it stays correct after the build-time
// token swap. Use this everywhere a PaddleEnv is needed on the client.
export function getPaddleEnvironment(): "sandbox" | "live" {
  return clientToken?.startsWith("test_") ? "sandbox" : "live";
}

let paddleInitialized = false;

export async function initializePaddle() {
  if (paddleInitialized) return;

  if (!clientToken) {
    throw new Error("VITE_PAYMENTS_CLIENT_TOKEN is not set");
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      // Paddle.js expects "production", not "live", for Environment.set().
      const paddleJsEnvironment = getPaddleEnvironment() === "sandbox" ? "sandbox" : "production";
      window.Paddle.Environment.set(paddleJsEnvironment);
      window.Paddle.Initialize({ token: clientToken });
      paddleInitialized = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function getPaddlePriceId(plan: PlanKey): string {
  if (getPaddleEnvironment() === "sandbox") {
    throw new Error("Paddle price IDs are configured for live only");
  }
  const id = PADDLE_PRICE_IDS[plan];
  if (!id) throw new Error(`Unknown plan: ${plan}`);
  return id;
}
