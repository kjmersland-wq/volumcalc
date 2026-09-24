import type { Lang } from "@/lib/i18n";

/**
 * Single switch for all paid checkouts (frontend + server).
 * Set to true to re-enable Stripe purchases and subscriptions.
 */
export const PURCHASES_ENABLED = false;

export const PURCHASES_PAUSED_MESSAGE: Record<Lang, string> = {
  en: "Paid plans are paused for a short while as we set up in Poland. Everything free works as normal.",
  no: "Betalte planer er midlertidig satt på pause mens vi etablerer oss i Polen. Alt som er gratis fungerer som normalt.",
  sv: "Betalplaner är pausade en kort tid medan vi etablerar oss i Polen. Allt som är gratis fungerar som vanligt.",
  da: "Betalte abonnementer er sat på pause i en kort periode, mens vi etablerer os i Polen. Alt gratis fungerer som normalt.",
  fi: "Maksulliset paketit ovat hetken tauolla, kun perustamme toimintaa Puolaan. Kaikki ilmainen toimii normaalisti.",
  de: "Kostenpflichtige Tarife sind kurzzeitig pausiert, während wir uns in Polen niederlassen. Alles Kostenlose funktioniert wie gewohnt.",
  nl: "Betaalde abonnementen zijn tijdelijk gepauzeerd terwijl we ons in Polen vestigen. Alles wat gratis is, werkt zoals normaal.",
  fr: "Les offres payantes sont suspendues pour une courte période pendant notre installation en Pologne. Tout ce qui est gratuit fonctionne normalement.",
  pl: "Płatne plany są na krótko wstrzymane, ponieważ rozpoczynamy działalność w Polsce. Wszystkie darmowe funkcje działają normalnie.",
  es: "Los planes de pago están en pausa por un breve tiempo mientras nos establecemos en Polonia. Todo lo gratuito funciona con normalidad.",
  it: "I piani a pagamento sono sospesi per un breve periodo mentre ci stabiliamo in Polonia. Tutto ciò che è gratuito funziona normalmente.",
  pt: "Os planos pagos estão em pausa por pouco tempo enquanto nos estabelecemos na Polónia. Tudo o que é gratuito funciona normalmente.",
};
