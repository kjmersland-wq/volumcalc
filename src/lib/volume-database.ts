export type VolumeRoom = "Office" | "Living room" | "Hallway" | "Garage" | "Bedroom";

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

export const USER_VERIFIED_CONFIDENCE = 1;
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
};

