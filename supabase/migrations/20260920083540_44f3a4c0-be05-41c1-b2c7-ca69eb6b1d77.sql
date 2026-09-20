
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
