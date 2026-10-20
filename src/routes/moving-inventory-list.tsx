import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ListChecks, ClipboardList, Boxes, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useI18n } from "@/lib/i18n";

const CANONICAL = "https://www.volumcalc.com/moving-inventory-list";

export const Route = createFileRoute("/moving-inventory-list")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Moving inventory list: room-by-room guide and free template — VolumCalc" },
      {
        name: "description",
        content:
          "A practical moving inventory list: what to write down in every room, how to estimate cubic metres, common mistakes, and how to build the list with a checklist calculator.",
      },
      { property: "og:title", content: "Moving inventory list: room-by-room guide — VolumCalc" },
      {
        property: "og:description",
        content:
          "Room-by-room checklists, volume tips and a faster way to turn your items into a complete moving inventory.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Moving inventory list: room-by-room guide and free template",
          description:
            "How to build a complete moving inventory list room by room, estimate volume in cubic metres, and avoid the most common mistakes.",
          mainEntityOfPage: CANONICAL,
          author: { "@type": "Organization", name: "VolumCalc" },
          publisher: { "@type": "Organization", name: "VolumCalc" },
        }),
      },
    ],
  }),
  component: MovingInventoryList,
});

type Room = { room: { no: string; en: string }; items: { no: string[]; en: string[] }; tip: { no: string; en: string } };

const rooms: Room[] = [
  {
    room: { no: "Stue", en: "Living room" },
    items: {
      no: ["Sofa og lenestoler", "Sofabord og sidebord", "TV, TV-benk og høyttalere", "Bokhyller (tell antall hyller)", "Tepper, lamper, planter", "Bilder og speil"],
      en: ["Sofa and armchairs", "Coffee and side tables", "TV, TV unit and speakers", "Bookcases (count the shelves)", "Rugs, lamps, plants", "Pictures and mirrors"],
    },
    tip: {
      no: "Bokhyller og sofaer er de største volumdriverne. Mål sofaen i lengde, dybde og høyde.",
      en: "Bookcases and sofas drive most of the volume. Measure the sofa in length, depth and height.",
    },
  },
  {
    room: { no: "Kjøkken", en: "Kitchen" },
    items: {
      no: ["Kjøleskap, fryser, oppvaskmaskin", "Kjøkkenbord og stoler", "Småelektrisk (mikro, kaffemaskin)", "Servise og glass i kasser", "Gryter, panner, kjøkkenredskap"],
      en: ["Fridge, freezer, dishwasher", "Kitchen table and chairs", "Small appliances (microwave, coffee machine)", "Crockery and glassware in boxes", "Pots, pans, utensils"],
    },
    tip: {
      no: "Regn løsøre i kasser: et vanlig kjøkken blir gjerne 8–15 flyttekasser à 0,08 m³.",
      en: "Count loose items as boxes: a typical kitchen fills 8–15 moving boxes of about 0.08 m³ each.",
    },
  },
  {
    room: { no: "Soverom", en: "Bedroom" },
    items: {
      no: ["Seng og madrass (oppgi bredde)", "Nattbord", "Garderobeskap eller kommode", "Klær – tell hengemeter", "Speil, lamper, gardiner"],
      en: ["Bed and mattress (state the width)", "Bedside tables", "Wardrobe or chest of drawers", "Clothes — count hanging metres", "Mirrors, lamps, curtains"],
    },
    tip: {
      no: "Noter om sengen og garderoben må demonteres – det påvirker tid, ikke bare volum.",
      en: "Note whether the bed and wardrobe need disassembly — that affects time, not just volume.",
    },
  },
  {
    room: { no: "Bad", en: "Bathroom" },
    items: {
      no: ["Vaskemaskin og tørketrommel", "Håndklær og toalettsaker", "Baderomshylle eller skap"],
      en: ["Washing machine and tumble dryer", "Towels and toiletries", "Bathroom shelf or cabinet"],
    },
    tip: {
      no: "Hvitevarer må tømmes og sikres. Merk dem alltid i listen.",
      en: "Appliances must be drained and secured. Always flag them in the list.",
    },
  },
  {
    room: { no: "Hjemmekontor", en: "Home office" },
    items: {
      no: ["Skrivebord og kontorstol", "PC, skjermer, skriver", "Arkivskap og permer", "Kabler i én merket kasse"],
      en: ["Desk and office chair", "Computer, monitors, printer", "Filing cabinet and folders", "Cables in one labelled box"],
    },
    tip: {
      no: "Elektronikk bør pakkes i originalemballasje eller polstret kasse – merk som skjørt.",
      en: "Pack electronics in original boxes or padded crates — flag them as fragile.",
    },
  },
  {
    room: { no: "Gang og bod", en: "Hallway and storage" },
    items: {
      no: ["Skostativ og knagger", "Yttertøy", "Støvsuger, vaskeutstyr", "Sesongkasser og verktøy"],
      en: ["Shoe rack and hooks", "Outdoor clothing", "Vacuum cleaner, cleaning kit", "Seasonal boxes and tools"],
    },
    tip: {
      no: "Boden undervurderes nesten alltid. Åpne døren og gå gjennom hylle for hylle.",
      en: "Storage rooms are almost always underestimated. Open the door and go through it shelf by shelf.",
    },
  },
  {
    room: { no: "Garasje og uteplass", en: "Garage and outdoor" },
    items: {
      no: ["Sykler, ski, dekk", "Hagemøbler og grill", "Gressklipper og hageredskap", "Verktøybenk og maling"],
      en: ["Bikes, skis, tyres", "Garden furniture and barbecue", "Lawnmower and garden tools", "Workbench and paint"],
    },
    tip: {
      no: "Brannfarlig væske, gassflasker og maling kan ikke fraktes – hold dem utenfor listen.",
      en: "Flammable liquids, gas bottles and paint cannot be transported — keep them off the list.",
    },
  },
];

function MovingInventoryList() {
  const { lang } = useI18n();
  const no = lang === "no";

  const steps = no
    ? [
        { icon: ClipboardList, t: "Gå rom for rom", d: "Lag én liste per rom i stedet for én lang liste. Det gjør det lett å kontrollere på flyttedagen." },
        { icon: ListChecks, t: "Start med de store tingene", d: "Sofa, senger, skap og hvitevarer utgjør mesteparten av volumet – ta dem først." },
        { icon: Boxes, t: "Regn om til kubikk", d: "Summer møbelvolum og antall kasser, og legg til 25 % stuefaktor for luft i bilen." },
      ]
    : [
        { icon: ClipboardList, t: "Work room by room", d: "Keep one list per room instead of one long list. It is far easier to check on moving day." },
        { icon: ListChecks, t: "Start with the big things", d: "Sofas, beds, wardrobes and appliances make up most of the volume — list them first." },
        { icon: Boxes, t: "Convert to cubic metres", d: "Add up furniture volume and boxes, then add a 25% stowage factor for air in the truck." },
      ];

  const mistakes = no
    ? [
        "Glemmer bod, loft og garasje – ofte 15–20 % av totalvolumet.",
        "Teller kasser, men ikke innholdet i skapene som må pakkes.",
        "Oppgir volum uten stuefaktor, slik at bilen blir for liten.",
        "Noterer ikke hva som skal demonteres eller er ekstra tungt.",
        "Tar med gjenstander som egentlig skal kastes eller gis bort.",
      ]
    : [
        "Forgetting the storage room, attic and garage — often 15–20% of the total volume.",
        "Counting boxes but not the cupboard contents that still need packing.",
        "Quoting volume without a stowage factor, so the truck ends up too small.",
        "Not noting what needs disassembly or is unusually heavy.",
        "Listing items that are actually going to be discarded or given away.",
      ];

  const volumes = no
    ? [
        ["3-seters sofa", "1,8 m³"],
        ["Dobbeltseng med madrass", "1,6 m³"],
        ["Garderobeskap, 2 dører", "1,1 m³"],
        ["Kjøleskap/fryser", "0,7 m³"],
        ["Spisebord, 6 personer", "0,9 m³"],
        ["Flyttekasse (standard)", "0,08 m³"],
      ]
    : [
        ["3-seat sofa", "1.8 m³"],
        ["Double bed with mattress", "1.6 m³"],
        ["Wardrobe, 2 doors", "1.1 m³"],
        ["Fridge/freezer", "0.7 m³"],
        ["Dining table, seats 6", "0.9 m³"],
        ["Moving box (standard)", "0.08 m³"],
      ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="surface-hero border-b border-border/60 px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl">
              {no ? "Flytteliste over inventar – rom for rom" : "Moving inventory list — room by room"}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {no
                ? "En god inventarliste forteller deg hva du eier, hvor mye plass det tar, og hva flyttingen bør koste. Her er en komplett guide – og en raskere måte å lage listen på."
                : "A good inventory list tells you what you own, how much space it takes and what the move should cost. Here is the complete guide — and a faster way to build the list."}
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link to="/upload">
                {no ? "Lag listen med sjekklisten" : "Build the list with the checklist"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.t} className="card-soft p-7">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <step.icon className="size-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold">{step.t}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{step.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16">
          <h2 className="text-2xl font-bold">{no ? "Sjekkliste for hvert rom" : "Checklist for every room"}</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {no
              ? "Bruk listene under som utgangspunkt, og stryk det du ikke har."
              : "Use the lists below as a starting point and cross out what you do not have."}
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {rooms.map((room) => (
              <article key={room.room.en} className="card-soft p-7">
                <h3 className="text-lg font-semibold">{no ? room.room.no : room.room.en}</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  {(no ? room.items.no : room.items.en).map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
                  {no ? room.tip.no : room.tip.en}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-muted/30 px-4 py-16">
          <div className="mx-auto max-w-5xl grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">{no ? "Typiske volumer" : "Typical volumes"}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {no
                  ? "Omtrentlige tall du kan bruke når du summerer listen manuelt."
                  : "Rough figures you can use when adding up the list by hand."}
              </p>
              <dl className="mt-6 divide-y divide-border rounded-xl border border-border bg-background">
                {volumes.map(([item, volume]) => (
                  <div key={item} className="flex items-center justify-between px-4 py-3 text-sm">
                    <dt>{item}</dt>
                    <dd className="font-semibold">{volume}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{no ? "Fem vanlige feil" : "Five common mistakes"}</h2>
              <ul className="mt-6 space-y-3 text-sm">
                {mistakes.map((mistake) => (
                  <li key={mistake} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold">{no ? "Slik hjelper VolumCalc" : "How VolumCalc helps"}</h2>
          <p className="mt-3 text-muted-foreground">
            {no
              ? "I stedet for å skrive listen for hånd velger du gjenstander fra sjekklisten, rom for rom. VolumCalc beregner volum i m³, legger til stuefaktor og foreslår bil. Du kan legge til egne gjenstander med mål, markere hva som ikke skal være med – og dele resultatet som lenke eller PDF med flyttebyrået."
              : "Instead of writing the list by hand you pick items from the checklist, room by room. VolumCalc calculates the volume in m³, adds the stowage factor and suggests a vehicle. You can add your own items with dimensions, mark what stays behind — and share the result as a link or PDF with your movers."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/upload">{no ? "Prøv gratis" : "Try it free"}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/pricing">{no ? "Se priser" : "See pricing"}</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
