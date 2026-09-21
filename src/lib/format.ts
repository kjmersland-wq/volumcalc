function toIntlLocale(lang: string) {
  return (
    {
      no: "nb-NO",
      en: "en-GB",
      sv: "sv-SE",
      da: "da-DK",
      dk: "da-DK",
      fi: "fi-FI",
      de: "de-DE",
      nl: "nl-NL",
      fr: "fr-FR",
      pl: "pl-PL",
      es: "es-ES",
      it: "it-IT",
      pt: "pt-PT",
    }[lang] ?? "en-GB"
  );
}

export function m3(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `${n.toFixed(2)} m³`;
}

export function money(value: number, currency: string, lang: string) {
  try {
    return new Intl.NumberFormat(toIntlLocale(lang), {
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
  return new Date(value).toLocaleDateString(toIntlLocale(lang), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
