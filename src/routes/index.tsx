import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/LandingPage";
import { languagePageHead } from "@/lib/language-page-meta";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () =>
    languagePageHead({
      title: "VolumCalc — Moving volume calculator: clear m³ estimate, room by room",
      description:
        "Free moving volume calculator. Pick items from the checklist, get an accurate m³ estimate, a recommended vehicle and a shareable report. Perfect for households and moving companies.",
      path: "/",
    }),
  component: LandingPage,
});
