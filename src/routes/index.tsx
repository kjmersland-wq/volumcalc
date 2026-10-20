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
      { title: "VolumCalc — Clear moving volume in minutes, room by room" },
      {
        name: "description",
        content:
          "Pick items from the checklist, get an accurate m³ estimate, a recommended vehicle and a shareable report. Perfect for households and moving companies.",
      },
      {
        property: "og:title",
        content: "VolumCalc — Clear moving volume in minutes, room by room",
      },
      {
        property: "og:description",
        content:
          "Pick items from the checklist and get an accurate m³ estimate and a shareable report.",
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
