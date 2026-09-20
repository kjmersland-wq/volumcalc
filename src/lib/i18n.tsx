import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "no" | "en";

type Dict = Record<string, { no: string; en: string }>;

const dict: Dict = {
  "nav.contact": { no: "Kontakt", en: "Contact" },
  "contact.badge": { no: "Kontakt oss", en: "Contact us" },
  "contact.title": { no: "Snakk med VolumCalc", en: "Talk to VolumCalc" },
  "contact.sub": {
    no: "Spørsmål om volumberegning, priser, demo eller samarbeid? Send oss en melding, så svarer vi raskt.",
    en: "Questions about volume estimates, pricing, a demo or a partnership? Send us a message and we reply quickly.",
  },
  "contact.name": { no: "Navn", en: "Name" },
  "contact.email": { no: "E-post", en: "Email" },
  "contact.phone": { no: "Telefon (valgfritt)", en: "Phone (optional)" },
  "contact.subject": { no: "Emne", en: "Subject" },
  "contact.message": { no: "Melding", en: "Message" },
  "contact.placeholder": {
    no: "Fortell kort hva du lurer på – f.eks. antall flyttinger i måneden, ønsket demo eller teknisk spørsmål.",
    en: "Tell us briefly what you need — e.g. monthly move volume, a demo request or a technical question.",
  },
  "contact.send": { no: "Send melding", en: "Send message" },
  "contact.sent": {
    no: "Takk! Meldingen er sendt til kjell@volumcalc.com. Vi svarer vanligvis innen én virkedag.",
    en: "Thanks! Your message was sent to kjell@volumcalc.com. We usually reply within one business day.",
  },
  "contact.sentTitle": { no: "Melding sendt", en: "Message sent" },
  "contact.another": { no: "Send en ny melding", en: "Send another message" },
  "contact.error": { no: "Noe gikk galt. Prøv igjen eller send e-post direkte.", en: "Something went wrong. Try again or email us directly." },
  "contact.required": { no: "Fyll ut navn, e-post, emne og melding.", en: "Please fill in name, email, subject and message." },
  "contact.privacy": {
    no: "Vi bruker opplysningene kun til å svare deg.",
    en: "We only use your details to reply to you.",
  },
  "contact.emailUs": { no: "Send e-post", en: "Email us" },
  "contact.response": { no: "Svartid", en: "Response time" },
  "contact.responseTime": { no: "Vanligvis innen én virkedag", en: "Usually within one business day" },
  "contact.aside": {
    no: "Er du flyttebyrå og vil teste VolumCalc med egne bilder? Nevn det i meldingen, så setter vi opp en gratis prøvekonto.",
    en: "Running a moving company and want to test VolumCalc with your own photos? Mention it and we will set up a free trial account.",
  },
  "contact.homeTitle": { no: "Har du spørsmål?", en: "Got a question?" },
  "contact.homeSub": {
    no: "Send oss noen ord, så tar vi kontakt.",
    en: "Send us a few words and we will get back to you.",
  },

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
  "upload.hint": { no: "JPG eller PNG · så mange bilder du vil", en: "JPG or PNG · as many photos as you like" },
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
  "share.title": { no: "Del beregningen", en: "Share this estimate" },
  "share.sub": { no: "Send rapporten trygt via kanalen du foretrekker.", en: "Send the report using your preferred channel." },
  "share.whatsapp": { no: "Del på WhatsApp", en: "Share on WhatsApp" },
  "share.facebook": { no: "Del på Facebook", en: "Share on Facebook" },
  "share.linkedin": { no: "Del på LinkedIn", en: "Share on LinkedIn" },
  "share.x": { no: "Del på X", en: "Share on X" },
  "share.email": { no: "Del med e-post", en: "Share by email" },
  "share.more": { no: "Flere", en: "More" },

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
  "payment.buy": { no: "Kjøp sikkert", en: "Buy securely" },
  "payment.subscribe": { no: "Abonner", en: "Subscribe" },
  "payment.secure": { no: "Sikker betaling uten å forlate VolumCalc.", en: "Secure payment without leaving VolumCalc." },
  "payment.test": { no: "Testmodus: Ingen ekte betalinger belastes.", en: "Test mode: No real payments are charged." },
  "payment.notLive": { no: "Betaling er ikke aktivert for produksjon ennå.", en: "Payments are not active in production yet." },
  "payment.complete": { no: "Betalingen er fullført", en: "Payment complete" },
  "payment.pending": { no: "Betalingsstatus mangler", en: "Payment status unavailable" },
  "payment.completeSub": { no: "Takk! Du kan nå fortsette til din neste volumberegning.", en: "Thank you. You can now continue to your next volume estimate." },
  "payment.continue": { no: "Start beregning", en: "Start estimate" },

  "rep.status.draft": { no: "Kladd", en: "Draft" },
  "rep.status.ready": { no: "Klar til deling", en: "Ready to share" },
  "rep.status.processed": { no: "Behandlet", en: "Processed" },
  "rep.estimateId": { no: "Beregnings-ID", en: "Estimate ID" },
  "rep.netVolume": { no: "Beregnet nettovolum", en: "Calculated net volume" },
  "rep.recommended": { no: "Anbefalt bil/plassbehov (inkl. stuefaktor +25 %)", en: "Recommended vehicle/space (incl. stowage factor +25%)" },
  "rep.counts": { no: "Totalt antall gjenstander & rom", en: "Total items & rooms" },
  "rep.itemsWord": { no: "gjenstander", en: "items" },
  "rep.roomsWord": { no: "rom", en: "rooms" },
  "rep.shareSecret": { no: "Del hemmelig lenke", en: "Share secret link" },
  "rep.pdf": { no: "Last ned PDF-rapport", en: "Download PDF report" },
  "rep.requestQuote": { no: "Be om uforpliktende tilbud", en: "Request a no-obligation quote" },
  "rep.truck.van": { no: "Varebil kl. B", en: "Small van (class B)" },
  "rep.truck.small": { no: "Varebil kl. B / Liten flyttebil", en: "Large van / small moving truck" },
  "rep.truck.medium": { no: "Flyttebil 3,5–7,5 tonn", en: "Moving truck 3.5–7.5 t" },
  "rep.truck.large": { no: "Stor flyttebil / semi", en: "Large moving truck / trailer" },
  "rep.storage": { no: "Tilsvarer et lagerrom på ca.", en: "Roughly a storage unit of about" },

  "rep.included": { no: "Skal flyttes", en: "To be moved" },
  "rep.excluded": { no: "Blir stående / Kastes", en: "Stays / discarded" },
  "rep.tag.disassemble": { no: "Skal demonteres", en: "Needs disassembly" },
  "rep.tag.fragile": { no: "Ekstra skjørt", en: "Extra fragile" },
  "rep.tag.heavy": { no: "Tung / Krever 2 mann", en: "Heavy / needs 2 people" },
  "rep.tag.discard": { no: "Kastes/Gis bort", en: "Discard / give away" },
  "rep.addNote": { no: "Legg til merknad …", en: "Add a note …" },
  "rep.itemDeleted": { no: "Gjenstand slettet", en: "Item deleted" },
  "rep.undo": { no: "Angre", en: "Undo" },
  "rep.rename": { no: "Endre navn", en: "Rename" },

  "rep.accessTitle": { no: "Adkomst & forhold", en: "Access & conditions" },
  "rep.floor": { no: "Etasje", en: "Floor" },
  "rep.elevator": { no: "Har heis (får plass til standardmøbler)", en: "Has a lift (fits standard furniture)" },
  "rep.carry": { no: "Bæreavstand", en: "Carrying distance" },
  "rep.carryHelp": { no: "Meter fra inngangsdør til parkering for flyttebil", en: "Metres from the front door to truck parking" },
  "rep.generalNotes": { no: "Særlige merknader for oppdraget", en: "Special notes for the job" },
  "rep.generalNotesPh": { no: "F.eks. bomvei, smal trappeoppgang, piano må bæres", en: "E.g. toll road, narrow stairwell, piano must be carried" },
  "rep.saveAccess": { no: "Lagre adkomstinfo", en: "Save access details" },
  "rep.saved": { no: "Lagret", en: "Saved" },

  "rep.viewCustomer": { no: "Kunde-visning", en: "Customer view" },
  "rep.viewBusiness": { no: "Bedrifts-visning", en: "Business view" },
  "rep.internalTitle": { no: "Intern kalkyle & notater", en: "Internal calculation & notes" },
  "rep.hourly": { no: "Timepris", en: "Hourly rate" },
  "rep.hours": { no: "Estimerte timer", en: "Estimated hours" },
  "rep.fixed": { no: "Fastpris (volum × m³-pris)", en: "Fixed price (volume × rate per m³)" },
  "rep.internalNotes": { no: "Interne notater", en: "Internal notes" },
  "rep.checklist": { no: "Sjekkliste for oppdraget", en: "Operational checklist" },
  "rep.check1": { no: "Adkomst og bæreavstand bekreftet", en: "Access and carrying distance confirmed" },
  "rep.check2": { no: "Demontering avklart", en: "Disassembly clarified" },
  "rep.check3": { no: "Skjøre gjenstander merket", en: "Fragile items flagged" },
  "rep.check4": { no: "Bilstørrelse booket", en: "Vehicle size booked" },
  "rep.export": { no: "Eksporter", en: "Export" },

  "quote.title": { no: "Be om uforpliktende tilbud", en: "Request a no-obligation quote" },
  "quote.sub": { no: "Vi sender forespørselen til flyttebyrået sammen med rapporten.", en: "We send your request to the moving company together with this report." },
  "quote.name": { no: "Navn", en: "Name" },
  "quote.phone": { no: "Telefon", en: "Phone" },
  "quote.email": { no: "E-post", en: "Email" },
  "quote.message": { no: "Melding", en: "Message" },
  "quote.send": { no: "Send forespørsel", en: "Send request" },
  "quote.sent": { no: "Takk! Forespørselen er sendt.", en: "Thank you. Your request has been sent." },
  "quote.required": { no: "Fyll inn navn og telefon eller e-post.", en: "Enter your name and a phone number or email." },

  "dash.quotes": { no: "Tilbudsforespørsler", en: "Quote requests" },
  "dash.quotesEmpty": { no: "Ingen forespørsler ennå.", en: "No requests yet." },
  "dash.markHandled": { no: "Merk som behandlet", en: "Mark as handled" },
  "dash.handled": { no: "Behandlet", en: "Handled" },
};


type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof dict | string) => string };

const LanguageContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => String(k) });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const urlLang = new URLSearchParams(window.location.search).get("lang");
    if (urlLang === "en" || urlLang === "no") {
      setLangState(urlLang);
      window.localStorage.setItem("volumcalc-lang", urlLang);
      return;
    }
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
