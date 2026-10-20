import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

const TITLE = "VolumCalc — flyttevolumen rum for rum (m³)";
const DESC =
  "Vælg genstande fra tjeklisten og få klar flyttevolumen i m³, anbefalet bil og en delbar rapport. Perfekt til privatpersoner og flyttefirmaer.";

export const Route = createFileRoute("/dk")({
  staticData: { sitemap: true },
  head: () => languagePageHead({ title: TITLE, description: DESC, path: "/dk" }),
  component: () => <LanguageLanding lang="da" />,
});
