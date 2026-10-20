import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/es")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — volumen de mudanza habitación por habitación (m³)",
    description: "Elige los objetos de la lista y obtén el volumen de la mudanza en m³, el vehículo recomendado y un informe para compartir. Para particulares y empresas de mudanzas.",
    path: "/es",
  }),
  component: () => <LanguageLanding lang="es" />,
});