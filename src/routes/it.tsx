import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/it")({
  staticData: { sitemap: true },
  head: () =>
    languagePageHead({
      title: "VolumCalc — stima del volume da video della stanza",
      description:
        "Filma le stanze con calma, completa poi una checklist senza stress e ottieni una stima chiara del volume stanza per stanza.",
      path: "/it",
    }),
  component: () => <LanguageLanding lang="it" />,
});
