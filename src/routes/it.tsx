import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/it")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — volume del trasloco stanza per stanza (m³)",
    description: "Scegli gli oggetti dalla lista e ottieni il volume del trasloco in m³, il veicolo consigliato e un rapporto condivisibile. Per privati e aziende di traslochi.",
    path: "/it",
  }),
  component: () => <LanguageLanding lang="it" />,
});