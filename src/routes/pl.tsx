import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";

const TITLE = "VolumCalc — obliczanie kubatury z nagrania pokoju";
const DESC =
  "Nagraj pokoje we własnym tempie, uzupełnij potem spokojną listę kontrolną i otrzymaj przejrzyste wyliczenie objętości pokój po pokoju.";

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
