import { USER_VERIFIED_SECURITY_LABEL } from "./volume-database";

const USER_VERIFIED_CONFIDENCE = 1;

export type DetectedItem = {
  name: string;
  name_no: string;
  category: string;
  quantity: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  volume_m3: number;
  confidence: number;
  photo_index: number;
  room: string;
};

export type ManualItemInput = {
  name: string;
  name_no: string;
  category: string;
  quantity: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  volume_m3: number;
  room: string;
  security_label: string;
};

function normalizeManualItem(item: ManualItemInput): DetectedItem | null {
  const quantity = Math.max(0, Math.round(Number(item.quantity) || 0));
  if (!quantity) return null;

  const length = Math.max(0, Number(item.length_cm) || 0);
  const width = Math.max(0, Number(item.width_cm) || 0);
  const height = Math.max(0, Number(item.height_cm) || 0);
  const dimensionVolume = (length * width * height) / 1_000_000;
  const baseVolume =
    dimensionVolume > 0 ? dimensionVolume : Math.max(0, Number(item.volume_m3) || 0);
  const volume = Math.round(baseVolume * quantity * 100) / 100;
  if (!volume) return null;

  return {
    name: String(item.name || "Item").slice(0, 120),
    name_no: String(item.name_no || item.name || "Gjenstand").slice(0, 120),
    category: String(item.category || "other").slice(0, 80),
    quantity,
    length_cm: length,
    width_cm: width,
    height_cm: height,
    volume_m3: volume,
    confidence:
      item.security_label === USER_VERIFIED_SECURITY_LABEL ? USER_VERIFIED_CONFIDENCE : 0.7,
    photo_index: 0,
    room: String(item.room || "Other"),
  };
}

export function analyzeManualItems(items: ManualItemInput[]): {
  items: DetectedItem[];
  total: number;
} {
  const parsed = items.map(normalizeManualItem).filter(Boolean) as DetectedItem[];
  const total = Math.round(parsed.reduce((sum, item) => sum + item.volume_m3, 0) * 100) / 100;
  return { items: parsed, total };
}
