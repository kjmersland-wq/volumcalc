ALTER TABLE public.estimate_items
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_included boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE public.estimates
  ADD COLUMN IF NOT EXISTS access_floor integer,
  ADD COLUMN IF NOT EXISTS has_elevator boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS carry_distance_m integer,
  ADD COLUMN IF NOT EXISTS access_notes text,
  ADD COLUMN IF NOT EXISTS internal_notes text;

CREATE TABLE IF NOT EXISTS public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text,
  email text,
  message text,
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.quote_requests TO authenticated;
GRANT ALL ON public.quote_requests TO service_role;

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Companies read their quote requests" ON public.quote_requests;
CREATE POLICY "Companies read their quote requests"
ON public.quote_requests FOR SELECT TO authenticated
USING (
  company_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.estimates e
    WHERE e.id = quote_requests.estimate_id
      AND (e.company_id = auth.uid() OR e.company_id IS NULL)
  )
);

DROP POLICY IF EXISTS "Companies update their quote requests" ON public.quote_requests;
CREATE POLICY "Companies update their quote requests"
ON public.quote_requests FOR UPDATE TO authenticated
USING (
  company_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.estimates e
    WHERE e.id = quote_requests.estimate_id
      AND (e.company_id = auth.uid() OR e.company_id IS NULL)
  )
)
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS quote_requests_estimate_idx ON public.quote_requests(estimate_id);