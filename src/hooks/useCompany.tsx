import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type CompanyProfile = {
  company_name: string;
  logo_url: string | null;
  brand_color: string;
  price_per_m3: number;
  currency: string;
  org_number: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  contact_email: string | null;
  room_names: string[];
  upload_token: string;
  is_demo: boolean;
};

/** The signed-in company's own profile, used for branding and pricing. */
export function useCompany() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["company", session?.user.id],
    enabled: Boolean(session),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", session!.user.id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as CompanyProfile | null;
    },
  });
}

/** Shared by useUnlimitedPhotos()/useIsUnlimitedPlan() — role, unlimited_until
 * and credits fetched once; React Query dedupes both queries by key across
 * whichever of the two hooks a component uses. */
function usePlanEntitlement() {
  const { session } = useAuth();
  const { data: roles } = useQuery({
    queryKey: ["roles", session?.user.id],
    enabled: Boolean(session),
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", session!.user.id);
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: credits } = useQuery({
    queryKey: ["credits", session?.user.id],
    enabled: Boolean(session),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_credits")
        .select("credits, unlimited_until")
        .eq("user_id", session!.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const hasRole = (roles ?? []).some((row) => row.role === "unlimited" || row.role === "admin");
  const isUnlimited = Boolean(credits?.unlimited_until && new Date(credits.unlimited_until) > new Date());
  const hasCredits = Boolean(credits?.credits && credits.credits > 0);
  return { hasRole, isUnlimited, hasCredits };
}

/**
 * True when the signed-in account may use AI photo analysis: admin/unlimited
 * role, an active unlimited_until window, or a positive credits balance —
 * the same entitlement checked server-side in assertUnlimitedOrAdmin
 * (analyze-photos.functions.ts) and consumePlanEntitlement
 * (estimates.functions.ts), so a paying non-admin account actually sees the
 * button the server would let it use.
 */
export function useUnlimitedPhotos() {
  const { hasRole, isUnlimited, hasCredits } = usePlanEntitlement();
  return hasRole || isUnlimited || hasCredits;
}

/** True only when the account is genuinely unlimited (admin/unlimited role,
 * or an active unlimited_until window) — unlike useUnlimitedPhotos(), a
 * finite credits balance does not count, since this drives the "Unlimited
 * photos" badge on the account page. */
export function useIsUnlimitedPlan() {
  const { hasRole, isUnlimited } = usePlanEntitlement();
  return hasRole || isUnlimited;
}

/** True when the signed-in account is a VolumCalc administrator. */
export function useIsAdmin() {
  const { session } = useAuth();
  const { data } = useQuery({
    queryKey: ["roles", session?.user.id],
    enabled: Boolean(session),
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", session!.user.id);
      if (error) throw error;
      return data ?? [];
    },
  });
  return (data ?? []).some((row) => row.role === "admin");
}
