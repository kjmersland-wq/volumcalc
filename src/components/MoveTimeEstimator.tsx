import { useMemo } from "react";
import { Clock, TriangleAlert, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  CREW_SIZES,
  estimateMoveTime,
  formatDuration,
  type MoveTimeItem,
  type PhaseKey,
  type SiteAccess,
} from "@/lib/move-time";

type Props = {
  items: MoveTimeItem[];
  pickup: SiteAccess;
  delivery: SiteAccess;
  rt: (key: string) => string;
  crew: number;
  onCrewChange: (crew: number) => void;
  includePacking: boolean;
  includeUnpacking: boolean;
  onIncludePackingChange: (value: boolean) => void;
  onIncludeUnpackingChange: (value: boolean) => void;
};

const PHASE_ORDER: PhaseKey[] = [
  "pack",
  "dismantle",
  "setup",
  "loadOut",
  "secure",
  "unload",
  "reassemble",
  "breaks",
  "unpack",
];

export function MoveTimeEstimator({
  items,
  pickup,
  delivery,
  rt,
  crew,
  onCrewChange,
  includePacking,
  includeUnpacking,
  onIncludePackingChange,
  onIncludeUnpackingChange,
}: Props) {
  const options = { crew, pickup, delivery, includePacking, includeUnpacking };
  const result = useMemo(
    () => estimateMoveTime(items, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, crew, pickup.floor, pickup.elevator, pickup.carryM, delivery.floor, delivery.elevator, delivery.carryM, includePacking, includeUnpacking],
  );
  const comparison = useMemo(
    () =>
      CREW_SIZES.map((size) => ({
        size,
        moveDay: estimateMoveTime(items, { ...options, crew: size }).moveDay,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, pickup.floor, pickup.elevator, pickup.carryM, delivery.floor, delivery.elevator, delivery.carryM, includePacking, includeUnpacking],
  );

  if (result.total <= 0) return null;

  const h = rt("mtime.hour");
  const min = rt("mtime.minute");
  const fmt = (minutes: number) => formatDuration(minutes, h, min);
  const rows = PHASE_ORDER.filter((key) => result.phases[key] >= 1);
  const largest = Math.max(...rows.map((key) => result.phases[key]));

  return (
    <section className="mt-6 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Clock className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">{rt("mtime.title")}</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{rt("mtime.sub")}</p>

      <div className="no-print mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <Users className="size-4 text-muted-foreground" />
            {rt("mtime.crew")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={rt("mtime.crew")}>
            {CREW_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                role="radio"
                aria-checked={crew === size}
                onClick={() => onCrewChange(size)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  crew === size
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {size} {rt("mtime.persons")}
              </button>
            ))}
          </div>
          {crew === 2 && <p className="mt-1.5 text-xs text-muted-foreground">{rt("mtime.crew2")}</p>}
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch id="mt-pack" checked={includePacking} onCheckedChange={onIncludePackingChange} />
            <Label htmlFor="mt-pack">{rt("mtime.includePacking")}</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="mt-unpack" checked={includeUnpacking} onCheckedChange={onIncludeUnpackingChange} />
            <Label htmlFor="mt-unpack">{rt("mtime.includeUnpacking")}</Label>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-primary/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{rt("mtime.total")}</p>
        <p className="mt-1 text-3xl font-bold text-primary">≈ {fmt(result.total)}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {rt("mtime.range")}: {fmt(result.low)} – {fmt(result.high)}
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          {(
            [
              ["mtime.beforeMove", result.beforeMove],
              ["mtime.moveDay", result.moveDay],
              ["mtime.afterMove", result.afterMove],
            ] as const
          )
            .filter(([, minutes]) => minutes >= 1)
            .map(([key, minutes]) => (
              <div key={key} className="rounded-lg bg-background/70 p-3">
                <dt className="text-xs text-muted-foreground">{rt(key)}</dt>
                <dd className="mt-0.5 text-lg font-semibold">{fmt(minutes)}</dd>
              </div>
            ))}
        </dl>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold">{rt("mtime.breakdown")}</p>
        <ul className="mt-2 space-y-2.5">
          {rows.map((key) => (
            <li key={key}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span>{rt(`mtime.ph.${key}`)}</span>
                <span className="shrink-0 font-medium tabular-nums">{fmt(result.phases[key])}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted print:border print:border-current">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(3, (result.phases[key] / largest) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 rounded-lg border border-border p-4">
        <p className="text-sm font-semibold">{rt("mtime.compare")}</p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          {comparison.map(({ size, moveDay }) => (
            <div
              key={size}
              className={cn("rounded-md p-2", size === crew ? "bg-primary/10 text-primary" : "bg-muted/50")}
            >
              <p className="text-xs text-muted-foreground">
                {size} {rt("mtime.persons")}
              </p>
              <p className="font-semibold tabular-nums">{fmt(moveDay)}</p>
            </div>
          ))}
        </div>
      </div>

      {result.hasSpecialist && (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-warning/20 p-3 text-sm text-warning-foreground">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {rt("mtime.specialist")}
        </p>
      )}

      <p className="mt-4 text-xs text-muted-foreground">{rt("mtime.disclaimer")}</p>
    </section>
  );
}
