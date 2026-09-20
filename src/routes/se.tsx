import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";

const TITLE = "VolumCalc — volymberäkning från foton (m³)";
const DESC =
  "Ladda upp foton av rummen och få en rumsvis volymberäkning i kubikmeter för flyttofferter och bilval.";

export const Route = createFileRoute("/se")({
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
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/se" }],
  }),
  component: () => <LanguageLanding lang="sv" />,
});
