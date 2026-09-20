import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/LandingPage";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "VolumCalc — AI volume estimates from room photos" },
      {
        name: "description",
        content:
          "Turn room photos into itemised, room-by-room cubic metre estimates for private moves and moving companies.",
      },
      { property: "og:title", content: "VolumCalc — AI volume estimates from room photos" },
      {
        property: "og:description",
        content: "Itemised m³ estimates from customer photos, ready for quoting and truck planning.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

