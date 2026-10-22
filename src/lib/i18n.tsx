import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { extraTranslations } from "./i18n.translations";
import { reportLangs } from "./report-langs";
import { fillTranslations } from "./translations-fill";

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
    no: "Takk! Meldingen er sendt til support@volumcalc.com. Vi svarer vanligvis innen én virkedag.",
    en: "Thanks! Your message was sent to support@volumcalc.com. We usually reply within one business day.",
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
    no: "Er du flyttebyrå og vil teste VolumCalc med dine egne kunder? Nevn det i meldingen, så setter vi opp en gratis prøvekonto.",
    en: "Running a moving company and want to try VolumCalc with your own customers? Just mention it, and we'll set you up with a free trial account.",
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
  "nav.tryFree": { no: "Få tilbud", en: "Get quotes" },
  "nav.calc": { no: "Beregn volum", en: "Calculate volume" },

  "hero.badge": {
    no: "Gratis volumberegning for flytting",
    en: "Free moving volume calculator",
  },
  "hero.title1": {
    no: "Få flyttetilbud på 5 minutter.",
    en: "Get moving quotes in 5 minutes.",
  },
  "hero.title2": {
    no: "Vi regner ut volumet for deg.",
    en: "We work out the volume for you.",
  },
  "hero.sub": {
    no: "Velg det du skal ha med, rom for rom. Du ser hvor stor bil du trenger, og kan sende forespørselen videre til flyttefirmaer med adresser og dato klare.",
    en: "Pick what you are taking, room by room. You see what size of van you need and can send your request on to moving companies, with addresses and date ready.",
  },
  "hero.s1": { no: "minutter til volumet er klart", en: "minutes until your volume is ready" },
  "hero.s2": { no: "gjenstander å velge mellom", en: "items to choose from" },
  "hero.s3": { no: "språk i rapporten", en: "languages in the report" },
  "hero.cta": { no: "Beregn volum og få tilbud", en: "Calculate volume and get quotes" },
  "hero.cta2": { no: "For flyttebyråer", en: "For moving companies" },
  "hero.stat1": { no: "raskere enn befaring", en: "faster than a survey" },
  "hero.stat2": {
    no: "gjenstander i sjekklisten",
    en: "items in the checklist",
  },
  "hero.stat3": { no: "færre tvister", en: "fewer disputes" },
  "hero.imageAlt": {
    no: "Stue med møbler og flytteesker klare til å bli målt opp",
    en: "Living room with furniture and moving boxes ready to be measured",
  },

  "how.title": {
    no: "Fra «jeg skal flytte» til tilbud i tre steg",
    en: "From “I'm moving” to quotes in three steps",
  },
  "how.1t": {
    no: "Velg gjenstander",
    en: "Choose your items",
  },
  "how.1d": {
    no: "Gå gjennom rommene og kryss av det som skal med, eller legg til egne ting med mål. Du ser volumet og hvor stor bil du trenger underveis. Ingen app.",
    en: "Go through the rooms and tick off what is coming with you, or add your own things with dimensions. You see the volume and the van size you need as you go. No app.",
  },
  "how.2t": {
    no: "Legg inn adresser og dato",
    en: "Add addresses and date",
  },
  "how.2d": {
    no: "Fortell hvor du flytter fra og til, når du vil flytte og hvordan firmaene kan nå deg. Etasje og heis hjelper dem å gi riktig pris.",
    en: "Tell us where you are moving from and to, when, and how companies can reach you. Floor and lift details help them quote the right price.",
  },
  "how.3t": {
    no: "Få tilbud eller last ned rapport",
    en: "Get quotes or download the report",
  },
  "how.3d": {
    no: "Send forespørselen til flyttefirmaer, last ned en PDF på ditt språk eller del en privat lenke.",
    en: "Send your request to moving companies, download a PDF in your language, or share a private link.",
  },

  "feat.title": { no: "Bygget for flyttebransjen", en: "Built for the moving industry" },
  "feat.1t": { no: "Nøyaktige kubikkmål", en: "Accurate cubic volume" },
  "feat.1d": {
    no: "Realistiske standardmål for over 120 gjenstander i en oversiktlig sjekkliste, rom for rom.",
    en: "Realistic reference dimensions for 120+ items in a clear, room-by-room checklist.",
  },
  "feat.2t": {
    no: "Netto og anbefalt volum",
    en: "Net and recommended volume",
  },
  "feat.2d": {
    no: "Se nettovolum og anbefalt volum med 25 % buffer, så du bestiller riktig bil første gang.",
    en: "See net volume and the recommended volume with a 25 % buffer, so you book the right vehicle the first time.",
  },
  "feat.3t": { no: "Delbar rapport", en: "Shareable report" },
  "feat.3d": {
    no: "Hver beregning får en egen lenke og PDF – kunden ser nøyaktig hva som er med.",
    en: "Every estimate gets its own link and PDF — the customer sees exactly what is included.",
  },
  "feat.4t": { no: "Din merkevare", en: "Your brand" },
  "feat.4d": {
    no: "Logo, farger, valuta og pris per m³ settes i innstillingene. Rapporter på 12 språk.",
    en: "Logo, colours, currency and price per m³ are set in your settings. Reports in 12 languages.",
  },

  "cta.title": { no: "Klar for å kutte befaringene?", en: "Ready to cut the site visits?" },
  "cta.sub": {
    no: "Opprett konto og del din første kundelenke i dag.",
    en: "Create an account and share your first customer link today.",
  },
  "cta.p.title": { no: "Klar til å få tilbud på flyttingen?", en: "Ready to get quotes for your move?" },
  "cta.p.sub": {
    no: "Det tar noen minutter å regne ut volumet. Deretter velger du selv hvilke firmaer som får forespørselen.",
    en: "Working out the volume takes a few minutes. Then you choose which companies receive your request.",
  },
  "agency.strip": { no: "Er du flyttebyrå?", en: "Are you a moving company?" },
  "next.title": { no: "Neste steg", en: "Next steps" },
  "next.sub": {
    no: "Volumet er klart. Slik kommer du videre med flyttingen:",
    en: "Your volume is ready. Here is how to move on with your move:",
  },
  "next.send": { no: "Send til flyttefirmaer", en: "Send to moving companies" },
  "next.pdf": { no: "Last ned PDF", en: "Download PDF" },
  "next.link": { no: "Kopier privat lenke", en: "Copy private link" },


  "upload.failed": {
    no: "Noe gikk galt. Prøv igjen.",
    en: "Something went wrong. Please try again.",
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
  "res.room": { no: "Rom", en: "Room" },
  "res.renameRoom": { no: "Gi rommet nytt navn", en: "Rename room" },
  "res.moveRoom": { no: "Flytt til rom", en: "Move to room" },
  "res.roomTotal": { no: "Romvolum", en: "Room volume" },
  "res.other": { no: "Annet", en: "Other" },
  "res.notFound": { no: "Fant ikke beregningen.", en: "Estimate not found." },
  "res.estimated": { no: "Estimert pris", en: "Estimated price" },
  "res.disclaimer": {
    no: "Estimatet er basert på en sjekkliste som er verifisert av brukeren, og er veiledende frem til flyttebyrået har godkjent det.",
    en: "This estimate is based on a user-verified checklist and is indicative until the moving company approves it.",
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
  "dash.deleteFailed": { no: "Kunne ikke slette beregningen.", en: "Could not delete the estimate." },
  "dash.link": {
    no: "Kopier kundelenke",
    en: "Copy customer link",
  },
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

  "set.title": { no: "Firmaprofil", en: "Company profile" },
  "set.name": { no: "Firmanavn", en: "Company name" },
  "set.logo": { no: "Logo-URL", en: "Logo URL" },
  "set.color": { no: "Merkefarge", en: "Brand colour" },
  "set.price": { no: "Pris per m³", en: "Price per m³" },
  "set.currency": { no: "Valuta", en: "Currency" },
  "set.lang": { no: "Standardspråk", en: "Default language" },
  "set.save": { no: "Lagre innstillinger", en: "Save settings" },
  "set.saved": { no: "Innstillinger lagret", en: "Settings saved" },
  "set.rooms": { no: "Mine rom", en: "My rooms" },
  "set.roomsHelp": {
    no: "Skriv ett rom per linje. Disse vises i romvalget i kalkulatoren.",
    en: "Write one room per line. These appear in the room selector in the calculator.",
  },

  "price.title": {
    no: "Priser for flyttevolum-kalkulatoren",
    en: "Pricing for the moving volume calculator",
  },
  "price.sub": {
    no: "m³-kalkulatoren er gratis. Velg en enkelt beregning for å lagre og dele din egen flytting, eller en plan for flyttebyrået.",
    en: "The m³ calculator is free. Choose a one-off estimate to save and share your own move, or a plan for your moving company.",
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
  "rep.viewBusiness": { no: "Byrå-visning", en: "Agency view" },
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
  "rep.titlePlaceholder": { no: "F.eks. Flytting Møviklia 4 → Oslo", en: "E.g. Move from Møviklia 4 → Oslo" },
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

  "rep.pdfHint": { no: "I dialogen: velg «Lagre som PDF» som skriver. Filen kan du legge ved i e-post.", en: "In the dialog, choose “Save as PDF” as the printer. You can then attach the file to an e-mail." },
  "mtime.title": { no: "Estimert tidsbruk for flyttingen", en: "Estimated time for the move" },
  "mtime.sub": {
    no: "Pakking, demontering, bæring ut og inn av bil, sikring for transport og montering – beregnet gjenstand for gjenstand ut fra størrelse, tags og adkomst.",
    en: "Packing, dismantling, carrying in and out of the truck, securing for transport and reassembly — calculated item by item from size, tags and access.",
  },
  "mtime.crew": { no: "Mannskap", en: "Crew" },
  "mtime.persons": { no: "personer", en: "people" },
  "mtime.crew2": { no: "1 flyttekar + 1 hjelper", en: "1 mover + 1 helper" },
  "mtime.includePacking": { no: "Flyttefolkene pakker ned innboet", en: "The crew packs your belongings" },
  "mtime.includeUnpacking": { no: "Flyttefolkene pakker også ut på ny adresse", en: "The crew also unpacks at the new address" },
  "mtime.share": { no: "Ta med tidsestimat i PDF og e-post til flyttefirma", en: "Include the time estimate in the PDF and mover e-mails" },
  "mtime.total": { no: "Samlet estimert tid", en: "Total estimated time" },
  "mtime.range": { no: "Typisk spenn", en: "Typical range" },
  "mtime.pickup": { no: "Hos avsender: til bilen er lastet og sikret", en: "At the old address: until the truck is loaded and secured" },
  "mtime.delivery": { no: "Hos mottaker: alt er inne og montert", en: "At the new address: everything is in and assembled" },
  "mtime.timeline": { no: "Slik går jobben, steg for steg", en: "How the job runs, step by step" },
  "mtime.drive": { no: "Kjøring mellom adressene (ikke med i tiden)", en: "Driving between the addresses (not included)" },
  "mtime.startAt": { no: "Etter", en: "After" },
  "mtime.ph.arrive": { no: "Inn døra: går gjennom rapporten, beskytter gulv og dører, rigger bil", en: "Walk in: go through the report, protect floors and doors, rig the truck" },
  "mtime.ph.pack": { no: "Pakker ned innboet", en: "Packing up your belongings" },
  "mtime.ph.dismantle": { no: "Demonterer senger, bord og skap", en: "Dismantling beds, tables and wardrobes" },
  "mtime.ph.loadOut": { no: "Bærer ut og laster bilen", en: "Carrying out and loading the truck" },
  "mtime.ph.secure": { no: "Sikring for transport (stropper, tepper, lastelås)", en: "Securing for transport (straps, blankets, load locks)" },
  "mtime.ph.unload": { no: "Losser og bærer inn", en: "Unloading and carrying in" },
  "mtime.ph.reassemble": { no: "Monterer møbler", en: "Reassembling furniture" },
  "mtime.ph.unpack": { no: "Pakker ut", en: "Unpacking" },
  "mtime.ph.arriveDelivery": { no: "Ankomst ny adresse: beskytter gulv, avtaler hvor ting skal stå", en: "Arrive at new address: protect floors, agree where things go" },
  "mtime.ph.breaks": { no: "Pauser", en: "Breaks" },
  "mtime.compare": { no: "Samlet tid med flere folk", en: "Total time with a bigger crew" },
  "mtime.perItem": { no: "Tid for denne gjenstanden", en: "Time for this item" },
  "mtime.hour": { no: "t", en: "h" },
  "mtime.minute": { no: "min", en: "min" },
  "mtime.specialist": {
    no: "Listen inneholder gjenstander (f.eks. piano eller svært tunge ting) som normalt krever ekstra bærehjelp eller spesialutstyr. Regn med flere folk og avtal det i forkant.",
    en: "The list contains items (e.g. a piano or very heavy pieces) that normally need extra bearers or special equipment. Plan for more people and agree it in advance.",
  },
  "mtime.disclaimer": {
    no: "Veiledende estimat. Forutsetter normal flyttekompetanse, ferdig tilgjengelig bil og at etasje 1 er bakkenivå. Gjenstander merket «Kastes/Gis bort» er ikke med. Kjøretid mellom adressene kommer i tillegg. Endre etasje, heis og bæreavstand under «Adkomst & forhold» – estimatet oppdateres automatisk.",
    en: "Indicative estimate. Assumes competent movers, a truck that is ready and available, and floor 1 as street level. Items marked “Discard / give away” are excluded. Driving time between the addresses is extra. Change floor, lift and carrying distance under “Access & conditions” — the estimate updates automatically.",
  },

  "add.title": { no: "Legg til gjenstander", en: "Add items" },
  "add.sub": {
    no: "Glemte du noe? Legg det til selv, gjerne med egne mål. Volum, bilstørrelse og tidsbruk oppdateres med en gang.",
    en: "Forgot something? Add it yourself, with its own dimensions if needed. Volume, vehicle size and time update right away.",
  },
  "add.room": { no: "Rom", en: "Room" },
  "add.suggestions": { no: "Forslag – huk av det som stemmer, og rett antall", en: "Suggestions: tick what is right and adjust the number" },
  "add.addSelected": { no: "Legg til valgte", en: "Add selected" },
  "add.manual": { no: "Eller legg til selv", en: "Or add one yourself" },
  "add.fromCatalog": { no: "Start med en vanlig gjenstand (valgfritt)", en: "Start from a common item (optional)" },
  "add.name": { no: "Navn", en: "Name" },
  "add.qty": { no: "Antall", en: "Quantity" },
  "add.dims": { no: "Mål lengde × bredde × høyde (cm)", en: "Size length × width × height (cm)" },
  "add.add": { no: "Legg til i rapporten", en: "Add to the report" },
  "add.added": { no: "Lagt til i rapporten", en: "Added to the report" },
  "add.failed": { no: "Kunne ikke legge til. Prøv igjen.", en: "Couldn't add it. Please try again." },
  "add.needFields": { no: "Fyll inn navn, antall og alle tre mål.", en: "Fill in name, quantity and all three measurements." },

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
  "mov.lang": { no: "Språk på e-posten", en: "Email language" },
  "mov.missing": { no: "Fyll inn navn, din e-post og minst én mottaker.", en: "Fill in your name, email and at least one recipient." },
  "rep.cancel": { no: "Avbryt", en: "Cancel" },
  "mtime.show": { no: "Vis tidsestimat", en: "Show time estimate" },
  "trust.title": { no: "Hvem står bak VolumCalc", en: "Who is behind VolumCalc" },
  "trust.about": { no: "VolumCalc er utviklet og drevet av KM TECH LABS i Kristiansand, Norge. Vi bygger enkle verktøy som gjør flytting tryggere og mer forutsigbar – for privatpersoner og flyttebyråer.", en: "VolumCalc is built and run by KM TECH LABS in Kristiansand, Norway. We make simple tools that make moving safer and more predictable — for households and moving companies." },
  "trust.p1t": {
    no: "Dataene dine er private",
    en: "Your data stays private",
  },
  "trust.p1d": {
    no: "Beregninger lagres privat og er bare tilgjengelige via din egen innlogging eller en hemmelig lenke du selv deler.",
    en: "Estimates are stored privately and are only reachable through your own login or a secret link you choose to share.",
  },
  "trust.p2t": {
    no: "Gjennomsiktige beregninger",
    en: "Transparent calculations",
  },
  "trust.p2d": {
    no: "Volumet bygger på faste standardmål per gjenstand og det du selv legger inn – ingen gjetting og ingenting skjult.",
    en: "Volumes come from fixed reference dimensions per item and what you enter yourself — no guesswork, nothing hidden.",
  },
  "trust.p3t": { no: "Data slettes", en: "Data is deleted" },
  "trust.p3d": {
    no: "Beregninger slettes senest 12 måneder etter siste aktivitet – eller tidligere hvis du ber om det.",
    en: "Estimates are deleted at the latest 12 months after the last activity — or sooner if you ask.",
  },
  "agency.title": { no: "For flyttebyråer", en: "For moving companies" },
  "agency.sub": { no: "Gi kundene et profesjonelt estimat med din egen profil – og spar tid på befaring.", en: "Give customers a professional estimate under your own brand — and save time on site visits." },
  "agency.b1": { no: "Egen logo, farger og firmadetaljer øverst i rapporten og PDF-en", en: "Your logo, colours and company details at the top of the report and PDF" },
  "agency.b2": { no: "Dashboard med alle beregninger, godkjenning og pris per m³", en: "Dashboard with all estimates, approval and your price per m³" },
  "agency.b3": { no: "Del rapporten med kunden via hemmelig lenke eller PDF – på kundens eget språk", en: "Share the report with the customer by secret link or PDF — in the customer's own language" },
  "agency.cta": { no: "Se løsningen for byråer", en: "See the agency solution" },
  "dash.st.new": { no: "Ny", en: "New" },
  "dash.st.viewed": { no: "Sett", en: "Viewed" },
  "dash.st.quoted": { no: "Tilbud sendt", en: "Quoted" },
  "dash.st.accepted": { no: "Akseptert", en: "Accepted" },
  "dash.st.archived": { no: "Arkivert", en: "Archived" },
  "dash.search": { no: "Søk på kunde, adresse eller e-post", en: "Search customer, address or email" },
  "dash.fStatus": { no: "Status", en: "Status" },
  "dash.fActive": { no: "Aktive (uten arkiv)", en: "Active (no archive)" },
  "dash.fAll": { no: "Alle", en: "All" },
  "dash.fDate": { no: "Dato", en: "Date" },
  "dash.dAny": { no: "Når som helst", en: "Any time" },
  "dash.d7": { no: "Siste 7 dager", en: "Last 7 days" },
  "dash.d30": { no: "Siste 30 dager", en: "Last 30 days" },
  "dash.d90": { no: "Siste 90 dager", en: "Last 90 days" },
  "dash.fVolume": { no: "Volum", en: "Volume" },
  "dash.vAny": { no: "Alle størrelser", en: "Any size" },
  "dash.vS": { no: "Under 10 m³", en: "Under 10 m³" },
  "dash.vM": { no: "10–25 m³", en: "10–25 m³" },
  "dash.vL": { no: "25–50 m³", en: "25–50 m³" },
  "dash.vXL": { no: "Over 50 m³", en: "Over 50 m³" },
  "dash.noMatch": { no: "Ingen estimater passer til filtrene.", en: "No estimates match your filters." },
  "dash.changeStatus": { no: "Endre status", en: "Change status" },
  "dash.statNewWeek": { no: "Nye denne uken", en: "New this week" },
  "dash.statAvg": { no: "Snitt volum", en: "Average volume" },
  "dash.statOpen": { no: "Venter på tilbud", en: "Awaiting quote" },
  "dash.statAccepted": { no: "Akseptert", en: "Accepted" },
  "dash.statMonth": { no: "Volum siste 30 dager", en: "Volume, last 30 days" },
  "dash.customerLink": { no: "Kundelenke", en: "Customer link" },
  "dash.copyLink": { no: "Kopier kundelenke", en: "Copy customer link" },
  "dash.copyEmbed": { no: "Kopier embed-kode", en: "Copy embed code" },
  "dash.copied": { no: "Kopiert", en: "Copied" },
  "dash.linkHelp": { no: "Del lenken med kundene dine, eller lim embed-koden inn på nettsiden din. Forespørsler havner her og sendes deg på e-post.", en: "Share the link with your customers, or paste the embed code into your website. Requests land here and are emailed to you." },
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

function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (SUPPORTED_LANGS as string[]).includes(value);
}

const PATH_LANG: Record<string, Lang> = {
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

/**
 * Pure — no window/localStorage access — so server (via the request URL) and
 * client (via window.location, before first render) can compute the exact
 * same value from equivalent input. That's what keeps SSR and hydration in
 * sync: this must never be called from inside an effect, or the server-
 * rendered page would show English while the client silently swaps language
 * after the fact (which is what happened before this existed).
 */
export function resolveLangFromRequest(pathname: string, search: string, host: string): Lang {
  const params = new URLSearchParams(search);
  const urlLang = params.get("lang");
  if (isLang(urlLang)) return urlLang;
  const normalizedPath = pathname.replace(/\/$/, "");
  const firstSegment = `/${normalizedPath.split("/").filter(Boolean)[0] ?? ""}`;
  const fromPath = PATH_LANG[normalizedPath] ?? PATH_LANG[firstSegment];
  if (fromPath) return fromPath;
  // No path/query signal: .com and other hosts start in English, .no starts in Norwegian
  if (host.endsWith(".no")) return "no";
  return "en";
}

export function LanguageProvider({
  children,
  initialLang = "en",
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    // The initial render (server and client alike) already resolved the
    // language from the URL/host via resolveLangFromRequest — this effect
    // only handles what genuinely can't be known before hydration: a
    // returning visitor's saved preference on a page with no language
    // signal of its own in the URL (e.g. a direct visit to /upload).
    if (window.localStorage.getItem("volumcalc-lang") === null) {
      window.localStorage.setItem("volumcalc-lang", initialLang);
    }
    const params = new URLSearchParams(window.location.search);
    const hasUrlSignal = isLang(params.get("lang"));
    const normalizedPath = window.location.pathname.replace(/\/$/, "");
    const firstSegment = `/${normalizedPath.split("/").filter(Boolean)[0] ?? ""}`;
    const hasPathSignal = Boolean(PATH_LANG[normalizedPath] ?? PATH_LANG[firstSegment]);
    if (hasUrlSignal || hasPathSignal) return;

    const stored = window.localStorage.getItem("volumcalc-lang");
    if (isLang(stored) && stored !== initialLang) setLangState(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  return extraTranslations[lang]?.[key] ?? reportLangs[lang]?.[key] ?? fillTranslations[lang]?.[key] ?? entry.en;
}

export function useI18n() {
  return useContext(LanguageContext);
}
