import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Check, Info, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { cn } from "@/lib/utils";

export type VanLang = "no" | "en";

export const BUFFER = 1.2;

type Vehicle = {
  id: string;
  maxGross: number;
  title: { no: string; en: string };
  size: { no: string; en: string };
  licenceOk: boolean;
  licence: { no: string; en: string };
  fits: { no: string; en: string };
};

const VEHICLES: Vehicle[] = [
  {
    id: "small-van",
    maxGross: 6,
    title: { no: "Liten varebil (Caddy / Berlingo)", en: "Small van (Caddy / Berlingo)" },
    size: { no: "ca. 3–4 m³", en: "approx. 3–4 m³" },
    licenceOk: true,
    licence: { no: "Kjøres med vanlig førerkort klasse B", en: "Drives on a standard category B licence" },
    fits: {
      no: "Her får du typisk plass til: en hybelseng, et lite bord med to stoler, en lenestol og rundt 10–15 flyttekasser.",
      en: "This typically fits: a single bed, a small table with two chairs, one armchair and around 10–15 moving boxes.",
    },
  },
  {
    id: "medium-van",
    maxGross: 11,
    title: { no: "Mellomstor varebil (Transit / Sprinter, kort)", en: "Medium van (Transit / Sprinter, short)" },
    size: { no: "ca. 8–11 m³", en: "approx. 8–11 m³" },
    licenceOk: true,
    licence: { no: "Kjøres med vanlig førerkort klasse B", en: "Drives on a standard category B licence" },
    fits: {
      no: "Her får du typisk plass til: dobbeltseng, 2-seters sofa, spisebord med fire stoler, vaskemaskin og rundt 20 flyttekasser.",
      en: "This typically fits: a double bed, a 2-seater sofa, a dining table with four chairs, a washing machine and around 20 moving boxes.",
    },
  },
  {
    id: "lwb-van",
    maxGross: 16,
    title: { no: "Lang varebil med høyt tak (LWB Sprinter)", en: "Long wheelbase high-roof van (LWB Sprinter)" },
    size: { no: "ca. 13–16 m³", en: "approx. 13–16 m³" },
    licenceOk: true,
    licence: { no: "Kjøres med vanlig førerkort klasse B (under 3 500 kg)", en: "Drives on a standard category B licence (under 3,500 kg)" },
    fits: {
      no: "Her får du typisk plass til: dobbeltseng, 3-seters sofa, garderobeskap, spisebord med fire stoler, vaskemaskin og rundt 25 kasser.",
      en: "This typically fits: a double bed, a 3-seater sofa, a wardrobe, a dining table with four chairs, a washing machine and around 25 boxes.",
    },
  },
  {
    id: "luton",
    maxGross: 22,
    title: { no: "Liten skapbil med heis (Luton-bil)", en: "Box van with tail lift (Luton van)" },
    size: { no: "ca. 18–20 m³", en: "approx. 18–20 m³" },
    licenceOk: true,
    licence: {
      no: "Kjøres med vanlig førerkort klasse B så lenge totalvekten er under 3 500 kg",
      en: "Drives on a standard category B licence as long as total weight stays under 3,500 kg",
    },
    fits: {
      no: "Her får du typisk plass til: dobbeltseng, 3-seters sofa, spisebord med fire stoler, vaskemaskin, kjøleskap og rundt 25–30 flyttekasser.",
      en: "This typically fits: a double bed, a 3-seater sofa, a dining table with four chairs, a washing machine, a fridge and around 25–30 moving boxes.",
    },
  },
  {
    id: "7-5t",
    maxGross: 40,
    title: { no: "Flyttebil 7,5 tonn", en: "7.5-tonne moving truck" },
    size: { no: "ca. 30–40 m³", en: "approx. 30–40 m³" },
    licenceOk: false,
    licence: { no: "Krever førerkort C1 – eller et flyttebyrå med sjåfør", en: "Requires a C1 licence — or a moving company with a driver" },
    fits: {
      no: "Her får du typisk plass til hele innboet i en 2–3-roms leilighet, inkludert hvitevarer og 40–60 kasser.",
      en: "This typically fits the whole contents of a 2–3 bedroom flat, including appliances and 40–60 boxes.",
    },
  },
  {
    id: "big-truck",
    maxGross: Number.POSITIVE_INFINITY,
    title: { no: "Stor flyttebil (eller to turer)", en: "Full-size removal truck (or two trips)" },
    size: { no: "45 m³ og oppover", en: "45 m³ and up" },
    licenceOk: false,
    licence: { no: "Krever lastebilsertifikat C – dette er jobb for et flyttebyrå", en: "Requires a category C licence — this is a job for a removal firm" },
    fits: {
      no: "Her får du typisk plass til en hel enebolig med sofagruppe, senger, hvitevarer, bod og garasje.",
      en: "This typically fits an entire house: sofas, beds, appliances, storage room and garage.",
    },
  },
];

type Preset = { key: string; label: { no: string; en: string }; volume: number; hint: { no: string; en: string } };

const PRESETS: Preset[] = [
  { key: "studio", label: { no: "Hybel", en: "Studio / room" }, volume: 8, hint: { no: "ett rom med kjøkkenkrok", en: "one room with a kitchenette" } },
  { key: "1room", label: { no: "1-roms", en: "1-bedroom" }, volume: 14, hint: { no: "liten leilighet, lite bod", en: "small flat, little storage" } },
  { key: "2-3room", label: { no: "2–3 roms", en: "2–3 bedroom" }, volume: 24, hint: { no: "familieleilighet med bod", en: "family flat with storage" } },
  { key: "house", label: { no: "Enebolig", en: "House" }, volume: 42, hint: { no: "hus med garasje og loft", en: "house with garage and attic" } },
];

function pickVehicle(gross: number) {
  return VEHICLES.find((vehicle) => gross <= vehicle.maxGross) ?? VEHICLES[VEHICLES.length - 1];
}

function VanIllustration({ id }: { id: string }) {
  const box = (x: number, y: number, w: number, h: number, key: string) => (
    <rect key={key} x={x} y={y} width={w} height={h} rx="1.5" className="fill-primary/25 stroke-primary/50" strokeWidth="1" />
  );
  const cargoBoxes: React.ReactNode[] = [];
  const columns = id === "small-van" ? 3 : id === "medium-van" ? 4 : id === "lwb-van" ? 5 : id === "luton" ? 6 : 7;
  const rows = id === "small-van" || id === "medium-van" ? 2 : 3;
  for (let c = 0; c < columns; c += 1) {
    for (let r = 0; r < rows; r += 1) {
      cargoBoxes.push(box(36 + c * 22, 76 - r * 18, 18, 15, `${c}-${r}`));
    }
  }
  return (
    <svg viewBox="0 0 220 110" role="img" aria-hidden className="h-auto w-full max-w-sm">
      <rect x="28" y="16" width={columns * 22 + 8} height="74" rx="6" className="fill-secondary/40 stroke-border" strokeWidth="2" />
      {cargoBoxes}
      <path
        d={`M${28 + columns * 22 + 8} 40 h18 l14 20 v30 h-32 z`}
        className="fill-muted stroke-border"
        strokeWidth="2"
      />
      <circle cx="58" cy="94" r="10" className="fill-foreground/80" />
      <circle cx={28 + columns * 22 + 22} cy="94" r="10" className="fill-foreground/80" />
      <circle cx="58" cy="94" r="4" className="fill-background" />
      <circle cx={28 + columns * 22 + 22} cy="94" r="4" className="fill-background" />
    </svg>
  );
}

export function VanCalculator({ lang }: { lang: VanLang }) {
  const no = lang === "no";
  const [mode, setMode] = useState<"volume" | "home">("volume");
  const [net, setNet] = useState(14);

  const gross = useMemo(() => Math.round(net * BUFFER * 10) / 10, [net]);
  const vehicle = pickVehicle(gross);

  const faq = no
    ? [
        {
          q: "Kan jeg kjøre en Luton-bil på 18–20 m³ med vanlig førerkort klasse B?",
          a: "Ja. Så lenge bilen har en tillatt totalvekt på 3 500 kg eller mindre, holder det med klasse B. Sjekk vognkortet før du henter bilen – og husk at totalvekten inkluderer lasten din, ikke bare bilen.",
        },
        {
          q: "Hvorfor blir bilen full før kubikkmålene er brukt opp?",
          a: "Fordi møbler ikke er firkantede. En sofa med skrå rygg, et rundt bord eller en sykkel lager luftlommer du ikke får fylt. Derfor legger vi automatisk på rundt 20 % stuefaktor, så du slipper å stå igjen med halve sofaen på fortauet.",
        },
        {
          q: "Hvor mange flyttekasser får du i 1 m³?",
          a: "Cirka 10–12 standard flyttekasser. Kasser er det enkleste å stable, så pakk mest mulig i kasser av lik størrelse – da utnytter du bilen langt bedre.",
        },
      ]
    : [
        {
          q: "Can I drive an 18–20 m³ Luton box van on a standard category B licence?",
          a: "Yes. As long as the van's maximum authorised mass is 3,500 kg or less, a category B licence is enough. Check the registration document before you collect it — and remember the weight limit includes your load, not just the van.",
        },
        {
          q: "Why does the van fill up before the cubic metres run out?",
          a: "Because furniture isn't box-shaped. A sloped sofa back, a round table or a bike creates air pockets you can't fill. That's why we add roughly 20% packing buffer automatically, so you don't end up with half a sofa on the pavement.",
        },
        {
          q: "How many moving boxes fit in 1 m³?",
          a: "Roughly 10–12 standard packing boxes. Boxes are the easiest thing to stack, so pack as much as you can into same-sized boxes — you'll use the van far better.",
        },
      ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-secondary/50 to-background">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {no
                ? "Hvor stor flyttebil trenger du egentlig? La oss finne ut av det sammen."
                : "Wondering how big a moving van you actually need? Let's figure it out."}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {no
                ? "Dra i skyveknappen eller velg boligtypen din, så foreslår vi bilstørrelsen med en gang – med stuefaktor og førerkort-sjekk på kjøpet."
                : "Drag the slider or pick your type of home, and we'll suggest the right van straight away — packing buffer and licence check included."}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10">
          <div className="flex flex-wrap justify-center gap-2">
            {(
              [
                ["volume", no ? "Jeg vet kubikkmålet" : "I know my cubic metres"],
                ["home", no ? "Hjelp meg å gjette ut fra bolig" : "Help me guess from my home"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  mode === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            {mode === "volume" ? (
              <div>
                <div className="flex items-end justify-between gap-4">
                  <label htmlFor="van-volume" className="text-sm font-medium text-muted-foreground">
                    {no ? "Innboet ditt (netto m³)" : "Your belongings (net m³)"}
                  </label>
                  <span className="text-3xl font-bold tabular-nums">{net} m³</span>
                </div>
                <Slider
                  id="van-volume"
                  className="mt-6"
                  min={5}
                  max={50}
                  step={1}
                  value={[net]}
                  onValueChange={(value) => setNet(value[0] ?? net)}
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>5 m³</span>
                  <span>50 m³</span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {no ? "Hva slags bolig flytter du fra?" : "What kind of home are you moving from?"}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => setNet(preset.volume)}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-left transition-colors",
                        net === preset.volume
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:border-primary/50",
                      )}
                    >
                      <span className="block font-semibold">{preset.label[lang]}</span>
                      <span className="block text-xs text-muted-foreground">{preset.hint[lang]}</span>
                      <span className="mt-1 block text-sm font-medium text-primary">~{preset.volume} m³</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-sm">
            <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_1.1fr] md:items-center">
              <div className="flex justify-center">
                <VanIllustration id={vehicle.id} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {no ? "Vår anbefaling" : "Our recommendation"}
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  {vehicle.title[lang]} <span className="text-muted-foreground">({vehicle.size[lang]})</span>
                </h2>
                <p
                  className={cn(
                    "mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                    vehicle.licenceOk ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
                  )}
                >
                  {vehicle.licenceOk ? <Check className="size-4" /> : <TriangleAlert className="size-4" />}
                  {vehicle.licence[lang]}
                </p>
                <p className="mt-4 text-sm text-muted-foreground">{vehicle.fits[lang]}</p>
                <div className="mt-5 rounded-xl bg-secondary/50 p-4 text-sm">
                  <p className="flex items-center gap-2 font-medium">
                    <Info className="size-4 text-primary" />
                    {no ? "Stuefaktor (Tetris-margin)" : "Packing buffer (the Tetris margin)"}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {no
                      ? `Vi legger automatisk på rundt 20 %, fordi møbler aldri stables perfekt. ${net} m³ innbo blir derfor ca. ${gross} m³ lasterom – så du slipper å stå igjen med halve sofaen på fortauet.`
                      : `We automatically add around 20%, because furniture never stacks perfectly. So ${net} m³ of belongings becomes about ${gross} m³ of load space — no half a sofa left on the pavement.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-6 text-center sm:p-8">
            <p className="mx-auto max-w-2xl text-base">
              {no
                ? "Er du usikker på om alt får plass? Slipp å gjette – knips et par kjappe bilder av rommene dine, så regner VolumCalc ut nøyaktig kubikkmål for deg på to minutter."
                : "Not sure if your stuff will actually fit? Skip the guesswork — snap a few quick photos of your rooms, and let VolumCalc calculate the exact volume in under two minutes."}
            </p>
            <Button asChild size="lg" className="mt-5">
              <Link to="/upload">
                <Camera className="size-4" />
                {no ? "Beregn med bilder (gratis)" : "Calculate with photos (free)"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-20">
          <h2 className="text-2xl font-bold">{no ? "Spørsmål folk stiller oss" : "Questions people ask us"}</h2>
          <Accordion type="single" collapsible className="mt-4">
            {faq.map((entry) => (
              <AccordionItem key={entry.q} value={entry.q}>
                <AccordionTrigger className="text-left">{entry.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{entry.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="mt-8 text-sm text-muted-foreground">
            {no ? (
              <>
                Vil du ha hele listen på plass før du bestiller bil?{" "}
                <Link to="/moving-inventory-list" className="text-primary underline-offset-4 hover:underline">
                  Se flyttelista rom for rom
                </Link>
                .
              </>
            ) : (
              <>
                Want the full list sorted before you book a van?{" "}
                <Link to="/moving-inventory-list" className="text-primary underline-offset-4 hover:underline">
                  See the room-by-room inventory guide
                </Link>
                .
              </>
            )}
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export function vanFaqJsonLd(lang: VanLang) {
  const entries =
    lang === "no"
      ? [
          ["Kan jeg kjøre en Luton-bil på 18–20 m³ med vanlig førerkort klasse B?", "Ja, så lenge bilens tillatte totalvekt er 3 500 kg eller mindre holder det med klasse B. Totalvekten inkluderer lasten din."],
          ["Hvorfor blir bilen full før kubikkmålene er brukt opp?", "Møbler er ikke firkantede, og skrå rygger og runde bord lager luftlommer. Derfor legger vi på rundt 20 % stuefaktor."],
          ["Hvor mange flyttekasser får du i 1 m³?", "Cirka 10–12 standard flyttekasser."],
        ]
      : [
          ["Can I drive an 18–20 m³ Luton box van on a standard category B licence?", "Yes, as long as the van's maximum authorised mass is 3,500 kg or less. The limit includes your load, not just the van."],
          ["Why does the van fill up before the cubic metres run out?", "Furniture isn't box-shaped, so sloped sofas and round tables create air pockets. That's why we add roughly 20% packing buffer."],
          ["How many moving boxes fit in 1 m³?", "Roughly 10–12 standard packing boxes."],
        ];
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
