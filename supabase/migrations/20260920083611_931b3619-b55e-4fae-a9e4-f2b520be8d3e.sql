
CREATE POLICY "Anyone can upload estimate photos" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'estimate-photos');
CREATE POLICY "Anyone can read estimate photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'estimate-photos');
