import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/LandingPage";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "VolumCalc — Instant volume estimates from room video" },
      {
        name: "description",
        content:
          "Turn a quick room video into itemised, room-by-room cubic metre estimates for private moves and moving companies.",
      },
      { property: "og:title", content: "VolumCalc — Instant volume estimates from room video" },
      {
        property: "og:description",
        content: "Itemised m³ estimates from room video and checklist confirmation, ready for quoting and truck planning.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});
