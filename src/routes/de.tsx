import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/de")({
  staticData: { sitemap: true },
  head: () =>
    languagePageHead({
      title: "VolumCalc — Volumenschätzung per Raumvideo",
      description:
        "Filmen Sie Ihre Räume in Ruhe, gehen Sie danach eine entspannte Checkliste durch und erhalten Sie eine klare Kubikmeterschätzung Raum für Raum.",
      path: "/de",
    }),
  component: () => <LanguageLanding lang="de" />,
});
