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