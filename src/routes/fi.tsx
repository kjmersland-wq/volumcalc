import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/fi")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — tilavuusarvio huonekuvista",
    description: "Muunna huonekuvat selkeäksi, huonekohtaiseksi kuutiometriarvioksi muuttoa ja tarjouksia varten.",
    path: "/fi",
  }),
  component: () => <LanguageLanding lang="fi" />,
});