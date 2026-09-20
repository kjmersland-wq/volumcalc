
ALTER TABLE public.estimates
  ADD COLUMN IF NOT EXISTS storage_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS storage_company text,
  ADD COLUMN IF NOT EXISTS storage_address text,
  ADD COLUMN IF NOT EXISTS storage_contact text,
  ADD COLUMN IF NOT EXISTS storage_phone text,
  ADD COLUMN IF NOT EXISTS delivery_address text,
  ADD COLUMN IF NOT EXISTS delivery_floor text,
  ADD COLUMN IF NOT EXISTS delivery_elevator boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS delivery_carry_distance text,
  ADD COLUMN IF NOT EXISTS delivery_notes text,
  ADD COLUMN IF NOT EXISTS packing_requested boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS packing_level text,
  ADD COLUMN IF NOT EXISTS packing_materials jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS packing_notes text,
  ADD COLUMN IF NOT EXISTS tender_mode boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS report_language text NOT NULL DEFAULT 'no';

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS org_number text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS website text;

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'unlimited', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'unlimited'::public.app_role FROM auth.users WHERE email = 'kjmersland@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'kjmersland@gmail.com'
ON CONFLICT DO NOTHING;
