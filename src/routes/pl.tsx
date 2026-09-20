import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";

const TITLE = "VolumCalc — obliczanie kubatury ze zdjęć (m³)";
const DESC =
  "Prześlij zdjęcia pomieszczeń i otrzymaj wyliczenie objętości w metrach sześciennych, pokój po pokoju.";

export const Route = createFileRoute("/pl")({
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
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/pl" }],
  }),
  component: () => <LanguageLanding lang="pl" />,
});
