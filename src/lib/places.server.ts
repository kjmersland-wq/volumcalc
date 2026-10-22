/**
 * Finds the best-rated international movers for a route with Google Places and
 * looks up a generic contact e-mail on each company's own website.
 * Server only. Google data is fetched live and only held in a short in-memory cache.
 */

export type RankedMover = {
  placeId: string;
  name: string;
  rating: number;
  reviews: number;
  address: string | null;
  website: string;
  mapsUrl: string | null;
  phone: string | null;
  /** Generic address read from the company's own site, if one was found. */
  email: string | null;
  /** Page to send people to when no e-mail was found. */
  contactUrl: string;
};

type PlaceResult = {
  id: string;
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  formattedAddress?: string;
  googleMapsUri?: string;
  nationalPhoneNumber?: string;
};

export type RouteQuery = {
  fromCountry: string;
  toCountry: string;
  fromAddress: string | null;
};

const MAX_RESULTS = 5;
const MIN_RATING = 3.8;
const MIN_REVIEWS = 3;
const CACHE_TTL_MS = 30 * 60 * 1000;

// Local wording finds local companies; Google matches the query to business names and categories.
const LOCAL_TERMS: Record<string, { term: string; lang: string }> = {
  NO: { term: "flyttebyrå internasjonal flytting", lang: "no" },
  SE: { term: "flyttfirma internationell flytt", lang: "sv" },
  DK: { term: "flyttefirma international flytning", lang: "da" },
  FI: { term: "kansainväliset muutot muuttofirma", lang: "fi" },
  PL: { term: "przeprowadzki międzynarodowe firma przeprowadzkowa", lang: "pl" },
  DE: { term: "internationaler Umzug Umzugsunternehmen", lang: "de" },
  NL: { term: "internationale verhuizing verhuisbedrijf", lang: "nl" },
  BE: { term: "internationale verhuizing déménagement international", lang: "nl" },
  FR: { term: "déménagement international déménageur", lang: "fr" },
  ES: { term: "mudanzas internacionales", lang: "es" },
  IT: { term: "traslochi internazionali", lang: "it" },
  PT: { term: "mudanças internacionais", lang: "pt" },
  GB: { term: "international removals company", lang: "en" },
  IE: { term: "international removals company", lang: "en" },
};

function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Weighted rating: a handful of 5-star reviews must not beat hundreds of 4.7s. */
function score(rating: number, reviews: number): number {
  const m = 15;
  const c = 4.2;
  return (reviews / (reviews + m)) * rating + (m / (reviews + m)) * c;
}

// ---- e-mail discovery ---------------------------------------------------------

const GENERIC_LOCAL = new RegExp(
  "^(info|post|mail|kontakt|contact|kontakta|hello|hallo|hej|office|kontor|sales|salg|quote|quotes|offer|offerte|" +
    "offers|tilbud|offert|booking|moving|move|flytt|umzug|angebot|service|kundeservice|kundservice|customerservice|" +
    "enquiries|enquiry|reception|international|relocation|removals|devis|demenagement|biuro|oferta|zapytania|" +
    "sekretariat|verhuizing|verhuizen|planning|vertrieb|anfrage|firmapost|kundenservice|umzuege|mudanzas|traslochi)" +
    "([._-].*)?$",
  "i",
);
const PREFERRED = ["international", "info", "post", "kontakt", "contact", "mail", "office", "biuro", "sales", "enquiries"];
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const LINK_RE = /href=["']([^"'#]+)["']/gi;
const CONTACT_HINT = /contact|kontakt|kontakta|impressum|over-ons|nous|contacto|contatti|om-oss|om-os/i;

function rootDomain(host: string): string {
  const parts = host.toLowerCase().split(".");
  if (parts.length >= 3 && ["co", "com", "org"].includes(parts[parts.length - 2]!) && parts[parts.length - 1]!.length === 2) {
    return parts.slice(-3).join(".");
  }
  return parts.slice(-2).join(".");
}

/** Only public http(s) sites: no localhost, IP literals or internal names. */
function safeUrl(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || /^[\d.]+$/.test(host) || host.includes(":") || host.endsWith(".local") || host.endsWith(".internal")) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

async function fetchText(url: string): Promise<{ finalUrl: string; text: string } | null> {
  const parsed = safeUrl(url);
  if (!parsed) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(parsed, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; VolumCalcBot/1.0; +https://www.volumcalc.com)" },
      redirect: "follow",
    });
    if (!response.ok) return null;
    const text = (await response.text()).slice(0, 600_000);
    return { finalUrl: response.url, text };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const contactCache = new Map<string, { at: number; email: string | null; contactUrl: string }>();

export async function discoverContact(website: string): Promise<{ email: string | null; contactUrl: string }> {
  const cached = contactCache.get(website);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS * 12) return { email: cached.email, contactUrl: cached.contactUrl };

  let email: string | null = null;
  let contactUrl = website;
  const home = await fetchText(website);
  if (home) {
    const domain = rootDomain(new URL(home.finalUrl).hostname);
    const pages = [home];
    const extra: string[] = [];
    for (const match of home.text.matchAll(LINK_RE)) {
      const href = match[1]!;
      if (!CONTACT_HINT.test(href)) continue;
      try {
        const abs = new URL(href, home.finalUrl);
        if (rootDomain(abs.hostname) === domain && !extra.includes(abs.href) && abs.href !== home.finalUrl) extra.push(abs.href);
      } catch {
        /* ignore malformed links */
      }
    }
    if (extra[0]) contactUrl = extra[0];
    const more = await Promise.all(extra.slice(0, 3).map(fetchText));
    for (const page of more) if (page) pages.push(page);

    const found = new Set<string>();
    for (const page of pages) {
      for (const raw of page.text.match(EMAIL_RE) ?? []) {
        const candidate = raw.toLowerCase().replace(/^(mailto:|%20)/, "");
        const [local = "", host = ""] = candidate.split("@");
        if (!GENERIC_LOCAL.test(local) || /noreply|no-reply|donotreply/.test(local)) continue;
        if (/\.(png|jpe?g|webp|svg|gif)$/.test(candidate)) continue;
        if (rootDomain(host) !== domain) continue;
        found.add(candidate);
      }
    }
    const rank = (e: string) => {
      const i = PREFERRED.findIndex((p) => e.split("@")[0]!.startsWith(p));
      return i === -1 ? 99 : i;
    };
    email = [...found].sort((a, b) => rank(a) - rank(b))[0] ?? null;
  }
  contactCache.set(website, { at: Date.now(), email, contactUrl });
  return { email, contactUrl };
}

// ---- Google Places ------------------------------------------------------------

const searchCache = new Map<string, { at: number; movers: RankedMover[] }>();

export function placesConfigured(): boolean {
  return Boolean(process.env["GOOGLE_PLACES_API_KEY"]);
}

export async function findTopMovers(route: RouteQuery): Promise<RankedMover[]> {
  const apiKey = process.env["GOOGLE_PLACES_API_KEY"];
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY is not configured");

  const key = `${route.fromCountry}|${route.toCountry}|${route.fromAddress ?? ""}`;
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.movers;

  const local = LOCAL_TERMS[route.fromCountry] ?? { term: "international removals company", lang: "en" };
  const where = route.fromAddress?.trim() ? `near ${route.fromAddress.trim()}` : `in ${countryName(route.fromCountry)}`;
  const destination = route.toCountry !== route.fromCountry ? ` to ${countryName(route.toCountry)}` : "";

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.rating,places.userRatingCount,places.websiteUri,places.formattedAddress,places.googleMapsUri,places.nationalPhoneNumber",
    },
    body: JSON.stringify({
      textQuery: `${local.term}${destination} ${where}`,
      languageCode: local.lang,
      regionCode: route.fromCountry,
      pageSize: 20,
    }),
  });
  if (!response.ok) {
    console.error("Places search failed", response.status, (await response.text()).slice(0, 300));
    throw new Error("Places search failed");
  }
  const json = (await response.json()) as { places?: PlaceResult[] };

  const ranked = (json.places ?? [])
    .filter(
      (p) =>
        p.displayName?.text &&
        p.websiteUri &&
        safeUrl(p.websiteUri) &&
        typeof p.rating === "number" &&
        p.rating >= MIN_RATING &&
        (p.userRatingCount ?? 0) >= MIN_REVIEWS,
    )
    .sort((a, b) => score(b.rating!, b.userRatingCount!) - score(a.rating!, a.userRatingCount!))
    .slice(0, MAX_RESULTS);

  const movers: RankedMover[] = await Promise.all(
    ranked.map(async (p) => {
      const contact = await discoverContact(p.websiteUri!);
      return {
        placeId: p.id,
        name: p.displayName!.text!,
        rating: p.rating!,
        reviews: p.userRatingCount!,
        address: p.formattedAddress ?? null,
        website: p.websiteUri!,
        mapsUrl: p.googleMapsUri ?? null,
        phone: p.nationalPhoneNumber ?? null,
        email: contact.email,
        contactUrl: contact.contactUrl,
      };
    }),
  );
  searchCache.set(key, { at: Date.now(), movers });
  return movers;
}
