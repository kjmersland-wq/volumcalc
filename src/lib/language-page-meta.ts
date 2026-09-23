export type LanguagePageMeta = {
  title: string;
  description: string;
  path: string;
};

export function languagePageHead({ title, description, path }: LanguagePageMeta) {
  const languageCode = path.slice(1);
  const image = `https://www.volumcalc.com/og-volumcalc-${languageCode}.jpg`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: `${title} — social sharing image` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: `https://www.volumcalc.com${path}` }],
  };
}