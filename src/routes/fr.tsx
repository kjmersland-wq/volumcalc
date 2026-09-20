import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/fr")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — estimation du volume à partir de photos",
    description: "Transformez des photos de pièces en estimation claire du volume par pièce pour vos déménagements et devis.",
    path: "/fr",
  }),
  component: () => <LanguageLanding lang="fr" />,
});