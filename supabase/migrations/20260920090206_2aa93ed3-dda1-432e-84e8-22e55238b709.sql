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