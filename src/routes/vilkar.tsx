import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, type LegalContent } from "@/components/LegalLayout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/vilkar")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Vilkår for bruk / Terms of service — VolumCalc" },
      {
        name: "description",
        content: "Vilkårene for å bruke VolumCalc: bruksrett, ansvar for estimater, kontoer, betaling og oppsigelse.",
      },
      { property: "og:title", content: "Vilkår for bruk — VolumCalc" },
      { property: "og:description", content: "Vilkårene for å bruke VolumCalc." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/vilkar" }],
  }),
  component: TermsPage,
});

const content: Record<"no" | "en", LegalContent> = {
  no: {
    title: "Vilkår for bruk",
    intro:
      "Disse vilkårene gjelder mellom deg som bruker og KM TECH LABS (org.nr. 934 044 029), som leverer VolumCalc på volumcalc.com.",
    updated: "Sist oppdatert 20. september 2026",
    sections: [
      {
        heading: "Tjenesten",
        body: [
          "VolumCalc beregner et estimert volum i kubikkmeter basert på bilder du laster opp, og lager en rapport du kan redigere, dele og laste ned.",
          "Du kan bruke tjenesten som privatperson eller på vegne av et firma. Bruker du den på vegne av et firma, bekrefter du at du har fullmakt til det.",
        ],
      },
      {
        heading: "Estimatet er veiledende",
        body: [
          "Resultatet er et AI-generert estimat basert på bildene og oppgitte opplysninger. Det er ikke en bindende pris eller en garanti for faktisk volum.",
          "Endelig pris og volum avtales alltid mellom deg og flyttebyrået. VolumCalc er ikke part i den avtalen og er ikke ansvarlig for flyttebyråets utførelse.",
          "Du er selv ansvarlig for at bildene og opplysningene du gir er dekkende for det som skal flyttes.",
        ],
      },
      {
        heading: "Din bruk",
        body: [
          "Du skal ikke laste opp innhold du ikke har rett til å bruke, ulovlig innhold eller bilder som viser sensitive personopplysninger.",
          "Du skal ikke forsøke å omgå sikkerhet, hente ut andres data, overbelaste tjenesten eller bruke den til automatisk masseinnhenting.",
          "Vi kan stenge kontoer som bryter vilkårene.",
        ],
      },
      {
        heading: "Konto og sikkerhet",
        body: [
          "Du er ansvarlig for å holde påloggingsinformasjonen din hemmelig og for aktivitet på kontoen din.",
          "Delingslenker til rapporter er hemmelige. Den som har lenken får se rapporten, så del den kun med dem som skal se den.",
        ],
      },
      {
        heading: "Priser og betaling",
        body: [
          "Priser vises i norske kroner inkludert eventuell merverdiavgift, og fremgår på prissiden før kjøp.",
          "Betaling skjer gjennom vår betalingsleverandør. Abonnement løper til det sies opp og kan avsluttes når som helst med virkning fra neste periode.",
        ],
      },
      {
        heading: "Ansvar",
        body: [
          "Tjenesten leveres som den er. Vi tilstreber høy oppetid, men kan ikke garantere feilfri eller uavbrutt drift.",
          "Vårt samlede ansvar er begrenset til det du har betalt for tjenesten de siste 12 månedene, med mindre noe annet følger av ufravikelig lov.",
          "Ingenting i vilkårene begrenser forbrukerrettigheter etter norsk lov.",
        ],
      },
      {
        heading: "Endringer og lovvalg",
        body: [
          "Vi kan oppdatere vilkårene. Vesentlige endringer varsles på nettsiden eller per e-post.",
          "Norsk rett gjelder. Verneting er Kristiansand tingrett, med mindre annet følger av ufravikelig lov.",
        ],
      },
    ],
  },
  en: {
    title: "Terms of service",
    intro:
      "These terms apply between you and KM TECH LABS (company no. 934 044 029), which provides VolumCalc at volumcalc.com.",
    updated: "Last updated 20 September 2026",
    sections: [
      {
        heading: "The service",
        body: [
          "VolumCalc estimates volume in cubic metres from the photos you upload and produces a report you can edit, share and download.",
          "You may use the service privately or on behalf of a company. If you use it for a company, you confirm that you are authorised to do so.",
        ],
      },
      {
        heading: "The estimate is indicative",
        body: [
          "The result is an AI-generated estimate based on your photos and information. It is not a binding price or a guarantee of actual volume.",
          "Final price and volume are always agreed between you and the moving company. VolumCalc is not a party to that agreement and is not responsible for the mover's performance.",
          "You are responsible for making sure your photos and details cover everything that is to be moved.",
        ],
      },
      {
        heading: "Your use",
        body: [
          "Do not upload content you have no right to use, unlawful content, or photos showing sensitive personal data.",
          "Do not attempt to bypass security, access other people's data, overload the service or use it for automated bulk scraping.",
          "We may suspend accounts that breach these terms.",
        ],
      },
      {
        heading: "Account and security",
        body: [
          "You are responsible for keeping your credentials confidential and for activity on your account.",
          "Report share links are secret. Anyone holding the link can view the report, so only share it with the intended recipients.",
        ],
      },
      {
        heading: "Prices and payment",
        body: [
          "Prices are shown in Norwegian kroner including any VAT and are stated on the pricing page before purchase.",
          "Payment is handled by our payment provider. Subscriptions run until cancelled and can be cancelled at any time with effect from the next period.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "The service is provided as is. We aim for high availability but cannot guarantee error-free or uninterrupted operation.",
          "Our total liability is limited to what you paid for the service in the last 12 months, unless mandatory law says otherwise.",
          "Nothing in these terms limits consumer rights under Norwegian law.",
        ],
      },
      {
        heading: "Changes and governing law",
        body: [
          "We may update these terms. Material changes are announced on the website or by email.",
          "Norwegian law applies. The venue is Kristiansand District Court unless mandatory law provides otherwise.",
        ],
      },
    ],
  },
};

function TermsPage() {
  const { lang } = useI18n();
  return <LegalLayout content={content[lang === "no" ? "no" : "en"]} />;
}
