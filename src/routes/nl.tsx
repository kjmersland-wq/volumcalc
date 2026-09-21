import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/nl")({
  staticData: { sitemap: true },
  head: () =>
    languagePageHead({
      title: "VolumCalc — volume-inschatting via kamervideo",
      description:
        "Film je kamers op je gemak, werk daarna een stressvrije checklist af en ontvang een helder volumeoverzicht per kamer.",
      path: "/nl",
    }),
  component: () => <LanguageLanding lang="nl" />,
});
