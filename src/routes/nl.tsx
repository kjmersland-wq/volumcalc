import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/nl")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — verhuisvolume kamer voor kamer (m³)",
    description: "Kies items uit de checklist en krijg helder verhuisvolume in m³, een aanbevolen voertuig en een deelbaar rapport. Voor particulieren en verhuisbedrijven.",
    path: "/nl",
  }),
  component: () => <LanguageLanding lang="nl" />,
});