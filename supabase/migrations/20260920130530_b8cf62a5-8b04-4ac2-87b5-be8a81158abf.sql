ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS upload_token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS companies_upload_token_key ON public.companies (upload_token);