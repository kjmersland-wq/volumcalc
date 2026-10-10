/**
 * Time estimate for packing, carrying out, securing and carrying in.
 *
 * All base rates below are *person-minutes per unit* for one typical item
 * in its category, at ground level with a short carry. They are scaled by
 * the item's actual size, adjusted by tags (fragile / heavy / disassemble),
 * multiplied by site conditions (stairs, lift, carrying distance) and finally
 * converted to clock time for a crew of N people, where each extra person is
 * a little less efficient than the last (people get in each other's way in
 * stairwells and on the ramp).
 *
 * Driving time between the two addresses is NOT included.
 */

export type MoveTimeItem = {
  id: string;
  name: string;
  name_no?: string | null;
  quantity: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  volume_m3: number;
  tags?: string[] | null;
  is_included?: boolean | null;
};

export type SiteAccess = {
  /** Floor number as people say it: 1 = street level, 2 = one flight up … */
  floor: number;
  elevator: boolean;
  /** Metres from the door to where the truck can park. */
  carryM: number;
};

export type PhaseKey =
  | "arrive"
  | "pack"
  | "dismantle"
  | "loadOut"
  | "secure"
  | "arriveDelivery"
  | "unload"
  | "reassemble"
  | "unpack"
  | "breaks";

export type MoveTimeOptions = {
  crew: number;
  pickup: SiteAccess;
  delivery: SiteAccess;
  includePacking: boolean;
  includeUnpacking: boolean;
};

/** One step of the job, in the order the crew does it. */
export type TimelineStep = {
  key: PhaseKey;
  side: "pickup" | "delivery";
  /** Clock minutes this step takes. */
  minutes: number;
  /** Clock minutes from the crew walking in until this step starts. */
  startsAt: number;
};

export type MoveTimeResult = {
  crew: number;
  /** Chronological steps; steps with no time are left out. */
  steps: TimelineStep[];
  /** Crew arrives at the old address → truck is loaded and secured. */
  pickupTotal: number;
  /** Crew arrives at the new address → everything is in and assembled. */
  deliveryTotal: number;
  total: number;
  low: number;
  high: number;
  /** Clock minutes per included item (all phases, quantity included). */
  perItem: Record<string, number>;
  /** True when something in the list normally needs extra bearers or equipment. */
  hasSpecialist: boolean;
};

type Category =
  | "box"
  | "soft"
  | "mattress"
  | "bed"
  | "sofa"
  | "armchair"
  | "chair"
  | "table"
  | "tallStorage"
  | "lowStorage"
  | "appliance"
  | "electronics"
  | "fragileFlat"
  | "sport"
  | "instrument"
  | "piano"
  | "generic";

type Rates = {
  /** Reference volume (m³, one unit) the rates are quoted for. */
  ref: number;
  pack: number;
  dismantle: number;
  carry: number;
  secure: number;
  reassemble: number;
};

const RATES: Record<Exclude<Category, "generic">, Rates> = {
  box: { ref: 0.11, pack: 4, dismantle: 0, carry: 1.2, secure: 0.5, reassemble: 0 },
  soft: { ref: 0.1, pack: 2, dismantle: 0, carry: 0.9, secure: 0.4, reassemble: 0 },
  mattress: { ref: 0.9, pack: 3, dismantle: 0, carry: 4, secure: 1.5, reassemble: 0 },
  bed: { ref: 2, pack: 5, dismantle: 12, carry: 6, secure: 2.5, reassemble: 16 },
  sofa: { ref: 2, pack: 7, dismantle: 0, carry: 9, secure: 3, reassemble: 0 },
  armchair: { ref: 0.8, pack: 4, dismantle: 0, carry: 4, secure: 1.5, reassemble: 0 },
  chair: { ref: 0.25, pack: 2, dismantle: 0, carry: 1.2, secure: 0.8, reassemble: 0 },
  table: { ref: 0.8, pack: 5, dismantle: 5, carry: 4.5, secure: 2, reassemble: 6 },
  tallStorage: { ref: 0.7, pack: 6, dismantle: 10, carry: 6, secure: 2.5, reassemble: 12 },
  lowStorage: { ref: 0.6, pack: 5, dismantle: 3, carry: 5, secure: 2, reassemble: 3 },
  appliance: { ref: 0.6, pack: 5, dismantle: 0, carry: 8, secure: 4, reassemble: 0 },
  electronics: { ref: 0.1, pack: 4.5, dismantle: 0, carry: 1.5, secure: 0.8, reassemble: 0 },
  fragileFlat: { ref: 0.15, pack: 8, dismantle: 0, carry: 2.5, secure: 1.5, reassemble: 0 },
  sport: { ref: 0.5, pack: 3, dismantle: 2, carry: 3, secure: 2, reassemble: 3 },
  instrument: { ref: 0.1, pack: 6, dismantle: 0, carry: 2.5, secure: 1.5, reassemble: 0 },
  piano: { ref: 1, pack: 10, dismantle: 0, carry: 30, secure: 8, reassemble: 0 },
};

/**
 * Order matters: the first matching rule wins, so specific rules (microwave,
 * digital piano, mattress) come before the broad ones that would also match.
 * Patterns cover both the English and the Norwegian item names.
 */
const CATEGORY_RULES: [Category, RegExp][] = [
  ["electronics", /microwave|mikrob[øo]lge|digital|keyboard|\btv\b|monitor|skjerm|\bpc\b|computer|printer|skriver|speaker|h[øo]yttaler|stereo|amplifier|forsterker|konsoll|console/],
  ["piano", /piano|flygel/],
  ["instrument", /guitar|gitar|drum|tromme|instrument|fiolin|violin|cello/],
  ["soft", /bedding|sengetøy|\bduvet|\bdyne|pillow|\bpute/],
  ["mattress", /madrass|mattress/],
  ["bed", /\bbed\b|seng|sofabed|sovesofa/],
  ["sofa", /sofa|couch|sectional|sofagruppe/],
  ["armchair", /armchair|lenestol|recliner|lenestoler/],
  ["chair", /chair|stol\b|stoler|krakk|stool|benk\b|bench/],
  ["appliance", /washing|vaskemaskin|t[øo]rketrommel|dryer|dishwasher|oppvask|fridge|refrigerator|kj[øo]leskap|freezer|fryser|stove|komfyr|\boven\b|\bovn\b|cooker/],
  ["fragileFlat", /mirror|speil|painting|maleri|picture|bilde|glass|artwork|kunst/],
  ["tallStorage", /wardrobe|garderobe|closet|cabinet|skap|bookcase|bokhylle|shelf|shelves|hylle|reol|regal|vitrine/],
  ["lowStorage", /dresser|kommode|sideboard|skjenk|drawers|skuff|tv bench|tv-benk|tv stand/],
  ["table", /table|bord\b|desk|skrivebord/],
  ["sport", /bike|bicycle|sykkel|ergometer|treadmill|tredem[øo]lle|\bski|golf|trampoline|kayak|kajakk|\bsurf/],
  ["box", /\bbox\b|boxes|carton|eske|kasse|kartong|pappeske|crate/],
  ["soft", /\bbag\b|\bbags\b|poser|pose\b|blanket|teppe|klær|clothes|soft goods|myke ting|\brug\b|matte/],
];

function categoryOf(item: MoveTimeItem): Category {
  const haystack = `${item.name} ${item.name_no ?? ""}`.toLowerCase();
  for (const [category, pattern] of CATEGORY_RULES) {
    if (pattern.test(haystack)) return category;
  }
  return "generic";
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

type ItemMinutes = {
  pack: number;
  dismantle: number;
  carry: number;
  secure: number;
  reassemble: number;
  specialist: boolean;
};

/** Person-minutes for ONE unit of the item before site conditions. */
function itemMinutes(item: MoveTimeItem): ItemMinutes {
  const qty = Math.max(1, Number(item.quantity) || 1);
  const dimsVolume = (item.length_cm * item.width_cm * item.height_cm) / 1_000_000;
  const unitVolume = clamp(dimsVolume > 0 ? dimsVolume : Number(item.volume_m3) / qty, 0.01, 12);

  const category = categoryOf(item);
  const tags = item.tags ?? [];

  let pack: number;
  let dismantle: number;
  let carry: number;
  let secure: number;
  let reassemble: number;

  if (category === "generic") {
    pack = 2 + 6 * unitVolume;
    carry = 1 + 5 * unitVolume;
    secure = 0.5 + 2 * unitVolume;
    dismantle = 0;
    reassemble = 0;
  } else {
    const rates = RATES[category];
    const handling = clamp(Math.pow(unitVolume / rates.ref, 0.6), 0.5, 2.5);
    const assembly = clamp(Math.pow(unitVolume / rates.ref, 0.4), 0.6, 1.8);
    pack = rates.pack * handling;
    carry = rates.carry * handling;
    secure = rates.secure * handling;
    dismantle = rates.dismantle * assembly;
    reassemble = rates.reassemble * assembly;
  }

  if (tags.includes("disassemble") && dismantle === 0) {
    dismantle = 6 + 4 * Math.sqrt(unitVolume);
    reassemble = 8 + 5 * Math.sqrt(unitVolume);
  }
  if (tags.includes("fragile")) {
    pack *= 1.5;
    carry *= 1.15;
    secure *= 1.2;
  }
  const heavy = tags.includes("heavy");
  if (heavy) {
    carry *= 1.5;
    secure *= 1.2;
  }

  return {
    pack,
    dismantle,
    carry,
    secure,
    reassemble,
    specialist: category === "piano" || (heavy && unitVolume >= 1.5),
  };
}

/**
 * Slowdown caused by the building: stairs, lift and long carries. Floor 1 is
 * street level (Norwegian convention), so only floors above it add stairs.
 */
export function siteFactor(site: SiteAccess): number {
  const flights = Math.max(0, Math.round(site.floor) - 1);
  const distance = 1 + Math.max(0, site.carryM - 20) * 0.006;
  const vertical = flights === 0 ? 1 : site.elevator ? 1.06 + 0.015 * flights : 1 + 0.2 * flights;
  return Math.min(distance * vertical, 4);
}

/** Build a SiteAccess from the free-text / nullable fields the report stores. */
export function siteFrom(
  floor: string | number | null | undefined,
  elevator: boolean | null | undefined,
  carry: string | number | null | undefined,
): SiteAccess {
  const f = Number(floor);
  const c = Number(carry);
  return {
    floor: Number.isFinite(f) && f > 0 ? Math.min(f, 60) : 1,
    elevator: Boolean(elevator),
    carryM: Number.isFinite(c) && c > 0 ? Math.min(c, 2000) : 15,
  };
}

/** Per extra person the crew works a bit less efficiently. */
const CREW_EFFICIENCY: Record<number, number> = { 1: 1, 2: 0.88, 3: 0.82, 4: 0.78 };

/** Unloading is quicker than loading: no puzzle to solve, nothing to wedge. */
const UNLOAD_FACTOR = 0.85;
/** Crew walks in, goes through the report with the customer, protects floors and doors, rigs ramp and trolleys. */
const ARRIVE_PICKUP_MIN = 15;
/** Same at the new address: floor protection, ramp, agreeing where things go. */
const ARRIVE_DELIVERY_MIN = 10;
/** Straps, load bars and blankets, once the last item is on board. */
const SECURE_FIXED_MIN = 10;
/** Roughly 10 minutes of rest per 2 hours of heavy work. */
const BREAK_SHARE = 10 / 120;
/** Honest uncertainty: real jobs are more often slower than faster. */
const RANGE_LOW = 0.85;
const RANGE_HIGH = 1.3;

export const CREW_SIZES = [2, 3, 4] as const;

export function estimateMoveTime(items: MoveTimeItem[], options: MoveTimeOptions): MoveTimeResult {
  const crew = clamp(Math.round(options.crew), 1, 4);
  const speed = crew * (CREW_EFFICIENCY[crew] ?? 0.78);
  const outFactor = siteFactor(options.pickup);
  const inFactor = siteFactor(options.delivery);

  const person: Record<"pack" | "dismantle" | "loadOut" | "secure" | "unload" | "reassemble" | "unpack", number> = {
    pack: 0,
    dismantle: 0,
    loadOut: 0,
    secure: 0,
    unload: 0,
    reassemble: 0,
    unpack: 0,
  };
  const perItem: Record<string, number> = {};
  let hasSpecialist = false;
  let counted = 0;

  for (const item of items) {
    if (item.is_included === false) continue;
    // Items marked "discard / give away" don't go in the truck at all.
    if ((item.tags ?? []).includes("discard")) continue;

    const qty = Math.max(1, Number(item.quantity) || 1);
    const m = itemMinutes(item);
    if (m.specialist) hasSpecialist = true;
    counted += 1;

    const pack = options.includePacking ? m.pack * qty : 0;
    const unpack = options.includeUnpacking ? m.pack * 0.6 * qty : 0;
    const dismantle = m.dismantle * qty;
    const loadOut = m.carry * qty * outFactor;
    const secure = m.secure * qty;
    const unload = m.carry * qty * UNLOAD_FACTOR * inFactor;
    const reassemble = m.reassemble * qty;

    person.pack += pack;
    person.unpack += unpack;
    person.dismantle += dismantle;
    person.loadOut += loadOut;
    person.secure += secure;
    person.unload += unload;
    person.reassemble += reassemble;

    perItem[item.id] = (pack + unpack + dismantle + loadOut + secure + unload + reassemble) / speed;
  }

  const empty = counted === 0;
  const w = (minutes: number) => minutes / speed;

  const pickupWork: [PhaseKey, number][] = [
    ["arrive", empty ? 0 : ARRIVE_PICKUP_MIN],
    ["pack", w(person.pack)],
    ["dismantle", w(person.dismantle)],
    ["loadOut", w(person.loadOut)],
    ["secure", empty ? 0 : w(person.secure) + SECURE_FIXED_MIN],
  ];
  const deliveryWork: [PhaseKey, number][] = [
    ["arriveDelivery", empty ? 0 : ARRIVE_DELIVERY_MIN],
    ["unload", w(person.unload)],
    ["reassemble", w(person.reassemble)],
    ["unpack", w(person.unpack)],
  ];
  const sum = (rows: [PhaseKey, number][]) => rows.reduce((acc, [, minutes]) => acc + minutes, 0);
  pickupWork.push(["breaks", sum(pickupWork) * BREAK_SHARE]);
  deliveryWork.push(["breaks", sum(deliveryWork) * BREAK_SHARE]);

  const steps: TimelineStep[] = [];
  for (const [side, rows] of [
    ["pickup", pickupWork],
    ["delivery", deliveryWork],
  ] as const) {
    // The clock restarts at the new address: driving time sits in between.
    let clock = 0;
    for (const [key, minutes] of rows) {
      if (minutes < 1) continue;
      steps.push({ key, side, minutes, startsAt: clock });
      clock += minutes;
    }
  }

  const pickupTotal = sum(pickupWork);
  const deliveryTotal = sum(deliveryWork);
  const total = pickupTotal + deliveryTotal;

  return {
    crew,
    steps,
    pickupTotal,
    deliveryTotal,
    total,
    low: total * RANGE_LOW,
    high: total * RANGE_HIGH,
    perItem,
    hasSpecialist,
  };
}

/** "6 t 30 min" — rounded to the nearest 5 minutes, since anything finer is false precision. */
export function formatDuration(minutes: number, hourLabel: string, minuteLabel: string, step = 5): string {
  const rounded = Math.max(0, Math.round(minutes / step) * step);
  if (rounded === 0) return `0 ${minuteLabel}`;
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (h === 0) return `${m} ${minuteLabel}`;
  if (m === 0) return `${h} ${hourLabel}`;
  return `${h} ${hourLabel} ${m} ${minuteLabel}`;
}
