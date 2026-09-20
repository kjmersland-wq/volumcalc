export type LanguagePageMeta = {
  title: string;
  description: string;
  path: string;
};

export function languagePageHead({ title, description, path }: LanguagePageMeta) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `https://www.volumcalc.com${path}` }],
  };
}