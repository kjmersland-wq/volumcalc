export function m3(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `${n.toFixed(2)} m³`;
}

export function money(value: number, currency: string, lang: string) {
  try {
    return new Intl.NumberFormat(lang === "no" ? "nb-NO" : "en-GB", {
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
  return new Date(value).toLocaleDateString(lang === "no" ? "nb-NO" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
