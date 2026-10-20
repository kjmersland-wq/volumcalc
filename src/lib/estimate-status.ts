/**
 * Pipeline status of an estimate, stored in estimates.status (free text).
 * Older rows use "pending" (= new) and "approved" (= accepted); both still read correctly.
 */
export const ESTIMATE_STATUSES = ["new", "viewed", "quoted", "accepted", "archived"] as const;
export type EstimateStatus = (typeof ESTIMATE_STATUSES)[number];

export function normalizeStatus(raw: string | null | undefined): EstimateStatus {
  switch (raw) {
    case "viewed":
    case "quoted":
    case "accepted":
    case "archived":
      return raw;
    case "approved":
      return "accepted";
    default:
      return "new";
  }
}

export const STATUS_BADGE: Record<EstimateStatus, string> = {
  new: "bg-primary/15 text-primary",
  viewed: "bg-muted text-muted-foreground",
  quoted: "bg-warning/25 text-warning-foreground",
  accepted: "bg-success/15 text-success",
  archived: "bg-muted text-muted-foreground opacity-70",
};
