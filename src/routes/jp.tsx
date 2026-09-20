import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/jp")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — 部屋の写真から容積を自動見積もり",
    description: "部屋の写真から、引越しや見積もりに使える部屋別の容積を立方メートルで算出します。",
    path: "/jp",
  }),
  component: () => <LanguageLanding lang="ja" />,
});