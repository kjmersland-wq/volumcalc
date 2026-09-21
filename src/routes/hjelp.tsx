import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

type Faq = { q: string; a: string };
type Group = { heading: string; items: Faq[] };

const content: Record<
  "no" | "en",
  {
    title: string;
    intro: string;
    groups: Group[];
    ctaTitle: string;
    ctaText: string;
    cta: string;
    contact: string;
  }
> = {
  no: {
    title: "Hjelp og ofte stilte spørsmål",
    intro:
      "Alt du trenger for å komme i gang med VolumCalc – fra romvideo og rolig sjekkliste til ferdig rapport, pakking, lagring og deling.",
    ctaTitle: "Fant du ikke svaret?",
    ctaText: "Send oss noen ord, så svarer vi vanligvis innen én virkedag.",
    cta: "Start en gratis beregning",
    contact: "Kontakt oss",
    groups: [
      {
        heading: "Romvideo",
        items: [
          {
            q: "Hvor lenge bør jeg filme hvert rom?",
            a: "Ta en rolig runde gjennom rommet i ditt eget tempo, slik at de viktigste møblene kommer tydelig med. Du trenger ikke nærbilder av hver minste ting, siden du bekrefter innholdet i sjekklisten etterpå.",
          },
          {
            q: "Hva gir best resultat?",
            a: "Godt lys, ryddige flater og en jevn kamerarunde fra døråpningen, slik at hele rommet kommer med. Hold mobilen stødig og ta den tiden du trenger.",
          },
          {
            q: "Må jeg filme inni skap og skuffer?",
            a: "Nei. Innholdet regnes vanligvis som flyttekasser, så du kan heller bekrefte antall i sjekklisten etter at du er ferdig med videoen.",
          },
        ],
      },
      {
        heading: "Rom og redigering",
        items: [
          {
            q: "Hvordan havner tingene i riktig rom?",
            a: "Du velger rommet før du filmer, og går deretter gjennom en sjekkliste som er tilpasset akkurat det rommet.",
          },
          {
            q: "Kan jeg endre navn på rom og flytte ting?",
            a: "Ja. I rapporten kan du gi rom nytt navn, flytte en gjenstand til et annet rom, endre antall og mål, legge til merknader og merke ting som skjøre, tunge, til demontering eller som ikke skal være med.",
          },
          {
            q: "Hva om noe mangler eller blir feil?",
            a: "Ingen fare — juster antall direkte i sjekklisten. Totalene oppdateres med én gang, så du får ryddet opp på et øyeblikk.",
          },
        ],
      },
      {
        heading: "Volum og bil",
        items: [
          {
            q: "Hva betyr nettovolum og anbefalt volum?",
            a: "Nettovolum er summen av gjenstandene. Anbefalt volum legger på 25 % stuefaktor for luft mellom møblene, og er tallet du bør bruke når du velger bil eller lagerrom.",
          },
          {
            q: "Hvilken bil trenger jeg?",
            a: "Rapporten foreslår bilstørrelse ut fra anbefalt volum. Du kan også regne på det selv i flyttebil-kalkulatoren vår.",
          },
        ],
      },
      {
        heading: "Pakking, lagring og levering",
        items: [
          {
            q: "Kan jeg be om hjelp til pakking?",
            a: "Ja. I rapporten krysser du av for pakkehjelp, velger omfang (kun skjøre ting, delvis eller full pakking) og fyller inn hvor mye emballasje som trengs – kasser, bobleplast, pakkepapir, tape, garderobekasser, madrassposer og møbeltepper.",
          },
          {
            q: "Vi skal mellomlagre tingene. Hvordan noterer jeg det?",
            a: "Fyll ut feltet for mellomlagring med lagerhotellets firmanavn, full adresse og kontaktperson. Det følger med i rapporten og PDF-en.",
          },
          {
            q: "Hvor legger jeg inn ny adresse?",
            a: "Under levering til ny bopel: full adresse, etasje, om det er heis, bæreavstand og eventuelle merknader.",
          },
        ],
      },
      {
        heading: "Deling, språk og PDF",
        items: [
          {
            q: "Kan jeg lagre rapporten på flere språk?",
            a: "Ja. Velg rapportspråk norsk, engelsk eller polsk. Alt du har redigert selv beholdes – det er kun de faste tekstene som byttes. Deretter kan du dele lenken eller lagre PDF på det språket.",
          },
          {
            q: "Hvordan deler jeg rapporten?",
            a: "Bruk «Del hemmelig lenke». Den som har lenken ser rapporten uten å logge inn, så del den bare med dem som skal se den.",
          },
          {
            q: "Hvordan skjuler jeg prisen når jeg sender ut på anbud?",
            a: "Slå på anbudsmodus i rapporten. Da forsvinner estimert pris og all priskalkyle fra skjerm, PDF og delt lenke, slik at transportfirmaene kun ser volum og innhold.",
          },
        ],
      },
      {
        heading: "For flyttebyråer",
        items: [
          {
            q: "Kan vi bruke vår egen logo og firmadetaljer?",
            a: "Ja. Under firmaprofil legger du inn logo, merkefarge, firmanavn, organisasjonsnummer, adresse, telefon, e-post og nettside. Det vises øverst i rapporten, i PDF-en og i headeren når dere er innlogget.",
          },
          {
            q: "Hvordan setter vi pris?",
            a: "Legg inn pris per m³ og valuta i firmaprofilen. Rapporten regner ut estimert pris automatisk, og i bedriftsvisningen kan dere også regne på timepris.",
          },
        ],
      },
      {
        heading: "Priser og personvern",
        items: [
          {
            q: "Hva koster det?",
            a: "Privatpersoner kan prøve gratis, og kjøpe én beregning eller en pakke med tre. Flyttebyråer har eget abonnement. Se prissiden for gjeldende priser.",
          },
          {
            q: "Hva skjer med bildene mine?",
            a: "Romvideoen din oppbevares privat i et lukket lager og brukes ikke til å trene AI-modeller. Den slettes senest 12 måneder etter siste aktivitet, og du kan når som helst be om raskere sletting på kjell@volumcalc.com.",
          },
        ],
      },
    ],
  },
  en: {
    title: "Help and frequently asked questions",
    intro:
      "Everything you need to get started with VolumCalc — from a quick room video and a calm checklist to a polished report, packing, storage and sharing.",
    ctaTitle: "Didn't find your answer?",
    ctaText: "Send us a few words and we usually reply within one business day.",
    cta: "Start a free estimate",
    contact: "Contact us",
    groups: [
      {
        heading: "Recording your room video",
        items: [
          {
            q: "How long should each room video be?",
            a: "A gentle sweep of each room at your own pace is usually perfect, so the main furniture is clearly visible. No need for close-ups of every little thing, as you’ll confirm items in the checklist afterwards.",
          },
          {
            q: "What gives the best result?",
            a: "Good lighting, tidy surfaces, and a smooth pan from the doorway so the full room is in view. Keep your phone steady and take your time.",
          },
          {
            q: "Do I need to record inside cupboards and drawers?",
            a: "No, not at all. Cupboard contents are normally counted as boxes, so you can simply confirm quantities in the checklist after filming.",
          },
        ],
      },
      {
        heading: "Rooms and editing",
        items: [
          {
            q: "How are items assigned to rooms?",
            a: "You choose the room before filming, then confirm items in a checklist tailored to that exact room.",
          },
          {
            q: "Can I rename rooms and move items?",
            a: "Yes. In the report you can rename rooms, move an item to another room, change quantity and dimensions, add notes and flag items as fragile, heavy, needing disassembly or not moving at all.",
          },
          {
            q: "What if something is missing or wrong?",
            a: "No worries — just adjust quantities directly in the checklist. Totals update instantly, so you can tidy everything up in moments.",
          },
        ],
      },
      {
        heading: "Volume and vehicle",
        items: [
          {
            q: "What is net volume versus recommended volume?",
            a: "Net volume is the sum of the items. Recommended volume adds a 25% stowage factor for air between furniture, and is the figure to use when choosing a vehicle or storage unit.",
          },
          {
            q: "Which van or truck do I need?",
            a: "The report suggests a vehicle size from the recommended volume. You can also work it out in our moving van calculator.",
          },
        ],
      },
      {
        heading: "Packing, storage and delivery",
        items: [
          {
            q: "Can I ask for packing help?",
            a: "Yes. Tick packing help in the report, choose the scope (fragile only, partial or full packing) and enter how much material is needed — boxes, bubble wrap, packing paper, tape, wardrobe boxes, mattress bags and furniture blankets.",
          },
          {
            q: "We need interim storage. Where do I note that?",
            a: "Fill in the storage section with the facility's company name, full address and contact person. It is carried into the report and the PDF.",
          },
          {
            q: "Where do I add the new address?",
            a: "Under delivery to the new home: full address, floor, whether there is a lift, carrying distance and any notes.",
          },
        ],
      },
      {
        heading: "Sharing, language and PDF",
        items: [
          {
            q: "Can I save the report in several languages?",
            a: "Yes. Choose Norwegian, English or Polish as the report language. Everything you edited yourself is kept — only the fixed labels change. Then share the link or save the PDF in that language.",
          },
          {
            q: "How do I share the report?",
            a: "Use \u201cShare secret link\u201d. Anyone with the link can view the report without signing in, so only share it with the intended recipients.",
          },
          {
            q: "How do I hide prices when inviting tenders?",
            a: "Turn on tender mode in the report. The estimated price and all price calculations disappear from the screen, the PDF and the shared link, so carriers only see volume and contents.",
          },
        ],
      },
      {
        heading: "For moving companies",
        items: [
          {
            q: "Can we use our own logo and company details?",
            a: "Yes. In the company profile you add logo, brand colour, company name, registration number, address, phone, email and website. They appear at the top of the report, in the PDF and in the header when you are signed in.",
          },
          {
            q: "How do we set prices?",
            a: "Enter your rate per m³ and currency in the company profile. The report calculates the estimated price automatically, and the business view also lets you work with an hourly rate.",
          },
        ],
      },
      {
        heading: "Pricing and privacy",
        items: [
          {
            q: "What does it cost?",
            a: "Private individuals can try it free and buy a single estimate or a pack of three. Moving companies have their own subscription. See the pricing page for current prices.",
          },
          {
            q: "What happens to my room video?",
            a: "Your estimate is created from your room video and checklist flow. Your media stays private, is not used to train AI models, and is deleted no later than 12 months after the last activity. If you’d like deletion sooner, just drop us a line at kjell@volumcalc.com and we’ll gladly help.",
          },
        ],
      },
    ],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: content.en.groups.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  ),
};

export const Route = createFileRoute("/hjelp")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Hjelp og FAQ / Help and FAQ — VolumCalc" },
      {
        name: "description",
        content:
          "Svar på de vanligste spørsmålene om VolumCalc: fotografering, rom, volum, pakking, lagring, deling, PDF, priser og personvern.",
      },
      { property: "og:title", content: "Hjelp og FAQ — VolumCalc" },
      { property: "og:description", content: "Alt du lurer på om volumberegning med VolumCalc." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(faqSchema) }],
  }),
  component: HelpPage,
});

function HelpPage() {
  const { lang } = useI18n();
  const c = content[lang === "no" ? "no" : "en"];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{c.intro}</p>

          <div className="mt-12 space-y-10">
            {c.groups.map((group) => (
              <section key={group.heading}>
                <h2 className="text-xl font-semibold">{group.heading}</h2>
                <div className="mt-4 space-y-4">
                  {group.items.map((item) => (
                    <div key={item.q} className="card-soft p-5">
                      <h3 className="font-semibold">{item.q}</h3>
                      <p className="mt-2 leading-relaxed text-muted-foreground">{item.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="card-soft mt-12 p-6">
            <h2 className="text-lg font-semibold">{c.ctaTitle}</h2>
            <p className="mt-2 text-muted-foreground">{c.ctaText}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/upload">{c.cta}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">{c.contact}</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
