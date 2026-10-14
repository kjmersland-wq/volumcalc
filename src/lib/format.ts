export function m3(value: number | string | null | undefined, lang = "en") {
  const n = Number(value ?? 0);
  const text = n.toFixed(2);
  // Comma as decimal separator in every language except English.
  return `${lang === "en" ? text : text.replace(".", ",")} m³`;
}

const LOCALES: Record<string, string> = {
  no: "nb-NO", sv: "sv-SE", da: "da-DK", fi: "fi-FI", de: "de-DE", nl: "nl-NL",
  fr: "fr-FR", pl: "pl-PL", es: "es-ES", it: "it-IT", pt: "pt-PT",
};

function localeFor(lang: string) {
  return LOCALES[lang] ?? "en-GB";
}

export function money(value: number, currency: string, lang: string) {
  try {
    return new Intl.NumberFormat(localeFor(lang), {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${Math.round(value)} ${currency}`;
  }
}

export function shortDate(value: string | null | undefined, lang: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(localeFor(lang), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
