import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/it")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — stima del volume dalle foto",
    description: "Trasforma le foto delle stanze in una chiara stima del volume per ambiente, pronta per traslochi e preventivi.",
    path: "/it",
  }),
  component: () => <LanguageLanding lang="it" />,
});