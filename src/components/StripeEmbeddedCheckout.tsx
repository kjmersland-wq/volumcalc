import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { createCheckoutSession } from "@/lib/payments.functions";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";

type Props = {
  priceId: string;
  customerEmail?: string | undefined;
  userId?: string | undefined;
};

export function StripeEmbeddedCheckout({ priceId, customerEmail, userId }: Props) {
  const fetchClientSecret = async () => {
    const result = await createCheckoutSession({
      data: {
        priceId,
        ...(customerEmail && { customerEmail }),
        ...(userId && { userId }),
        environment: getStripeEnvironment(),
        returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      },
    });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("No payment session was returned");
    return result.clientSecret;
  };

  return (
    <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}