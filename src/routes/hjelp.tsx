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
      "Alt du trenger for å komme i gang med VolumCalc – fra fotografering til ferdig rapport, pakking, lagring og deling.",
    ctaTitle: "Fant du ikke svaret?",
    ctaText: "Send oss noen ord, så svarer vi vanligvis innen én virkedag.",
    cta: "Start en gratis beregning",
    contact: "Kontakt oss",
    groups: [
      {
        heading: "Fotografering",
        items: [
          {
            q: "Hvor mange bilder bør jeg ta?",
            a: "Ta 1–3 bilder per rom: ett oversiktsbilde av hele rommet, pluss 1–2 nærbilder av de største møblene. Du trenger ikke fotografere hver minste gjenstand. Maks 20 bilder per beregning.",
          },
          {
            q: "Hva gir best resultat?",
            a: "Godt lys, ryddige flater og bilder tatt fra døråpningen slik at hele rommet kommer med. Ta bildene i liggende format hvis du kan.",
          },
          {
            q: "Må jeg fotografere skap og skuffer innvendig?",
            a: "Nei. Innholdet i skap og skuffer regnes normalt inn i flyttekasser. Skriv heller antall kasser som merknad i rapporten.",
          },
        ],
      },
      {
        heading: "Rom og redigering",
        items: [
          {
            q: "Hvordan sorteres bildene i rom?",
            a: "AI-en grupperer gjenstandene automatisk i rom som stue, kjøkken, soverom, bad, gang, kontor, garasje og annet.",
          },
          {
            q: "Kan jeg endre navn på rom og flytte ting?",
            a: "Ja. I rapporten kan du gi rom nytt navn, flytte en gjenstand til et annet rom, endre antall og mål, legge til merknader og merke ting som skjøre, tunge, til demontering eller som ikke skal være med.",
          },
          {
            q: "Hva om AI-en bommer på noe?",
            a: "Hver gjenstand har en sikkerhetsgrad i prosent. Gå gjennom det som har lav sikkerhet og juster målene – totalvolumet oppdateres med én gang.",
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
            a: "Bildene ligger i et lukket lager og er ikke offentlige. De brukes ikke til å trene AI-modeller, og slettes senest 12 måneder etter siste aktivitet. Du kan be om sletting når som helst på kjell@volumcalc.com.",
          },
        ],
      },
    ],
  },
  en: {
    title: "Help and frequently asked questions",
    intro:
      "Everything you need to get started with VolumCalc — from a few quick photos and a calm checklist to a polished report, packing, storage and sharing.",
    ctaTitle: "Didn't find your answer?",
    ctaText: "Send us a few words and we usually reply within one business day.",
    cta: "Start a free estimate",
    contact: "Contact us",
    groups: [
      {
        heading: "Photographing your room",
        items: [
          {
            q: "How many photos should I take per room?",
            a: "Take 1–3 photos per room: one overview shot of the whole room, plus 1–2 close-ups of the largest furniture. You don't need to photograph every last item. Maximum 20 photos per estimate.",
          },
          {
            q: "What gives the best result?",
            a: "Good lighting, tidy surfaces, and photos taken from the doorway so the whole room is in view. Shoot in landscape if you can.",
          },
          {
            q: "Do I need to photograph inside cupboards and drawers?",
            a: "No. Cupboard and drawer contents are normally counted as moving boxes — just note the number of boxes in the report instead.",
          },
        ],
      },
      {
        heading: "Rooms and editing",
        items: [
          {
            q: "How are photos sorted into rooms?",
            a: "The AI automatically groups items into rooms like living room, kitchen, bedroom, bathroom, hallway, office, garage and other.",
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
            q: "What happens to my photos?",
            a: "Your photos are stored privately and are never public. They're not used to train AI models, and are deleted no later than 12 months after the last activity. You can request deletion at any time at kjell@volumcalc.com.",
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
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/hjelp" }],
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
