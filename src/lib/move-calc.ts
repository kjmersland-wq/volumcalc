import { MOVE_DATABASE, type CalcDatabase } from "./move-data";

export type { CalcItem, CalcDatabase } from "./move-data";

/** Quantities per room id and item id. */
export type CalcChoices = Record<string, Record<string, number>>;

export type CalcDetail = { rom: string; id: string; navn: string; antall: number; m3: number; kg: number };

export type CalcResult = {
  nettoM3: number;
  anbefaltM3: number;
  totalKg: number;
  detaljer: CalcDetail[];
};

export const DEFAULT_STOWAGE_FACTOR = 1.25;

/**
 * Sums volume and weight for the chosen quantities. Unknown rooms/items and
 * non-positive or non-numeric quantities are ignored. Values are plain
 * numbers (round only for display). `db` lets the caller add custom
 * rooms/items on top of MOVE_DATABASE.
 */
export function beregn(
  valg: CalcChoices,
  db: CalcDatabase = MOVE_DATABASE,
  stuefaktor = DEFAULT_STOWAGE_FACTOR,
): CalcResult {
  let nettoM3 = 0;
  let totalKg = 0;
  const detaljer: CalcDetail[] = [];

  for (const rom of Object.keys(valg)) {
    for (const id of Object.keys(valg[rom] ?? {})) {
      const antall = Math.floor(Number(valg[rom]?.[id]));
      const gjenstand = db[rom]?.[id];
      if (!gjenstand || !Number.isFinite(antall) || antall <= 0) continue;
      const m3 = antall * gjenstand.m3;
      const kg = antall * gjenstand.kg;
      nettoM3 += m3;
      totalKg += kg;
      detaljer.push({ rom, id, navn: gjenstand.navn, antall, m3, kg });
    }
  }

  return { nettoM3, anbefaltM3: nettoM3 * stuefaktor, totalKg: Math.round(totalKg), detaljer };
}
