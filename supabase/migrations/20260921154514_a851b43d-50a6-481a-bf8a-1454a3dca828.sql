ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS room_names text[] NOT NULL DEFAULT ARRAY['Stue', 'Kjøkken', 'Soverom 1', 'Soverom 2', 'Bad', 'Gang', 'Garasje', 'Kontor', 'Spisestue', 'Annet']::text[];

UPDATE public.companies
SET room_names = ARRAY['Stue', 'Kjøkken', 'Soverom 1', 'Soverom 2', 'Bad', 'Gang', 'Garasje', 'Kontor', 'Spisestue', 'Annet']::text[]
WHERE room_names IS NULL OR cardinality(room_names) = 0;