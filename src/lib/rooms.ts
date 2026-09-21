import { VOLUME_DATABASE, type VolumeRoom } from "./volume-database";

export const DEFAULT_ROOM_NAMES_NO = [
  "Stue",
  "Kjøkken",
  "Soverom 1",
  "Soverom 2",
  "Soverom 3",
  "Bad",
  "Garasje",
  "Gang",
  "Kontor",
  "Spisestue",
  "Annet",
];

export const DEFAULT_ROOM_NAMES_EN = [
  "Living room",
  "Kitchen",
  "Bedroom 1",
  "Bedroom 2",
  "Bedroom 3",
  "Bathroom",
  "Garage",
  "Hallway",
  "Office",
  "Dining room",
  "Other",
];

const TEMPLATE_ORDER = Object.keys(VOLUME_DATABASE) as VolumeRoom[];

export function sanitizeRoomNames(value: string[] | string | null | undefined, fallback: string[]) {
  const raw = Array.isArray(value) ? value : String(value ?? "").split(/[\n,;]/);
  const seen = new Set<string>();
  const names = raw
    .map((name) => name.trim().replace(/\s+/g, " "))
    .filter((name) => name.length >= 1 && name.length <= 50)
    .filter((name) => {
      const key = name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 30);

  return names.length ? names : fallback;
}

export function defaultRoomNames(lang: string) {
  return lang === "no" ? DEFAULT_ROOM_NAMES_NO : DEFAULT_ROOM_NAMES_EN;
}

export function roomTemplateForName(name: string): VolumeRoom {
  const normalized = name.toLowerCase();
  if (normalized.includes("kjøkken") || normalized.includes("kitchen")) return "Kitchen";
  if (normalized.includes("bad") || normalized.includes("bath")) return "Bathroom";
  if (normalized.includes("garasje") || normalized.includes("garage")) return "Garage";
  if (normalized.includes("gang") || normalized.includes("hall")) return "Hallway";
  if (normalized.includes("kontor") || normalized.includes("office")) return "Office";
  if (normalized.includes("spise") || normalized.includes("dining")) return "Dining room";
  if (normalized.includes("soverom") || normalized.includes("bedroom")) return "Bedroom";
  if (normalized.includes("stue") || normalized.includes("living")) return "Living room";
  return TEMPLATE_ORDER.includes(name as VolumeRoom) ? (name as VolumeRoom) : "Other";
}

export function localizedTemplateName(room: VolumeRoom, lang: string) {
  const labels: Record<VolumeRoom, { no: string; en: string }> = {
    Office: { no: "Kontor", en: "Office" },
    "Living room": { no: "Stue", en: "Living room" },
    Kitchen: { no: "Kjøkken", en: "Kitchen" },
    Hallway: { no: "Gang", en: "Hallway" },
    Garage: { no: "Garasje", en: "Garage" },
    Bedroom: { no: "Soverom", en: "Bedroom" },
    Bathroom: { no: "Bad", en: "Bathroom" },
    "Dining room": { no: "Spisestue", en: "Dining room" },
    Other: { no: "Annet", en: "Other" },
  };
  return lang === "no" ? labels[room].no : labels[room].en;
}