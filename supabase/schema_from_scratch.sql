-- VolumCalc: full database schema from scratch.
--
-- Run this ONCE in an empty Supabase project (Dashboard -> SQL Editor). It is every file in
-- supabase/migrations, in order, as one script: companies, estimates, estimate_rooms,
-- estimate_items, quote_requests, contact_messages, profiles, user_roles (+ has_role),
-- user_credits, payment_events, and finally the partner tables (partners, partner_quote_requests).
--
-- Do NOT also run the individual migration files afterwards: they are already included here.
-- If you use the Supabase CLI instead (supabase db push), you do not need this file.

-- ======================================================================
-- 20260920083540_44f3a4c0-be05-41c1-b2c7-ca69eb6b1d77.sql
-- ======================================================================

CREATE TABLE public.companies (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT 'My Moving Company',
  contact_email TEXT,
  logo_url TEXT,
  brand_color TEXT NOT NULL DEFAULT '#2563eb',
  price_per_m3 NUMERIC NOT NULL DEFAULT 850,
  currency TEXT NOT NULL DEFAULT 'NOK',
  default_language TEXT NOT NULL DEFAULT 'no',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Companies manage own profile" ON public.companies FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  move_date DATE,
  address TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  total_volume_m3 NUMERIC NOT NULL DEFAULT 0,
  photo_urls TEXT[] NOT NULL DEFAULT '{}',
  share_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX estimates_share_token_idx ON public.estimates(share_token);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estimates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.estimates TO anon;
GRANT ALL ON public.estimates TO service_role;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create an estimate" ON public.estimates FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view estimates" ON public.estimates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anon can update pending estimates" ON public.estimates FOR UPDATE TO anon USING (company_id IS NULL) WITH CHECK (company_id IS NULL);
CREATE POLICY "Companies update their estimates" ON public.estimates FOR UPDATE TO authenticated USING (company_id IS NULL OR company_id = auth.uid()) WITH CHECK (company_id IS NULL OR company_id = auth.uid());
CREATE POLICY "Companies delete their estimates" ON public.estimates FOR DELETE TO authenticated USING (company_id = auth.uid());

CREATE TABLE public.estimate_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_no TEXT,
  category TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  length_cm NUMERIC NOT NULL DEFAULT 0,
  width_cm NUMERIC NOT NULL DEFAULT 0,
  height_cm NUMERIC NOT NULL DEFAULT 0,
  volume_m3 NUMERIC NOT NULL DEFAULT 0,
  confidence NUMERIC NOT NULL DEFAULT 0.8,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX estimate_items_estimate_idx ON public.estimate_items(estimate_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estimate_items TO authenticated;
GRANT SELECT, INSERT ON public.estimate_items TO anon;
GRANT ALL ON public.estimate_items TO service_role;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view items" ON public.estimate_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can add items" ON public.estimate_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Companies edit items" ON public.estimate_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Companies delete items" ON public.estimate_items FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER estimates_updated_at BEFORE UPDATE ON public.estimates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.companies (id, company_name, contact_email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Moving Company'), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ======================================================================
-- 20260920083548_72f1c9b5-210c-47ca-91d4-5dbc282ad6a6.sql
-- ======================================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- ======================================================================
-- 20260920083611_931b3619-b55e-4fae-a9e4-f2b520be8d3e.sql
-- ======================================================================

CREATE POLICY "Anyone can upload estimate photos" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'estimate-photos');
CREATE POLICY "Anyone can read estimate photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'estimate-photos');

-- ======================================================================
-- 20260920090206_2aa93ed3-dda1-432e-84e8-22e55238b709.sql
-- ======================================================================
CREATE TABLE public.estimate_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estimate_rooms TO authenticated;
GRANT SELECT, INSERT ON public.estimate_rooms TO anon;
GRANT ALL ON public.estimate_rooms TO service_role;
ALTER TABLE public.estimate_rooms ENABLE ROW LEVEL SECURITY;

CREATE INDEX estimate_rooms_estimate_idx ON public.estimate_rooms(estimate_id, sort_order);
CREATE UNIQUE INDEX estimate_rooms_estimate_name_idx ON public.estimate_rooms(estimate_id, lower(name));

CREATE POLICY "Anyone can view estimate rooms"
ON public.estimate_rooms FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can add rooms to unclaimed estimates"
ON public.estimate_rooms FOR INSERT TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.estimates e
    WHERE e.id = estimate_rooms.estimate_id
      AND (e.company_id IS NULL OR e.company_id = auth.uid())
  )
);

CREATE POLICY "Companies can rename own estimate rooms"
ON public.estimate_rooms FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.estimates e
    WHERE e.id = estimate_rooms.estimate_id
      AND (e.company_id IS NULL OR e.company_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.estimates e
    WHERE e.id = estimate_rooms.estimate_id
      AND (e.company_id IS NULL OR e.company_id = auth.uid())
  )
);

CREATE POLICY "Companies can delete own estimate rooms"
ON public.estimate_rooms FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.estimates e
    WHERE e.id = estimate_rooms.estimate_id
      AND e.company_id = auth.uid()
  )
);

ALTER TABLE public.estimate_items
ADD COLUMN room_id UUID REFERENCES public.estimate_rooms(id) ON DELETE SET NULL;
CREATE INDEX estimate_items_room_idx ON public.estimate_items(room_id);

DROP POLICY "Companies edit items" ON public.estimate_items;
DROP POLICY "Companies delete items" ON public.estimate_items;

CREATE POLICY "Companies edit own estimate items"
ON public.estimate_items FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.estimates e
    WHERE e.id = estimate_items.estimate_id
      AND (e.company_id IS NULL OR e.company_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.estimates e
    WHERE e.id = estimate_items.estimate_id
      AND (e.company_id IS NULL OR e.company_id = auth.uid())
  )
  AND (
    estimate_items.room_id IS NULL OR EXISTS (
      SELECT 1 FROM public.estimate_rooms r
      WHERE r.id = estimate_items.room_id
        AND r.estimate_id = estimate_items.estimate_id
    )
  )
);

CREATE POLICY "Companies delete own estimate items"
ON public.estimate_items FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.estimates e
    WHERE e.id = estimate_items.estimate_id
      AND e.company_id = auth.uid()
  )
);

CREATE TRIGGER estimate_rooms_updated_at
BEFORE UPDATE ON public.estimate_rooms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======================================================================
-- 20260920095445_1e2a0083-7335-414b-b97d-7ad693b8a869.sql
-- ======================================================================
-- estimates
DROP POLICY IF EXISTS "Anyone can view estimates" ON public.estimates;
DROP POLICY IF EXISTS "Anyone can create an estimate" ON public.estimates;
DROP POLICY IF EXISTS "Anon can update pending estimates" ON public.estimates;

CREATE POLICY "Companies view own or unclaimed estimates"
ON public.estimates FOR SELECT TO authenticated
USING (company_id IS NULL OR company_id = auth.uid());

CREATE POLICY "Companies create estimates"
ON public.estimates FOR INSERT TO authenticated
WITH CHECK (company_id IS NULL OR company_id = auth.uid());

-- estimate_rooms
DROP POLICY IF EXISTS "Anyone can view estimate rooms" ON public.estimate_rooms;
DROP POLICY IF EXISTS "Anyone can add rooms to unclaimed estimates" ON public.estimate_rooms;

CREATE POLICY "Companies view rooms of accessible estimates"
ON public.estimate_rooms FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.estimates e WHERE e.id = estimate_rooms.estimate_id AND (e.company_id IS NULL OR e.company_id = auth.uid())));

CREATE POLICY "Companies add rooms to accessible estimates"
ON public.estimate_rooms FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.estimates e WHERE e.id = estimate_rooms.estimate_id AND (e.company_id IS NULL OR e.company_id = auth.uid())));

-- estimate_items
DROP POLICY IF EXISTS "Anyone can view items" ON public.estimate_items;
DROP POLICY IF EXISTS "Anyone can add items" ON public.estimate_items;

CREATE POLICY "Companies view items of accessible estimates"
ON public.estimate_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.estimates e WHERE e.id = estimate_items.estimate_id AND (e.company_id IS NULL OR e.company_id = auth.uid())));

CREATE POLICY "Companies add items to accessible estimates"
ON public.estimate_items FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.estimates e WHERE e.id = estimate_items.estimate_id AND (e.company_id IS NULL OR e.company_id = auth.uid()))
  AND (room_id IS NULL OR EXISTS (SELECT 1 FROM public.estimate_rooms r WHERE r.id = estimate_items.room_id AND r.estimate_id = estimate_items.estimate_id))
);

-- remove anonymous data API access entirely
REVOKE ALL ON public.estimates FROM anon;
REVOKE ALL ON public.estimate_items FROM anon;
REVOKE ALL ON public.estimate_rooms FROM anon;
REVOKE ALL ON public.companies FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.estimates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estimate_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estimate_rooms TO authenticated;
GRANT ALL ON public.estimates TO service_role;
GRANT ALL ON public.estimate_items TO service_role;
GRANT ALL ON public.estimate_rooms TO service_role;

-- storage
DROP POLICY IF EXISTS "Anyone can read estimate photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload estimate photos" ON storage.objects;

CREATE POLICY "Companies read own estimate photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'estimate-photos'
  AND EXISTS (
    SELECT 1 FROM public.estimates e
    WHERE e.id::text = split_part(storage.objects.name, '/', 1)
      AND (e.company_id IS NULL OR e.company_id = auth.uid())
  )
);

CREATE POLICY "Companies upload own estimate photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'estimate-photos'
  AND EXISTS (
    SELECT 1 FROM public.estimates e
    WHERE e.id::text = split_part(storage.objects.name, '/', 1)
      AND (e.company_id IS NULL OR e.company_id = auth.uid())
  )
);

-- ======================================================================
-- 20260920101320_ee8bc16a-b67b-49b8-93bd-77d6572ac567.sql
-- ======================================================================
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

-- ======================================================================
-- 20260920110933_cd06f515-96a0-4624-949f-b7ace51f09c8.sql
-- ======================================================================
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'no',
  email_sent BOOLEAN NOT NULL DEFAULT false,
  handled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read contact messages"
  ON public.contact_messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update contact messages"
  ON public.contact_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ======================================================================
-- 20260920124118_17328f3e-ebf3-43fe-93c4-58dc3c1432bb.sql
-- ======================================================================

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

-- ======================================================================
-- 20260920124130_733f2734-50cb-410d-a37f-7cee194498ea.sql
-- ======================================================================

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- ======================================================================
-- 20260920125914_476c50ed-766e-45bc-a701-b61f7f93011f.sql
-- ======================================================================
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- contact_messages: admin only
DROP POLICY IF EXISTS "Authenticated users can read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update contact messages" ON public.contact_messages;
CREATE POLICY "Admins read contact messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update contact messages" ON public.contact_messages
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- estimates: owner only
DROP POLICY IF EXISTS "Companies view own or unclaimed estimates" ON public.estimates;
DROP POLICY IF EXISTS "Companies update their estimates" ON public.estimates;
DROP POLICY IF EXISTS "Companies create estimates" ON public.estimates;
CREATE POLICY "Companies view own estimates" ON public.estimates
  FOR SELECT TO authenticated USING (company_id = auth.uid());
CREATE POLICY "Companies update own estimates" ON public.estimates
  FOR UPDATE TO authenticated USING (company_id = auth.uid()) WITH CHECK (company_id = auth.uid());
CREATE POLICY "Companies create own estimates" ON public.estimates
  FOR INSERT TO authenticated WITH CHECK (company_id = auth.uid());

-- estimate_rooms: owner only
DROP POLICY IF EXISTS "Companies view rooms of accessible estimates" ON public.estimate_rooms;
DROP POLICY IF EXISTS "Companies add rooms to accessible estimates" ON public.estimate_rooms;
DROP POLICY IF EXISTS "Companies can rename own estimate rooms" ON public.estimate_rooms;
CREATE POLICY "Companies view own estimate rooms" ON public.estimate_rooms
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.estimates e WHERE e.id = estimate_rooms.estimate_id AND e.company_id = auth.uid()));
CREATE POLICY "Companies add own estimate rooms" ON public.estimate_rooms
  FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.estimates e WHERE e.id = estimate_rooms.estimate_id AND e.company_id = auth.uid()));
CREATE POLICY "Companies rename own estimate rooms" ON public.estimate_rooms
  FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.estimates e WHERE e.id = estimate_rooms.estimate_id AND e.company_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.estimates e WHERE e.id = estimate_rooms.estimate_id AND e.company_id = auth.uid()));

-- estimate_items: owner only
DROP POLICY IF EXISTS "Companies view items of accessible estimates" ON public.estimate_items;
DROP POLICY IF EXISTS "Companies add items to accessible estimates" ON public.estimate_items;
DROP POLICY IF EXISTS "Companies edit own estimate items" ON public.estimate_items;
CREATE POLICY "Companies view own estimate items" ON public.estimate_items
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.estimates e WHERE e.id = estimate_items.estimate_id AND e.company_id = auth.uid()));
CREATE POLICY "Companies add own estimate items" ON public.estimate_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.estimates e WHERE e.id = estimate_items.estimate_id AND e.company_id = auth.uid())
    AND (room_id IS NULL OR EXISTS (SELECT 1 FROM public.estimate_rooms r WHERE r.id = estimate_items.room_id AND r.estimate_id = estimate_items.estimate_id))
  );
CREATE POLICY "Companies edit own estimate items v2" ON public.estimate_items
  FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.estimates e WHERE e.id = estimate_items.estimate_id AND e.company_id = auth.uid()))
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.estimates e WHERE e.id = estimate_items.estimate_id AND e.company_id = auth.uid())
    AND (room_id IS NULL OR EXISTS (SELECT 1 FROM public.estimate_rooms r WHERE r.id = estimate_items.room_id AND r.estimate_id = estimate_items.estimate_id))
  );

-- quote_requests: owner only, with matching check
DROP POLICY IF EXISTS "Companies read their quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Companies update their quote requests" ON public.quote_requests;
CREATE POLICY "Companies read own quote requests" ON public.quote_requests
  FOR SELECT TO authenticated USING (
    company_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.estimates e WHERE e.id = quote_requests.estimate_id AND e.company_id = auth.uid())
  );
CREATE POLICY "Companies update own quote requests" ON public.quote_requests
  FOR UPDATE TO authenticated USING (
    company_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.estimates e WHERE e.id = quote_requests.estimate_id AND e.company_id = auth.uid())
  ) WITH CHECK (
    company_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.estimates e WHERE e.id = quote_requests.estimate_id AND e.company_id = auth.uid())
  );

-- ======================================================================
-- 20260920125930_7a5a09af-8b98-4058-a4bb-39fb97b5b1a0.sql
-- ======================================================================
DROP POLICY IF EXISTS "Admins read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins update contact messages" ON public.contact_messages;

CREATE POLICY "Admins read contact messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );
CREATE POLICY "Admins update contact messages" ON public.contact_messages
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;

-- ======================================================================
-- 20260920130530_b8cf62a5-8b04-4ac2-87b5-be8a81158abf.sql
-- ======================================================================
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS upload_token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS companies_upload_token_key ON public.companies (upload_token);

-- ======================================================================
-- 20260920164601_008f343d-50af-4e36-afcc-13f78e6e5ba9.sql
-- ======================================================================
DROP POLICY IF EXISTS "Companies read own estimate photos" ON storage.objects;
DROP POLICY IF EXISTS "Companies upload own estimate photos" ON storage.objects;

CREATE POLICY "Companies read own estimate photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'estimate-photos'
  AND EXISTS (
    SELECT 1 FROM public.estimates e
    WHERE e.id::text = split_part(objects.name, '/', 1)
      AND e.company_id = auth.uid()
  )
);

CREATE POLICY "Companies upload own estimate photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'estimate-photos'
  AND EXISTS (
    SELECT 1 FROM public.estimates e
    WHERE e.id::text = split_part(objects.name, '/', 1)
      AND e.company_id = auth.uid()
  )
);

-- ======================================================================
-- 20260921101539_f23c0987-7736-4c60-82ab-3f6c485278f0.sql
-- ======================================================================
ALTER TABLE public.estimates
  ADD COLUMN IF NOT EXISTS report_title text,
  ADD COLUMN IF NOT EXISTS move_from text,
  ADD COLUMN IF NOT EXISTS move_to text,
  ADD COLUMN IF NOT EXISTS move_distance_km numeric;

-- ======================================================================
-- 20260921154514_a851b43d-50a6-481a-bf8a-1454a3dca828.sql
-- ======================================================================
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS room_names text[] NOT NULL DEFAULT ARRAY['Stue', 'Kjøkken', 'Soverom 1', 'Soverom 2', 'Bad', 'Gang', 'Garasje', 'Kontor', 'Spisestue', 'Annet']::text[];

UPDATE public.companies
SET room_names = ARRAY['Stue', 'Kjøkken', 'Soverom 1', 'Soverom 2', 'Bad', 'Gang', 'Garasje', 'Kontor', 'Spisestue', 'Annet']::text[]
WHERE room_names IS NULL OR cardinality(room_names) = 0;

-- ======================================================================
-- 20260921160410_7ae299c9-143c-439d-87db-6c9774f6940c.sql
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT,
  account_type TEXT NOT NULL DEFAULT 'private',
  preferred_report_language TEXT NOT NULL DEFAULT 'en',
  notification_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own profile" ON public.profiles;
CREATE POLICY "Users manage their own profile" ON public.profiles
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======================================================================
-- 20260922160147_b468825b-0e5b-4f9a-b54c-c68faa818b5c.sql
-- ======================================================================
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

-- ======================================================================
-- 20261013090000_partner_directory_and_quote_requests.sql
-- ======================================================================
-- Partner directory for private customers: movers that have agreed to receive
-- quote requests, matched on route (from/to country) and volume.
-- lead_email is only ever read server-side with the service role.

CREATE TABLE public.partners (
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

CREATE INDEX partners_active_idx ON public.partners (active, priority);

GRANT ALL ON public.partners TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners TO authenticated;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage partners"
  ON public.partners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- One row per quote request sent to a partner (separate from public.quote_requests,
-- which holds customer requests sent to a moving company account): audit trail, consent record and
-- protection against sending the same report to the same partner twice.
CREATE TABLE public.partner_quote_requests (
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

CREATE INDEX partner_quote_requests_estimate_idx ON public.partner_quote_requests (estimate_id);

GRANT ALL ON public.partner_quote_requests TO service_role;
GRANT SELECT ON public.partner_quote_requests TO authenticated;
ALTER TABLE public.partner_quote_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read partner quote requests"
  ON public.partner_quote_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Route and insurance choice stored on the estimate itself so they follow the
-- report to every device and into the request sent to movers.
ALTER TABLE public.estimates
  ADD COLUMN move_from_country char(2) CHECK (move_from_country IS NULL OR move_from_country = upper(move_from_country)),
  ADD COLUMN move_to_country char(2) CHECK (move_to_country IS NULL OR move_to_country = upper(move_to_country)),
  ADD COLUMN transport_insurance boolean;
