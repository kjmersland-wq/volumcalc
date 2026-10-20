import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/de")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — Umzugsvolumen Raum für Raum (m³)",
    description: "Wählen Sie Gegenstände aus der Checkliste und erhalten Sie das Umzugsvolumen in m³, das empfohlene Fahrzeug und einen teilbaren Bericht. Für Privatpersonen und Umzugsfirmen.",
    path: "/de",
  }),
  component: () => <LanguageLanding lang="de" />,
});