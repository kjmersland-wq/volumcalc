import { xl } from "@/lib/extra-labels";
import type { ItemStatus } from "@/lib/item-status";
import type { Lang } from "@/lib/i18n";

export const STATUS_STYLE: Record<ItemStatus, string> = {
  moving: "bg-success/15 text-success",
  maybe: "bg-warning/25 text-warning-foreground",
  not_moving: "bg-destructive/10 text-destructive",
};

const LABEL_KEY = { moving: "moving", maybe: "maybe", not_moving: "notMoving" } as const;

export function statusLabel(status: ItemStatus, lang: Lang) {
  return xl(lang, LABEL_KEY[status]);
}

/** Moving / Maybe / Not moving, one click each. */
export function ItemStatusToggle({
  value,
  onChange,
  label,
  lang = "no",
  className = "",
}: {
  value: ItemStatus;
  onChange: (next: ItemStatus) => void;
  /** Item name, for the accessible group label. */
  label: string;
  lang?: Lang;
  className?: string;
}) {
  const options: ItemStatus[] = ["moving", "maybe", "not_moving"];
  return (
    <div
      role="group"
      aria-label={`${label}: ${statusLabel(value, lang)}`}
      className={`inline-flex rounded-lg border border-border bg-background p-0.5 ${className}`}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            value === option ? STATUS_STYLE[option] : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {statusLabel(option, lang)}
        </button>
      ))}
    </div>
  );
}
