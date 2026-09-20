import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/pt")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — estimativa de volume através de fotografias",
    description: "Transforme fotografias das divisões numa estimativa clara do volume por divisão para mudanças e orçamentos.",
    path: "/pt",
  }),
  component: () => <LanguageLanding lang="pt" />,
});