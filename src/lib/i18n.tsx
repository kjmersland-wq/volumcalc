import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "no" | "en";

type Dict = Record<string, { no: string; en: string }>;

const dict: Dict = {
  "nav.how": { no: "Slik fungerer det", en: "How it works" },
  "nav.pricing": { no: "Priser", en: "Pricing" },
  "nav.login": { no: "Logg inn", en: "Log in" },
  "nav.dashboard": { no: "Dashbord", en: "Dashboard" },
  "nav.tryFree": { no: "Prøv gratis", en: "Try for free" },

  "hero.badge": { no: "AI-drevet volumberegning", en: "AI-powered volume estimation" },
  "hero.title1": { no: "Kubikk på", en: "Cubic metres in" },
  "hero.title2": { no: "sekunder – ikke befaring", en: "seconds — not site visits" },
  "hero.sub": {
    no: "VolumCalc gjør bilder av rommene dine om til en ryddig, rominndelt volumberegning – klar for flytteplanlegging og pristilbud.",
    en: "VolumCalc turns room photos into a clear, room-by-room volume estimate — ready for moving plans and quotes.",
  },
  "hero.cta": { no: "Start en gratis beregning", en: "Start a free estimate" },
  "hero.cta2": { no: "For flyttebyråer", en: "For moving companies" },
  "hero.stat1": { no: "raskere enn befaring", en: "faster than a survey" },
  "hero.stat2": { no: "gjenstander gjenkjent", en: "items recognised" },
  "hero.stat3": { no: "færre tvister", en: "fewer disputes" },

  "how.title": { no: "Fra bilde til tilbud i tre steg", en: "From photo to quote in three steps" },
  "how.1t": { no: "Kunden laster opp bilder", en: "Customer uploads photos" },
  "how.1d": {
    no: "Del en lenke. Kunden tar bilder fra mobilen – ingen innlogging, ingen app.",
    en: "Share a link. The customer shoots photos on their phone — no login, no app.",
  },
  "how.2t": { no: "AI analyserer", en: "AI analyses" },
  "how.2d": {
    no: "Hver gjenstand identifiseres med mål, volum i m³ og en tydelig sikkerhetsgrad.",
    en: "Every item is identified with dimensions, volume in m³ and a clear confidence level.",
  },
  "how.3t": { no: "Du sender tilbud", en: "You send the quote" },
  "how.3d": {
    no: "Gå gjennom listen, juster ved behov og generer pris basert på din m³-pris.",
    en: "Review the list, adjust if needed and generate a price from your rate per m³.",
  },

  "feat.title": { no: "Bygget for flyttebransjen", en: "Built for the moving industry" },
  "feat.1t": { no: "Nøyaktige kubikkmål", en: "Accurate cubic volume" },
  "feat.1d": {
    no: "Realistiske standardmål per møbeltype, justert etter det AI-en ser på bildet.",
    en: "Realistic reference dimensions per furniture type, adjusted to what the AI sees.",
  },
  "feat.2t": { no: "Sikkerhetsgrad", en: "Confidence score" },
  "feat.2d": {
    no: "Se hvilke gjenstander som bør dobbeltsjekkes før du sender tilbudet.",
    en: "See which items deserve a second look before the quote goes out.",
  },
  "feat.3t": { no: "Delbar rapport", en: "Shareable report" },
  "feat.3d": {
    no: "Hver beregning får en egen lenke og PDF – kunden ser nøyaktig hva som er med.",
    en: "Every estimate gets its own link and PDF — the customer sees exactly what is included.",
  },
  "feat.4t": { no: "Din merkevare", en: "Your brand" },
  "feat.4d": {
    no: "Logo, farger, valuta og pris per m³ settes i innstillingene.",
    en: "Logo, colours, currency and price per m³ are set in your settings.",
  },

  "cta.title": { no: "Klar for å kutte befaringene?", en: "Ready to cut the site visits?" },
  "cta.sub": {
    no: "Opprett konto og del din første opplastingslenke i dag.",
    en: "Create an account and share your first upload link today.",
  },

  "upload.title": { no: "Last opp bilder av tingene dine", en: "Upload photos of your items" },
  "upload.sub": {
    no: "AI-en sorterer bildene og gjenstandene automatisk etter rom.",
    en: "AI automatically sorts your photos and items by room.",
  },
  "upload.guideTitle": { no: "Slik får du best resultat", en: "How to get the best result" },
  "upload.guide": {
    no: "Ta 1–3 bilder per rom. Ett oversiktsbilde av hele rommet + 1–2 nærbilder av de største møblene gir best resultat. Du trenger ikke fotografere hver minste gjenstand.",
    en: "Take 1–3 photos per room. One overview photo of the whole room + 1–2 closer photos of the largest furniture items gives the best result. You don’t need to photograph every small object.",
  },
  "upload.drop": { no: "Dra bilder hit eller trykk for å velge", en: "Drag photos here or tap to select" },
  "upload.hint": { no: "JPG eller PNG · maks 15 bilder", en: "JPG or PNG · maximum 15 photos" },
  "upload.limit": { no: "Du kan laste opp maksimalt 15 bilder.", en: "You can upload a maximum of 15 photos." },
  "upload.photos": { no: "bilder valgt", en: "photos selected" },
  "upload.details": { no: "Kontaktinformasjon (valgfritt)", en: "Contact details (optional)" },
  "upload.name": { no: "Navn", en: "Name" },
  "upload.phone": { no: "Telefon", en: "Phone" },
  "upload.date": { no: "Flyttedato", en: "Move date" },
  "upload.address": { no: "Adresse", en: "Address" },
  "upload.submit": { no: "Beregn volum", en: "Calculate volume" },
  "upload.needPhoto": { no: "Legg til minst ett bilde først.", en: "Add at least one photo first." },
  "upload.uploading": { no: "Laster opp bilder …", en: "Uploading photos …" },
  "upload.analysing": { no: "AI analyserer møblene dine …", en: "AI is analysing your furniture …" },
  "upload.saving": { no: "Lagrer beregningen …", en: "Saving your estimate …" },
  "upload.failed": { no: "Noe gikk galt. Prøv igjen.", en: "Something went wrong. Please try again." },

  "res.title": { no: "Volumberegning", en: "Volume estimate" },
  "res.total": { no: "Totalt volum", en: "Total volume" },
  "res.items": { no: "gjenstander", en: "items" },
  "res.item": { no: "Gjenstand", en: "Item" },
  "res.dims": { no: "Mål (cm)", en: "Dimensions (cm)" },
  "res.qty": { no: "Antall", en: "Qty" },
  "res.volume": { no: "Volum", en: "Volume" },
  "res.confidence": { no: "Sikkerhet", en: "Confidence" },
  "res.pdf": { no: "Last ned PDF", en: "Download PDF" },
  "res.share": { no: "Kopier delingslenke", en: "Copy share link" },
  "res.copied": { no: "Lenke kopiert", en: "Link copied" },
  "res.photos": { no: "Bilder", en: "Photos" },
  "res.room": { no: "Rom", en: "Room" },
  "res.renameRoom": { no: "Gi rommet nytt navn", en: "Rename room" },
  "res.moveRoom": { no: "Flytt til rom", en: "Move to room" },
  "res.roomTotal": { no: "Romvolum", en: "Room volume" },
  "res.other": { no: "Annet", en: "Other" },
  "res.notFound": { no: "Fant ikke beregningen.", en: "Estimate not found." },
  "res.estimated": { no: "Estimert pris", en: "Estimated price" },
  "res.disclaimer": {
    no: "Estimatet er basert på bildene og er veiledende frem til flyttebyrået har godkjent det.",
    en: "This estimate is based on the photos and is indicative until the moving company approves it.",
  },

  "auth.title": { no: "Logg inn for flyttebyrå", en: "Moving company login" },
  "auth.signin": { no: "Logg inn", en: "Sign in" },
  "auth.signup": { no: "Opprett konto", en: "Create account" },
  "auth.email": { no: "E-post", en: "Email" },
  "auth.password": { no: "Passord", en: "Password" },
  "auth.company": { no: "Firmanavn", en: "Company name" },
  "auth.google": { no: "Fortsett med Google", en: "Continue with Google" },
  "auth.toSignup": { no: "Har du ikke konto? Opprett en", en: "No account? Create one" },
  "auth.toSignin": { no: "Har du allerede konto? Logg inn", en: "Already have an account? Sign in" },
  "auth.check": {
    no: "Sjekk e-posten din for å bekrefte kontoen.",
    en: "Check your email to confirm your account.",
  },

  "dash.title": { no: "Innkomne beregninger", en: "Incoming estimates" },
  "dash.empty": { no: "Ingen beregninger ennå.", en: "No estimates yet." },
  "dash.customer": { no: "Kunde", en: "Customer" },
  "dash.date": { no: "Mottatt", en: "Received" },
  "dash.status": { no: "Status", en: "Status" },
  "dash.open": { no: "Åpne", en: "Open" },
  "dash.link": { no: "Kopier opplastingslenke", en: "Copy upload link" },
  "dash.settings": { no: "Innstillinger", en: "Settings" },
  "dash.signout": { no: "Logg ut", en: "Sign out" },
  "dash.claim": { no: "Hent inn til mitt firma", en: "Claim for my company" },
  "dash.approve": { no: "Godkjenn", en: "Approve" },
  "dash.approved": { no: "Godkjent", en: "Approved" },
  "dash.pending": { no: "Til gjennomgang", en: "Pending review" },
  "dash.saveItem": { no: "Lagre", en: "Save" },
  "dash.deleteItem": { no: "Slett", en: "Delete" },
  "dash.editing": { no: "Rediger AI-resultatet", en: "Edit the AI result" },

  "set.title": { no: "Firmaprofil", en: "Company profile" },
  "set.name": { no: "Firmanavn", en: "Company name" },
  "set.logo": { no: "Logo-URL", en: "Logo URL" },
  "set.color": { no: "Merkefarge", en: "Brand colour" },
  "set.price": { no: "Pris per m³", en: "Price per m³" },
  "set.currency": { no: "Valuta", en: "Currency" },
  "set.lang": { no: "Standardspråk", en: "Default language" },
  "set.save": { no: "Lagre innstillinger", en: "Save settings" },
  "set.saved": { no: "Innstillinger lagret", en: "Settings saved" },

  "price.title": { no: "Enkle priser, uansett hvordan du flytter", en: "Simple pricing, however you move" },
  "price.sub": {
    no: "Velg en enkelt beregning for din egen flytting, eller en plan for flyttebyrået.",
    en: "Choose a one-off estimate for your own move, or a plan for your moving company.",
  },
  "price.private": { no: "For privatpersoner", en: "For private individuals" },
  "price.business": { no: "For flyttebyråer", en: "For moving companies" },
  "price.month": { no: "/mnd", en: "/mo" },
  "price.cta": { no: "Kom i gang", en: "Get started" },
  "price.popular": { no: "Mest populær", en: "Most popular" },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof dict | string) => string };

const LanguageContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => String(k) });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("volumcalc-lang");
    if (stored === "en" || stored === "no") {
      setLangState(stored);
      return;
    }
    // No saved choice: .com and other hosts start in English, .no starts in Norwegian
    const host = window.location.hostname;
    if (host.endsWith(".no")) setLangState("no");
  }, []);


  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("volumcalc-lang", l);
  }, []);

  const t = useCallback(
    (k: string) => {
      const entry = dict[k];
      return entry ? entry[lang] : k;
    },
    [lang],
  );

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  return useContext(LanguageContext);
}
