import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/us")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — AI volume estimates from room photos",
    description: "Turn room photos into itemized, room-by-room volume estimates for moving quotes and truck planning.",
    path: "/us",
  }),
  component: () => <LanguageLanding lang="us" />,
});