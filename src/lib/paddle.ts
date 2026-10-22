import { PADDLE_PRICE_IDS, type PlanKey } from "@/lib/paddle-prices";
import { getPaddleClientToken } from "@/lib/paddle.functions";

declare global {
  interface Window {
    Paddle: any;
  }
}

// Only the live Paddle account is used; there is no sandbox mode.
export function getPaddleEnvironment(): "sandbox" | "live" {
  return "live";
}

let initPromise: Promise<void> | null = null;

function loadPaddleScript(): Promise<void> {
  if (typeof window !== "undefined" && window.Paddle) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Paddle.js could not be loaded"));
    document.head.appendChild(script);
  });
}

export async function initializePaddle() {
  if (!initPromise) {
    initPromise = (async () => {
      const [{ token }] = await Promise.all([getPaddleClientToken(), loadPaddleScript()]);
      // Paddle.js expects "production" for the live account.
      window.Paddle.Environment.set("production");
      window.Paddle.Initialize({ token });
    })();
    // Allow a retry after a failure instead of caching the rejected promise.
    initPromise.catch(() => {
      initPromise = null;
    });
  }
  return initPromise;
}

export function getPaddlePriceId(plan: PlanKey): string {
  const id = PADDLE_PRICE_IDS[plan];
  if (!id) throw new Error(`Unknown plan: ${plan}`);
  return id;
}
