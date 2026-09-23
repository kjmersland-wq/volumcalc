import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/LandingPage";
import { hreflangLinks } from "@/lib/language-page-meta";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VolumCalc",
  url: "https://www.volumcalc.com/",
  logo: "https://www.volumcalc.com/favicon.svg",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "VolumCalc",
  url: "https://www.volumcalc.com/",
};

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
      { property: "og:image", content: "https://www.volumcalc.com/og-volumcalc-en.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "VolumCalc — Moving volume, made clear" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://www.volumcalc.com/og-volumcalc-en.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/" }, ...hreflangLinks()],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(organizationSchema) },
      { type: "application/ld+json", children: JSON.stringify(websiteSchema) },
    ],
  }),
  component: LandingPage,
});
