import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/fi")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — muuttotilavuus huone huoneelta (m³)",
    description: "Valitse esineet tarkistuslistalta ja saat selkeän muuttotilavuuden m³, suositellun auton ja jaettavan raportin. Sopii yksityishenkilöille ja muuttofirmoille.",
    path: "/fi",
  }),
  component: () => <LanguageLanding lang="fi" />,
});