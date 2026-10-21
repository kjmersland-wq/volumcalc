import { useState } from "react";
import { initializePaddle, getPaddlePriceId } from "@/lib/paddle";
import type { PlanKey } from "@/lib/paddle-prices";

export function usePaddleCheckout() {
  const [loading, setLoading] = useState(false);

  const openCheckout = async (options: {
    plan: PlanKey;
    quantity: number;
    customerEmail?: string;
    customData?: Record<string, string>;
    successUrl?: string;
  }) => {
    setLoading(true);
    try {
      await initializePaddle();
      const paddlePriceId = getPaddlePriceId(options.plan);

      window.Paddle.Checkout.open({
        items: [{ priceId: paddlePriceId, quantity: options.quantity }],
        customer: options.customerEmail ? { email: options.customerEmail } : undefined,
        customData: options.customData,
        settings: {
          displayMode: "overlay",
          successUrl: options.successUrl || `${window.location.origin}/pricing?checkout=success`,
          allowLogout: false,
          variant: "one-page",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return { openCheckout, loading };
}
