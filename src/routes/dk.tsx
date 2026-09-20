import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";

const TITLE = "VolumCalc — volumenberegning ud fra fotos (m³)";
const DESC =
  "Upload fotos af rummene og få en rumopdelt volumenberegning i kubikmeter til flyttetilbud og bilvalg.";

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
