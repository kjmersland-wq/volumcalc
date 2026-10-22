import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { accessLine, composeMail, type Facts, type MailInput } from "@/lib/outreach.functions";
import { getDb, insuranceLine, loadEstimate, type EstimateRow } from "@/lib/partners.functions";

const MAX_REQUESTS_PER_ESTIMATE = 10;

const tokenSchema = z
  .string()
  .trim()
  .min(8)
  .max(64)
  .regex(/^[a-f0-9]+$/i);

const topSchema = z.object({ estimateId: z.string().uuid(), token: tokenSchema });

async function topFor(estimate: EstimateRow) {
  const { findTopMovers } = await import("./places.server");
  if (!estimate.move_from_country || !estimate.move_to_country) return null;
  return findTopMovers({
    fromCountry: estimate.move_from_country,
    toCountry: estimate.move_to_country,
    fromAddress: estimate.move_from,
  });
}

/**
 * The five best-rated movers for the customer's route, ranked on Google rating and review count.
 * The e-mail itself never leaves the server; the page only learns whether one was found.
 */
export const findTopMoversForEstimate = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => topSchema.parse(data))
  .handler(async ({ data }) => {
    const { placesConfigured } = await import("./places.server");
    if (!placesConfigured()) return { available: false as const, missingRoute: false, movers: [] };

    const db = await getDb();
    const estimate = await loadEstimate(db, data.estimateId, data.token);
    const top = await topFor(estimate);
    if (!top) return { available: true as const, missingRoute: true, movers: [] };

    const { data: sentRows } = await db
      .from("quote_requests")
      .select("partners(lead_email)")
      .eq("estimate_id", estimate.id)
      .eq("status", "sent");
    const sentEmails = new Set(
      ((sentRows ?? []) as { partners: { lead_email: string } | null }[])
        .map((r) => r.partners?.lead_email?.toLowerCase())
        .filter(Boolean),
    );

    return {
      available: true as const,
      missingRoute: false,
      movers: top.map((m) => ({
        placeId: m.placeId,
        name: m.name,
        rating: m.rating,
        reviews: m.reviews,
        address: m.address,
        website: m.website,
        mapsUrl: m.mapsUrl,
        phone: m.phone,
        contactUrl: m.contactUrl,
        canEmail: Boolean(m.email),
        alreadySent: m.email ? sentEmails.has(m.email.toLowerCase()) : false,
      })),
    };
  });

const sendSchema = z.object({
  estimateId: z.string().uuid(),
  token: tokenSchema,
  placeIds: z.array(z.string().min(5).max(200)).min(1).max(5),
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

/** Emails the report to the ticked movers. Only movers on the current top list can be chosen. */
export const sendRequestsToTopMovers = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => sendSchema.parse(data))
  .handler(async ({ data }) => {
    const db = await getDb();
    const estimate = await loadEstimate(db, data.estimateId, data.token);
    const top = await topFor(estimate);
    if (!top) throw new Error("Route missing");

    const chosen = top.filter((m) => data.placeIds.includes(m.placeId) && m.email);
    if (chosen.length === 0) throw new Error("No movers with an e-mail address selected");

    // Every company gets a row (inactive, so it never shows up as a curated partner). That row is
    // the audit trail and what stops the same report going to the same company twice.
    const rowFor = new Map<string, string>();
    for (const mover of chosen) {
      const email = mover.email!.toLowerCase();
      const { data: existing } = await db.from("partners").select("id").eq("lead_email", email).maybeSingle();
      if (existing?.id) {
        rowFor.set(mover.placeId, existing.id as string);
        continue;
      }
      const { data: created, error } = await db
        .from("partners")
        .insert({
          name: mover.name.slice(0, 160),
          website: mover.website.slice(0, 240),
          country_code: estimate.move_from_country,
          lead_email: email,
          serves_from: [estimate.move_from_country],
          serves_to: [estimate.move_to_country],
          languages: [],
          active: false,
          agreement_note: "Found automatically via Google Places; no agreement",
        })
        .select("id")
        .single();
      if (error || !created) throw new Error("Could not record the request");
      rowFor.set(mover.placeId, created.id as string);
    }

    const { data: sentRows } = await db
      .from("quote_requests")
      .select("partner_id,status")
      .eq("estimate_id", estimate.id);
    const rows = (sentRows ?? []) as { partner_id: string; status: string }[];
    const alreadySent = new Set(rows.filter((r) => r.status === "sent").map((r) => r.partner_id));
    if (alreadySent.size >= MAX_REQUESTS_PER_ESTIMATE) throw new Error("Request limit reached for this report");

    const toSend = chosen.filter((m) => !alreadySent.has(rowFor.get(m.placeId)!));
    if (toSend.length === 0) return { sent: [] as string[], failed: [] as string[] };

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
    const message = [insuranceLine(data.lang, estimate.transport_insurance), data.message].filter(Boolean).join("\n\n");
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
    const sent: string[] = [];
    const failed: string[] = [];
    const log: Record<string, unknown>[] = [];

    for (const mover of toSend) {
      const partnerId = rowFor.get(mover.placeId)!;
      try {
        await sendMailViaSmtp({
          from: sender,
          fromName: data.senderName,
          to: mover.email!,
          replyTo: data.replyTo,
          subject,
          text,
        });
        sent.push(mover.name);
        log.push({ estimate_id: estimate.id, partner_id: partnerId, status: "sent", transport_insurance: estimate.transport_insurance });
      } catch (error) {
        console.error("Quote request failed", mover.placeId, error);
        failed.push(mover.name);
        log.push({
          estimate_id: estimate.id,
          partner_id: partnerId,
          status: "failed",
          error: error instanceof Error ? error.message.slice(0, 300) : "send failed",
          transport_insurance: estimate.transport_insurance,
        });
      }
    }

    const { error: logError } = await db.from("quote_requests").upsert(log, { onConflict: "estimate_id,partner_id" });
    if (logError) console.error("Could not log quote requests", logError);
    return { sent, failed };
  });
