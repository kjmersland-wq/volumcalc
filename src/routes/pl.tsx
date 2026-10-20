import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

const TITLE = "VolumCalc — objętość przeprowadzki pokój po pokoju (m³)";
const DESC =
  "Wybierz przedmioty z listy kontrolnej i uzyskaj objętość przeprowadzki w m³, zalecany pojazd oraz raport do udostępnienia. Dla osób prywatnych i firm przeprowadzkowych.";

export const Route = createFileRoute("/pl")({
  staticData: { sitemap: true },
  head: () => languagePageHead({ title: TITLE, description: DESC, path: "/pl" }),
  component: () => <LanguageLanding lang="pl" />,
});
