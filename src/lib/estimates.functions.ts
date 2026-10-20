import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { USER_VERIFIED_SECURITY_LABEL } from "./volume-database";
import { buildItemTags } from "./item-status";

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

  // One credit per submitted estimate, regardless of how many items it has.
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
  status: z.enum(["moving", "maybe", "not_moving"]).default("moving"),
  custom: z.boolean().default(false),
  /** Per-unit weight in kg. */
  weight_kg: z.number().nonnegative().max(10000).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

const siteSchema = z.object({
  address: z.string().trim().max(240).optional(),
  floor: z.string().trim().max(20).optional(),
  elevator: z.boolean().default(false),
  carry_m: z.number().int().min(0).max(1000).nullable().optional(),
  mobile: z.string().trim().max(40).optional(),
});

const createSchema = z.object({
  manual_items: z.array(manualItemSchema).max(300).default([]),
  customer_name: z.string().trim().max(120).regex(/^[^\r\n]*$/, "Customer name cannot contain line breaks").optional(),
  customer_phone: z.string().trim().max(40).optional(),
  customer_email: z.string().trim().email().max(160).optional(),
  notes: z.string().trim().max(1500).optional(),
  from: siteSchema.optional(),
  to: siteSchema.optional(),
  report_language: z.string().trim().max(5).optional(),
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
 * All writes happen server-side so no public write access to the tables is
 * required. The caller only gets back the id and
 * the share token for the estimate it just created.
 */
export const createEstimate = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data, context }) => {
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

    // Saving an estimate (and therefore the PDF and the share link) is a paid
    // feature. A company_token submission is billed against the COMPANY's own
    // plan (companies.id === auth.users.id, so it shares the user_roles /
    // user_credits rows) — the anonymous visitor filling in that company's
    // public form has no account to check or top up. Everyone else must be
    // signed in with an entitlement. Identity is always server-verified, never
    // client-supplied, so neither path can be spoofed.
    if (data.company_token) {
      if (companyId) {
        const allowed = await consumePlanEntitlement(supabaseAdmin, companyId);
        if (!allowed) throw new Error("COMPANY_QUOTA_EXCEEDED");
      }
    } else {
      const userId = await resolveVerifiedUserId();
      if (!userId) throw new Error("AUTH_REQUIRED");
      const allowed = await consumePlanEntitlement(supabaseAdmin, userId);
      if (!allowed) throw new Error("NO_CREDITS");
      // Without a company token an estimate can only belong to the caller's own company.
      if (companyId !== userId) companyId = null;
    }

    const from = data.from ?? { elevator: false };
    const to = data.to ?? { elevator: false };
    // The estimate has no dedicated mobile-number column, so the on-site
    // mobile numbers lead the access notes the company already sees.
    const withMobile = (mobile: string | undefined, notes: string | undefined) =>
      [mobile ? `Mobil på stedet / mobile: ${mobile}` : null, notes || null].filter(Boolean).join("\n") || null;
    const floorNumber = from.floor && /^-?\d{1,3}$/.test(from.floor) ? Number(from.floor) : null;

    const { data: estimate, error: insertError } = await supabaseAdmin
      .from("estimates")
      .insert({
        company_id: companyId,
        status: "new",
        customer_name: data.customer_name || null,
        customer_phone: data.customer_phone || null,
        customer_email: data.customer_email || null,
        move_date: data.move_date || null,
        notes: data.notes || null,
        address: from.address || data.address || null,
        move_from: from.address || data.address || null,
        move_to: to.address || null,
        access_floor: floorNumber,
        has_elevator: from.elevator,
        carry_distance_m: from.carry_m ?? null,
        access_notes: withMobile(from.mobile, undefined),
        delivery_address: to.address || null,
        delivery_floor: to.floor || null,
        delivery_elevator: to.elevator,
        delivery_carry_distance: to.carry_m != null ? String(to.carry_m) : null,
        delivery_notes: withMobile(to.mobile, undefined),
        ...(data.report_language ? { report_language: data.report_language } : {}),
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
          is_included: item.status !== "not_moving",
          tags: buildItemTags({ status: item.status, custom: item.custom, weightKg: item.weight_kg }),
          notes: item.notes,
        })),
      );
      if (itemsError) throw new Error("Could not save the estimate items");
    }

    await supabaseAdmin.from("estimates").update({ total_volume_m3: result.total }).eq("id", estimate.id);

    // Company links: email the company the full summary. Delivery problems
    // never fail the submission — the estimate is saved and shows up in the
    // company's dashboard either way.
    let emailed = false;
    if (companyId) {
      try {
        const { data: company } = await supabaseAdmin
          .from("companies")
          .select("company_name,contact_email,default_language")
          .eq("id", companyId)
          .maybeSingle();
        let companyEmail = company?.contact_email ?? null;
        if (!companyEmail) {
          const { data: owner } = await supabaseAdmin.auth.admin.getUserById(companyId);
          companyEmail = owner.user?.email ?? null;
        }
        if (companyEmail) {
          const { sendLeadEmail, vehicleLabel } = await import("./lead-email.server");
          const { recommendedVolume, recommendVehicle } = await import("./volume");
          const net = result.total;
          const gross = recommendedVolume(net);
          const maybe =
            Math.round(
              result.items.filter((item) => item.status === "maybe").reduce((sum, item) => sum + item.volume_m3, 0) * 100,
            ) / 100;
          const origin = process.env["PUBLIC_SITE_URL"] || "https://www.volumcalc.com";
          const lang = company?.default_language === "no" ? "no" : "en";
          await sendLeadEmail({
            companyName: company?.company_name ?? "VolumCalc",
            companyEmail,
            lang,
            reportUrl: `${origin}/estimate/${estimate.id}?token=${estimate.share_token}`,
            netVolume: net,
            recommendedVolume: gross,
            maybeVolume: maybe,
            vehicle: vehicleLabel(recommendVehicle(gross), lang),
            totalKg: result.items
              .filter((item) => item.status !== "not_moving")
              .reduce((sum, item) => sum + (item.weight_kg ?? 0) * item.quantity, 0),
            customer: {
              name: data.customer_name || null,
              phone: data.customer_phone || null,
              email: data.customer_email || null,
            },
            moveDate: data.move_date || null,
            notes: data.notes || null,
            from: {
              address: from.address || data.address || null,
              floor: from.floor || null,
              elevator: from.elevator,
              carryM: from.carry_m ?? null,
              mobile: from.mobile || null,
              notes: null,
            },
            to: {
              address: to.address || null,
              floor: to.floor || null,
              elevator: to.elevator,
              carryM: to.carry_m ?? null,
              mobile: to.mobile || null,
              notes: null,
            },
            items: result.items.map((item) => ({
              room: item.room || "Other",
              name: item.name_no || item.name,
              quantity: item.quantity,
              volume_m3: item.volume_m3,
              status: item.status,
              custom: item.custom,
              dims:
                item.custom && item.length_cm && item.width_cm && item.height_cm
                  ? `${item.length_cm}×${item.width_cm}×${item.height_cm} cm`
                  : null,
              weight_kg: item.weight_kg,
              notes: item.notes,
            })),
          });
          emailed = true;
        }
      } catch (sendError) {
        console.error("Lead email delivery failed", sendError);
      }
    }

    return { id: estimate.id as string, share_token: estimate.share_token as string, emailed };
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

const addItemsSchema = z.object({
  id: z.string().uuid(),
  token: z
    .string()
    .trim()
    .min(8)
    .max(64)
    .regex(/^[a-f0-9]+$/i),
  room_id: z.string().uuid().nullable().default(null),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        name_no: z.string().trim().min(1).max(120),
        category: z.string().trim().min(1).max(80).default("other"),
        quantity: z.number().int().min(1).max(999),
        length_cm: z.number().min(1).max(5000),
        width_cm: z.number().min(1).max(5000),
        height_cm: z.number().min(1).max(5000),
        confidence: z.number().min(0).max(1).default(1),
        custom: z.boolean().default(false),
        weight_kg: z.number().nonnegative().max(10000).nullable().optional(),
        notes: z.string().trim().max(500).nullable().optional(),
      }),
    )
    .min(1)
    .max(40),
});

/**
 * Adds new items (typed in, with their own dimensions, or picked from the
 * catalogue) to an existing report, in one room, and refreshes the report
 * total. Same share-token check as the other report edits.
 */
export const addEstimateItems = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => addItemsSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: estimate } = await supabaseAdmin
      .from("estimates")
      .select("id,share_token")
      .eq("id", data.id)
      .maybeSingle();
    if (!estimate || estimate.share_token !== data.token) throw new Error("Estimate not found");

    if (data.room_id) {
      const { data: room } = await supabaseAdmin
        .from("estimate_rooms")
        .select("id,estimate_id")
        .eq("id", data.room_id)
        .maybeSingle();
      if (!room || room.estimate_id !== data.id) throw new Error("Room not found");
    }

    const { error: insertError } = await supabaseAdmin.from("estimate_items").insert(
      data.items.map((item) => ({
        estimate_id: data.id,
        room_id: data.room_id,
        name: item.name,
        name_no: item.name_no,
        category: item.category,
        quantity: item.quantity,
        length_cm: item.length_cm,
        width_cm: item.width_cm,
        height_cm: item.height_cm,
        volume_m3:
          Math.round(((item.length_cm * item.width_cm * item.height_cm * item.quantity) / 1_000_000) * 100) / 100,
        confidence: item.confidence,
        photo_url: null,
        notes: item.notes ?? null,
        tags: buildItemTags({ status: "moving", custom: item.custom, weightKg: item.weight_kg }),
      })),
    );
    if (insertError) throw new Error("Could not add the items");

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

    return { added: data.items.length };
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
