import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";

const TITLE = "VolumCalc — volumenberegning fra rumvideo";
const DESC =
  "Film rummene i roligt tempo, udfyld en stressfri tjekliste bagefter, og få en klar volumenberegning rum for rum.";

export const Route = createFileRoute("/dk")({
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
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/dk" }],
  }),
  component: () => <LanguageLanding lang="da" />,
});
