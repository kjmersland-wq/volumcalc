import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";

const TITLE = "VolumCalc — volumberegning fra bilder (m³)";
const DESC =
  "Last opp bilder av rommene, og få en romvis volumberegning i kubikkmeter til flyttetilbud og bilvalg.";

export const Route = createFileRoute("/no")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/no" }],
  }),
  component: () => <LanguageLanding lang="no" />,
});
