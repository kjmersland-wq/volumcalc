import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/es")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — estimación de volumen a partir de vídeo de habitaciones",
    description: "Graba tus habitaciones con calma, completa después una lista sin estrés y obtén una estimación clara del volumen estancia por estancia.",
    path: "/es",
  }),
  component: () => <LanguageLanding lang="es" />,
});