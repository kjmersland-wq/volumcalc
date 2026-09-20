export const STOWAGE_FACTOR = 1.25;

export function recommendedVolume(netVolume: number) {
  return Math.round(netVolume * STOWAGE_FACTOR * 100) / 100;
}

export type VehicleKey = "rep.truck.van" | "rep.truck.small" | "rep.truck.medium" | "rep.truck.large";

export function recommendVehicle(grossVolume: number): VehicleKey {
  if (grossVolume <= 8) return "rep.truck.van";
  if (grossVolume <= 20) return "rep.truck.small";
  if (grossVolume <= 45) return "rep.truck.medium";
  return "rep.truck.large";
}

/** Rough storage unit size in m², assuming ~2.4 m stacking height. */
export function storageUnitM2(grossVolume: number) {
  return Math.max(2, Math.ceil(grossVolume / 2.4));
}
