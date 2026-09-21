ALTER TABLE public.estimates
  ADD COLUMN IF NOT EXISTS report_title text,
  ADD COLUMN IF NOT EXISTS move_from text,
  ADD COLUMN IF NOT EXISTS move_to text,
  ADD COLUMN IF NOT EXISTS move_distance_km numeric;