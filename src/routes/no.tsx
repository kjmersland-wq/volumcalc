import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

const TITLE = "VolumCalc — volumberegning fra bilder (m³)";
const DESC =
  "Last opp bilder av rommene, og få en romvis volumberegning i kubikkmeter til flyttetilbud og bilvalg.";

export const Route = createFileRoute("/no")({
  staticData: { sitemap: true },
  head: () => languagePageHead({ title: TITLE, description: DESC, path: "/no" }),
  component: () => <LanguageLanding lang="no" />,
});
