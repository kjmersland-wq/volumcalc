# VolumCalc

Flyttekalkulator som regner ut volum (m³) rom for rom, foreslår bil, lager en delbar rapport/PDF og lar kunden sende forespørsel til flyttefirmaer. Egen dashbord-side for flyttebyråer.

- **App:** TanStack Start (React 19, Vite, Tailwind) med serverfunksjoner
- **Database og innlogging:** Supabase (Postgres, Auth)
- **Hosting:** Vercel, bygget fra `main` på GitHub
- **Betaling:** Paddle (live), kalt direkte fra serveren
- **E-post:** Resend eller Migadu SMTP

## Kjør lokalt

```sh
bun install
cp .env.example .env   # fyll ut verdiene
bun run dev
```

## Oppsett fra bunnen av (sjekkliste)

Gjør dette i rekkefølge første gang. Alt under er nødvendig for at hele appen skal virke.

### 1. Supabase

1. Lag et nytt prosjekt på supabase.com.
2. Åpne **SQL Editor**, lim inn hele `supabase/schema_from_scratch.sql` og kjør den **én gang**. Den lager alle tabeller, policyer og funksjoner (inkludert `has_role`). Ikke kjør filene i `supabase/migrations` i tillegg.
3. **Project Settings → API:** kopier prosjekt-URL, `publishable`-nøkkelen og `service_role`-nøkkelen (hemmelig).
4. **Authentication → URL Configuration:** sett *Site URL* til `https://www.volumcalc.com` og legg til `https://www.volumcalc.com/**` og `http://localhost:3000/**` under *Redirect URLs*.
5. **Authentication → Providers → Google:** slå på og lim inn Client ID og Secret fra en OAuth-klient i Google Cloud (autorisert redirect-URI står i Supabase-skjermbildet). Uten dette virker ikke «Logg inn med Google».
6. **Authentication → SMTP Settings:** sett en egen avsender (Resend eller Migadu) slik at bekreftelses- og glemt-passord-e-poster kommer fra ditt domene.
7. Opprett deg selv som bruker på siden, og kjør så disse to setningene i SQL Editor for å bli administrator (bytt e-post):

   ```sql
   INSERT INTO public.user_roles (user_id, role)
   SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'din@epost.no'
   ON CONFLICT DO NOTHING;
   ```

### 2. Vercel

1. Importer GitHub-repoet `kjmersland-wq/volumcalc`. Produksjonsgrenen er `main`.
2. Legg inn miljøvariablene under (Settings → Environment Variables, **Production og Preview**).
3. Koble domenet `www.volumcalc.com` (DNS hos domeneleverandøren/Cloudflare).
4. Etter å ha endret variabler: **Deployments → ⋯ → Redeploy**. Variabler gjelder først etter ny deploy.

| Variabel | Hva | Hemmelig |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase prosjekt-URL (brukes i nettleseren, må finnes ved bygging) | Nei |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable-nøkkel (nettleseren) | Nei |
| `SUPABASE_URL` | Samme URL, for serveren | Nei |
| `SUPABASE_PUBLISHABLE_KEY` | Samme nøkkel, for serveren | Nei |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin-nøkkel, bare serveren | **Ja** |
| `PUBLIC_SITE_URL` | `https://www.volumcalc.com` | Nei |
| `PADDLE_LIVE_API_KEY` | Paddle API-nøkkel (live) | **Ja** |
| `PADDLE_CLIENT_TOKEN` | Paddle.js klient-token, må begynne med `live_` | Nei |
| `PADDLE_WEBHOOK_SECRET` | Hemmelighet for webhook-signatur | **Ja** |
| `RESEND_API_KEY` | E-post via Resend (anbefalt) | **Ja** |
| `RESEND_FROM` | Avsender på et verifisert Resend-domene, f.eks. `post@volumcalc.com` | Nei |
| `MIGADU_SMTP_HOST` / `_PORT` / `_USER` / `_PASSWORD` | Alternativ til Resend (brukes hvis `RESEND_API_KEY` mangler) | Passord: **Ja** |
| `CONTACT_RECIPIENT_EMAIL` | Mottaker for kontaktskjemaet (standard `kjmersland@gmail.com`) | Nei |

Bygget **feiler med vilje** hvis `VITE_SUPABASE_URL` eller `VITE_SUPABASE_PUBLISHABLE_KEY` mangler, i stedet for å bruke feil database. Den forrige live-versjonen blir da stående.

### 3. Paddle

1. Opprett produktene og legg prisene inn i `src/lib/paddle-prices.ts` (`single`, `three_pack`, `business`).
2. **Developer Tools → Notifications:** legg til destinasjonen `https://www.volumcalc.com/api/public/payments/webhook`, velg hendelsene `transaction.completed` og `subscription.*`, og kopier hemmeligheten til `PADDLE_WEBHOOK_SECRET`.
3. Godkjenn domenet `www.volumcalc.com` under Paddles checkout-innstillinger.

### 4. E-post

- **Resend:** verifiser domenet `volumcalc.com` (DNS-poster), lag en API-nøkkel og sett `RESEND_API_KEY` og `RESEND_FROM`. Uten verifisert domene kan Resend bare sende til e-posten kontoen er opprettet med.
- **Migadu:** sett `MIGADU_SMTP_*`, og la `RESEND_API_KEY` stå tom.

### 5. Partnere (valgfritt)

Logg inn som admin og åpne `/dashboard/admin`. Der legger du inn flyttefirmaer («Relevante firmaer») enkeltvis eller ved å lime inn `Firmanavn; epost@firma.no` per linje.

## Sjekk at alt virker

1. Forsiden og `/upload` laster uten feil.
2. Opprett konto (e-post) og logg inn. Prøv også Google.
3. Fullfør en beregning og åpne rapporten.
4. Send en melding fra `/contact`. Den skal komme til `CONTACT_RECIPIENT_EMAIL`.
5. Åpne `/pricing` innlogget og trykk et kjøp: Paddle-vinduet skal åpnes.
6. Etter en ekte betaling: kredittene dukker opp i dashbordet (webhooken fungerer).

## Feilsøking

- **Hvit side eller innlogging feiler:** sjekk `VITE_SUPABASE_*` i Vercel, og redeploy.
- **«relation public.estimates does not exist»:** `schema_from_scratch.sql` er ikke kjørt i dette prosjektet.
- **«Checkout could not be opened»:** `PADDLE_CLIENT_TOKEN` mangler eller starter ikke med `live_`.
- **Kjøp gir ingen kreditter:** `PADDLE_WEBHOOK_SECRET` mangler, eller webhook-adressen i Paddle er feil.
- **Kontaktskjema/forespørsel sendes ikke:** sjekk `RESEND_API_KEY`/`RESEND_FROM` eller `MIGADU_SMTP_*`.

## Utvikling

- `main` er produksjon og bygges automatisk av Vercel. Ikke skriv om historikk som er pushet.
- Databaseendringer legges som nye filer i `supabase/migrations`. `supabase/schema_from_scratch.sql` er alle migrasjonene samlet for et tomt prosjekt; lag den på nytt etter at du har lagt til en migrasjon.
- Typer: `src/integrations/supabase/types.ts` genereres med `supabase gen types typescript`. Partnertabellene er ikke med ennå, og koden bruker en løst typet håndtering til de er regenerert.
- Se `CLAUDE.md` for regler om hva som ikke skal endres uten eksplisitt beskjed.
