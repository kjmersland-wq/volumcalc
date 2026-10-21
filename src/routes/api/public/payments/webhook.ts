import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhook, EventName, type PaddleEnv } from '@/lib/paddle.server';

// Credits granted per human-readable price ID (one-time purchases).
const PRICE_CREDITS: Record<string, number> = {
  single_estimate_nok: 1,
  three_pack_nok: 3,
};

// Defer client construction until first use so env var availability is not
// assumed at module load time.
let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

/**
 * Records the event row first (idempotent via the unique event-id column).
 * Returns false when the event was already processed.
 * Reuses the existing payment_events table: the unique event column stores
 * the provider event id regardless of which provider sent it.
 */
async function recordPaymentEvent(
  eventId: string,
  env: PaddleEnv,
  values: Record<string, unknown>
): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from('payment_events')
    .insert({ stripe_event_id: eventId, environment: env, ...values })
    .select('id')
    .single();
  if (error) {
    // Unique violation means the event was already processed — not an error.
    if (error.code === '23505') return false;
    console.error('payment_events insert failed:', error);
    return false;
  }
  return Boolean(data);
}

async function handleSubscriptionCreated(data: any, env: PaddleEnv) {
  const { id, customerId, items, status, currentBillingPeriod, customData } = data;

  const userId = customData?.userId;
  if (!userId) {
    console.error('No userId in customData');
    return;
  }

  const item = items[0];
  const priceId = item.price.importMeta?.externalId;
  const productId = item.product.importMeta?.externalId;
  if (!priceId || !productId) {
    // Product/price was not created via create_product / create_price, so we
    // have no human-readable ID to map tiers off.
    console.warn('Skipping subscription: missing importMeta.externalId', {
      rawPriceId: item.price.id,
      rawProductId: item.product.id,
    });
    return;
  }

  await getSupabase().from('subscriptions').upsert(
    {
      user_id: userId,
      paddle_subscription_id: id,
      paddle_customer_id: customerId,
      product_id: productId,
      price_id: priceId,
      status: status,
      current_period_start: currentBillingPeriod?.startsAt,
      current_period_end: currentBillingPeriod?.endsAt,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    {
      // Key on the Paddle subscription ID so re-subscribing after cancel
      // inserts a new row instead of overwriting the canceled one.
      onConflict: 'paddle_subscription_id',
    }
  );
}

async function handleSubscriptionUpdated(data: any, env: PaddleEnv) {
  const { id, status, currentBillingPeriod, scheduledChange } = data;

  await getSupabase()
    .from('subscriptions')
    .update({
      status: status,
      current_period_start: currentBillingPeriod?.startsAt,
      current_period_end: currentBillingPeriod?.endsAt,
      cancel_at_period_end: scheduledChange?.action === 'cancel',
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', id)
    .eq('environment', env);
}

async function handleSubscriptionCanceled(data: any, env: PaddleEnv) {
  await getSupabase()
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', data.id)
    .eq('environment', env);
}

/** One-time purchase: grant estimate credits to the purchasing user. */
async function handleTransactionCompleted(eventId: string, data: any, env: PaddleEnv) {
  const userId = data.customData?.userId;
  if (!userId) {
    console.warn('transaction.completed without customData.userId — no credits granted');
    return;
  }

  const items = data.items ?? [];
  let credits = 0;
  let lookupKey: string | null = null;
  for (const item of items) {
    const externalId = item.price?.importMeta?.externalId;
    if (externalId && PRICE_CREDITS[externalId]) {
      credits += PRICE_CREDITS[externalId];
      lookupKey = externalId;
    }
  }

  const inserted = await recordPaymentEvent(eventId, env, {
    event_type: 'transaction.completed',
    user_id: userId,
    customer_id: data.customerId ?? null,
    customer_email: data.details?.receivedByEmail ?? null,
    session_id: data.checkout?.id ?? null,
    subscription_id: data.subscriptionId ?? null,
    lookup_key: lookupKey,
    credits_granted: credits,
    amount_total: data.details?.totals?.total ?? null,
    currency: data.currencyCode ?? null,
    status: data.status ?? null,
  });
  if (!inserted) return; // duplicate delivery

  if (credits > 0) {
    await getSupabase().rpc('grant_estimate_credits', {
      _user_id: userId,
      _credits: credits,
      _unlimited_until: null,
      _customer_id: data.customerId ?? null,
    });
  }
}

async function handleWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.eventType) {
    case EventName.SubscriptionCreated:
      await handleSubscriptionCreated(event.data, env);
      break;
    case EventName.SubscriptionUpdated:
      await handleSubscriptionUpdated(event.data, env);
      break;
    case EventName.SubscriptionCanceled:
      await handleSubscriptionCanceled(event.data, env);
      break;
    case EventName.TransactionCompleted:
      await handleTransactionCompleted(event.eventId, event.data, env);
      break;
    default:
      // Unhandled events (e.g. transaction.payment_failed) — record and 200.
      console.log('Unhandled event:', event.eventType);
  }
}

export const Route = createFileRoute('/api/public/payments/webhook')({
  staticData: {},
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;
        try {
          await handleWebhook(request, env);
          return Response.json({ received: true });
        } catch (e) {
          console.error('Webhook error:', e);
          return new Response('Webhook error', { status: 400 });
        }
      },
    },
  },
});
