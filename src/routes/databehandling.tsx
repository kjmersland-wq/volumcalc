import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, type LegalContent } from "@/components/LegalLayout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/databehandling")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Databehandleravtale / Data processing agreement — VolumCalc" },
      {
        name: "description",
        content:
          "Databehandleravtalen mellom flyttebyrået som kunde og KM TECH LABS som databehandler for VolumCalc.",
      },
      { property: "og:title", content: "Databehandleravtale — VolumCalc" },
      { property: "og:description", content: "Vilkårene for behandling av personopplysninger på vegne av kunden." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/databehandling" }],
  }),
  component: DpaPage,
});

const content: Record<"no" | "en", LegalContent> = {
  no: {
    title: "Databehandleravtale",
    intro:
      "Når et flyttebyrå bruker VolumCalc til å behandle opplysninger om sine egne kunder, er byrået behandlingsansvarlig og KM TECH LABS databehandler. Denne avtalen gjelder da automatisk som del av vilkårene.",
    updated: "Sist oppdatert 20. september 2026",
    sections: [
      {
        heading: "Formål og omfang",
        body: [
          "Vi behandler personopplysninger kun for å levere VolumCalc: volumberegning fra bilder, rapporter, deling, tilbudsforespørsler og support.",
          "Typer opplysninger: navn, e-post, telefon, adresser, flyttedato, bilder av bolig og innbo, samt notater kunden selv legger inn.",
          "Registrerte: flyttebyråets kunder og byråets egne ansatte med tilgang til løsningen.",
        ],
      },
      {
        heading: "Våre plikter",
        body: [
          "Vi behandler opplysningene kun etter dokumenterte instrukser fra deg som kunde, og ikke til egne formål.",
          "Alle med tilgang er underlagt taushetsplikt.",
          "Vi gjennomfører egnede tekniske og organisatoriske tiltak: kryptering, tilgangsstyring per konto, radnivå-sikkerhet i databasen, private bildelager og logging.",
          "Vi bistår deg med innsyn, retting og sletting, og med varsling ved brudd på personopplysningssikkerheten uten ugrunnet opphold.",
        ],
      },
      {
        heading: "Underdatabehandlere",
        body: [
          "Vi bruker underdatabehandlere for skydrift og database, AI-analyse av bilder, e-postutsending og betaling.",
          "Alle er bundet av tilsvarende plikter. Vi varsler ved planlagte endringer slik at du kan protestere.",
        ],
      },
      {
        heading: "Overføring utenfor EØS",
        body: [
          "Om en underdatabehandler behandler data utenfor EØS, skjer det på grunnlag av EUs standard personvernbestemmelser (SCC) med nødvendige tilleggstiltak.",
        ],
      },
      {
        heading: "Sletting og revisjon",
        body: [
          "Ved opphør sletter eller returnerer vi personopplysningene innen 60 dager, med mindre lov krever lagring.",
          "Du kan be om dokumentasjon på etterlevelse. Revisjon på stedet avtales særskilt og dekkes av kunden.",
          "Kontakt: kjell@volumcalc.com.",
        ],
      },
    ],
  },
  en: {
    title: "Data processing agreement",
    intro:
      "When a moving company uses VolumCalc to process data about its own customers, the company is the controller and KM TECH LABS is the processor. This agreement then applies automatically as part of the terms.",
    updated: "Last updated 20 September 2026",
    sections: [
      {
        heading: "Purpose and scope",
        body: [
          "We process personal data solely to deliver VolumCalc: volume estimation from photos, reports, sharing, quote requests and support.",
          "Categories of data: name, email, phone, addresses, moving date, photos of homes and belongings, and notes entered by users.",
          "Data subjects: the moving company's customers and its own staff with access to the service.",
        ],
      },
      {
        heading: "Our obligations",
        body: [
          "We process data only on your documented instructions and never for our own purposes.",
          "Everyone with access is bound by confidentiality.",
          "We apply appropriate technical and organisational measures: encryption, per-account access control, row level security in the database, private photo storage and logging.",
          "We assist you with access, rectification and erasure requests, and notify you of personal data breaches without undue delay.",
        ],
      },
      {
        heading: "Sub-processors",
        body: [
          "We use sub-processors for cloud hosting and database, AI image analysis, email delivery and payments.",
          "All are bound by equivalent obligations. We notify you of planned changes so you can object.",
        ],
      },
      {
        heading: "Transfers outside the EEA",
        body: [
          "If a sub-processor processes data outside the EEA, it is based on the EU Standard Contractual Clauses with the necessary supplementary measures.",
        ],
      },
      {
        heading: "Deletion and audit",
        body: [
          "On termination we delete or return personal data within 60 days unless law requires retention.",
          "You may request documentation of compliance. On-site audits are agreed separately and paid by the customer.",
          "Contact: kjell@volumcalc.com.",
        ],
      },
    ],
  },
};

function DpaPage() {
  const { lang } = useI18n();
  return <LegalLayout content={content[lang === "no" ? "no" : "en"]} />;
}
