import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/fr")({
  staticData: { sitemap: true },
  head: () =>
    languagePageHead({
      title: "VolumCalc — estimation du volume à partir d’une vidéo de pièce",
      description:
        "Filmez vos pièces tranquillement, complétez ensuite une checklist sans stress et obtenez une estimation claire du volume pièce par pièce.",
      path: "/fr",
    }),
  component: () => <LanguageLanding lang="fr" />,
});
