// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Public (publishable) backend values. These are safe to ship in client code and act as a
// fallback when the build environment does not provide VITE_SUPABASE_* (e.g. production deploys
// where .env is not present), which otherwise crashes the published app on hydration.
const SUPABASE_URL = process.env["VITE_SUPABASE_URL"] ?? "https://pohymoavvmimruuizxca.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? "sb_publishable_oYL3UEMrE70lxtK_bhS7wA_MoOQXgtS";
const SUPABASE_PROJECT_ID = process.env["VITE_SUPABASE_PROJECT_ID"] ?? "pohymoavvmimruuizxca";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(SUPABASE_PROJECT_ID),
    },
  },
});
