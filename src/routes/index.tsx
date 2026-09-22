import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/LandingPage";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "VolumCalc — Brilliant moving volume estimates from your own photos" },
      {
        name: "description",
        content:
          "Turn a quick wander through your rooms into a clear, room-by-room cubic metre estimate for a calmer move.",
      },
      {
        property: "og:title",
        content: "VolumCalc — Brilliant moving volume estimates from your own photos",
      },
      {
        property: "og:description",
        content:
          "A warm, straightforward photo-and-checklist flow for beautifully clear moving volume estimates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});
