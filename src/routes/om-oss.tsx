import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, type LegalContent } from "@/components/LegalLayout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/om-oss")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Om oss / About VolumCalc — KM TECH LABS" },
      {
        name: "description",
        content:
          "VolumCalc er utviklet og drevet av KM TECH LABS i Kristiansand, Norge. Om selskapet, kontakt og selskapsopplysninger.",
      },
      { property: "og:title", content: "Om oss — VolumCalc" },
      { property: "og:description", content: "VolumCalc er laget av KM TECH LABS i Kristiansand, Norge." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/om-oss" }],
  }),
  component: AboutPage,
});

const content: Record<"no" | "en", LegalContent> = {
  no: {
    title: "Om VolumCalc",
    intro:
      "VolumCalc er utviklet og drevet av KM TECH LABS i Kristiansand, Norge. Vi lager verktøy som gjør flytteplanlegging raskere, tryggere og mer forutsigbar.",
    updated: "Selskapsopplysninger",
    sections: [
      {
        heading: "Hva vi gjør",
        body: [
          "Vi gjør vanlige mobilbilder om til en ryddig, rominndelt volumberegning i kubikkmeter — på sekunder, uten befaring.",
          "Privatpersoner får et realistisk bilde av hva flyttingen omfatter før de ber om tilbud. Flyttebyråer får et ferdig underlag som kan redigeres, godkjennes, deles og prises.",
        ],
      },
      {
        heading: "Hvorfor",
        body: [
          "Befaringer er dyre og tidkrevende, og løse anslag over telefon skaper tvister etterpå. Et felles, etterprøvbart underlag gir færre overraskelser for begge parter.",
        ],
      },
      {
        heading: "Selskapsopplysninger",
        body: [
          "KM TECH LABS, Kristiansand, Norge.",
          "Organisasjonsnummer: 934 044 029.",
          "E-post: kjell@volumcalc.com. Nettsted: volumcalc.com.",
        ],
      },
    ],
  },
  en: {
    title: "About VolumCalc",
    intro:
      "VolumCalc is developed and operated by KM TECH LABS in Kristiansand, Norway. We build tools that make move planning faster, safer and more predictable.",
    updated: "Company details",
    sections: [
      {
        heading: "What we do",
        body: [
          "We turn ordinary phone photos into a clear, room-by-room volume estimate in cubic metres — in seconds, without a site visit.",
          "Private individuals get a realistic picture of their move before asking for quotes. Moving companies get a ready-made basis they can edit, approve, share and price.",
        ],
      },
      {
        heading: "Why",
        body: [
          "Site visits are costly and slow, and rough phone estimates cause disputes later. A shared, verifiable basis means fewer surprises for both sides.",
        ],
      },
      {
        heading: "Company details",
        body: [
          "KM TECH LABS, Kristiansand, Norway.",
          "Company registration number: 934 044 029.",
          "Email: kjell@volumcalc.com. Website: volumcalc.com.",
        ],
      },
    ],
  },
};

function AboutPage() {
  const { lang } = useI18n();
  return <LegalLayout content={content[lang === "no" ? "no" : "en"]} />;
}
