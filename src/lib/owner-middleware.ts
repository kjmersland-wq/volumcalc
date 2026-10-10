import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isOwnerEmail } from "@/lib/owner";

/**
 * While the site is closed, every server function is callable by the owner
 * only. The sign-in box in MaintenanceGate hides the UI; this is what actually
 * stops direct calls to the server functions.
 *
 * The e-mail is read from Supabase (getUser round-trip), not from the token
 * payload, and must be confirmed. To reopen the site, remove this middleware
 * from the server functions (or relax the check below).
 */
export const requireOwner = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { data, error } = await context.supabase.auth.getUser();
    if (error || !data.user?.email_confirmed_at || !isOwnerEmail(data.user.email)) {
      throw new Error("Forbidden: this site is currently closed");
    }
    // The owner is never limited by credits, plans or quotas.
    return next({ context: { isOwner: true as const } });
  });
