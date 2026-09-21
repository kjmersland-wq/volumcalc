import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/pt")({
  staticData: { sitemap: true },
  head: () =>
    languagePageHead({
      title: "VolumCalc — estimativa de volume por vídeo da divisão",
      description:
        "Filme as divisões com calma, preencha depois uma checklist sem stress e receba uma estimativa clara do volume divisão a divisão.",
      path: "/pt",
    }),
  component: () => <LanguageLanding lang="pt" />,
});
