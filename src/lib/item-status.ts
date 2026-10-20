/**
 * Moving / Maybe / Not moving for an estimate item, kept on the existing
 * estimate_items columns so no schema change is needed:
 *   moving      → is_included = true
 *   maybe       → is_included = true  + "maybe" tag (counted in the total, highlighted)
 *   not_moving  → is_included = false (excluded from every volume total)
 * Custom items carry a "custom" tag; a per-unit weight is stored as "kg:<n>".
 */
export type ItemStatus = "moving" | "maybe" | "not_moving";

export const MAYBE_TAG = "maybe";
export const CUSTOM_TAG = "custom";
const WEIGHT_PREFIX = "kg:";

type StatusFields = { is_included?: boolean | null; tags?: string[] | null };

export function itemStatus(item: StatusFields): ItemStatus {
  if (item.is_included === false) return "not_moving";
  return (item.tags ?? []).includes(MAYBE_TAG) ? "maybe" : "moving";
}

/** The is_included/tags patch that puts an item into `status`, keeping its other tags. */
export function statusPatch(item: StatusFields, status: ItemStatus): { is_included: boolean; tags: string[] } {
  const rest = (item.tags ?? []).filter((tag) => tag !== MAYBE_TAG);
  return {
    is_included: status !== "not_moving",
    tags: status === "maybe" ? [...rest, MAYBE_TAG] : rest,
  };
}

/** Tags for a new item: status + custom marker + per-unit weight. */
export function buildItemTags(opts: { status: ItemStatus; custom?: boolean | undefined; weightKg?: number | null | undefined }): string[] {
  const tags: string[] = [];
  if (opts.status === "maybe") tags.push(MAYBE_TAG);
  if (opts.custom) tags.push(CUSTOM_TAG);
  if (opts.weightKg && opts.weightKg > 0) tags.push(`${WEIGHT_PREFIX}${Math.round(opts.weightKg * 100) / 100}`);
  return tags;
}

export function isCustomItem(item: { tags?: string[] | null }): boolean {
  return (item.tags ?? []).includes(CUSTOM_TAG);
}

/** Per-unit weight in kg, if one was entered. */
export function itemWeightKg(item: { tags?: string[] | null }): number | null {
  const tag = (item.tags ?? []).find((value) => value.startsWith(WEIGHT_PREFIX));
  if (!tag) return null;
  const kg = Number(tag.slice(WEIGHT_PREFIX.length));
  return Number.isFinite(kg) && kg > 0 ? kg : null;
}

/** Tags that are bookkeeping, not user-facing labels. */
export function isHiddenTag(tag: string): boolean {
  return tag === MAYBE_TAG || tag === CUSTOM_TAG || tag.startsWith(WEIGHT_PREFIX);
}

/** Volume of `quantity` boxes of l × w × h centimetres, in m³. */
export function dimensionVolumeM3(lengthCm: number, widthCm: number, heightCm: number, quantity = 1): number {
  return (lengthCm * widthCm * heightCm * quantity) / 1_000_000;
}
