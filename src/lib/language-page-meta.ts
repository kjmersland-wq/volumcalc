export type LanguagePageMeta = {
  title: string;
  description: string;
  path: string;
};

// The homepage's 12 language variants — every hreflang-tagged page must
// list all of these (including itself), so search engines know they're
// alternates of the same content, not duplicates or unrelated pages.
const HREFLANG_PATHS: Record<string, string> = {
  en: "/",
  no: "/no",
  sv: "/se",
  da: "/dk",
  fi: "/fi",
  de: "/de",
  nl: "/nl",
  fr: "/fr",
  pl: "/pl",
  es: "/es",
  it: "/it",
  pt: "/pt",
};

export function hreflangLinks(): { rel: "alternate"; hreflang: string; href: string }[] {
  const links = Object.entries(HREFLANG_PATHS).map(([hreflang, path]) => ({
    rel: "alternate" as const,
    hreflang,
    href: `https://www.volumcalc.com${path}`,
  }));
  links.push({ rel: "alternate", hreflang: "x-default", href: "https://www.volumcalc.com/" });
  return links;
}

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
    links: [{ rel: "canonical", href: `https://www.volumcalc.com${path}` }, ...hreflangLinks()],
  };
}