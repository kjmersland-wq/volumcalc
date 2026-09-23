import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

const TITLE = "VolumCalc — obliczanie kubatury ze zdjęć (m³)";
const DESC =
  "Prześlij zdjęcia pomieszczeń i otrzymaj wyliczenie objętości w metrach sześciennych, pokój po pokoju.";

export const Route = createFileRoute("/pl")({
  staticData: { sitemap: true },
  head: () => languagePageHead({ title: TITLE, description: DESC, path: "/pl" }),
  component: () => <LanguageLanding lang="pl" />,
});
