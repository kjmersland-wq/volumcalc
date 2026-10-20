import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/fr")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — volume de déménagement pièce par pièce (m³)",
    description: "Choisissez les objets dans la liste et obtenez le volume en m³, le véhicule recommandé et un rapport partageable. Pour les particuliers et les déménageurs.",
    path: "/fr",
  }),
  component: () => <LanguageLanding lang="fr" />,
});