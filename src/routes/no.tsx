import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

const TITLE = "VolumCalc — flyttevolum rom for rom (m³)";
const DESC =
  "Velg gjenstander fra sjekklisten og få klart flyttevolum i m³, anbefalt bil og en delbar rapport. Perfekt for privatpersoner og flyttefirmaer.";

export const Route = createFileRoute("/no")({
  staticData: { sitemap: true },
  head: () => languagePageHead({ title: TITLE, description: DESC, path: "/no" }),
  component: () => <LanguageLanding lang="no" />,
});
