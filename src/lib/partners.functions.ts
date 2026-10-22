import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { accessLine, composeMail, type Facts, type MailInput } from "@/lib/outreach.functions";

/**
 * Partner matching and quote requests for private customers.
 *
 * The partner tables and the new estimate columns (move_*_country,
 * transport_insurance) come from migration 20261013090000. The generated
 * Supabase types are rewritten by Lovable, so until they include the new
 * tables the queries below go through this loosely typed handle.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LooseDb = { from: (table: string) => any };

const MAX_MATCHES = 5;
const MAX_REQUESTS_PER_ESTIMATE = 10;

const tokenSchema = z
  .string()
  .trim()
  .min(8)
  .max(64)
  .regex(/^[a-f0-9]+$/i);
const countrySchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{2}$/, "Use an upper-case ISO country code");

type PartnerRow = {
  id: string;
  name: string;
  country_code: string;
  serves_from: string[];
  serves_to: string[];
  min_m3: number | null;
  max_m3: number | null;
  languages: string[];
  priority: number;
};

export type EstimateRow = {
  id: string;
  share_token: string;
  total_volume_m3: number | string | null;
  report_title: string | null;
  customer_name: string | null;
  move_from: string | null;
  move_to: string | null;
  move_distance_km: number | null;
  access_floor: string | number | null;
  has_elevator: boolean | null;
  carry_distance_m: string | number | null;
  delivery_floor: string | number | null;
  delivery_elevator: boolean | null;
  delivery_carry_distance: string | number | null;
  move_from_country: string | null;
  move_to_country: string | null;
  transport_insurance: boolean | null;
};

const ESTIMATE_COLUMNS =
  "id,share_token,total_volume_m3,report_title,customer_name,move_from,move_to,move_distance_km,access_floor,has_elevator,carry_distance_m,delivery_floor,delivery_elevator,delivery_carry_distance,move_from_country,move_to_country,transport_insurance";

export async function getDb(): Promise<LooseDb> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as LooseDb;
}

export async function loadEstimate(db: LooseDb, id: string, token: string): Promise<EstimateRow> {
  const { data } = await db.from("estimates").select(ESTIMATE_COLUMNS).eq("id", id).maybeSingle();
  if (!data || data.share_token !== token) throw new Error("Invalid report link");
  return data as EstimateRow;
}

/** Active partners that cover the route and the volume, best match first. */
async function eligiblePartners(db: LooseDb, estimate: EstimateRow): Promise<PartnerRow[]> {
  const from = estimate.move_from_country;
  const to = estimate.move_to_country;
  if (!from || !to) return [];
  const volume = Number(estimate.total_volume_m3) || 0;

  const { data } = await db
    .from("partners")
    .select("id,name,country_code,serves_from,serves_to,min_m3,max_m3,languages,priority")
    .eq("active", true)
    .contains("serves_from", [from])
    .contains("serves_to", [to])
    .order("priority", { ascending: true })
    .order("name", { ascending: true });

  return ((data ?? []) as PartnerRow[]).filter(
    (p) => (p.min_m3 == null || volume >= Number(p.min_m3)) && (p.max_m3 == null || volume <= Number(p.max_m3)),
  );
}

async function sentPartnerIds(db: LooseDb, estimateId: string): Promise<Set<string>> {
  const { data } = await db.from("quote_requests").select("partner_id").eq("estimate_id", estimateId).eq("status", "sent");
  return new Set(((data ?? []) as { partner_id: string }[]).map((r) => r.partner_id));
}

const matchSchema = z.object({ estimateId: z.string().uuid(), token: tokenSchema });

/**
 * Up to five relevant partners for the customer's route and volume. Only
 * public fields are returned — never the partner's lead e-mail.
 */
export const matchPartners = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => matchSchema.parse(data))
  .handler(async ({ data }) => {
    const db = await getDb();
    const estimate = await loadEstimate(db, data.estimateId, data.token);
    const missingRoute = !estimate.move_from_country || !estimate.move_to_country;
    const [eligible, sent] = await Promise.all([eligiblePartners(db, estimate), sentPartnerIds(db, estimate.id)]);
    return {
      missingRoute,
      partners: eligible.slice(0, MAX_MATCHES).map((p) => ({
        id: p.id,
        name: p.name,
        country: p.country_code,
        languages: p.languages,
        alreadySent: sent.has(p.id),
      })),
    };
  });

const detailsSchema = z.object({
  estimateId: z.string().uuid(),
  token: tokenSchema,
  fromCountry: countrySchema.nullable().optional(),
  toCountry: countrySchema.nullable().optional(),
  transportInsurance: z.boolean().nullable().optional(),
});

/** Reads the route and insurance choice stored on the estimate. */
export const getMoveDetails = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => matchSchema.parse(data))
  .handler(async ({ data }) => {
    const db = await getDb();
    const estimate = await loadEstimate(db, data.estimateId, data.token);
    return {
      fromCountry: estimate.move_from_country,
      toCountry: estimate.move_to_country,
      transportInsurance: estimate.transport_insurance,
    };
  });

/** Saves route countries and/or the insurance choice; the report token is the credential. */
export const setMoveDetails = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => detailsSchema.parse(data))
  .handler(async ({ data }) => {
    const db = await getDb();
    await loadEstimate(db, data.estimateId, data.token);
    const patch: Record<string, unknown> = {};
    if (data.fromCountry !== undefined) patch["move_from_country"] = data.fromCountry;
    if (data.toCountry !== undefined) patch["move_to_country"] = data.toCountry;
    if (data.transportInsurance !== undefined) patch["transport_insurance"] = data.transportInsurance;
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await db.from("estimates").update(patch).eq("id", data.estimateId);
    if (error) throw new Error("Could not save move details");
    return { ok: true };
  });

const sendSchema = z.object({
  estimateId: z.string().uuid(),
  token: tokenSchema,
  partnerIds: z.array(z.string().uuid()).min(1).max(MAX_MATCHES),
  senderName: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[^\r\n]*$/, "Name cannot contain line breaks"),
  replyTo: z.string().trim().email().max(180),
  message: z.string().trim().max(1500).optional(),
  reportUrl: z.string().trim().url().max(500),
  lang: z.enum(["no", "en", "pl"]).default("no"),
  consent: z.literal(true),
});

export function insuranceLine(lang: MailInput["lang"], insurance: boolean | null): string | null {
  if (insurance === null) return null;
  const text = {
    no: insurance ? "Transportforsikring ønskes inkludert i tilbudet." : "Transportforsikring er ikke ønsket.",
    en: insurance ? "Please include transport insurance in the quote." : "Transport insurance is not wanted.",
    pl: insurance
      ? "Prosimy o uwzględnienie ubezpieczenia transportu w ofercie."
      : "Ubezpieczenie transportu nie jest wymagane.",
  } as const;
  return text[lang];
}

/**
 * Emails the report to the partners the customer ticked. Only partners that
 * still match the route and volume can be chosen, each partner gets a report
 * at most once, and every send is logged with the customer's consent.
 */
export const sendQuoteRequests = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => sendSchema.parse(data))
  .handler(async ({ data }) => {
    const db = await getDb();
    const estimate = await loadEstimate(db, data.estimateId, data.token);

    const [eligible, alreadySent] = await Promise.all([eligiblePartners(db, estimate), sentPartnerIds(db, estimate.id)]);
    if (alreadySent.size >= MAX_REQUESTS_PER_ESTIMATE) throw new Error("Request limit reached for this report");

    const allowed = new Map(eligible.slice(0, MAX_MATCHES).map((p) => [p.id, p]));
    const chosen = [...new Set(data.partnerIds)].filter((id) => allowed.has(id) && !alreadySent.has(id));
    if (chosen.length === 0) throw new Error("No eligible partners selected");

    const { data: leadRows } = await db.from("partners").select("id,lead_email").in("id", chosen);
    const leadEmail = new Map(((leadRows ?? []) as { id: string; lead_email: string }[]).map((r) => [r.id, r.lead_email]));

    const fallbackTitle = data.lang === "no" ? "Flytteoppdrag" : data.lang === "pl" ? "Przeprowadzka" : "Move";
    const facts: Facts = {
      title: estimate.report_title || estimate.customer_name || fallbackTitle,
      volume: Number(estimate.total_volume_m3) || 0,
      from: estimate.move_from,
      to: estimate.move_to,
      distanceKm: estimate.move_distance_km,
      pickupAccess: accessLine(data.lang, estimate.access_floor, estimate.has_elevator, estimate.carry_distance_m),
      deliveryAccess: accessLine(
        data.lang,
        estimate.delivery_floor,
        estimate.delivery_elevator,
        estimate.delivery_carry_distance,
      ),
    };
    const message = [insuranceLine(data.lang, estimate.transport_insurance), data.message]
      .filter(Boolean)
      .join("\n\n");
    const mailInput = {
      estimateId: data.estimateId,
      token: data.token,
      recipients: [],
      replyTo: data.replyTo,
      senderName: data.senderName,
      message,
      reportUrl: data.reportUrl,
      lang: data.lang,
    } as MailInput;
    const { subject, text } = composeMail(data.lang, facts, mailInput);

    const { sendMailViaSmtp } = await import("./smtp.server");
    const sender = process.env["MIGADU_SMTP_USER"]!;
    const sentTo: string[] = [];
    const failed: string[] = [];
    const log: Record<string, unknown>[] = [];

    for (const id of chosen) {
      const to = leadEmail.get(id);
      const name = allowed.get(id)!.name;
      if (!to) {
        failed.push(name);
        continue;
      }
      try {
        await sendMailViaSmtp({ from: sender, fromName: "VolumCalc", to, replyTo: data.replyTo, subject, text });
        sentTo.push(name);
        log.push({ estimate_id: estimate.id, partner_id: id, status: "sent", transport_insurance: estimate.transport_insurance });
      } catch (error) {
        console.error("Quote request failed", id, error);
        failed.push(name);
        log.push({
          estimate_id: estimate.id,
          partner_id: id,
          status: "failed",
          error: error instanceof Error ? error.message.slice(0, 300) : "send failed",
          transport_insurance: estimate.transport_insurance,
        });
      }
    }

    if (log.length) {
      const { error } = await db.from("quote_requests").upsert(log, { onConflict: "estimate_id,partner_id" });
      if (error) console.error("Could not log quote requests", error);
    }
    return { sent: sentTo, failed };
  });
