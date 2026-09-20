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