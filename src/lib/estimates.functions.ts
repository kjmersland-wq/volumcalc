import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { USER_VERIFIED_SECURITY_LABEL, VOLUME_DATABASE } from "./volume-database";

const dataUrl = z.string().min(20).max(12_000_000).regex(/^data:image\/(jpeg|png|webp);base64,/);
const roomNames = Object.keys(VOLUME_DATABASE) as Array<keyof typeof VOLUME_DATABASE>;
const roomSchema = z.enum(roomNames as [string, ...string[]]);

const manualItemSchema = z.object({
  room: roomSchema,
  name: z.string().trim().min(1).max(120),
  name_no: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80),
  quantity: z.number().int().min(1).max(999),
  length_cm: z.number().nonnegative().max(5000),
  width_cm: z.number().nonnegative().max(5000),
  height_cm: z.number().nonnegative().max(5000),
  volume_m3: z.number().nonnegative().max(1000),
  security_label: z.literal(USER_VERIFIED_SECURITY_LABEL),
});

const createSchema = z.object({
  images: z.array(dataUrl).max(100).default([]), // kept for backward compatibility, no longer used for analysis
  manual_items: z.array(manualItemSchema).min(1).max(300),
  customer_name: z.string().trim().max(120).optional(),
  customer_phone: z.string().trim().max(40).optional(),
  move_date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  address: z.string().trim().max(240).optional(),
  company_id: z.string().uuid().optional(),
  company_token: z.string().trim().min(8).max(64).regex(/^[a-f0-9]+$/i).optional(),
});

const sharedSchema = z.object({
  id: z.string().uuid(),
  token: z.string().trim().min(8).max(64).regex(/^[a-f0-9]+$/i),
});

function decodeDataUrl(url: string): Uint8Array {
  const base64 = url.slice(url.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Creates an estimate on behalf of an (possibly anonymous) visitor.
 * All writes happen server-side so no public write access to the tables or
 * the private photo bucket is required. The caller only gets back the id and
 * the share token for the estimate it just created.
 */
export const createEstimate = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { analyzeManualItems } = await import("./analyze.server");

    // A company-specific upload link attributes the estimate to that company so
    // it lands in their dashboard; otherwise it stays unattributed.
    let companyId: string | null = null;
    if (data.company_token) {
      const { data: company } = await supabaseAdmin
        .from("companies")
        .select("id")
        .eq("upload_token", data.company_token)
        .maybeSingle();
      companyId = company?.id ?? null;
    }
    if (!companyId && data.company_id) {
      const { data: company } = await supabaseAdmin
        .from("companies")
        .select("id")
        .eq("id", data.company_id)
        .maybeSingle();
      companyId = company?.id ?? null;
    }

    const { data: estimate, error: insertError } = await supabaseAdmin
      .from("estimates")
      .insert({
        company_id: companyId,
        customer_name: data.customer_name || null,
        customer_phone: data.customer_phone || null,
        move_date: data.move_date || null,
        address: data.address || null,
      })
      .select("id,share_token")
      .single();
    if (insertError || !estimate) throw new Error("Could not create the estimate");

    const paths: string[] = [];
    for (let i = 0; i < data.images.length; i++) {
      const image = data.images[i];
      if (!image) continue;
      const path = `${estimate.id}/${i}.jpg`;
      const { error } = await supabaseAdmin.storage
        .from("estimate-photos")
        .upload(path, decodeDataUrl(image), { contentType: "image/jpeg", upsert: true });
      if (error) throw new Error("Could not store the photos");
      paths.push(path);
    }

    const photoUrls = paths.length
      ? (
          await supabaseAdmin.storage
            .from("estimate-photos")
            .createSignedUrls(paths, 60 * 60 * 24 * 365)
        ).data?.map((s) => s.signedUrl).filter(Boolean) ?? []
      : [];

    const result = analyzeManualItems(data.manual_items);

    if (result.items.length) {
      const roomNames = Array.from(new Set(result.items.map((item) => item.room || "Other")));
      const { data: rooms } = await supabaseAdmin
        .from("estimate_rooms")
        .insert(roomNames.map((name, sortOrder) => ({ estimate_id: estimate.id, name, sort_order: sortOrder })))
        .select("id,name");
      const roomIds = new Map((rooms ?? []).map((room) => [room.name, room.id]));

      const { error: itemsError } = await supabaseAdmin.from("estimate_items").insert(
        result.items.map((item) => ({
          estimate_id: estimate.id,
          name: item.name,
          name_no: item.name_no,
          category: item.category,
          quantity: item.quantity,
          length_cm: item.length_cm,
          width_cm: item.width_cm,
          height_cm: item.height_cm,
          volume_m3: item.volume_m3,
          confidence: item.confidence,
          photo_url: photoUrls[item.photo_index] ?? photoUrls[0] ?? null,
          room_id: roomIds.get(item.room || "Other") ?? null,
        })),
      );
      if (itemsError) throw new Error("Could not save the estimate items");
    }

    await supabaseAdmin
      .from("estimates")
      .update({ photo_urls: photoUrls, total_volume_m3: result.total })
      .eq("id", estimate.id);

    return { id: estimate.id as string, share_token: estimate.share_token as string };
  });

/**
 * Read an estimate without being signed in. Requires the secret share token
 * that belongs to that exact estimate, so one link never exposes another
 * customer's data.
 */
export const getSharedEstimate = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => sharedSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: estimate } = await supabaseAdmin
      .from("estimates")
      .select(
        "id,customer_name,address,customer_phone,status,total_volume_m3,photo_urls,created_at,share_token,company_id,access_floor,has_elevator,carry_distance_m,access_notes,storage_enabled,storage_company,storage_address,storage_contact,storage_phone,delivery_address,delivery_floor,delivery_elevator,delivery_carry_distance,delivery_notes,packing_requested,packing_level,packing_materials,packing_notes,tender_mode,report_language",
      )
      .eq("id", data.id)
      .maybeSingle();

    if (!estimate || estimate.share_token !== data.token) return null;

    const [{ data: items }, { data: rooms }] = await Promise.all([
      supabaseAdmin
        .from("estimate_items")
        .select(
          "id,name,name_no,quantity,length_cm,width_cm,height_cm,volume_m3,confidence,photo_url,room_id,notes,tags,is_included,deleted_at",
        )
        .eq("estimate_id", data.id)
        .is("deleted_at", null)
        .order("volume_m3", { ascending: false }),
      supabaseAdmin
        .from("estimate_rooms")
        .select("id,name,sort_order")
        .eq("estimate_id", data.id)
        .order("sort_order"),
    ]);

    const { share_token: _token, company_id: _companyId, ...safeEstimate } = estimate;

    return { estimate: safeEstimate, items: items ?? [], rooms: rooms ?? [] };
  });

const quoteSchema = z.object({
  id: z.string().uuid(),
  token: z.string().trim().min(8).max(64).regex(/^[a-f0-9]+$/i),
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().email().max(160).optional(),
  message: z.string().trim().max(2000).optional(),
});

/**
 * A customer holding the share link can ask the owning company for a quote.
 * The token is validated server-side before anything is written.
 */
export const requestQuote = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => quoteSchema.parse(data))
  .handler(async ({ data }) => {
    if (!data.phone && !data.email) throw new Error("A phone number or email is required");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: estimate } = await supabaseAdmin
      .from("estimates")
      .select("id,share_token,company_id")
      .eq("id", data.id)
      .maybeSingle();

    if (!estimate || estimate.share_token !== data.token) throw new Error("Estimate not found");

    const { error } = await supabaseAdmin.from("quote_requests").insert({
      estimate_id: estimate.id,
      company_id: estimate.company_id,
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      message: data.message || null,
    });
    if (error) throw new Error("Could not send the request");

    return { ok: true };
  });


/**
 * A signed-in company takes ownership of an estimate that no company owns yet.
 * The caller must hold the secret share link for that exact estimate, so an
 * estimate can never be claimed by guessing ids.
 */
export const claimEstimate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => sharedSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: estimate } = await supabaseAdmin
      .from("estimates")
      .select("id,share_token,company_id")
      .eq("id", data.id)
      .maybeSingle();

    if (!estimate || estimate.share_token !== data.token) throw new Error("Estimate not found");
    if (estimate.company_id && estimate.company_id !== context.userId) {
      throw new Error("This estimate already belongs to another company");
    }

    if (!estimate.company_id) {
      const { error } = await supabaseAdmin
        .from("estimates")
        .update({ company_id: context.userId })
        .eq("id", estimate.id)
        .is("company_id", null);
      if (error) throw new Error("Could not claim the estimate");

      await supabaseAdmin
        .from("quote_requests")
        .update({ company_id: context.userId })
        .eq("estimate_id", estimate.id)
        .is("company_id", null);
    }

    return { ok: true };
  });
