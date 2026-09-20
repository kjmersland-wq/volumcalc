import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/de")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — Volumenschätzung aus Raumfotos",
    description: "Verwandeln Sie Raumfotos in eine übersichtliche, raumweise Kubikmeterschätzung für Umzüge und Angebote.",
    path: "/de",
  }),
  component: () => <LanguageLanding lang="de" />,
});