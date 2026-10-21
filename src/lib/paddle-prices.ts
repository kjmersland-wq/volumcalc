// Fixed Paddle price IDs (live). Safe to ship to the client — these are public
// identifiers, not secrets. Prices in Paddle: 11 EUR, 25 EUR, 130 EUR/month.
export type PlanKey = "single" | "three_pack" | "business";

export const PADDLE_PRICE_IDS: Record<PlanKey, string> = {
  single: "pri_01m5f5zzzkzx04bd7eb32bfrna",
  three_pack: "pri_01m5f5zzvm63pkv6gc174yv73r",
  business: "pri_01m5f5zzpz40z267cn0fw2qpsf",
};

// Estimate credits granted per one-time price, keyed by Paddle price ID.
export const PRICE_CREDITS: Record<string, number> = {
  [PADDLE_PRICE_IDS.single]: 1,
  [PADDLE_PRICE_IDS.three_pack]: 3,
};
