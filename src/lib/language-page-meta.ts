import { homeStructuredData } from "./structured-data";

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

const OG_LOCALES: Record<string, string> = {
  en: "en_US",
  no: "nb_NO",
  sv: "sv_SE",
  da: "da_DK",
  fi: "fi_FI",
  de: "de_DE",
  nl: "nl_NL",
  fr: "fr_FR",
  pl: "pl_PL",
  es: "es_ES",
  it: "it_IT",
  pt: "pt_PT",
};

const PATH_TO_LANG: Record<string, string> = Object.fromEntries(
  Object.entries(HREFLANG_PATHS).map(([lang, path]) => [path, lang]),
);

/** Social-image code used in /og-volumcalc-<code>.jpg for a language path. */
const IMAGE_CODE: Record<string, string> = { "/": "en" };

/**
 * Full head for a homepage variant ("/" or "/no", "/se", …): unique title and
 * description, Open Graph / Twitter tags with the language's own 1200×630
 * image, a self-referencing canonical, reciprocal hreflang alternates (incl.
 * x-default) and a single JSON-LD graph.
 */
export function languagePageHead({ title, description, path }: LanguagePageMeta) {
  const lang = PATH_TO_LANG[path] ?? "en";
  const url = `https://www.volumcalc.com${path === "/" ? "/" : path}`;
  const code = IMAGE_CODE[path] ?? path.slice(1);
  const image = `https://www.volumcalc.com/og-volumcalc-${code}.jpg`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: "VolumCalc" },
      { property: "og:locale", content: OG_LOCALES[lang] ?? "en_US" },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: title },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      {
        "script:ld+json": homeStructuredData({ url, inLanguage: lang === "no" ? "nb" : lang, description }),
      },
    ],
    links: [{ rel: "canonical", href: url }, ...hreflangLinks()],
  };
}
