import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type Stripe from "stripe";
import { createStripeClient, getStripeErrorMessage, type StripeEnv } from "@/lib/stripe.server";
import { PURCHASES_ENABLED, PURCHASES_PAUSED_MESSAGE } from "@/lib/purchases";

type CheckoutResult = { clientSecret: string } | { error: string };

type Identity = { userId: string; email?: string };

/**
 * Resolves the billing identity from the caller's Supabase session only.
 * Client-supplied user ids / e-mail addresses are never trusted.
 * Returns null for anonymous callers (Stripe then collects the e-mail itself).
 */
async function resolveIdentity(): Promise<Identity | null> {
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length);
  if (!token || token.split(".").length !== 3) return null;

  const SUPABASE_URL = process.env["SUPABASE_URL"];
  const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.id) return null;
  return { userId: data.user.id, ...(data.user.email && { email: data.user.email }) };
}

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  identity: Identity,
): Promise<string> {
  const found = await stripe.customers.search({
    query: `metadata['userId']:'${identity.userId}'`,
    limit: 1,
  });
  const customer = found.data[0];
  if (customer) return customer.id;

  const created = await stripe.customers.create({
    ...(identity.email && { email: identity.email }),
    metadata: { userId: identity.userId },
  });
  return created.id;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: { priceId: string; returnUrl: string; environment: StripeEnv }) => {
    if (!/^[a-zA-Z0-9_-]+$/.test(data.priceId)) throw new Error("Invalid priceId");
    if (!data.returnUrl.startsWith("http://") && !data.returnUrl.startsWith("https://")) {
      throw new Error("Invalid return URL");
    }
    return { priceId: data.priceId, returnUrl: data.returnUrl, environment: data.environment };
  })
  .handler(async ({ data }): Promise<CheckoutResult> => {
    if (!PURCHASES_ENABLED) return { error: PURCHASES_PAUSED_MESSAGE.en };
    try {
      const identity = await resolveIdentity();
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      const stripePrice = prices.data[0];
      if (!stripePrice) throw new Error("Price not found");
      const isRecurring = stripePrice.type === "recurring";
      const customerId = identity ? await resolveOrCreateCustomer(stripe, identity) : undefined;

      let productDescription: string | undefined;
      if (!isRecurring) {
        const productId =
          typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
        productDescription = (await stripe.products.retrieve(productId)).name;
      }

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: isRecurring ? "subscription" : "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        managed_payments: { enabled: true },
        ...(customerId && { customer: customerId }),
        ...(!isRecurring && { payment_intent_data: { description: productDescription } }),
        ...(identity && {
          metadata: { userId: identity.userId, managed_payments: "true" },
          ...(isRecurring && { subscription_data: { metadata: { userId: identity.userId } } }),
        }),
      } as Stripe.Checkout.SessionCreateParams);

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
