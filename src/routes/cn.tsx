import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/cn")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — 通过房间照片估算体积",
    description: "将房间照片转换为清晰的逐房间立方米估算，适用于搬家计划和报价。",
    path: "/cn",
  }),
  component: () => <LanguageLanding lang="zh" />,
});