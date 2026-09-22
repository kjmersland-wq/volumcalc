CREATE TABLE public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  environment text NOT NULL,
  event_type text NOT NULL,
  user_id uuid,
  customer_id text,
  customer_email text,
  session_id text,
  payment_intent_id text,
  subscription_id text,
  lookup_key text,
  credits_granted integer NOT NULL DEFAULT 0,
  amount_total integer,
  currency text,
  status text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.payment_events TO service_role;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read payment events"
  ON public.payment_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.user_credits (
  user_id uuid PRIMARY KEY,
  credits integer NOT NULL DEFAULT 0,
  unlimited_until timestamptz,
  stripe_customer_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.user_credits TO authenticated;
GRANT ALL ON public.user_credits TO service_role;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own credits"
  ON public.user_credits FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all credits"
  ON public.user_credits FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.grant_estimate_credits(
  _user_id uuid,
  _credits integer,
  _unlimited_until timestamptz DEFAULT NULL,
  _customer_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits, unlimited_until, stripe_customer_id)
  VALUES (_user_id, GREATEST(_credits, 0), _unlimited_until, _customer_id)
  ON CONFLICT (user_id) DO UPDATE
  SET credits = public.user_credits.credits + GREATEST(_credits, 0),
      unlimited_until = GREATEST(
        COALESCE(public.user_credits.unlimited_until, to_timestamp(0)),
        COALESCE(_unlimited_until, to_timestamp(0))
      ),
      stripe_customer_id = COALESCE(_customer_id, public.user_credits.stripe_customer_id),
      updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.grant_estimate_credits(uuid, integer, timestamptz, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_estimate_credits(uuid, integer, timestamptz, text) TO service_role;