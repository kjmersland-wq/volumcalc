import { createFileRoute } from "@tanstack/react-router";
import { LanguageLanding } from "@/components/LanguageLanding";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/fi")({
  staticData: { sitemap: true },
  head: () => languagePageHead({
    title: "VolumCalc — tilavuusarvio huonevideosta",
    description: "Kuvaa huoneet rauhassa, täytä stressitön tarkistuslista jälkeenpäin ja saat selkeän kuutiometriarvion huone kerrallaan.",
    path: "/fi",
  }),
  component: () => <LanguageLanding lang="fi" />,
});