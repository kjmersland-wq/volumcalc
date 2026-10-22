import type { Lang } from "@/lib/i18n";

/** ISO 3166-1 alpha-2 codes offered for the route; names come from Intl in the page language. */
export const ROUTE_COUNTRIES = [
  "NO", "SE", "DK", "FI", "IS", "DE", "NL", "BE", "FR", "ES", "IT", "PT", "PL",
  "LT", "LV", "EE", "CZ", "AT", "CH", "IE", "GB",
] as const;

export function countryName(code: string, lang: Lang): string {
  try {
    return new Intl.DisplayNames([lang], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function countryOptions(lang: Lang): { code: string; name: string }[] {
  return ROUTE_COUNTRIES.map((code) => ({ code, name: countryName(code, lang) })).sort((a, b) =>
    a.name.localeCompare(b.name, lang),
  );
}
