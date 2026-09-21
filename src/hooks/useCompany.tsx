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

/** True when the signed-in account may upload photos without the normal limit. */
export function useUnlimitedPhotos() {
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
  return (data ?? []).some((row) => row.role === "unlimited" || row.role === "admin");
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
