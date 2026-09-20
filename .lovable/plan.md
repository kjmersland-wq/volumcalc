# VolumCalc: rapportfelter, juridiske sider og firmaprofil

## 1. Bildegrense
- Maks **20 bilder** per beregning igjen: tydelig tekst på opplastingssiden, vennlig melding hvis man velger flere.
- **Din egen konto (kjmersland@gmail.com) har ingen grense.** Løses med en egen rolletabell (ubegrenset-rolle), ikke ved å skrive e-posten inn i koden.
- Gratisprøven beholder sine 6 bilder.

## 2. Rapporten: skjul pris ved anbud
- Ny bryter i rapporten: **"Anbudsmodus – skjul priser"**.
- Når den er på, forsvinner "Estimert pris" og alle prisfelter fra skjerm, PDF og delt lenke. Volum, rom og gjenstander vises som før.

## 3. Lagre/dele rapporten på flere språk
- Ny språkvelger for rapporten: **norsk, engelsk, polsk**.
- Valget gjelder både visning, PDF og delingslenke, og alt du selv har redigert (romnavn, merknader) beholdes uendret – kun faste etiketter oversettes.
- Polsk legges inn som nytt rapportspråk (etiketter, romnavn-forslag, statuser).

## 4. Nye felter i rapporten
Alt lagres på beregningen og vises i PDF:

**Mellomlagring / lagerhotell**
- Ja/nei, firmanavn, full adresse, kontaktperson, telefon.

**Levering direkte til ny bolig**
- Full adresse, etasje, heis (ja/nei), bæreavstand, merknader.

**Pakking og emballasje**
- Ønsker pakkehjelp (ja/nei), nivå: kun skjøre ting / delvis / full pakking.
- Emballasjeliste med antall: flyttekasser, bobleplast, pakkepapir, tape, garderobekasser, madrassposer, møbelteppe.
- Fritekst for spesielle ting (kunst, piano, TV).

## 5. Firmaprofil på rapport og i header
- Utvidede firmainnstillinger: organisasjonsnummer, adresse, telefon, e-post, nettside, i tillegg til logo og farge som finnes i dag.
- Når et firma er eier av en rapport, vises logo + firmadetaljer øverst i rapporten og i PDF, og firmanavnet vises i headeren når de er innlogget.

## 6. Footer og juridiske sider
- Footer får: "Utviklet og drevet av KM TECH LABS i Kristiansand, Norge · Org.nr. 934 044 029".
- Nye sider på norsk og engelsk (språket følger språkvelgeren):
  - Personvernerklæring / Privacy policy (GDPR: hva lagres, bilder, sletting, rettigheter)
  - Vilkår for bruk / Terms of service
  - Informasjonskapsler / Cookie policy
  - Databehandleravtale / Data processing (for flyttebyråer)
  - Angrerett og kjøpsvilkår / Refunds and purchase terms (forbrukerkjøp, digitale tjenester)
  - Om oss / About (KM TECH LABS, org.nr., kontakt)
- Alle lenkes i footer og legges i sitemap.

## 7. Hjelp og FAQ
- Ny **Hjelp / FAQ**-side på begge språk: fotografering, rom og redigering, volum og stuefaktor, pakking og lagring, deling og PDF, priser og betaling, personvern og sletting, for flyttebyråer.
- FAQ-schema for søkemotorer, lenket i footer og fra rapporten.

## Teknisk
- Migrasjon: nye kolonner på `estimates` (lagring, levering, pakking, emballasje, anbudsmodus, rapportspråk), nye kolonner på `companies` (org.nr., adresse, telefon, e-post, nettside), ny `user_roles`-tabell med `has_role`-funksjon for ubegrenset opplasting. GRANT + RLS på alt nytt.
- Bildegrense håndheves både i skjema og server-validator, med unntak for rolle `unlimited`.
- Rapportspråk håndteres med en egen ordliste (no/en/pl) for rapport- og PDF-etiketter.
- Nye ruter: `/hjelp` (delt hjelp/FAQ), `/personvern`, `/vilkar`, `/cookies`, `/databehandling`, `/kjopsvilkar`, `/om-oss` – hver side tospråklig med egen title/description.
