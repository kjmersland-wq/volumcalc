import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/pt")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — volume da mudança divisão a divisão (m³)",
    description: "Escolha os objetos da lista e obtenha o volume da mudança em m³, o veículo recomendado e um relatório partilhável. Para particulares e empresas de mudanças.",
    path: "/pt",
  }),
  component: () => <LanguageLanding lang="pt" />,
});