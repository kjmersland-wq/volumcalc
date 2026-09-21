import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";

const TITLE = "VolumCalc — volymberäkning från rumsvideo";
const DESC =
  "Filma dina rum i lugn och ro, gå igenom en stressfri checklista efteråt och få en tydlig volymberäkning rum för rum.";

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
