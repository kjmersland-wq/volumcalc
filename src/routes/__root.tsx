import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LanguageProvider, SUPPORTED_LANGS, useI18n, type Lang } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { useLocalizedMeta } from "@/lib/use-localized-meta";

function NotFoundComponent() {
  const { t } = useI18n();
  useLocalizedMeta({
    title: `404 — ${t("root.notFoundTitle")} — VolumCalc`,
    description: t("root.notFoundBody"),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t("root.notFoundTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("root.notFoundBody")}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("root.goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { t } = useI18n();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  useLocalizedMeta({
    title: `${t("root.errorTitle")} — VolumCalc`,
    description: t("root.errorBody"),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t("root.errorTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("root.errorBody")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("root.tryAgain")}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("root.goHome")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  staticData: { sitemap: false },
  validateSearch: (search: Record<string, unknown>): { lang?: Lang } => {
    const value = search["lang"];
    return typeof value === "string" && (SUPPORTED_LANGS as string[]).includes(value)
      ? { lang: value as Lang }
      : {};
  },
  head: ({ match }) => {
    const norwegian = match.search.lang === "no";
    const socialImage = norwegian
      ? "https://volumcalc.com/og-volumcalc-no.jpg"
      : "https://volumcalc.com/og-volumcalc-en.jpg";
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "VolumCalc — Brilliant moving volume estimates from a quick room video" },
        {
          name: "description",
          content:
            "Room-by-room cubic metre estimates from a quick room video and stress-free checklist flow.",
        },
        { name: "author", content: "VolumCalc" },
        {
          name: "google-site-verification",
          content: "lw36vGJxiTk2wfz2FodnA06RXUeBUdk7a3EwNI-wSE8",
        },
        {
          property: "og:title",
          content: "VolumCalc — Brilliant moving volume estimates from a quick room video",
        },
        {
          property: "og:description",
          content:
            "Room-by-room cubic metre estimates from a quick room video and stress-free checklist flow.",
        },
        { property: "og:type", content: "website" },
        { property: "og:image", content: socialImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        {
          property: "og:image:alt",
          content: norwegian
            ? "VolumCalc – romvis volumberegning fra video"
            : "VolumCalc — room-by-room volume estimates from room video",
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: socialImage },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
        },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster position="top-center" richColors />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
