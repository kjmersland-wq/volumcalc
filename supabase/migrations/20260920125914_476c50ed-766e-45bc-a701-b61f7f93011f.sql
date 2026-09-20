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