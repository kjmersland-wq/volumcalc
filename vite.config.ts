// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Public (publishable) Supabase values, baked into the browser bundle at build time.
// They must come from the hosting environment (Vercel: Settings -> Environment Variables);
// there is deliberately no fallback, so a build can never silently talk to the wrong project.
const SUPABASE_URL = process.env["VITE_SUPABASE_URL"];
const SUPABASE_PUBLISHABLE_KEY = process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

if ((process.env["VERCEL"] || process.env["CI"]) && (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY)) {
  throw new Error(
    "Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_PUBLISHABLE_KEY. Add them in Vercel -> Settings -> " +
      "Environment Variables (Production and Preview), then redeploy. See README.md.",
  );
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    // Only override when the variables are set in the real environment; locally Vite reads .env itself.
    define: {
      ...(SUPABASE_URL ? { "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL) } : {}),
      ...(SUPABASE_PUBLISHABLE_KEY
        ? { "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY) }
        : {}),
    },
  },
});
