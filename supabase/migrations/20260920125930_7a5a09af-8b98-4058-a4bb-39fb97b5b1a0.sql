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