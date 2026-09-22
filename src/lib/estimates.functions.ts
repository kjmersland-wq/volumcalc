import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { USER_VERIFIED_SECURITY_LABEL } from "./volume-database";

type EstimateItemUpdate = Database["public"]["Tables"]["estimate_items"]["Update"];

/**
 * Server-verified caller identity from the bearer token attachSupabaseAuth
 * already attaches globally (src/start.ts) when the caller has a session —
 * returns null for a genuinely anonymous caller, same optional-auth pattern
 * as resolveIdentity() in payments.functions.ts. Never trusts a client-
 * supplied id, since createEstimate has no auth middleware (it must stay
 * callable by anonymous customers).
 */
async function resolveVerifiedUserId(): Promise<string | null> {
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length);
  if (!token || token.split(".").length !== 3) return null;

  const SUPABASE_URL = process.env["SUPABASE_URL"];
  const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.id) return null;
  return data.user.id;
}

/**
 * Checks whether `accountId` (a user, or — since companies.id references
 * auth.users — a company acting on its own upload link) may create one more
 * estimate: admin/unlimited role, an active unlimited_until window, or a
 * positive credits balance. Consumes one credit only in that last case;
 * role and unlimited_until never touch the credits counter. Shared by both
 * a caller's own submission and a company_token submission, since a company
 * is billed through the exact same user_roles/user_credits rows as any
 * other account.
 */
async function consumePlanEntitlement(supabaseAdmin: any, accountId: string): Promise<boolean> {
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", accountId)
    .in("role", ["admin", "unlimited"]);
  if (roles && roles.length > 0) return true;

  const { data: credits } = await supabaseAdmin
    .from("user_credits")
    .select("credits, unlimited_until")
    .eq("user_id", accountId)
    .maybeSingle();
  const isUnlimited = Boolean(credits?.unlimited_until && new Date(credits.unlimited_until) > new Date());
  if (isUnlimited) return true;

  const hasCredits = Boolean(credits?.credits && credits.credits > 0);
  if (!hasCredits) return false;

  // One credit per submitted estimate, regardless of room/photo count.
  await supabaseAdmin
    .from("user_credits")
    .update({ credits: (credits!.credits ?? 0) - 1 })
    .eq("user_id", accountId);
  return true;
}

const manualItemSchema = z.object({
  room: z.string().trim().min(1).max(50),
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

// Kept comfortably under Cloudflare Workers' request body limit even for a
// single clip (base64 inflates size by ~33% over the raw clip).
const uploadRoomVideoSchema = z.object({
  session_id: z.string().uuid(),
  room: z.string().trim().min(1).max(50),
  mime_type: z.string().trim().min(1).max(80).default("video/webm"),
  data: z
    .string()
    .min(1)
    .max(6_000_000)
    .regex(/^[A-Za-z0-9+/]+=*$/, "Invalid video data"),
});

/**
 * Uploads one room's clip to the existing 'estimate-photos' bucket right
 * after filming stops, keyed under a client-generated session id (no
 * estimate exists yet at this point). Returns a long-lived signed URL that
 * createEstimate later carries into estimates.photo_urls as-is.
 */
export const uploadRoomVideo = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => uploadRoomVideoSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const bytes = Uint8Array.from(atob(data.data), (c) => c.charCodeAt(0));
    const extension = data.mime_type.includes("mp4") ? "mp4" : "webm";
    const safeRoom = data.room.replace(/[^a-zA-Z0-9-_]+/g, "-").slice(0, 60) || "room";
    const path = `${data.session_id}/${safeRoom}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("estimate-photos")
      .upload(path, bytes, { contentType: data.mime_type, upsert: true });
    if (uploadError) throw new Error("Could not upload the recording");

    const { data: signed } = await supabaseAdmin.storage
      .from("estimate-photos")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (!signed?.signedUrl) throw new Error("Could not create a link for the recording");

    return { url: signed.signedUrl };
  });

function photoExtensionForMimeType(mimeType: string): string {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("heic")) return "heic";
  if (mimeType.includes("heif")) return "heif";
  return "jpg";
}

// Generous for a single phone photo (a few MB is typical; base64 inflates
// size by ~33% over the raw file).
const uploadRoomPhotoSchema = z.object({
  session_id: z.string().uuid(),
  room: z.string().trim().min(1).max(50),
  mime_type: z.string().trim().min(1).max(80).default("image/jpeg"),
  data: z
    .string()
    .min(1)
    .max(10_000_000)
    .regex(/^[A-Za-z0-9+/]+=*$/, "Invalid photo data"),
});

/**
 * Uploads one room photo to the existing 'estimate-photos' bucket right
 * after it's picked, mirroring uploadRoomVideo's pattern (same bucket, same
 * <sessionId>/<room>-... path shape) but kept separate so the video upload
 * path stays untouched. A short random suffix avoids collisions when several
 * photos for the same room are picked at once.
 */
export const uploadRoomPhoto = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => uploadRoomPhotoSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const bytes = Uint8Array.from(atob(data.data), (c) => c.charCodeAt(0));
    const extension = photoExtensionForMimeType(data.mime_type);
    const safeRoom = data.room.replace(/[^a-zA-Z0-9-_]+/g, "-").slice(0, 60) || "room";
    const suffix = Math.random().toString(36).slice(2, 8);
    const path = `${data.session_id}/${safeRoom}-${Date.now()}-${suffix}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("estimate-photos")
      .upload(path, bytes, { contentType: data.mime_type, upsert: true });
    if (uploadError) throw new Error("Could not upload the photo");

    const { data: signed } = await supabaseAdmin.storage
      .from("estimate-photos")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (!signed?.signedUrl) throw new Error("Could not create a link for the photo");

    return { url: signed.signedUrl };
  });

const roomVideoUrlSchema = z.object({
  room: z.string().trim().min(1).max(50),
  url: z.string().trim().url().max(2000),
});

const createSchema = z.object({
  manual_items: z.array(manualItemSchema).max(300).default([]),
  room_video_urls: z.array(roomVideoUrlSchema).max(20).default([]),
  room_photo_urls: z.array(roomVideoUrlSchema).max(60).default([]),
  customer_name: z.string().trim().max(120).regex(/^[^\r\n]*$/, "Customer name cannot contain line breaks").optional(),
  customer_phone: z.string().trim().max(40).optional(),
  move_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  address: z.string().trim().max(240).optional(),
  company_id: z.string().uuid().optional(),
  company_token: z
    .string()
    .trim()
    .min(8)
    .max(64)
    .regex(/^[a-f0-9]+$/i)
    .optional(),
});

const sharedSchema = z.object({
  id: z.string().uuid(),
  token: z
    .string()
    .trim()
    .min(8)
    .max(64)
    .regex(/^[a-f0-9]+$/i),
});

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

    // A company_token submission is billed against the COMPANY's own plan
    // (companies.id === auth.users.id, so it shares the exact same
    // user_roles/user_credits rows) — never against the anonymous visitor
    // filling out that company's public form, who has no VolumCalc account
    // of their own to check or top up. Exhausting the company's plan is a
    // hard block with a neutral message; the company discovers this in
    // their own dashboard, not via an automated alert. A caller submitting
    // under their own account is gated the same way, against their own
    // identity — server-verified, never client-supplied, so neither path
    // can be spoofed by passing a different company_id.
    if (data.company_token) {
      if (companyId) {
        const allowed = await consumePlanEntitlement(supabaseAdmin, companyId);
        if (!allowed) throw new Error("COMPANY_QUOTA_EXCEEDED");
      }
    } else {
      const userId = await resolveVerifiedUserId();
      if (userId) {
        const allowed = await consumePlanEntitlement(supabaseAdmin, userId);
        if (!allowed) throw new Error("NO_CREDITS");
      }
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

    const result = analyzeManualItems(data.manual_items);

    if (result.items.length) {
      const roomNames = Array.from(new Set(result.items.map((item) => item.room || "Other")));
      const { data: rooms } = await supabaseAdmin
        .from("estimate_rooms")
        .insert(
          roomNames.map((name, sortOrder) => ({
            estimate_id: estimate.id,
            name,
            sort_order: sortOrder,
          })),
        )
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
          photo_url: null,
          room_id: roomIds.get(item.room || "Other") ?? null,
        })),
      );
      if (itemsError) throw new Error("Could not save the estimate items");
    }

    // Room clips/photos are already uploaded to 'estimate-photos' by
    // uploadRoomVideo/uploadRoomPhoto right after being captured (so nothing
    // is lost if the visitor never finishes this form) — their signed URLs
    // just get attached here. Filming is currently unused (photos took its
    // place in the UI) but room_video_urls is kept so it still works if
    // filming is re-enabled later.
    const photoUrls = [
      ...data.room_video_urls.map((video) => video.url),
      ...data.room_photo_urls.map((photo) => photo.url),
    ];

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
  token: z
    .string()
    .trim()
    .min(8)
    .max(64)
    .regex(/^[a-f0-9]+$/i),
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

const updateSharedItemSchema = z.object({
  id: z.string().uuid(),
  token: z
    .string()
    .trim()
    .min(8)
    .max(64)
    .regex(/^[a-f0-9]+$/i),
  itemId: z.string().uuid(),
  patch: z
    .object({
      quantity: z.number().int().min(1).max(999).optional(),
      length_cm: z.number().positive().max(5000).optional(),
      width_cm: z.number().positive().max(5000).optional(),
      height_cm: z.number().positive().max(5000).optional(),
      tags: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
    })
    .refine((p) => Object.keys(p).length > 0, "Empty patch"),
});

/**
 * Lets whoever holds an estimate's share link (customer or owning company)
 * adjust one item's quantity, measurements or tags directly on the shared
 * report — same requestQuote pattern: validate {id, token} server-side
 * before writing anything, via the service-role client (never RLS, since
 * anon has no write grants on estimate_items at all). Deliberately narrow:
 * only these four fields, never name/room/notes/deletion, and itemId is
 * checked against estimate_id so a valid token for one estimate can never
 * touch another estimate's items.
 */
export const updateSharedEstimateItem = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateSharedItemSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: estimate } = await supabaseAdmin
      .from("estimates")
      .select("id,share_token")
      .eq("id", data.id)
      .maybeSingle();
    if (!estimate || estimate.share_token !== data.token) throw new Error("Estimate not found");

    const { data: item } = await supabaseAdmin
      .from("estimate_items")
      .select("id,estimate_id,length_cm,width_cm,height_cm,quantity")
      .eq("id", data.itemId)
      .maybeSingle();
    if (!item || item.estimate_id !== data.id) throw new Error("Item not found");

    const patch: EstimateItemUpdate = {};
    if (data.patch.quantity !== undefined) patch.quantity = data.patch.quantity;
    if (data.patch.length_cm !== undefined) patch.length_cm = data.patch.length_cm;
    if (data.patch.width_cm !== undefined) patch.width_cm = data.patch.width_cm;
    if (data.patch.height_cm !== undefined) patch.height_cm = data.patch.height_cm;
    if (data.patch.tags !== undefined) patch.tags = data.patch.tags;
    if (
      data.patch.length_cm !== undefined ||
      data.patch.width_cm !== undefined ||
      data.patch.height_cm !== undefined ||
      data.patch.quantity !== undefined
    ) {
      const length = data.patch.length_cm ?? item.length_cm;
      const width = data.patch.width_cm ?? item.width_cm;
      const height = data.patch.height_cm ?? item.height_cm;
      const quantity = data.patch.quantity ?? item.quantity;
      patch.volume_m3 = Math.round(((length * width * height * quantity) / 1_000_000) * 100) / 100;
    }

    const { error: updateError } = await supabaseAdmin
      .from("estimate_items")
      .update(patch)
      .eq("id", data.itemId);
    if (updateError) throw new Error("Could not update the item");

    // Recompute the estimate's total — same math as the owner-side recalcTotal().
    const { data: rows } = await supabaseAdmin
      .from("estimate_items")
      .select("volume_m3,is_included")
      .eq("estimate_id", data.id)
      .is("deleted_at", null);
    const total =
      Math.round(
        (rows ?? [])
          .filter((r) => r.is_included !== false)
          .reduce((sum, r) => sum + Number(r.volume_m3), 0) * 100,
      ) / 100;
    await supabaseAdmin.from("estimates").update({ total_volume_m3: total }).eq("id", data.id);

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
