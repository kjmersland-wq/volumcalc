import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

const TITLE = "VolumCalc — flyttvolym rum för rum (m³)";
const DESC =
  "Välj föremål från checklistan och få tydlig flyttvolym i m³, rekommenderad bil och en delbar rapport. Perfekt för privatpersoner och flyttfirmor.";

export const Route = createFileRoute("/se")({
  staticData: { sitemap: true },
  head: () => languagePageHead({ title: TITLE, description: DESC, path: "/se" }),
  component: () => <LanguageLanding lang="sv" />,
});
