import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { createStripeClient, type StripeEnv } from "@/lib/stripe.server";

/**
 * Stripe webhook receiver.
 *
 * Registered automatically by the Lovable Stripe integration at
 *   /api/public/payments/webhook?env=live   (and ?env=sandbox)
 *
 * Every delivery is signature-verified, logged to public.payment_events
 * (idempotent on the Stripe event id) and, when it represents a completed
 * purchase, converted into estimate credits for the buying account.
 */

const CREDITS_BY_LOOKUP_KEY: Record<string, number> = {
  volumcalc_single_estimate_nok: 1,
  volumcalc_three_estimates_nok: 3,
  volumcalc_business_monthly_nok: 300,
};

const SUBSCRIPTION_LOOKUP_KEYS = new Set(["volumcalc_business_monthly_nok"]);

function resolveEnv(request: Request): StripeEnv {
  const env = new URL(request.url).searchParams.get("env");
  return env === "sandbox" ? "sandbox" : "live";
}

function webhookSecret(env: StripeEnv): string | undefined {
  return env === "sandbox"
    ? process.env["PAYMENTS_SANDBOX_WEBHOOK_SECRET"]
    : process.env["PAYMENTS_LIVE_WEBHOOK_SECRET"];
}

async function adminClient() {
  const url = process.env["SUPABASE_URL"];
  const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !serviceKey) throw new Error("Supabase service credentials are not configured");
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  });
}

type Purchase = {
  userId: string | null;
  customerId: string | null;
  customerEmail: string | null;
  sessionId: string | null;
  paymentIntentId: string | null;
  subscriptionId: string | null;
  lookupKey: string | null;
  credits: number;
  unlimitedUntil: string | null;
  amountTotal: number | null;
  currency: string | null;
  status: string | null;
};

function idOf(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}

/** Resolves the buyer + purchased plan for a paid checkout session. */
async function fromCheckoutSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<Purchase> {
  let lookupKey: string | null = null;
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 1,
      expand: ["data.price"],
    });
    lookupKey = lineItems.data[0]?.price?.lookup_key ?? null;
  } catch {
    lookupKey = null;
  }

  const credits = lookupKey ? (CREDITS_BY_LOOKUP_KEY[lookupKey] ?? 0) : 0;
  const isSubscription =
    session.mode === "subscription" || (lookupKey ? SUBSCRIPTION_LOOKUP_KEYS.has(lookupKey) : false);

  // A subscription period also grants a rolling one-month access window, so a
  // renewal never leaves a paying customer locked out between top-ups.
  const unlimitedUntil = isSubscription
    ? new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString()
    : null;

  return {
    userId: session.metadata?.["userId"] ?? null,
    customerId: idOf(session.customer),
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
    sessionId: session.id,
    paymentIntentId: idOf(session.payment_intent),
    subscriptionId: idOf(session.subscription),
    lookupKey,
    credits,
    unlimitedUntil,
    amountTotal: session.amount_total ?? null,
    currency: session.currency ?? null,
    status: session.payment_status ?? null,
  };
}

/** Resolves a recurring renewal invoice into another month of plan credits. */
async function fromInvoice(stripe: Stripe, invoice: Stripe.Invoice): Promise<Purchase | null> {
  const line = invoice.lines?.data?.[0];
  const priceId = idOf((line as { price?: unknown } | undefined)?.price);
  let lookupKey: string | null = null;
  if (priceId) {
    try {
      lookupKey = (await stripe.prices.retrieve(priceId)).lookup_key ?? null;
    } catch {
      lookupKey = null;
    }
  }
  if (!lookupKey || !SUBSCRIPTION_LOOKUP_KEYS.has(lookupKey)) return null;

  const customerId = idOf(invoice.customer);
  let userId: string | null = null;
  if (customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (!("deleted" in customer && customer.deleted)) {
        userId = (customer as Stripe.Customer).metadata?.["userId"] ?? null;
      }
    } catch {
      userId = null;
    }
  }

  return {
    userId,
    customerId,
    customerEmail: invoice.customer_email ?? null,
    sessionId: null,
    paymentIntentId: null,
    subscriptionId: idOf((invoice as { subscription?: unknown }).subscription),
    lookupKey,
    credits: CREDITS_BY_LOOKUP_KEY[lookupKey] ?? 0,
    unlimitedUntil: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(),
    amountTotal: invoice.amount_paid ?? null,
    currency: invoice.currency ?? null,
    status: invoice.status ?? null,
  };
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const env = resolveEnv(request);
        const secret = webhookSecret(env);
        const signature = request.headers.get("stripe-signature");
        if (!secret) return new Response("Webhook secret not configured", { status: 500 });
        if (!signature) return new Response("Missing signature", { status: 400 });

        const body = await request.text();
        const stripe = createStripeClient(env);

        let event: Stripe.Event;
        try {
          event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            secret,
            undefined,
            Stripe.createSubtleCryptoProvider(),
          );
        } catch {
          return new Response("Invalid signature", { status: 400 });
        }

        let purchase: Purchase | null = null;
        try {
          if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.payment_status === "paid" || session.mode === "subscription") {
              purchase = await fromCheckoutSession(stripe, session);
            }
          } else if (event.type === "invoice.payment_succeeded") {
            purchase = await fromInvoice(stripe, event.data.object as Stripe.Invoice);
          }
        } catch (error) {
          console.error("[payments/webhook] failed to resolve purchase", event.type, error);
          return new Response("Processing error", { status: 500 });
        }

        try {
          const supabase = await adminClient();

          // The unique stripe_event_id makes replays a no-op.
          const { error: insertError } = await supabase.from("payment_events").insert({
            stripe_event_id: event.id,
            environment: env,
            event_type: event.type,
            user_id: purchase?.userId ?? null,
            customer_id: purchase?.customerId ?? null,
            customer_email: purchase?.customerEmail ?? null,
            session_id: purchase?.sessionId ?? null,
            payment_intent_id: purchase?.paymentIntentId ?? null,
            subscription_id: purchase?.subscriptionId ?? null,
            lookup_key: purchase?.lookupKey ?? null,
            credits_granted: purchase?.credits ?? 0,
            amount_total: purchase?.amountTotal ?? null,
            currency: purchase?.currency ?? null,
            status: purchase?.status ?? null,
          });

          if (insertError) {
            // 23505 = already recorded; acknowledge without granting twice.
            if (insertError.code === "23505") return new Response("ok (duplicate)");
            throw new Error(insertError.message);
          }

          if (purchase?.userId && (purchase.credits > 0 || purchase.unlimitedUntil)) {
            const { error: grantError } = await supabase.rpc("grant_estimate_credits", {
              _user_id: purchase.userId,
              _credits: purchase.credits,
              _unlimited_until: purchase.unlimitedUntil,
              _customer_id: purchase.customerId,
            });
            if (grantError) throw new Error(grantError.message);
          }
        } catch (error) {
          console.error("[payments/webhook] failed to record payment", event.id, error);
          return new Response("Storage error", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
