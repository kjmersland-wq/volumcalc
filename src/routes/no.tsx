import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";

const TITLE = "VolumCalc — volumberegning fra romvideo";
const DESC =
  "Film rommene i ro og mak, gå gjennom en stressfri sjekkliste etterpå, og få en tydelig volumberegning rom for rom.";

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
