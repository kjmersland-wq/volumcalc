import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

const TITLE = "VolumCalc — volymberäkning från foton (m³)";
const DESC =
  "Ladda upp foton av rummen och få en rumsvis volymberäkning i kubikmeter för flyttofferter och bilval.";

export const Route = createFileRoute("/se")({
  staticData: { sitemap: true },
  head: () => languagePageHead({ title: TITLE, description: DESC, path: "/se" }),
  component: () => <LanguageLanding lang="sv" />,
});
