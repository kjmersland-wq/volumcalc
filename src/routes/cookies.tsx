import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, type LegalContent } from "@/components/LegalLayout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/cookies")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Informasjonskapsler / Cookie policy — VolumCalc" },
      {
        name: "description",
        content: "Hvilke informasjonskapsler og lokal lagring VolumCalc bruker, og hvordan du kan styre dem.",
      },
      { property: "og:title", content: "Informasjonskapsler — VolumCalc" },
      { property: "og:description", content: "Informasjonskapsler og lokal lagring i VolumCalc." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CookiePage,
});

const content: Record<"no" | "en", LegalContent> = {
  no: {
    title: "Informasjonskapsler",
    intro:
      "VolumCalc bruker et minimum av informasjonskapsler og lokal lagring — kun det som trengs for at tjenesten skal fungere.",
    updated: "Sist oppdatert 20. september 2026",
    sections: [
      {
        heading: "Nødvendige informasjonskapsler",
        body: [
          "Innlogging: en kapsel/lokal lagring som holder deg innlogget mellom sidevisninger. Slettes når du logger ut.",
          "Språkvalg: vi lagrer valget ditt (norsk eller engelsk) lokalt i nettleseren slik at siden husker det.",
          "Sikkerhet: tekniske kapsler som beskytter mot misbruk av skjemaer og innlogging.",
        ],
      },
      {
        heading: "Betaling",
        body: [
          "Når du gjennomfører et kjøp setter betalingsleverandøren egne kapsler som er nødvendige for å fullføre og sikre betalingen.",
        ],
      },
      {
        heading: "Analyse og markedsføring",
        body: [
          "Vi bruker ikke sporing på tvers av nettsteder, og setter ingen markedsføringskapsler uten samtykke.",
        ],
      },
      {
        heading: "Slik styrer du kapslene",
        body: [
          "Du kan slette eller blokkere informasjonskapsler i nettleserinnstillingene dine. Blokkerer du de nødvendige kapslene, vil innlogging og betaling slutte å virke.",
          "Spørsmål? Send en e-post til kjell@volumcalc.com.",
        ],
      },
    ],
  },
  en: {
    title: "Cookie policy",
    intro: "VolumCalc uses a minimum of cookies and local storage — only what the service needs to work.",
    updated: "Last updated 20 September 2026",
    sections: [
      {
        heading: "Strictly necessary cookies",
        body: [
          "Sign-in: a cookie/local storage entry that keeps you signed in between page views. Removed when you sign out.",
          "Language: your choice of Norwegian or English is stored locally so the site remembers it.",
          "Security: technical cookies protecting forms and sign-in against abuse.",
        ],
      },
      {
        heading: "Payments",
        body: [
          "When you complete a purchase, the payment provider sets its own cookies that are necessary to complete and secure the payment.",
        ],
      },
      {
        heading: "Analytics and marketing",
        body: ["We do not use cross-site tracking and set no marketing cookies without consent."],
      },
      {
        heading: "How to control cookies",
        body: [
          "You can delete or block cookies in your browser settings. Blocking the necessary ones will break sign-in and payments.",
          "Questions? Email kjell@volumcalc.com.",
        ],
      },
    ],
  },
};

function CookiePage() {
  const { lang } = useI18n();
  return <LegalLayout content={content[lang === "no" ? "no" : "en"]} />;
}
