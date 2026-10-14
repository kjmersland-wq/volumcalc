import { useMemo } from "react";
import { Car, Clock, TriangleAlert, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  CREW_SIZES,
  estimateMoveTime,
  formatDuration,
  type MoveTimeItem,
  type SiteAccess,
  type TimelineStep,
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
  /** Whether the estimate appears in the printed/PDF report and the mover e-mail. */
};

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
  const result = useMemo(
    () => estimateMoveTime(items, { crew, pickup, delivery, includePacking, includeUnpacking }),
    [items, crew, pickup, delivery, includePacking, includeUnpacking],
  );
  const comparison = useMemo(
    () =>
      CREW_SIZES.map((size) => ({
        size,
        total: estimateMoveTime(items, {
          crew: size,
          pickup,
          delivery,
          includePacking,
          includeUnpacking,
        }).total,
      })),
    [items, pickup, delivery, includePacking, includeUnpacking],
  );

  if (result.total <= 0) return null;

  const h = rt("mtime.hour");
  const min = rt("mtime.minute");
  const fmt = (minutes: number) => formatDuration(minutes, h, min);

  const pickupSteps = result.steps.filter((step) => step.side === "pickup");
  const deliverySteps = result.steps.filter((step) => step.side === "delivery");

  function renderSteps(steps: TimelineStep[], total: number) {
    return (
      <ol className="mt-3 space-y-3">
        {steps.map((step, index) => (
          <li key={`${step.key}-${step.side}`} className="flex gap-3">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary print:border print:border-current">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span>{rt(`mtime.ph.${step.key}`)}</span>
                <span className="shrink-0 font-medium tabular-nums">{fmt(step.minutes)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted print:border print:border-current">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(3, (step.minutes / total) * 100)}%` }}
                />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {rt("mtime.startAt")} {fmt(step.startsAt)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <section className={cn("mt-6 rounded-xl border border-border bg-card p-6")}>
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
          <div
            className="mt-2 flex flex-wrap gap-2"
            role="radiogroup"
            aria-label={rt("mtime.crew")}
          >
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
          {crew === 2 && (
            <p className="mt-1.5 text-xs text-muted-foreground">{rt("mtime.crew2")}</p>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch
              id="mt-pack"
              checked={includePacking}
              onCheckedChange={onIncludePackingChange}
            />
            <Label htmlFor="mt-pack">{rt("mtime.includePacking")}</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="mt-unpack"
              checked={includeUnpacking}
              onCheckedChange={onIncludeUnpackingChange}
            />
            <Label htmlFor="mt-unpack">{rt("mtime.includeUnpacking")}</Label>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-primary/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {rt("mtime.total")}
        </p>
        <p className="mt-1 text-3xl font-bold text-primary">≈ {fmt(result.total)}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {rt("mtime.range")}: {fmt(result.low)} – {fmt(result.high)}
        </p>
      </div>

      <p className="mt-6 text-sm font-semibold">{rt("mtime.timeline")}</p>

      <div className="mt-3 rounded-lg border border-border p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold">{rt("mtime.pickup")}</p>
          <p className="shrink-0 font-semibold tabular-nums text-primary">
            {fmt(result.pickupTotal)}
          </p>
        </div>
        {renderSteps(pickupSteps, result.pickupTotal)}
      </div>

      <p className="my-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Car className="size-4" />
        {rt("mtime.drive")}
      </p>

      {deliverySteps.length > 0 && (
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold">{rt("mtime.delivery")}</p>
            <p className="shrink-0 font-semibold tabular-nums text-primary">
              {fmt(result.deliveryTotal)}
            </p>
          </div>
          {renderSteps(deliverySteps, result.deliveryTotal)}
        </div>
      )}

      <div className="mt-5 rounded-lg border border-border p-4">
        <p className="text-sm font-semibold">{rt("mtime.compare")}</p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          {comparison.map(({ size, total }) => (
            <div
              key={size}
              className={cn(
                "rounded-md p-2",
                size === crew ? "bg-primary/10 text-primary" : "bg-muted/50",
              )}
            >
              <p className="text-xs text-muted-foreground">
                {size} {rt("mtime.persons")}
              </p>
              <p className="font-semibold tabular-nums">{fmt(total)}</p>
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
