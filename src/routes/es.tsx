import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/es")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — estimación de volumen mediante fotos",
    description: "Convierte fotos de habitaciones en una estimación clara del volumen por estancia para mudanzas y presupuestos.",
    path: "/es",
  }),
  component: () => <LanguageLanding lang="es" />,
});