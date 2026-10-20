import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { formatDuration } from "@/lib/move-time";

const schema = z.object({
  estimateId: z.string().uuid(),
  token: z.string().min(6).max(80),
  recipients: z.array(z.string().trim().email().max(180)).min(1).max(15),
  replyTo: z.string().trim().email().max(180),
  senderName: z.string().trim().min(2).max(120),
  message: z.string().trim().max(2000).optional(),
  reportUrl: z.string().trim().url().max(500),
  lang: z.enum(["no", "en", "pl"]).default("no"),
  /** Clock minutes from the report's time estimate, if the report has one. */
  time: z
    .object({
      crew: z.number().int().min(1).max(4),
      total: z.number().min(0).max(10_000),
      low: z.number().min(0).max(10_000),
      high: z.number().min(0).max(20_000),
    })
    .optional(),
});

type MailInput = z.infer<typeof schema>;
type MailLang = MailInput["lang"];

type Facts = {
  title: string;
  volume: number;
  from: string | null;
  to: string | null;
  distanceKm: number | null;
  pickupAccess: string | null;
  deliveryAccess: string | null;
};

const HOURS: Record<MailLang, string> = { no: "t", en: "h", pl: "godz." };

function liftText(lang: MailLang, value: boolean | null | undefined) {
  if (value == null) return null;
  if (lang === "no") return value ? "med heis" : "uten heis";
  if (lang === "pl") return value ? "z windą" : "bez windy";
  return value ? "with a lift" : "no lift";
}

function accessLine(
  lang: MailLang,
  floor: string | number | null | undefined,
  elevator: boolean | null | undefined,
  carry: string | number | null | undefined,
) {
  const parts: string[] = [];
  if (floor !== null && floor !== undefined && String(floor).trim() !== "") {
    parts.push(lang === "no" ? `etasje ${floor}` : lang === "pl" ? `piętro ${floor}` : `floor ${floor}`);
  }
  const lift = liftText(lang, elevator);
  if (lift) parts.push(lift);
  if (carry !== null && carry !== undefined && String(carry).trim() !== "") {
    parts.push(
      lang === "no" ? `ca. ${carry} m å bære` : lang === "pl" ? `ok. ${carry} m noszenia` : `about ${carry} m to carry`,
    );
  }
  return parts.length ? parts.join(", ") : null;
}

/**
 * Plain, friendly wording written by hand in each language — deliberately not
 * a stiff form letter. The customer is a person asking for help with a move.
 */
function composeMail(lang: MailLang, facts: Facts, input: MailInput): { subject: string; text: string } {
  const fmt = (n: number) => formatDuration(n, HOURS[lang], "min");
  const m3 = `${Math.round(facts.volume * 10) / 10} m³`;
  const route = facts.from && facts.to ? `${facts.from} → ${facts.to}` : facts.from || facts.to;
  const km = facts.distanceKm;

  const t = {
    no: {
      subject: `Kan dere hjelpe oss med flytting? – ${facts.title}`,
      hello: "Hei!",
      intro: `Jeg heter ${input.senderName} og skal flytte snart. Jeg har satt sammen en oversikt over alt som skal med, og håper dere kan gi meg et tilbud.`,
      factsTitle: "Kort om flyttingen:",
      volume: `Volum: ca. ${m3}`,
      route: route ? `Strekning: ${route}${km ? ` (ca. ${km} km)` : ""}` : null,
      pickup: facts.pickupAccess ? `Der vi flytter fra: ${facts.pickupAccess}` : null,
      delivery: facts.deliveryAccess ? `Dit vi flytter: ${facts.deliveryAccess}` : null,
      time: input.time
        ? `Tidsbruk: vi har regnet ut ca. ${fmt(input.time.total)} med ${input.time.crew} personer (typisk ${fmt(input.time.low)}–${fmt(input.time.high)}), medregnet pakking, bæring, sikring i bilen og lossing. Kjøretid kommer i tillegg.`
        : null,
      report: "Hele rapporten med alle gjenstander og mål ligger her:",
      ask: "Kan dere sende meg et pristilbud, og si litt om når dere har ledig tid? Har dere spørsmål, er det bare å svare på denne e-posten, så tar jeg kontakt raskt.",
      thanks: "Tusen takk for hjelpen!",
      regards: "Vennlig hilsen",
      footer: "Sendt via VolumCalc – volumcalc.com",
    },
    en: {
      subject: `Could you help us with a move? – ${facts.title}`,
      hello: "Hi there,",
      intro: `My name is ${input.senderName} and I'm moving soon. I've put together an overview of everything that needs to come along, and I'd love to hear what you could offer.`,
      factsTitle: "A quick summary:",
      volume: `Volume: about ${m3}`,
      route: route ? `Route: ${route}${km ? ` (about ${km} km)` : ""}` : null,
      pickup: facts.pickupAccess ? `Where we're moving from: ${facts.pickupAccess}` : null,
      delivery: facts.deliveryAccess ? `Where we're moving to: ${facts.deliveryAccess}` : null,
      time: input.time
        ? `Time needed: we estimate about ${fmt(input.time.total)} with ${input.time.crew} people (typically ${fmt(input.time.low)}–${fmt(input.time.high)}), including packing, carrying, securing the load and unloading. Driving time is extra.`
        : null,
      report: "The full report with every item and measurement is here:",
      ask: "Could you send me a price quote, and let me know when you might have a free slot? If anything is unclear, just reply to this email and I'll get back to you quickly.",
      thanks: "Thank you so much for your help!",
      regards: "Kind regards",
      footer: "Sent via VolumCalc – volumcalc.com",
    },
    pl: {
      subject: `Czy możecie pomóc nam w przeprowadzce? – ${facts.title}`,
      hello: "Dzień dobry!",
      intro: `Nazywam się ${input.senderName} i wkrótce się przeprowadzam. Mam przygotowane zestawienie wszystkiego, co jedzie ze mną, i bardzo chętnie poznam Waszą ofertę.`,
      factsTitle: "Krótko o przeprowadzce:",
      volume: `Objętość: ok. ${m3}`,
      route: route ? `Trasa: ${route}${km ? ` (ok. ${km} km)` : ""}` : null,
      pickup: facts.pickupAccess ? `Skąd się wyprowadzamy: ${facts.pickupAccess}` : null,
      delivery: facts.deliveryAccess ? `Dokąd się przeprowadzamy: ${facts.deliveryAccess}` : null,
      time: input.time
        ? `Czas pracy: szacujemy ok. ${fmt(input.time.total)} przy ${input.time.crew} osobach (zwykle ${fmt(input.time.low)}–${fmt(input.time.high)}), wliczając pakowanie, noszenie, zabezpieczenie ładunku i rozładunek. Czas dojazdu liczy się osobno.`
        : null,
      report: "Pełny raport z wszystkimi przedmiotami, wymiarami i zdjęciami znajdziecie tutaj:",
      ask: "Czy moglibyście przesłać wycenę i napisać, kiedy macie wolny termin? Jeśli coś jest niejasne, wystarczy odpowiedzieć na tego maila – odezwę się szybko.",
      thanks: "Bardzo dziękuję za pomoc!",
      regards: "Pozdrawiam serdecznie",
      footer: "Wysłano przez VolumCalc – volumcalc.com",
    },
  }[lang];

  const text = [
    t.hello,
    "",
    t.intro,
    "",
    t.factsTitle,
    `• ${t.volume}`,
    ...[t.route, t.pickup, t.delivery, t.time].filter((line): line is string => Boolean(line)).map((line) => `• ${line}`),
    "",
    t.report,
    input.reportUrl,
    "",
    t.ask,
    ...(input.message?.trim() ? ["", input.message.trim()] : []),
    "",
    t.thanks,
    "",
    t.regards,
    input.senderName,
    input.replyTo,
    "",
    "---",
    t.footer,
  ].join("\n");

  return { subject: `[VolumCalc] ${t.subject}`, text };
}

/**
 * Sends the shareable estimate report link to the moving companies the
 * customer picked. The share token is validated against the estimate so a
 * report can only be sent by someone who already holds the link.
 */
export const sendEstimateToMovers = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: estimate } = await supabaseAdmin
      .from("estimates")
      .select(
        "id, share_token, total_volume_m3, report_title, customer_name, move_from, move_to, move_distance_km, access_floor, has_elevator, carry_distance_m, delivery_floor, delivery_elevator, delivery_carry_distance",
      )
      .eq("id", data.estimateId)
      .maybeSingle();
    if (!estimate || estimate.share_token !== data.token) throw new Error("Invalid report link");

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
    const { subject, text } = composeMail(data.lang, facts, data);

    const { sendMailViaSmtp } = await import("./smtp.server");
    const sender = process.env["MIGADU_SMTP_USER"]!;
    const results: { to: string; ok: boolean }[] = [];
    for (const to of data.recipients) {
      try {
        await sendMailViaSmtp({
          from: sender,
          fromName: "VolumCalc",
          to,
          replyTo: data.replyTo,
          subject,
          text,
        });
        results.push({ to, ok: true });
      } catch (error) {
        console.error("Mover outreach failed", to, error);
        results.push({ to, ok: false });
      }
    }
    return { sent: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).map((r) => r.to) };
  });
