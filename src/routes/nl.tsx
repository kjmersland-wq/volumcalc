import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/nl")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — volume-inschatting via kamerfoto's",
    description: "Zet kamerfoto's om in een duidelijk volumeoverzicht per kamer voor verhuizingen en offertes.",
    path: "/nl",
  }),
  component: () => <LanguageLanding lang="nl" />,
});