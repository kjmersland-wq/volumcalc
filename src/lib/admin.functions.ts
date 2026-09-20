import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Confirms the signed-in caller holds the admin role.
 * The role is read through the caller's own RLS-scoped client, so a user can
 * never claim a role they do not have.
 */
async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Admin access required");
}

const createSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(72),
  company_name: z.string().trim().min(1).max(160),
  org_number: z.string().trim().max(40).optional(),
  address: z.string().trim().max(240).optional(),
  phone: z.string().trim().max(40).optional(),
  website: z.string().trim().max(240).optional(),
  contact_email: z.string().trim().max(160).optional(),
  logo_url: z.string().trim().max(2000).optional(),
  brand_color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  price_per_m3: z.number().min(0).max(100000).optional(),
  currency: z.enum(["NOK", "EUR", "USD", "SEK", "DKK"]).optional(),
  default_language: z.enum(["no", "en"]).optional(),
  is_demo: z.boolean().optional(),
});

export type AdminCompanyRow = {
  id: string;
  company_name: string;
  contact_email: string | null;
  logo_url: string | null;
  brand_color: string;
  org_number: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  upload_token: string;
  is_demo: boolean;
  created_at: string;
  estimates: number;
};

/** All company accounts with their private upload link and estimate counts. */
export const adminListCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminCompanyRow[]> => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: companies, error } = await supabaseAdmin
      .from("companies")
      .select(
        "id,company_name,contact_email,logo_url,brand_color,org_number,phone,website,address,upload_token,is_demo,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error("Could not load the company accounts");

    const { data: estimates } = await supabaseAdmin.from("estimates").select("company_id").limit(5000);
    const counts = new Map<string, number>();
    for (const row of estimates ?? []) {
      if (!row.company_id) continue;
      counts.set(row.company_id, (counts.get(row.company_id) ?? 0) + 1);
    }

    return (companies ?? []).map((c) => ({ ...c, estimates: counts.get(c.id) ?? 0 })) as AdminCompanyRow[];
  });

/** Creates a login plus a branded company profile for a moving company. */
export const adminCreateCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (authError || !created.user) throw new Error(authError?.message || "Could not create the login");

    const { error: updateError } = await supabaseAdmin
      .from("companies")
      .update({
        company_name: data.company_name,
        org_number: data.org_number || null,
        address: data.address || null,
        phone: data.phone || null,
        website: data.website || null,
        contact_email: data.contact_email || data.email,
        logo_url: data.logo_url || null,
        ...(data.brand_color ? { brand_color: data.brand_color } : {}),
        ...(data.price_per_m3 !== undefined ? { price_per_m3: data.price_per_m3 } : {}),
        ...(data.currency ? { currency: data.currency } : {}),
        ...(data.default_language ? { default_language: data.default_language } : {}),
        is_demo: data.is_demo ?? false,
      })
      .eq("id", created.user.id);
    if (updateError) throw new Error("The login was created but the company profile could not be saved");

    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("id,upload_token")
      .eq("id", created.user.id)
      .maybeSingle();

    return { id: created.user.id, upload_token: (company?.upload_token as string) ?? "" };
  });

const idSchema = z.object({ id: z.string().uuid() });

/** Issues a fresh secret upload link for a company; the old link stops working. */
export const adminRotateUploadToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const token = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    const { error } = await supabaseAdmin.from("companies").update({ upload_token: token }).eq("id", data.id);
    if (error) throw new Error("Could not refresh the link");
    return { upload_token: token };
  });

const passwordSchema = z.object({ id: z.string().uuid(), password: z.string().min(8).max(72) });

/** Sets a new password for a company login. */
export const adminSetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => passwordSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.id, { password: data.password });
    if (error) throw new Error("Could not update the password");
    return { ok: true };
  });

const tokenSchema = z.object({
  token: z.string().trim().min(8).max(64).regex(/^[a-f0-9]+$/i),
});

/**
 * Public branding lookup for a company upload link. Only the details a company
 * wants shown to its own customers are returned — never contact logins or ids
 * of other companies.
 */
export const getCompanyByUploadToken = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("company_name,logo_url,brand_color,phone,website,is_demo")
      .eq("upload_token", data.token)
      .maybeSingle();
    return company ?? null;
  });
