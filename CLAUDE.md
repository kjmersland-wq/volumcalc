# CLAUDE.md — Regler for Claude Code i dette prosjektet (VolumCalc)

Claude Code kan brukes fritt til **tekster, oversettelser, SEO-innhold, dokumentasjon, FAQ, blogginnhold og forslag til forbedringer** — men skal IKKE røre de tekniske områdene under uten at Kjell eksplisitt ber om det i den enkelte oppgaven.

## IKKE RØR — genererte filer (skrives automatisk på nytt)
- `src/routeTree.gen.ts`
- `src/integrations/supabase/client.ts`, `client.server.ts`, `previewAuthStorage.ts`, `auth-middleware.ts`, `auth-attacher.ts`, `types.ts`
- `.env` (alle VITE_SUPABASE_*/nøkkelvariabler)
- `supabase/config.toml`

## IKKE RØR — backend, database og sikkerhet
- Database-skjemaer: `auth`, `storage`, `realtime`, `supabase_functions`, `vault` (verken tabeller eller triggere)
- RLS-policies, GRANT-setninger og eksisterende migrasjonsfiler
- `user_roles`-tabellen og `has_role()`-funksjonen
- Storage-bucket policies (estimate_photos o.l.)
- Alltid be om eksplisitt godkjenning før nye migrasjoner

## IKKE RØR — autentisering og økter
- `src/start.ts` (functionMiddleware / bearer-token-vedlegg)
- `requireSupabaseAuth`, auth-middleware-kjeden
- Login-, OAuth- og økt-håndtering

## IKKE RØR — betaling
- Stripe-nøkler, pris-ID-er, lookup keys, webhook-signaturverifisering
- Checkout-flyten og betalingsrelaterte server-funksjoner

## IKKE RØR — rammeverk og byggeoppsett
- Router-oppsettet: `src/router.tsx`, kjernen i `src/routes/__root.tsx`, `src/start.ts`
- Installer ALDRI `react-router-dom` eller andre routere — TanStack Router er låst
- `vite.config.ts`, `tsconfig.json`, `package.json`-avhengigheter (kun etter eksplisitt beskjed)
- Rekkefølgen av `@import` øverst i `src/styles.css`
- IKKE flytt eller slett filer under `src/server/`, `*.server.ts` eller endre import-beskyttelsen mellom klient/server

## IKKE RØR — infrastruktur utenfor koden
- DNS, Cloudflare, Migadu (e-post/SMTP), domeneinnstillinger
- Publicerings-/deploy-innstillinger

## Lovte og ønsket bruk
- Norsk/engelsk (+ alle språkversjoner) tekster, oversettelser og korrektur
- SEO-tekster, metadata-tekstinnhold (title/description-forslag), blogg og landingssider
- FAQ, hjelpesider, juridiske sider (innholdet, ikke rutingen)
- Dokumentasjon, oppgavelister, idéutvikling og kodegjennomgang med forslag
