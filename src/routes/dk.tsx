import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

const TITLE = "VolumCalc — volumenberegning ud fra fotos (m³)";
const DESC =
  "Upload fotos af rummene og få en rumopdelt volumenberegning i kubikmeter til flyttetilbud og bilvalg.";

export const Route = createFileRoute("/dk")({
  staticData: { sitemap: true },
  head: () => languagePageHead({ title: TITLE, description: DESC, path: "/dk" }),
  component: () => <LanguageLanding lang="da" />,
});
