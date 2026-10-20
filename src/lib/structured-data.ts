export const SITE_ORIGIN = "https://www.volumcalc.com";

const LANGUAGES = ["en", "nb", "sv", "da", "fi", "de", "nl", "fr", "pl", "es", "it", "pt"];

/**
 * One JSON-LD @graph for a homepage variant: Organization, WebSite and
 * SoftwareApplication. The Organization and WebSite use fixed @ids so every
 * language version points at the same entities; the SoftwareApplication is
 * per page so its description and language match the page.
 */
export function homeStructuredData(opts: { url: string; inLanguage: string; description: string }) {
  const org = `${SITE_ORIGIN}/#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": org,
        name: "VolumCalc",
        legalName: "KM TECH LABS",
        url: `${SITE_ORIGIN}/`,
        logo: `${SITE_ORIGIN}/favicon.svg`,
        identifier: "934 044 029",
        address: { "@type": "PostalAddress", addressLocality: "Kristiansand", addressCountry: "NO" },
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: "support@volumcalc.com",
            availableLanguage: LANGUAGES,
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_ORIGIN}/#website`,
        name: "VolumCalc",
        url: `${SITE_ORIGIN}/`,
        publisher: { "@id": org },
        inLanguage: LANGUAGES,
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${opts.url}#software`,
        name: "VolumCalc",
        alternateName: "VolumCalc moving volume calculator",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url: opts.url,
        inLanguage: opts.inLanguage,
        description: opts.description,
        featureList: [
          "Moving volume calculator in m³",
          "Room-by-room checklist with 120+ items",
          "Recommended vehicle size",
          "Custom items with dimensions",
          "PDF report in 12 languages",
          "Shareable report link",
        ],
        publisher: { "@id": org },
        offers: [
          { "@type": "Offer", name: "Free calculator", price: "0", priceCurrency: "NOK" },
          { "@type": "Offer", name: "Single estimate", price: "129", priceCurrency: "NOK" },
          { "@type": "Offer", name: "3 estimates", price: "299", priceCurrency: "NOK" },
        ],
      },
    ],
  };
}
