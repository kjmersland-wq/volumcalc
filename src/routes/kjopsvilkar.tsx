import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, type LegalContent } from "@/components/LegalLayout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/kjopsvilkar")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Kjøpsvilkår og angrerett / Purchase terms — VolumCalc" },
      {
        name: "description",
        content: "Priser, betaling, levering, angrerett og reklamasjon ved kjøp av volumberegninger fra VolumCalc.",
      },
      { property: "og:title", content: "Kjøpsvilkår og angrerett — VolumCalc" },
      { property: "og:description", content: "Priser, betaling, angrerett og reklamasjon i VolumCalc." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/kjopsvilkar" }],
  }),
  component: PurchasePage,
});

const content: Record<"no" | "en", LegalContent> = {
  no: {
    title: "Kjøpsvilkår og angrerett",
    intro:
      "Selger er KM TECH LABS, Kristiansand, Norge, org.nr. 934 044 029, kjell@volumcalc.com. Vilkårene gjelder kjøp av volumberegninger og abonnement på volumcalc.com.",
    updated: "Sist oppdatert 20. september 2026",
    sections: [
      {
        heading: "Priser og betaling",
        body: [
          "Prisene står oppgitt på prissiden i norske kroner inkludert merverdiavgift for forbrukere.",
          "Betaling skjer med kort gjennom vår betalingsleverandør. Vi lagrer ikke kortnummeret ditt.",
          "Kvittering sendes til e-postadressen du oppgir i betalingen.",
        ],
      },
      {
        heading: "Levering",
        body: [
          "Tjenesten er digital og leveres umiddelbart etter betaling. Du får tilgang til beregningen og rapporten med én gang.",
        ],
      },
      {
        heading: "Angrerett",
        body: [
          "Som forbruker har du 14 dagers angrerett etter angrerettloven.",
          "Ved kjøp av digitale tjenester som leveres straks, samtykker du ved kjøp til at leveringen starter umiddelbart, og du erkjenner at angreretten bortfaller når tjenesten er fullt levert – det vil si når beregningen er gjennomført.",
          "Har du kjøpt, men ikke brukt beregningen, kan du angre innen 14 dager ved å sende en e-post til kjell@volumcalc.com. Vi refunderer da hele beløpet innen 14 dager.",
        ],
      },
      {
        heading: "Abonnement",
        body: [
          "Abonnement for flyttebyråer faktureres forskuddsvis per måned og fornyes automatisk til det sies opp.",
          "Du kan si opp når som helst. Oppsigelsen får virkning fra neste faktureringsperiode, og du beholder tilgangen ut perioden du har betalt for.",
        ],
      },
      {
        heading: "Reklamasjon og klage",
        body: [
          "Fungerer ikke tjenesten som avtalt, kontakt oss på kjell@volumcalc.com. Vi retter feilen eller refunderer kjøpet.",
          "Et volumestimat som avviker fra faktisk volum er ikke i seg selv en mangel; estimatet er veiledende og bygger på bildene som er lastet opp.",
          "Du kan klage til Forbrukertilsynet eller bruke EUs klageportal (ec.europa.eu/odr) dersom vi ikke blir enige.",
        ],
      },
    ],
  },
  en: {
    title: "Purchase terms and right of withdrawal",
    intro:
      "The seller is KM TECH LABS, Kristiansand, Norway, company no. 934 044 029, kjell@volumcalc.com. These terms cover purchases of estimates and subscriptions on volumcalc.com.",
    updated: "Last updated 20 September 2026",
    sections: [
      {
        heading: "Prices and payment",
        body: [
          "Prices are shown on the pricing page in Norwegian kroner including VAT for consumers.",
          "Payment is by card through our payment provider. We never store your card number.",
          "A receipt is sent to the email address you give at checkout.",
        ],
      },
      {
        heading: "Delivery",
        body: ["The service is digital and delivered immediately after payment. You get access to the estimate and report right away."],
      },
      {
        heading: "Right of withdrawal",
        body: [
          "As a consumer you have a 14-day right of withdrawal under Norwegian and EU consumer law.",
          "For digital services delivered immediately, you consent at checkout to delivery starting at once and acknowledge that the right of withdrawal lapses once the service has been fully delivered — that is, once the estimate has been produced.",
          "If you have paid but not used the estimate, you may withdraw within 14 days by emailing kjell@volumcalc.com. We refund the full amount within 14 days.",
        ],
      },
      {
        heading: "Subscriptions",
        body: [
          "Business subscriptions are billed monthly in advance and renew automatically until cancelled.",
          "You can cancel at any time. Cancellation takes effect from the next billing period and you keep access for the period already paid.",
        ],
      },
      {
        heading: "Complaints",
        body: [
          "If the service does not work as agreed, contact kjell@volumcalc.com. We will fix the problem or refund your purchase.",
          "An estimate differing from the actual volume is not in itself a defect; the estimate is indicative and based on the photos uploaded.",
          "You may complain to the Norwegian Consumer Authority or use the EU ODR platform (ec.europa.eu/odr) if we cannot agree.",
        ],
      },
    ],
  },
};

function PurchasePage() {
  const { lang } = useI18n();
  return <LegalLayout content={content[lang === "no" ? "no" : "en"]} />;
}
