import { EXTRA_ROOMS, extraItemName, type ExtraLang, type RoomKey } from "./catalog-i18n";

export type VolumeRoom =
  | "Office"
  | "Living room"
  | "Hallway"
  | "Garage"
  | "Bedroom"
  | "Kitchen"
  | "Bathroom"
  | "Dining room"
  | "Other";

export type VolumeDatabaseItem = {
  key: string;
  name: string;
  name_no: string;
  name_pl: string;
  category: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  volume_m3: number;
};

export const USER_VERIFIED_SECURITY_LABEL = "100% (Brukerverifisert)";

export const VOLUME_DATABASE: Record<VolumeRoom, VolumeDatabaseItem[]> = {
  Office: [
    {
      key: "office-chair-high-back",
      name: "High-back office chair",
      name_no: "Kontorstol med høy rygg",
      name_pl: "Krzesło biurowe z wysokim oparciem",
      category: "office",
      length_cm: 70,
      width_cm: 70,
      height_cm: 125,
      volume_m3: 0.61,
    },
    {
      key: "small-computer-desk",
      name: "Small computer desk",
      name_no: "Lite databord",
      name_pl: "Małe biurko komputerowe",
      category: "office",
      length_cm: 110,
      width_cm: 60,
      height_cm: 75,
      volume_m3: 0.5,
    },
    {
      key: "electric-guitar",
      name: "Electric guitar",
      name_no: "Elektrisk gitar",
      name_pl: "Gitara elektryczna",
      category: "office",
      length_cm: 100,
      width_cm: 30,
      height_cm: 60,
      volume_m3: 0.18,
    },
  ],
  "Living room": [
    {
      key: "corner-sofa",
      name: "Corner sofa",
      name_no: "Hjørnesofa",
      name_pl: "Sofa narożna",
      category: "living_room",
      length_cm: 440,
      width_cm: 100,
      height_cm: 90,
      volume_m3: 3.96,
    },
    {
      key: "antique-armchair",
      name: "Antique armchair",
      name_no: "Antikk lenestol",
      name_pl: "Antyczny fotel",
      category: "living_room",
      length_cm: 130,
      width_cm: 70,
      height_cm: 100,
      volume_m3: 0.91,
    },
    {
      key: "coffee-table",
      name: "Coffee table",
      name_no: "Salongbord",
      name_pl: "Stolik kawowy",
      category: "living_room",
      length_cm: 130,
      width_cm: 100,
      height_cm: 50,
      volume_m3: 0.65,
    },
    {
      key: "large-tv",
      name: "Large TV",
      name_no: "Stor TV",
      name_pl: "Duży telewizor",
      category: "living_room",
      length_cm: 145,
      width_cm: 20,
      height_cm: 100,
      volume_m3: 0.29,
    },
  ],
  Kitchen: [
    {
      key: "kitchen-table",
      name: "Kitchen table",
      name_no: "Kjøkkenbord",
      name_pl: "Stół kuchenny",
      category: "kitchen",
      length_cm: 120,
      width_cm: 80,
      height_cm: 75,
      volume_m3: 0.72,
    },
    {
      key: "kitchen-chair",
      name: "Kitchen chair",
      name_no: "Kjøkkenstol",
      name_pl: "Krzesło kuchenne",
      category: "kitchen",
      length_cm: 45,
      width_cm: 50,
      height_cm: 90,
      volume_m3: 0.2,
    },
    {
      key: "microwave",
      name: "Microwave",
      name_no: "Mikrobølgeovn",
      name_pl: "Mikrofalówka",
      category: "kitchen",
      length_cm: 55,
      width_cm: 45,
      height_cm: 35,
      volume_m3: 0.09,
    },
    {
      key: "kitchen-box",
      name: "Kitchen box",
      name_no: "Kjøkkeneske",
      name_pl: "Karton z kuchni",
      category: "kitchen",
      length_cm: 55,
      width_cm: 40,
      height_cm: 50,
      volume_m3: 0.11,
    },
  ],
  Hallway: [
    {
      key: "white-dresser",
      name: "White dresser",
      name_no: "Hvit kommode",
      name_pl: "Biała komoda",
      category: "hallway",
      length_cm: 95,
      width_cm: 55,
      height_cm: 90,
      volume_m3: 0.47,
    },
    {
      key: "free-standing-coat-rack",
      name: "Freestanding coat rack",
      name_no: "Frittstående stumtjener",
      name_pl: "Wolnostojący wieszak",
      category: "hallway",
      length_cm: 60,
      width_cm: 60,
      height_cm: 100,
      volume_m3: 0.36,
    },
    {
      key: "filled-cardboard-box",
      name: "Filled cardboard box",
      name_no: "Fylt pappeske",
      name_pl: "Pełny karton",
      category: "hallway",
      length_cm: 55,
      width_cm: 40,
      height_cm: 50,
      volume_m3: 0.11,
    },
  ],
  Garage: [
    {
      key: "bedding-bags",
      name: "Bedding in bags",
      name_no: "Sengetøy i poser",
      name_pl: "Pościel w workach",
      category: "garage",
      length_cm: 110,
      width_cm: 80,
      height_cm: 83,
      volume_m3: 0.73,
    },
    {
      key: "moving-box",
      name: "Moving box",
      name_no: "Flytteeske",
      name_pl: "Karton do przeprowadzki",
      category: "garage",
      length_cm: 95,
      width_cm: 70,
      height_cm: 80,
      volume_m3: 0.53,
    },
    {
      key: "car-wheel",
      name: "Car wheel",
      name_no: "Bilhjul",
      name_pl: "Koło samochodowe",
      category: "garage",
      length_cm: 70,
      width_cm: 70,
      height_cm: 80,
      volume_m3: 0.39,
    },
  ],
  Bedroom: [
    {
      key: "double-frame-bed",
      name: "Double frame bed",
      name_no: "Dobbel rammeseng",
      name_pl: "Łóżko podwójne z ramą",
      category: "bedroom",
      length_cm: 180,
      width_cm: 200,
      height_cm: 60,
      volume_m3: 2.16,
    },
    {
      key: "wide-dresser",
      name: "Wide dresser",
      name_no: "Bred kommode",
      name_pl: "Szeroka komoda",
      category: "bedroom",
      length_cm: 170,
      width_cm: 80,
      height_cm: 50,
      volume_m3: 0.68,
    },
  ],
  Bathroom: [
    {
      key: "bathroom-cabinet",
      name: "Bathroom cabinet",
      name_no: "Baderomsskap",
      name_pl: "Szafka łazienkowa",
      category: "bathroom",
      length_cm: 60,
      width_cm: 35,
      height_cm: 80,
      volume_m3: 0.17,
    },
    {
      key: "laundry-basket",
      name: "Laundry basket",
      name_no: "Skittentøyskurv",
      name_pl: "Kosz na pranie",
      category: "bathroom",
      length_cm: 45,
      width_cm: 45,
      height_cm: 65,
      volume_m3: 0.13,
    },
    {
      key: "bathroom-box",
      name: "Bathroom box",
      name_no: "Baderomseske",
      name_pl: "Karton z łazienki",
      category: "bathroom",
      length_cm: 45,
      width_cm: 35,
      height_cm: 35,
      volume_m3: 0.06,
    },
  ],
  "Dining room": [
    {
      key: "dining-table",
      name: "Dining table",
      name_no: "Spisebord",
      name_pl: "Stół jadalniany",
      category: "dining_room",
      length_cm: 200,
      width_cm: 95,
      height_cm: 75,
      volume_m3: 1.43,
    },
    {
      key: "dining-chair",
      name: "Dining chair",
      name_no: "Spisestol",
      name_pl: "Krzesło jadalniane",
      category: "dining_room",
      length_cm: 50,
      width_cm: 55,
      height_cm: 95,
      volume_m3: 0.26,
    },
    {
      key: "sideboard",
      name: "Sideboard",
      name_no: "Skjenk",
      name_pl: "Kredens",
      category: "dining_room",
      length_cm: 160,
      width_cm: 45,
      height_cm: 85,
      volume_m3: 0.61,
    },
  ],
  Other: [
    {
      key: "moving-box-other",
      name: "Moving box",
      name_no: "Flytteeske",
      name_pl: "Karton do przeprowadzki",
      category: "other",
      length_cm: 55,
      width_cm: 40,
      height_cm: 50,
      volume_m3: 0.11,
    },
    {
      key: "medium-shelf",
      name: "Medium shelf",
      name_no: "Middels hylle",
      name_pl: "Średnia półka",
      category: "other",
      length_cm: 80,
      width_cm: 35,
      height_cm: 180,
      volume_m3: 0.5,
    },
    {
      key: "miscellaneous-bag",
      name: "Bag / soft goods",
      name_no: "Bag / myke ting",
      name_pl: "Torba / miękkie rzeczy",
      category: "other",
      length_cm: 70,
      width_cm: 40,
      height_cm: 35,
      volume_m3: 0.1,
    },
  ],
};

/**
 * Common items that don't belong to one specific room (electronics,
 * instruments, sport/hobby gear) — offered alongside every room's own
 * catalog via catalogForRoom(), not instead of it. Kept as a separate list
 * (rather than duplicated into each room) so it's a single place to extend.
 */
export const CROSS_ROOM_ITEMS: VolumeDatabaseItem[] = [
  // Electronics
  {
    key: "desktop-pc-tower",
    name: "Desktop PC tower",
    name_no: "PC-kabinett (tårn)",
    name_pl: "Komputer stacjonarny (obudowa)",
    category: "electronics",
    length_cm: 45,
    width_cm: 20,
    height_cm: 45,
    volume_m3: 0.04,
  },
  {
    key: "computer-monitor",
    name: "Computer monitor",
    name_no: "Dataskjerm",
    name_pl: "Monitor komputerowy",
    category: "electronics",
    length_cm: 60,
    width_cm: 20,
    height_cm: 40,
    volume_m3: 0.05,
  },
  {
    key: "home-printer",
    name: "Home printer",
    name_no: "Hjemmeskriver",
    name_pl: "Drukarka domowa",
    category: "electronics",
    length_cm: 45,
    width_cm: 35,
    height_cm: 20,
    volume_m3: 0.03,
  },
  {
    key: "floor-speaker",
    name: "Floor-standing speaker",
    name_no: "Gulvhøyttaler",
    name_pl: "Głośnik podłogowy",
    category: "electronics",
    length_cm: 25,
    width_cm: 30,
    height_cm: 90,
    volume_m3: 0.07,
  },
  // Musical instruments
  {
    key: "musical-instrument-case",
    name: "Guitar / instrument case",
    name_no: "Gitar-/instrumentkoffert",
    name_pl: "Futerał na gitarę / instrument",
    category: "instrument",
    length_cm: 104,
    width_cm: 35,
    height_cm: 12,
    volume_m3: 0.04,
  },
  {
    key: "keyboard-piano",
    name: "Digital keyboard / piano",
    name_no: "Keyboard / digitalt piano",
    name_pl: "Keyboard / pianino cyfrowe",
    category: "instrument",
    length_cm: 130,
    width_cm: 35,
    height_cm: 15,
    volume_m3: 0.07,
  },
  {
    key: "guitar-amplifier",
    name: "Guitar amplifier",
    name_no: "Gitarforsterker",
    name_pl: "Wzmacniacz gitarowy",
    category: "instrument",
    length_cm: 50,
    width_cm: 25,
    height_cm: 45,
    volume_m3: 0.06,
  },
  {
    key: "drum-kit-boxed",
    name: "Drum kit (packed)",
    name_no: "Trommesett (pakket)",
    name_pl: "Zestaw perkusyjny (spakowany)",
    category: "instrument",
    length_cm: 100,
    width_cm: 100,
    height_cm: 60,
    volume_m3: 0.6,
  },
  // Sport / hobby
  {
    key: "bicycle",
    name: "Bicycle",
    name_no: "Sykkel",
    name_pl: "Rower",
    category: "sport_hobby",
    length_cm: 170,
    width_cm: 40,
    height_cm: 100,
    volume_m3: 0.68,
  },
  {
    key: "ski-set-bag",
    name: "Skis + poles (bag)",
    name_no: "Ski + staver (bag)",
    name_pl: "Narty + kijki (pokrowiec)",
    category: "sport_hobby",
    length_cm: 180,
    width_cm: 25,
    height_cm: 15,
    volume_m3: 0.07,
  },
  {
    key: "golf-bag",
    name: "Golf bag with clubs",
    name_no: "Golfbag med køller",
    name_pl: "Torba golfowa z kijami",
    category: "sport_hobby",
    length_cm: 130,
    width_cm: 35,
    height_cm: 35,
    volume_m3: 0.16,
  },
  {
    key: "exercise-bike",
    name: "Exercise bike",
    name_no: "Ergometersykkel",
    name_pl: "Rower treningowy",
    category: "sport_hobby",
    length_cm: 100,
    width_cm: 55,
    height_cm: 120,
    volume_m3: 0.66,
  },
];

/** This room's own catalog plus the shared cross-room items — the full set
 * offered to the checklist UI for a given room. */
export function catalogForRoom(room: VolumeRoom): VolumeDatabaseItem[] {
  return [...VOLUME_DATABASE[room], ...CROSS_ROOM_ITEMS];
}

const ITEM_INDEX = new Map<string, VolumeDatabaseItem>();
for (const item of [...Object.values(VOLUME_DATABASE).flat(), ...CROSS_ROOM_ITEMS]) {
  ITEM_INDEX.set(item.name.trim().toLowerCase(), item);
  ITEM_INDEX.set(item.name_no.trim().toLowerCase(), item);
  ITEM_INDEX.set(item.name_pl.trim().toLowerCase(), item);
}

type NamedItem = { name: string; name_no?: string | null };

const isExtraLang = (lang: string): lang is ExtraLang => lang in EXTRA_ROOMS;

/**
 * Display name of an item in the report language. Stored rows only carry
 * name (en) and name_no, so other languages are resolved by matching against
 * the catalog; custom names fall back to the stored text.
 */
export function itemDisplayName(item: NamedItem, lang: string): string {
  if (lang === "no") return item.name_no || item.name;
  if (lang === "pl" || isExtraLang(lang)) {
    const hit =
      ITEM_INDEX.get(item.name.trim().toLowerCase()) ??
      (item.name_no ? ITEM_INDEX.get(item.name_no.trim().toLowerCase()) : undefined);
    if (!hit) return item.name;
    return lang === "pl" ? hit.name_pl : (extraItemName(hit.name, lang) ?? item.name);
  }
  return item.name;
}

type RoomTable = Record<RoomKey | "basement", string>;

const ROOM_NAMES: Record<string, RoomTable> = {
  en: { "Living room": "Living room", Bedroom: "Bedroom", Kitchen: "Kitchen", Hallway: "Hallway", Garage: "Garage", Office: "Office", "Dining room": "Dining room", Bathroom: "Bathroom", Other: "Other", basement: "basement" },
  no: { "Living room": "Stue", Bedroom: "Soverom", Kitchen: "Kjøkken", Hallway: "Gang", Garage: "Garasje", Office: "Kontor", "Dining room": "Spisestue", Bathroom: "Bad", Other: "Annet", basement: "kjeller" },
  pl: { "Living room": "Salon", Bedroom: "Sypialnia", Kitchen: "Kuchnia", Hallway: "Przedpokój", Garage: "Garaż", Office: "Biuro", "Dining room": "Jadalnia", Bathroom: "Łazienka", Other: "Inne", basement: "piwnica" },
  ...EXTRA_ROOMS,
};

// Extra spellings people store (definite forms, synonyms) -> canonical room.
const ROOM_ALIASES: [string, RoomKey][] = [
  ["stua", "Living room"], ["stuen", "Living room"], ["oppholdsrom", "Living room"], ["livingroom", "Living room"],
  ["sovrom", "Bedroom"], ["bedrooms", "Bedroom"], ["kjøkkenet", "Kitchen"], ["hall", "Hallway"], ["entre", "Hallway"],
  ["entré", "Hallway"], ["garasjen", "Garage"], ["arbeidsrom", "Office"], ["spisestua", "Dining room"],
  ["baderom", "Bathroom"], ["toalett", "Bathroom"], ["bathrooms", "Bathroom"], ["andre", "Other"],
];

const ROOM_CANDIDATES: { text: string; room: RoomKey }[] = (() => {
  const list: { text: string; room: RoomKey }[] = ROOM_ALIASES.map(([text, room]) => ({ text, room }));
  for (const table of Object.values(ROOM_NAMES)) {
    for (const [room, text] of Object.entries(table)) {
      if (room !== "basement") list.push({ text: text.toLowerCase(), room: room as RoomKey });
    }
  }
  return list.sort((a, b) => b.text.length - a.text.length);
})();

const BASEMENT_WORDS = new Set(Object.values(ROOM_NAMES).map((t) => t.basement.toLowerCase()).concat("cellar"));

/**
 * Translate a stored room name for display. A trailing detail ("Soverom 1",
 * "Kontor – kjeller") is kept; unknown names are returned unchanged.
 */
export function roomDisplayName(raw: string, lang: string): string {
  const table: RoomTable = ROOM_NAMES[lang] ?? ROOM_NAMES["en"]!;
  const name = raw.trim();
  const lower = name.toLowerCase();
  for (const { text, room } of ROOM_CANDIDATES) {
    if (!lower.startsWith(text)) continue;
    const rest = name.slice(text.length);
    if (rest && /^\p{L}/u.test(rest)) continue; // part of a longer word
    const tail = rest.replace(/\p{L}+/gu, (w) => (BASEMENT_WORDS.has(w.toLowerCase()) ? table.basement : w));
    return table[room] + tail;
  }
  return name;
}
