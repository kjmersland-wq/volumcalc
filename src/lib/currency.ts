import type { Lang } from "@/lib/i18n";

// Display-only currency conversion for the /pricing page. The actual Stripe
// charge always happens in NOK, regardless of the visitor's language — this
// module never touches checkout, it only decides what number and currency
// label to show someone browsing in a given language.

export type DisplayCurrency = "NOK" | "SEK" | "DKK" | "PLN" | "EUR";

export const LANG_TO_CURRENCY: Record<Lang, DisplayCurrency> = {
  no: "NOK",
  sv: "SEK",
  da: "DKK",
  pl: "PLN",
  en: "EUR",
  de: "EUR",
  nl: "EUR",
  fr: "EUR",
  es: "EUR",
  it: "EUR",
  pt: "EUR",
  fi: "EUR",
};

// Approximate NOK exchange rates, for rough display only — not precise
// enough for billing. Update occasionally; nothing breaks if these drift a
// little, since every non-NOK amount is shown with an "≈" prefix.
// Last checked: 2026-09-23.
const NOK_RATE: Record<Exclude<DisplayCurrency, "NOK">, number> = {
  EUR: 0.086,
  SEK: 1.01,
  DKK: 0.645,
  PLN: 0.365,
};

const CURRENCY_LABEL: Record<DisplayCurrency, string> = {
  NOK: "NOK",
  SEK: "SEK",
  DKK: "DKK",
  PLN: "PLN",
  EUR: "€",
};

// Keeps displayed numbers clean instead of showing false precision like
// "128.9" for a rate-converted amount.
function roundApprox(amount: number): number {
  if (amount < 20) return Math.round(amount);
  if (amount < 200) return Math.round(amount / 5) * 5;
  return Math.round(amount / 10) * 10;
}

export function convertFromNok(amountNok: number, currency: DisplayCurrency): number {
  if (currency === "NOK") return amountNok;
  return roundApprox(amountNok * NOK_RATE[currency]);
}

export type ApproxPrice = { prefix: string; amount: string; currency: string };

export function approxPrice(amountNok: number, lang: Lang): ApproxPrice {
  const currency = LANG_TO_CURRENCY[lang];
  if (currency === "NOK") {
    return { prefix: "", amount: amountNok.toLocaleString("nb-NO"), currency: "NOK" };
  }
  const converted = convertFromNok(amountNok, currency);
  return { prefix: "≈ ", amount: converted.toLocaleString("nb-NO"), currency: CURRENCY_LABEL[currency] };
}

export function formatApproxInline(amountNok: number, lang: Lang): string {
  const p = approxPrice(amountNok, lang);
  return `${p.prefix}${p.amount} ${p.currency}`;
}
