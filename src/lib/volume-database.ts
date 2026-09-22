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
    category: "sport_hobby",
    length_cm: 100,
    width_cm: 55,
    height_cm: 120,
    volume_m3: 0.66,
  },
];

/** This room's own catalog plus the shared cross-room items — the full set
 * offered to the checklist UI and to AI photo analysis for a given room. */
export function catalogForRoom(room: VolumeRoom): VolumeDatabaseItem[] {
  return [...VOLUME_DATABASE[room], ...CROSS_ROOM_ITEMS];
}
