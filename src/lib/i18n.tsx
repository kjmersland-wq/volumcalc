import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { extraTranslations } from "./i18n.translations";
import { landingRouteTranslations } from "./i18n.landing-translations";

export type Lang =
  "no" | "en" | "sv" | "da" | "fi" | "de" | "nl" | "fr" | "pl" | "es" | "it" | "pt";

type Dict = Record<string, { no: string; en: string }>;

export const dict: Dict = {
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
  "contact.error": {
    no: "Noe gikk galt. Prøv igjen eller send e-post direkte.",
    en: "Something went wrong. Try again or email us directly.",
  },
  "contact.required": {
    no: "Fyll ut navn, e-post, emne og melding.",
    en: "Please fill in name, email, subject and message.",
  },
  "contact.privacy": {
    no: "Vi bruker opplysningene kun til å svare deg.",
    en: "We only use your details to reply to you.",
  },
  "contact.emailUs": { no: "Send e-post", en: "Email us" },
  "contact.response": { no: "Svartid", en: "Response time" },
  "contact.responseTime": {
    no: "Vanligvis innen én virkedag",
    en: "Usually within one business day",
  },
  "contact.aside": {
    no: "Er du flyttebyrå og vil teste VolumCalc med egne bilder? Nevn det i meldingen, så setter vi opp en gratis prøvekonto.",
    en: "Running a moving company and want to test VolumCalc with your own video + checklist flow? Mention it and we will set up a free trial account.",
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

  "hero.badge": {
    no: "Trygg og enkel volumberegning",
    en: "Instant volume estimates from room video",
  },
  "hero.title1": {
    no: "Så fint! Vi fikser flyttevolumet ditt",
    en: "Brilliant! Let’s sort your moving volume in a jiffy —",
  },
  "hero.title2": { no: "med en rolig videorunde", en: "from a quick room video." },
  "hero.sub": {
    no: "VolumCalc hjelper deg med å gjøre en rolig runde gjennom rommene, og gjør det om til en tydelig, rominndelt volumberegning. Perfekt når du vil planlegge flyttingen i fred og ro.",
    en: "VolumCalc helps you turn a quick wander through your rooms into a beautifully clear, room-by-room volume estimate. Perfectly sorted for your moving plans.",
  },
  "hero.cta": { no: "Start en gratis beregning", en: "Start a free estimate" },
  "hero.cta2": { no: "For flyttebyråer", en: "For moving companies" },
  "hero.stat1": { no: "raskere enn befaring", en: "faster than a survey" },
  "hero.stat2": { no: "gjenstander gjenkjent", en: "standard items available" },
  "hero.stat3": { no: "færre tvister", en: "fewer disputes" },

  "how.title": { no: "Fra video til tilbud i tre steg", en: "From video to quote in three steps" },
  "how.1t": { no: "Film rommet i ditt tempo", en: "Simply record a quick video" },
  "how.1d": {
    no: "Åpne lenken på mobilen og ta en rolig, behagelig runde gjennom rommet. Du har god tid, og trenger verken app eller innlogging.",
    en: "Simply record a quick video — Just open the link on your mobile and take a steady, relaxed stroll through the room. Take all the time you need, with no fussy apps or logins required.",
  },
  "how.2t": { no: "Rolig sjekkliste etterpå", en: "Stress-free checklist" },
  "how.2d": {
    no: "Når du er ferdig med videoen, krysser du av gjenstandene i en tilpasset sjekkliste i fred og ro. Enkelt og trygt, hver gang.",
    en: "Once you’ve finished filming, simply tick off your items from a tailored checklist in total peace and quiet. Spot on every time.",
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
    en: "Realistic reference dimensions per furniture type in a structured, room-by-room checklist.",
  },
  "feat.2t": { no: "Sikkerhetsgrad", en: "User-verified list" },
  "feat.2d": {
    no: "Se hvilke gjenstander som bør dobbeltsjekkes før du sender tilbudet.",
    en: "100% reliable checklists. Your customers verify their own items down to a tee, giving you a completely accurate, dispute-free basis for your transport quotes.",
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

  "upload.title": {
    no: "Så gøy at du er i gang! La oss filme flyttelasset ditt",
    en: "Lovely — let’s record your inventory together",
  },
  "upload.sub": {
    no: "Her tar vi det helt uten stress. Du filmer rommet i eget tempo, og så klikker du enkelt av gjenstandene dine i fred og ro etterpå.",
    en: "No rush at all — just film each room at your own pace, then tick through your items calmly afterwards.",
  },
  "upload.guideTitle": { no: "Slik gjør vi det sammen", en: "How it works" },
  "upload.guide": {
    no: "Slik gjør vi det sammen: Velg rommet du står i nå, og ta en rolig og behagelig runde med kameraet. Du har kjempegod tid og filmer helt i ditt eget tempo. Du trenger ikke å tenke på opptelling underveis – det fikser vi sammen på sjekklisten etterpå!",
    en: "Choose the room you’re in and take a steady 15-second sweep on your phone. Afterwards, you can go through the checklist in peace and quiet.",
  },
  "upload.drop": {
    no: "Trykk her for å velge rom før du starter den koselige videorunden på mobilen din",
    en: "Choose your room here before starting your calm video walkthrough",
  },
  "upload.roomSelectorLabel": {
    no: "Trykk her for å velge rom før du starter den koselige videorunden på mobilen din",
    en: "Choose your room here before starting your calm video walkthrough",
  },
  "upload.selectRoom": { no: "Velg rom", en: "Select room" },
  "upload.hint": {
    no: "Romvideo + sjekkliste i rolig tempo",
    en: "Room video + checklist, at your own pace",
  },
  "upload.stopRecording": {
    no: "Stopp filming og se sjekklisten",
    en: "Stop filming and view checklist",
  },
  "upload.photos": { no: "bilder valgt", en: "items selected" },
  "upload.details": { no: "Kontaktinformasjon (valgfritt)", en: "Contact details (optional)" },
  "upload.name": { no: "Navn", en: "Name" },
  "upload.phone": { no: "Telefon", en: "Phone" },
  "upload.date": { no: "Flyttedato", en: "Move date" },
  "upload.address": { no: "Adresse", en: "Address" },
  "upload.securityLabel": { no: "Sikkerhet", en: "Security" },
  "upload.submit": {
    no: "La oss starte registreringen",
    en: "Let’s get your registration started",
  },
  "upload.netVolumeLabel": { no: "Nettovolum", en: "Net volume" },
  "upload.grossVolumeLabel": {
    no: "Bilbehov (+25 % stuefaktor)",
    en: "Vehicle requirement (+25% stowage factor)",
  },
  "upload.needPhoto": {
    no: "Velg minst én gjenstand i sjekklisten først, så er vi i gang.",
    en: "Please tick at least one item in the checklist first, and we’ll get cracking.",
  },
  "upload.uploading": { no: "Starter videorunden …", en: "Starting your room recording …" },
  "upload.analysing": { no: "Gjør klar sjekklisten …", en: "Preparing your checklist …" },
  "upload.saving": { no: "Lagrer beregningen …", en: "Saving your estimate …" },
  "upload.failed": {
    no: "Noe gikk galt. Prøv igjen.",
    en: "Something went wrong. Please try again.",
  },
  "upload.aiCredits": {
    no: "Video- og sjekklisteflyten er midlertidig utilgjengelig. Prøv gjerne igjen om litt.",
    en: "The video + checklist flow is temporarily unavailable. Please try again shortly.",
  },
  "upload.aiBusy": {
    no: "AI-tjenesten er travel akkurat nå. Prøv igjen om litt.",
    en: "The service is busy right now. Please try again shortly.",
  },

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
    en: "This estimate is based on room video and a user-verified checklist, and is indicative until the moving company approves it.",
  },
  "share.title": { no: "Del beregningen", en: "Share this estimate" },
  "share.sub": {
    no: "Send rapporten trygt via kanalen du foretrekker.",
    en: "Send the report using your preferred channel.",
  },
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
  "auth.toSignin": {
    no: "Har du allerede konto? Logg inn",
    en: "Already have an account? Sign in",
  },
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
  "dash.delete": { no: "Slett", en: "Delete" },
  "dash.deleteTitle": { no: "Slette denne beregningen?", en: "Delete this estimate?" },
  "dash.deleteDesc": {
    no: "Beregningen og alle rom, gjenstander og forespørsler slettes permanent.",
    en: "The estimate and all its rooms, items and requests will be permanently deleted.",
  },
  "dash.cancel": { no: "Avbryt", en: "Cancel" },
  "dash.deleteFailed": {
    no: "Kunne ikke slette beregningen.",
    en: "Could not delete the estimate.",
  },
  "dash.link": { no: "Kopier opplastingslenke", en: "Copy upload link" },
  "dash.settings": { no: "Innstillinger", en: "Settings" },
  "dash.signout": { no: "Logg ut", en: "Sign out" },
  "rep.claimHelp": {
    no: "Denne beregningen tilhører ingen bedrift ennå. Hent den inn for å redigere og følge den opp.",
    en: "This estimate does not belong to a company yet. Claim it to edit and follow it up.",
  },
  "dash.claim": { no: "Hent inn til mitt firma", en: "Claim for my company" },
  "dash.approve": { no: "Godkjenn", en: "Approve" },
  "dash.approved": { no: "Godkjent", en: "Approved" },
  "dash.pending": { no: "Til gjennomgang", en: "Pending review" },
  "dash.saveItem": { no: "Lagre", en: "Save" },
  "dash.deleteItem": { no: "Slett", en: "Delete" },
  "dash.editing": { no: "Rediger AI-resultatet", en: "Edit the checklist result" },

  "set.title": { no: "Firmaprofil", en: "Company profile" },
  "set.name": { no: "Firmanavn", en: "Company name" },
  "set.logo": { no: "Logo-URL", en: "Logo URL" },
  "set.color": { no: "Merkefarge", en: "Brand colour" },
  "set.price": { no: "Pris per m³", en: "Price per m³" },
  "set.currency": { no: "Valuta", en: "Currency" },
  "set.lang": { no: "Standardspråk", en: "Default language" },
  "set.save": { no: "Lagre innstillinger", en: "Save settings" },
  "set.saved": { no: "Innstillinger lagret", en: "Settings saved" },

  "price.title": {
    no: "Enkle priser, uansett hvordan du flytter",
    en: "Simple pricing, however you move",
  },
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
  "payment.secure": {
    no: "Sikker betaling uten å forlate VolumCalc.",
    en: "Secure payment without leaving VolumCalc.",
  },
  "payment.test": {
    no: "Testmodus: Ingen ekte betalinger belastes.",
    en: "Test mode: No real payments are charged.",
  },
  "payment.notLive": {
    no: "Betaling er ikke aktivert for produksjon ennå.",
    en: "Payments are not active in production yet.",
  },
  "payment.complete": { no: "Betalingen er fullført", en: "Payment complete" },
  "payment.pending": { no: "Betalingsstatus mangler", en: "Payment status unavailable" },
  "payment.completeSub": {
    no: "Takk! Du kan nå fortsette til din neste volumberegning.",
    en: "Thank you. You can now continue to your next volume estimate.",
  },
  "payment.continue": { no: "Start beregning", en: "Start estimate" },

  "rep.status.draft": { no: "Kladd", en: "Draft" },
  "rep.status.ready": { no: "Klar til deling", en: "Ready to share" },
  "rep.status.processed": { no: "Behandlet", en: "Processed" },
  "rep.estimateId": { no: "Beregnings-ID", en: "Estimate ID" },
  "rep.netVolume": { no: "Beregnet nettovolum", en: "Calculated net volume" },
  "rep.recommended": {
    no: "Anbefalt bil/plassbehov (inkl. stuefaktor +25 %)",
    en: "Recommended vehicle/space (incl. stowage factor +25%)",
  },
  "rep.counts": { no: "Totalt antall gjenstander & rom", en: "Total items & rooms" },
  "rep.itemsWord": { no: "gjenstander", en: "items" },
  "rep.roomsWord": { no: "rom", en: "rooms" },
  "rep.shareSecret": { no: "Del hemmelig lenke", en: "Share secret link" },
  "rep.pdf": { no: "Last ned PDF-rapport", en: "Download PDF report" },
  "rep.requestQuote": { no: "Be om uforpliktende tilbud", en: "Request a no-obligation quote" },
  "rep.truck.van": { no: "Varebil kl. B", en: "Small van (class B)" },
  "rep.truck.small": {
    no: "Varebil kl. B / Liten flyttebil",
    en: "Large van / small moving truck",
  },
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
  "rep.elevator": {
    no: "Har heis (får plass til standardmøbler)",
    en: "Has a lift (fits standard furniture)",
  },
  "rep.carry": { no: "Bæreavstand", en: "Carrying distance" },
  "rep.carryHelp": {
    no: "Meter fra inngangsdør til parkering for flyttebil",
    en: "Metres from the front door to truck parking",
  },
  "rep.generalNotes": { no: "Særlige merknader for oppdraget", en: "Special notes for the job" },
  "rep.generalNotesPh": {
    no: "F.eks. bomvei, smal trappeoppgang, piano må bæres",
    en: "E.g. toll road, narrow stairwell, piano must be carried",
  },
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
  "rep.check1": {
    no: "Adkomst og bæreavstand bekreftet",
    en: "Access and carrying distance confirmed",
  },
  "rep.check2": { no: "Demontering avklart", en: "Disassembly clarified" },
  "rep.check3": { no: "Skjøre gjenstander merket", en: "Fragile items flagged" },
  "rep.check4": { no: "Bilstørrelse booket", en: "Vehicle size booked" },
  "rep.export": { no: "Eksporter", en: "Export" },

  "quote.title": { no: "Be om uforpliktende tilbud", en: "Request a no-obligation quote" },
  "quote.sub": {
    no: "Vi sender forespørselen til flyttebyrået sammen med rapporten.",
    en: "We send your request to the moving company together with this report.",
  },
  "quote.name": { no: "Navn", en: "Name" },
  "quote.phone": { no: "Telefon", en: "Phone" },
  "quote.email": { no: "E-post", en: "Email" },
  "quote.message": { no: "Melding", en: "Message" },
  "quote.send": { no: "Send forespørsel", en: "Send request" },
  "quote.sent": {
    no: "Takk! Forespørselen er sendt.",
    en: "Thank you. Your request has been sent.",
  },
  "quote.required": {
    no: "Fyll inn navn og telefon eller e-post.",
    en: "Enter your name and a phone number or email.",
  },

  "upload.limit": {
    no: "Sjekklisten er klar, rom for rom, når du er klar.",
    en: "Your checklist is ready to fill in room by room.",
  },
  "upload.unlimited": {
    no: "Kontoen din støtter ubegrenset antall registreringer.",
    en: "Your account supports unlimited registrations.",
  },

  "admin.nav": { no: "Admin", en: "Admin" },
  "admin.title": { no: "Transportfirma-kontoer", en: "Moving company accounts" },
  "admin.sub": {
    no: "Opprett innlogging, firmaprofil, logo og hemmelig delelenke for hvert transportfirma. Hvert firma ser kun sine egne beregninger.",
    en: "Create a login, company profile, logo and secret share link for each moving company. Every company only sees its own estimates.",
  },
  "admin.new": { no: "Ny firma-konto", en: "New company account" },
  "admin.email": { no: "Innloggings-e-post", en: "Login email" },
  "admin.password": { no: "Passord", en: "Password" },
  "admin.company": { no: "Firmanavn", en: "Company name" },
  "admin.org": { no: "Org.nr.", en: "Company reg. no." },
  "admin.address": { no: "Adresse", en: "Address" },
  "admin.phone": { no: "Telefon", en: "Phone" },
  "admin.website": { no: "Nettside", en: "Website" },
  "admin.logo": { no: "Logo-URL", en: "Logo URL" },
  "admin.color": { no: "Profilfarge", en: "Brand colour" },
  "admin.price": { no: "Pris per m³", en: "Price per m³" },
  "admin.demo": { no: "Marker som demo-konto", en: "Mark as demo account" },
  "admin.create": { no: "Opprett konto", en: "Create account" },
  "admin.created": { no: "Kontoen er opprettet.", en: "The account was created." },
  "admin.failed": { no: "Kunne ikke opprette kontoen.", en: "Could not create the account." },
  "admin.list": { no: "Eksisterende kontoer", en: "Existing accounts" },
  "admin.link": { no: "Hemmelig delelenke", en: "Secret share link" },
  "admin.copy": { no: "Kopier lenke", en: "Copy link" },
  "admin.rotate": { no: "Ny lenke", en: "New link" },
  "admin.rotated": {
    no: "Ny lenke laget. Den gamle virker ikke lenger.",
    en: "New link created. The old one no longer works.",
  },
  "admin.estimates": { no: "beregninger", en: "estimates" },
  "admin.onlyAdmin": { no: "Kun for administratorer.", en: "Administrators only." },
  "admin.setPassword": { no: "Sett nytt passord", en: "Set new password" },
  "admin.passwordSet": { no: "Passordet er oppdatert.", en: "The password was updated." },
  "admin.demoLink": { no: "Åpne demo-side", en: "Open demo page" },

  "upload.forCompany": {
    no: "Du sender registreringen til",
    en: "You are sending this registration to",
  },

  "demo.badge": { no: "Demo", en: "Demo" },
  "demo.title": {
    no: "Slik ser dashbordet ut for ditt firma",
    en: "This is how the dashboard looks for your company",
  },
  "demo.sub": {
    no: "Et eksempel med et fiktivt firma. Egen logo og firmadetaljer i toppen, egen hemmelig delelenke, og kun firmaets egne beregninger i listen.",
    en: "An example using a fictitious company. Your own logo and company details in the header, your own secret share link, and only your own estimates in the list.",
  },
  "demo.isolation": {
    no: "Hver konto er adskilt: et firma kan aldri se beregninger som tilhører et annet firma.",
    en: "Every account is separate: a company can never see estimates that belong to another company.",
  },
  "demo.cta": { no: "Vil du ha en slik konto?", en: "Want an account like this?" },

  "rep.reportLang": { no: "Rapportspråk", en: "Report language" },
  "rep.reportLangHelp": {
    no: "Velg språket rapporten vises, deles og lagres i. Dine egne redigeringer beholdes.",
    en: "Choose the language the report is shown, shared and saved in. Your own edits are kept.",
  },
  "rep.tender": { no: "Anbudsmodus – skjul priser", en: "Tender mode – hide prices" },
  "rep.tenderHelp": {
    no: "Skjuler estimert pris og all priskalkyle i rapporten, PDF og delt lenke.",
    en: "Hides the estimated price and all price calculations in the report, PDF and shared link.",
  },

  "rep.storageTitle": { no: "Mellomlagring / lagerhotell", en: "Interim storage / self-storage" },
  "rep.storageEnabled": { no: "Tingene skal mellomlagres", en: "Items go into interim storage" },
  "rep.storageCompany": { no: "Firmanavn på lager", en: "Storage company" },
  "rep.storageAddress": { no: "Full adresse", en: "Full address" },
  "rep.storageContact": { no: "Kontaktperson", en: "Contact person" },
  "rep.storagePhone": { no: "Telefon", en: "Phone" },

  "rep.deliveryTitle": { no: "Levering til ny bopel", en: "Delivery to the new home" },
  "rep.deliveryAddress": { no: "Full adresse", en: "Full address" },
  "rep.deliveryFloor": { no: "Etasje", en: "Floor" },
  "rep.deliveryElevator": { no: "Heis i bygget", en: "Lift in the building" },
  "rep.deliveryCarry": { no: "Bæreavstand (meter)", en: "Carrying distance (metres)" },
  "rep.deliveryNotes": { no: "Merknader om levering", en: "Delivery notes" },

  "rep.packingTitle": { no: "Pakking og emballasje", en: "Packing and materials" },
  "rep.packingRequested": { no: "Vi ønsker hjelp til pakking", en: "We want help with packing" },
  "rep.packingLevel": { no: "Omfang", en: "Scope" },
  "rep.packingLevel.fragile": { no: "Kun skjøre gjenstander", en: "Fragile items only" },
  "rep.packingLevel.partial": { no: "Delvis pakking", en: "Partial packing" },
  "rep.packingLevel.full": { no: "Full pakking", en: "Full packing" },
  "rep.materials": { no: "Emballasje som trengs", en: "Packing materials needed" },
  "mat.boxes": { no: "Flyttekasser", en: "Moving boxes" },
  "mat.bubble": { no: "Bobleplast (ruller)", en: "Bubble wrap (rolls)" },
  "mat.paper": { no: "Pakkepapir (pakker)", en: "Packing paper (packs)" },
  "mat.tape": { no: "Tape (ruller)", en: "Tape (rolls)" },
  "mat.wardrobe": { no: "Garderobekasser", en: "Wardrobe boxes" },
  "mat.mattress": { no: "Madrassposer", en: "Mattress bags" },
  "mat.blanket": { no: "Møbeltepper", en: "Furniture blankets" },
  "rep.packingNotes": {
    no: "Spesielle gjenstander (kunst, piano, TV)",
    en: "Special items (art, piano, TV)",
  },
  "rep.saveExtras": { no: "Lagre logistikk", en: "Save logistics" },

  "set.org": { no: "Organisasjonsnummer", en: "Company registration number" },
  "set.address": { no: "Firmaadresse", en: "Company address" },
  "set.phone": { no: "Telefon", en: "Phone" },
  "set.website": { no: "Nettside", en: "Website" },
  "set.contactEmail": { no: "Kontakt-e-post", en: "Contact email" },
  "set.brandingHelp": {
    no: "Logo og firmadetaljer vises øverst i rapporten, i PDF og i headeren når du er innlogget.",
    en: "Your logo and company details appear at the top of the report, in the PDF and in the header when signed in.",
  },

  "nav.help": { no: "Hjelp og FAQ", en: "Help and FAQ" },
  "footer.legal": { no: "Juridisk", en: "Legal" },
  "footer.product": { no: "Produkt", en: "Product" },
  "footer.company": { no: "Selskap", en: "Company" },
  "footer.privacy": { no: "Personvernerklæring", en: "Privacy policy" },
  "footer.terms": { no: "Vilkår for bruk", en: "Terms of service" },
  "footer.cookies": { no: "Informasjonskapsler", en: "Cookie policy" },
  "footer.dpa": { no: "Databehandleravtale", en: "Data processing agreement" },
  "footer.purchase": {
    no: "Kjøpsvilkår og angrerett",
    en: "Purchase terms and right of withdrawal",
  },
  "footer.about": { no: "Om oss", en: "About us" },
  "footer.builtBy": {
    no: "Utviklet og drevet av KM TECH LABS i Kristiansand, Norge · Org.nr. 934 044 029",
    en: "Developed and operated by KM TECH LABS in Kristiansand, Norway · Company no. 934 044 029",
  },

  "dash.quotes": { no: "Tilbudsforespørsler", en: "Quote requests" },
  "dash.quotesEmpty": { no: "Ingen forespørsler ennå.", en: "No requests yet." },
  "dash.markHandled": { no: "Merk som behandlet", en: "Mark as handled" },
  "dash.handled": { no: "Behandlet", en: "Handled" },

  "rep.titleEdit": { no: "Endre rapportnavn", en: "Rename report" },
  "rep.titlePlaceholder": {
    no: "F.eks. Flytting Møviklia 4 → Oslo",
    en: "E.g. Move from Møviklia 4 → Oslo",
  },
  "rep.titleSaved": { no: "Rapportnavnet er lagret", en: "Report name saved" },

  "mprice.title": { no: "Grovt prisestimat for flyttingen", en: "Rough moving price estimate" },
  "mprice.sub": {
    no: "Regn ut et omtrentlig prisspenn ut fra volum, avstand og adkomst. Endelig pris får du fra flyttefirmaet.",
    en: "Get an approximate price range based on volume, distance and access. The final price comes from the mover.",
  },
  "mprice.from": { no: "Flytter fra", en: "Moving from" },
  "mprice.to": { no: "Flytter til", en: "Moving to" },
  "mprice.km": { no: "Avstand (km)", en: "Distance (km)" },
  "mprice.floors": { no: "Etasjer uten heis", en: "Floors without lift" },
  "mprice.packing": { no: "Pakking av innbo", en: "Packing service" },
  "mprice.range": { no: "Estimert prisspenn", en: "Estimated price range" },
  "mprice.disclaimer": {
    no: "Estimatet er veiledende og avhenger av avstand, tidspunkt, adkomst og hva som avtales med flyttefirmaet.",
    en: "The estimate is indicative and depends on distance, timing, access and what you agree with the mover.",
  },

  "mov.title": { no: "Hent pristilbud fra flyttefirma", en: "Get quotes from moving companies" },
  "mov.sub": {
    no: "Åpne firmaets eget tilbudsskjema, eller send rapporten på e-post til firmaene du velger.",
    en: "Open the company's own quote form, or email the report to the companies you choose.",
  },
  "mov.country": { no: "Land", en: "Country" },
  "mov.allCountries": { no: "Alle land", en: "All countries" },
  "mov.listTitle": { no: "Send rapporten på e-post", en: "Email the report" },
  "mov.listHelp": {
    no: "Legg inn e-postadressen firmaet oppgir på nettsiden sin. Du kan også legge til egne adresser.",
    en: "Add the email address the company lists on its website. You can also add your own addresses.",
  },
  "mov.manual": { no: "Eget firma", en: "Own contact" },
  "mov.addManual": { no: "Legg til adresse manuelt", en: "Add address manually" },
  "mov.yourName": { no: "Ditt navn", en: "Your name" },
  "mov.yourEmail": { no: "Din e-post (svaradresse)", en: "Your email (reply-to)" },
  "mov.message": { no: "Melding (valgfritt)", en: "Message (optional)" },
  "mov.send": { no: "Send rapport til valgte firma", en: "Send report to selected companies" },
  "mov.sent": { no: "Rapporten er sendt", en: "Report sent" },
  "mov.failed": { no: "Utsending feilet", en: "Sending failed" },
  "mov.missing": {
    no: "Fyll inn navn, din e-post og minst én mottaker.",
    en: "Fill in your name, email and at least one recipient.",
  },
};

export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  no: "Norsk",
  sv: "Svenska",
  da: "Dansk",
  fi: "Suomi",
  de: "Deutsch",
  nl: "Nederlands",
  fr: "Français",
  pl: "Polski",
  es: "Español",
  it: "Italiano",
  pt: "Português",
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof dict | string) => string };

const LanguageContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => String(k) });

export const SUPPORTED_LANGS: Lang[] = [
  "en",
  "no",
  "sv",
  "da",
  "fi",
  "de",
  "nl",
  "fr",
  "pl",
  "es",
  "it",
  "pt",
];

const PATH_LANGS: Partial<Record<string, Lang>> = {
  "/no": "no",
  "/se": "sv",
  "/dk": "da",
  "/fi": "fi",
  "/de": "de",
  "/nl": "nl",
  "/fr": "fr",
  "/pl": "pl",
  "/es": "es",
  "/it": "it",
  "/pt": "pt",
};

const LOCALE_OVERRIDES: Partial<Record<Lang, Record<string, string>>> = {
  ...extraTranslations,
  ...landingRouteTranslations,
};

function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (SUPPORTED_LANGS as string[]).includes(value);
}

function normalizePathname(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/$/, "");
}

function getPathLang(pathname: string) {
  return PATH_LANGS[normalizePathname(pathname)];
}

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "en";

  const syncedUrlLang = getUrlOrPathLang();
  if (syncedUrlLang) return syncedUrlLang;

  const stored = window.localStorage.getItem("volumcalc-lang");
  if (isLang(stored)) return stored;

  return window.location.hostname.endsWith(".no") ? "no" : "en";
}

function getUrlOrPathLang(): Lang | undefined {
  if (typeof window === "undefined") return undefined;

  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get("lang");
  if (isLang(urlLang)) return urlLang;

  const pathLang = getPathLang(window.location.pathname);
  if (pathLang) return pathLang;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  useEffect(() => {
    const syncedUrlLang = getUrlOrPathLang();
    if (!syncedUrlLang) return;
    setLangState(syncedUrlLang);
    window.localStorage.setItem("volumcalc-lang", syncedUrlLang);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("volumcalc-lang", l);
  }, []);

  const t = useCallback((k: string) => translate(k, lang), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}

export function translate(key: string, lang: Lang): string {
  const entry = dict[key];
  if (!entry) return key;
  if (lang === "no" || lang === "en") return entry[lang];
  const override = LOCALE_OVERRIDES[lang];
  if (override) {
    return override[key] ?? (entry as Partial<Record<Lang, string>>)[lang] ?? entry.en;
  }
  return entry.en;
}

export function useI18n() {
  return useContext(LanguageContext);
}
