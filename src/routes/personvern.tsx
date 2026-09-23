import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, type LegalContent } from "@/components/LegalLayout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/personvern")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Personvernerklæring / Privacy policy — VolumCalc" },
      {
        name: "description",
        content:
          "Slik behandler VolumCalc bilder og personopplysninger etter GDPR — lagringstid, rettigheter og sletting.",
      },
      { property: "og:title", content: "Personvernerklæring — VolumCalc" },
      { property: "og:description", content: "Hvordan VolumCalc behandler bilder og personopplysninger." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/personvern" }],
  }),
  component: PrivacyPage,
});

const content: Record<"no" | "en", LegalContent> = {
  no: {
    title: "Personvernerklæring",
    intro:
      "VolumCalc er en tjeneste fra KM TECH LABS, Kristiansand, Norge (org.nr. 934 044 029). Vi er behandlingsansvarlig for opplysningene som samles inn på volumcalc.com.",
    updated: "Sist oppdatert 20. september 2026",
    sections: [
      {
        heading: "Hvilke opplysninger vi behandler",
        body: [
          "Bilder du laster opp av rom og møbler, og informasjonen som utledes av dem (gjenstander, mål, volum, romnavn).",
          "Kontaktopplysninger du selv oppgir: navn, e-post, telefon, adresse, ønsket flyttedato, adresse til nytt bosted og eventuelt lagerhotell.",
          "Kontoopplysninger for flyttebyråer: e-post, firmanavn, organisasjonsnummer, adresse, logo og prisinnstillinger.",
          "Tekniske data som er nødvendige for drift og sikkerhet, som IP-adresse og tidspunkt for forespørsler.",
        ],
      },
      {
        heading: "Formål og behandlingsgrunnlag",
        body: [
          "Å beregne volum og lage rapporten du har bedt om (avtale, personvernforordningen artikkel 6 nr. 1 bokstav b).",
          "Å svare på henvendelser og tilbudsforespørsler (avtale eller berettiget interesse, bokstav b og f).",
          "Å drifte, sikre og forbedre tjenesten, inkludert å hindre misbruk (berettiget interesse, bokstav f).",
          "Å oppfylle bokførings- og regnskapsplikt ved kjøp (rettslig forpliktelse, bokstav c).",
        ],
      },
      {
        heading: "Bildene dine og AI-analyse",
        body: [
          "Bildene lagres i et lukket lager og er ikke offentlig tilgjengelige. De hentes kun fram via din egen innlogging eller en hemmelig delingslenke du selv deler.",
          "Bildene sendes til en AI-leverandør for gjenkjenning av møbler og mål. De brukes ikke til å trene modeller.",
          "Ikke last opp bilder av dokumenter, skjermer eller andre ting som viser sensitive opplysninger.",
        ],
      },
      {
        heading: "Deling med andre",
        body: [
          "Databehandlere som leverer infrastruktur, databaselagring, AI-analyse, e-postutsending og betaling. Alle er bundet av databehandleravtaler.",
          "Flyttebyrået som eier beregningen din, når du selv sender en tilbudsforespørsel eller deler lenken.",
          "Vi selger aldri opplysninger og bruker dem ikke til reklame fra tredjeparter.",
        ],
      },
      {
        heading: "Lagringstid",
        body: [
          "Beregninger med bilder slettes senest 12 måneder etter siste aktivitet, med mindre du eller flyttebyrået ber om sletting tidligere.",
          "Henvendelser via kontaktskjema lagres i inntil 24 måneder.",
          "Kjøpsdokumentasjon lagres så lenge bokføringsloven krever (5 år).",
        ],
      },
      {
        heading: "Dine rettigheter",
        body: [
          "Du kan be om innsyn, retting, sletting, begrensning, dataportabilitet og protestere mot behandling.",
          "Send en e-post til kjell@volumcalc.com, så svarer vi normalt innen 30 dager.",
          "Du kan klage til Datatilsynet (datatilsynet.no) dersom du mener vi behandler opplysningene dine feil.",
        ],
      },
      {
        heading: "Sikkerhet og overføring utenfor EØS",
        body: [
          "Data lagres kryptert, med tilgangsstyring slik at kun eier av beregningen og den som har delingslenken får se innholdet.",
          "Enkelte leverandører kan behandle data utenfor EØS. Da benyttes EUs standard personvernbestemmelser (SCC) som overføringsgrunnlag.",
        ],
      },
    ],
  },
  en: {
    title: "Privacy policy",
    intro:
      "VolumCalc is a service from KM TECH LABS, Kristiansand, Norway (company no. 934 044 029). We are the data controller for information collected on volumcalc.com.",
    updated: "Last updated 20 September 2026",
    sections: [
      {
        heading: "What we process",
        body: [
          "Photos you upload of rooms and furniture, and the data derived from them (items, dimensions, volume, room names).",
          "Contact details you provide: name, email, phone, address, preferred moving date, destination address and any storage facility.",
          "Account data for moving companies: email, company name, registration number, address, logo and pricing settings.",
          "Technical data needed to run and secure the service, such as IP address and request timestamps.",
        ],
      },
      {
        heading: "Purpose and legal basis",
        body: [
          "To calculate volume and produce the report you asked for (contract, GDPR art. 6(1)(b)).",
          "To answer enquiries and quote requests (contract or legitimate interest, art. 6(1)(b) and (f)).",
          "To operate, secure and improve the service, including preventing abuse (legitimate interest, art. 6(1)(f)).",
          "To meet accounting obligations for purchases (legal obligation, art. 6(1)(c)).",
        ],
      },
      {
        heading: "Your photos and AI analysis",
        body: [
          "Photos are kept in private storage and are not publicly accessible. They are only retrieved through your own login or a secret share link you choose to send.",
          "Photos are sent to an AI provider to recognise furniture and dimensions. They are not used to train models.",
          "Please do not upload photos of documents, screens or anything else showing sensitive information.",
        ],
      },
      {
        heading: "Sharing",
        body: [
          "Processors providing infrastructure, database storage, AI analysis, email delivery and payments. All are bound by data processing agreements.",
          "The moving company that owns your estimate, when you send a quote request or share the link.",
          "We never sell your data and do not use it for third-party advertising.",
        ],
      },
      {
        heading: "Retention",
        body: [
          "Estimates with photos are deleted no later than 12 months after the last activity, unless you or the moving company asks for earlier deletion.",
          "Contact form enquiries are kept for up to 24 months.",
          "Purchase records are kept as long as Norwegian accounting law requires (5 years).",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You may request access, rectification, erasure, restriction, portability and object to processing.",
          "Email kjell@volumcalc.com and we normally reply within 30 days.",
          "You may complain to the Norwegian Data Protection Authority (datatilsynet.no) if you believe we handle your data incorrectly.",
        ],
      },
      {
        heading: "Security and transfers outside the EEA",
        body: [
          "Data is stored encrypted with access control, so only the owner of the estimate and the holder of the share link can see the content.",
          "Some providers may process data outside the EEA. In that case the EU Standard Contractual Clauses apply as the transfer mechanism.",
        ],
      },
    ],
  },
};

function PrivacyPage() {
  const { lang } = useI18n();
  return <LegalLayout content={content[lang === "no" ? "no" : "en"]} />;
}
