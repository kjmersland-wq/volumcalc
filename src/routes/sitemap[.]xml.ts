import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import { sitemapStaticPaths, sitemapXML, type SitemapEntry } from "@/lib/sitemap";

const BASE_URL = "https://www.volumcalc.com";

/**
 * Last real content change per page. Bump a date when that page's content
 * changes — a lastmod that moves on every request is ignored by crawlers.
 */
const DEFAULT_LASTMOD = "2026-10-20";
const LASTMOD: Record<string, string> = {
  "/personvern": "2026-09-20",
  "/vilkar": "2026-09-20",
  "/kjopsvilkar": "2026-09-20",
  "/databehandling": "2026-09-20",
  "/cookies": "2026-09-20",
};

/** The homepage in every language; each lists all of them (and itself) as alternates. */
const HOME_VARIANTS: { hreflang: string; path: string }[] = [
  { hreflang: "en", path: "/" },
  { hreflang: "no", path: "/no" },
  { hreflang: "sv", path: "/se" },
  { hreflang: "da", path: "/dk" },
  { hreflang: "fi", path: "/fi" },
  { hreflang: "de", path: "/de" },
  { hreflang: "nl", path: "/nl" },
  { hreflang: "fr", path: "/fr" },
  { hreflang: "pl", path: "/pl" },
  { hreflang: "es", path: "/es" },
  { hreflang: "it", path: "/it" },
  { hreflang: "pt", path: "/pt" },
  { hreflang: "x-default", path: "/" },
];

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({
          path,
          lastmod: LASTMOD[path] ?? DEFAULT_LASTMOD,
          ...(HOME_VARIANTS.some((variant) => variant.path === path && variant.hreflang !== "x-default")
            ? { alternates: HOME_VARIANTS }
            : {}),
        }));
        if (entries.length === 0) {
          return new Response(
            'No pages are included in this sitemap. Check route decisions and ancestor exclusions. Setting "exclude-subtree" on the root excludes the entire site.',
            { status: 404, headers: { "Cache-Control": "no-store" } },
          );
        }
        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
