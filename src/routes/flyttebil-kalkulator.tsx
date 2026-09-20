import { createFileRoute } from "@tanstack/react-router";
import { VanCalculator, vanFaqJsonLd } from "@/components/VanCalculator";

const CANONICAL = "https://www.volumcalc.com/flyttebil-kalkulator";
const ALTERNATE = "https://www.volumcalc.com/en/moving-van-calculator";
const TITLE = "Flyttebil-kalkulator: hvor stor bil trenger du? — VolumCalc";
const DESCRIPTION =
  "Finn riktig størrelse på flyttebilen på sekunder. Velg kubikk eller boligtype, få anbefalt bil, stuefaktor og sjekk om du kan kjøre den på førerkort klasse B.";

export const Route = createFileRoute("/flyttebil-kalkulator")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: CANONICAL },
      { rel: "alternate", hrefLang: "nb", href: CANONICAL },
      { rel: "alternate", hrefLang: "en", href: ALTERNATE },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(vanFaqJsonLd("no")) }],
  }),
  component: () => <VanCalculator lang="no" />,
});
