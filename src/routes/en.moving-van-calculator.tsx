import { createFileRoute } from "@tanstack/react-router";
import { VanCalculator, vanFaqJsonLd } from "@/components/VanCalculator";

const CANONICAL = "https://www.volumcalc.com/en/moving-van-calculator";
const ALTERNATE = "https://www.volumcalc.com/flyttebil-kalkulator";
const TITLE = "Moving van size calculator: which van do you need? — VolumCalc";
const DESCRIPTION =
  "Find the right moving van size in seconds. Enter your cubic metres or pick your type of home, get a van recommendation, packing buffer and a category B licence check.";

export const Route = createFileRoute("/en/moving-van-calculator")({
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
      { rel: "alternate", hrefLang: "en", href: CANONICAL },
      { rel: "alternate", hrefLang: "nb", href: ALTERNATE },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(vanFaqJsonLd("en")) }],
  }),
  component: () => <VanCalculator lang="en" />,
});
