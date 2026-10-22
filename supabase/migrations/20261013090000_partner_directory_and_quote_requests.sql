-- Partner directory for private customers: movers that have agreed to receive
-- quote requests, matched on route (from/to country) and volume.
-- lead_email is only ever read server-side with the service role.

CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  website text,
  country_code char(2) NOT NULL CHECK (country_code = upper(country_code)),
  lead_email text NOT NULL,
  serves_from text[] NOT NULL DEFAULT '{}',
  serves_to text[] NOT NULL DEFAULT '{}',
  min_m3 numeric CHECK (min_m3 IS NULL OR min_m3 >= 0),
  max_m3 numeric CHECK (max_m3 IS NULL OR max_m3 >= 0),
  languages text[] NOT NULL DEFAULT '{}',
  priority integer NOT NULL DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  agreed_at timestamptz,
  agreement_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS partners_active_idx ON public.partners (active, priority);

GRANT ALL ON public.partners TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners TO authenticated;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage partners" ON public.partners;
CREATE POLICY "Admins manage partners"
  ON public.partners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- One row per quote request sent to a partner (separate from public.quote_requests,
-- which holds customer requests sent to a moving company account): audit trail, consent record and
-- protection against sending the same report to the same partner twice.
CREATE TABLE IF NOT EXISTS public.partner_quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  error text,
  transport_insurance boolean,
  customer_consent_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (estimate_id, partner_id)
);

CREATE INDEX IF NOT EXISTS partner_quote_requests_estimate_idx ON public.partner_quote_requests (estimate_id);

GRANT ALL ON public.partner_quote_requests TO service_role;
GRANT SELECT ON public.partner_quote_requests TO authenticated;
ALTER TABLE public.partner_quote_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read partner quote requests" ON public.partner_quote_requests;
CREATE POLICY "Admins read partner quote requests"
  ON public.partner_quote_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Route and insurance choice stored on the estimate itself so they follow the
-- report to every device and into the request sent to movers.
ALTER TABLE public.estimates
  ADD COLUMN IF NOT EXISTS move_from_country char(2) CHECK (move_from_country IS NULL OR move_from_country = upper(move_from_country)),
  ADD COLUMN IF NOT EXISTS move_to_country char(2) CHECK (move_to_country IS NULL OR move_to_country = upper(move_to_country)),
  ADD COLUMN IF NOT EXISTS transport_insurance boolean;
