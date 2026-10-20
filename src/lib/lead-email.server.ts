import { sendMailViaSmtp } from "./smtp.server";

type Site = {
  address: string | null;
  floor: string | number | null;
  elevator: boolean;
  carryM: number | null;
  mobile: string | null;
  notes: string | null;
};

export type LeadItem = {
  room: string;
  name: string;
  quantity: number;
  volume_m3: number;
  status: "moving" | "maybe" | "not_moving";
  custom: boolean;
  dims: string | null;
  weight_kg: number | null;
  notes: string | null;
};

export type LeadSummary = {
  companyName: string;
  companyEmail: string;
  lang: "no" | "en";
  reportUrl: string;
  netVolume: number;
  recommendedVolume: number;
  maybeVolume: number;
  vehicle: string;
  totalKg: number;
  customer: { name: string | null; phone: string | null; email: string | null };
  moveDate: string | null;
  notes: string | null;
  from: Site;
  to: Site;
  items: LeadItem[];
};

const T = {
  no: {
    subject: (name: string, m3: string) => `Ny flytteforespørsel fra ${name} (${m3})`,
    intro: "Du har fått en ny flytteforespørsel via VolumCalc.",
    volume: "Volum",
    net: "Netto",
    recommended: "Anbefalt (med buffer)",
    maybe: "Hvorav «kanskje»",
    vehicle: "Anbefalt kjøretøy",
    weight: "Vekt",
    contact: "Kontakt",
    name: "Navn",
    phone: "Telefon",
    email: "E-post",
    date: "Ønsket dato",
    pickup: "Henteadresse",
    delivery: "Leveringsadresse",
    floor: "Etasje",
    lift: "Heis",
    yes: "ja",
    no: "nei",
    carry: "Bæreavstand",
    mobile: "Mobil på stedet",
    notes: "Notater",
    items: "Gjenstander",
    report: "Åpne hele rapporten",
    maybeTag: "kanskje",
    notMovingTag: "flytter ikke",
    customTag: "egendefinert",
    notMovingHeading: "Flyttes ikke (ikke med i volumet)",
  },
  en: {
    subject: (name: string, m3: string) => `New moving request from ${name} (${m3})`,
    intro: "You have received a new moving request through VolumCalc.",
    volume: "Volume",
    net: "Net",
    recommended: "Recommended (with buffer)",
    maybe: "Of which “maybe”",
    vehicle: "Recommended vehicle",
    weight: "Weight",
    contact: "Contact",
    name: "Name",
    phone: "Phone",
    email: "Email",
    date: "Preferred date",
    pickup: "Pickup address",
    delivery: "Delivery address",
    floor: "Floor",
    lift: "Lift",
    yes: "yes",
    no: "no",
    carry: "Carry distance",
    mobile: "Mobile at the address",
    notes: "Notes",
    items: "Items",
    report: "Open the full report",
    maybeTag: "maybe",
    notMovingTag: "not moving",
    customTag: "custom",
    notMovingHeading: "Not moving (not in the volume)",
  },
} as const;

const VEHICLES: Record<"no" | "en", Record<string, string>> = {
  no: {
    "rep.truck.van": "Varebil kl. B",
    "rep.truck.small": "Varebil kl. B / Liten flyttebil",
    "rep.truck.medium": "Flyttebil 3,5–7,5 tonn",
    "rep.truck.large": "Stor flyttebil / semi",
  },
  en: {
    "rep.truck.van": "Small van (class B)",
    "rep.truck.small": "Large van / small moving truck",
    "rep.truck.medium": "Moving truck 3.5–7.5 t",
    "rep.truck.large": "Large moving truck / trailer",
  },
};

export function vehicleLabel(key: string, lang: "no" | "en"): string {
  return VEHICLES[lang][key] ?? key;
}

const round = (n: number) => (Math.round(n * 100) / 100).toString();

export function composeLeadEmail(summary: LeadSummary): { subject: string; text: string } {
  const t = T[summary.lang];
  const m3 = (n: number) => `${round(n)} m³`;

  const site = (title: string, s: Site) => [
    `${title}: ${s.address || "—"}`,
    `  ${t.floor}: ${s.floor ?? "—"} · ${t.lift}: ${s.elevator ? t.yes : t.no} · ${t.carry}: ${s.carryM != null ? `${s.carryM} m` : "—"}`,
    `  ${t.mobile}: ${s.mobile || "—"}`,
    ...(s.notes ? [`  ${t.notes}: ${s.notes}`] : []),
  ];

  const line = (item: LeadItem) => {
    const flags = [
      item.status === "maybe" ? t.maybeTag : null,
      item.custom ? t.customTag : null,
      item.dims,
      item.weight_kg ? `${round(item.weight_kg)} kg` : null,
    ].filter(Boolean);
    return `  ${item.quantity} × ${item.name} — ${m3(item.volume_m3)}${flags.length ? ` (${flags.join(", ")})` : ""}${item.notes ? ` — ${item.notes}` : ""}`;
  };

  const counted = summary.items.filter((item) => item.status !== "not_moving");
  const skipped = summary.items.filter((item) => item.status === "not_moving");
  const rooms = Array.from(new Set(counted.map((item) => item.room)));

  const lines = [
    t.intro,
    "",
    `${t.volume}: ${t.net} ${m3(summary.netVolume)} · ${t.recommended} ${m3(summary.recommendedVolume)}${
      summary.maybeVolume > 0 ? ` · ${t.maybe} ${m3(summary.maybeVolume)}` : ""
    }`,
    `${t.vehicle}: ${summary.vehicle}`,
    ...(summary.totalKg > 0 ? [`${t.weight}: ${Math.round(summary.totalKg)} kg`] : []),
    "",
    `${t.contact}:`,
    `  ${t.name}: ${summary.customer.name || "—"}`,
    `  ${t.phone}: ${summary.customer.phone || "—"}`,
    `  ${t.email}: ${summary.customer.email || "—"}`,
    `  ${t.date}: ${summary.moveDate || "—"}`,
    "",
    ...site(t.pickup, summary.from),
    "",
    ...site(t.delivery, summary.to),
    ...(summary.notes ? ["", `${t.notes}: ${summary.notes}`] : []),
    "",
    `${t.items}:`,
    ...rooms.flatMap((room) => [
      `${room}`,
      ...counted.filter((item) => item.room === room).map(line),
    ]),
    ...(skipped.length ? ["", t.notMovingHeading, ...skipped.map(line)] : []),
    "",
    `${t.report}: ${summary.reportUrl}`,
  ];

  return {
    subject: t.subject(summary.customer.name || "—", m3(summary.recommendedVolume)),
    text: lines.join("\n"),
  };
}

/** Emails the full lead summary to the moving company. Throws if delivery fails. */
export async function sendLeadEmail(summary: LeadSummary): Promise<void> {
  const sender = process.env["MIGADU_SMTP_USER"];
  if (!sender) throw new Error("SMTP sender is not configured");
  const { subject, text } = composeLeadEmail(summary);
  await sendMailViaSmtp({
    from: sender,
    fromName: `VolumCalc — ${summary.companyName}`,
    to: summary.companyEmail,
    ...(summary.customer.email ? { replyTo: summary.customer.email } : {}),
    subject,
    text,
  });
}
