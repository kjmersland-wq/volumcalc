import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { routeTree } from "./routeTree.gen";
import { resolveLangFromRequest, type Lang } from "@/lib/i18n";

// Resolved once per request (server) or once at boot (client) — before any
// component renders — so the very first render already shows the right
// language instead of English-then-swap after hydration. See i18n.tsx's
// resolveLangFromRequest for why this has to stay outside any effect.
// createIsomorphicFn (not a plain typeof-window branch) is required here —
// the build's import-protection plugin statically forbids a server-only
// import like getRequest from reaching the client bundle at all, even
// behind a runtime guard; this is the framework's blessed way to keep one
// server-only branch and one client branch in the same call.
const resolveInitialLang = createIsomorphicFn()
  .server((): Lang => {
    const request = getRequest();
    if (!request) return "en";
    const url = new URL(request.url);
    return resolveLangFromRequest(url.pathname, url.search, url.hostname);
  })
  .client(
    (): Lang => resolveLangFromRequest(window.location.pathname, window.location.search, window.location.hostname),
  );

export const getRouter = () => {
  const queryClient = new QueryClient();
  const initialLang = resolveInitialLang();

  const router = createRouter({
    routeTree,
    context: { queryClient, initialLang },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
