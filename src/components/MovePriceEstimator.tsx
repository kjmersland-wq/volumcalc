import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Props = {
  volumeM3: number;
  currency: string;
  rt: (key: string) => string;
  defaults?: { from?: string; to?: string; distanceKm?: number };
  onChange?: (value: { from: string; to: string; distanceKm: number }) => void;
};

/**
 * Rough price range for private customers. Deliberately a span, since the
 * real price depends heavily on distance, access and the mover's schedule.
 */
export function MovePriceEstimator({ volumeM3, currency, rt, defaults, onChange }: Props) {
  const [from, setFrom] = useState(defaults?.from ?? "");
  const [to, setTo] = useState(defaults?.to ?? "");
  const [km, setKm] = useState(defaults?.distanceKm ? String(defaults.distanceKm) : "");
  const [floors, setFloors] = useState("0");
  const [packing, setPacking] = useState(false);

  const distance = Math.max(0, Number(km) || 0);
  const stairFloors = Math.max(0, Number(floors) || 0);

  const mid = useMemo(() => {
    const base = 2500;
    const volume = volumeM3 * 450;
    const travel = distance * 18;
    const stairs = stairFloors * 350;
    const pack = packing ? volumeM3 * 250 : 0;
    return base + volume + travel + stairs + pack;
  }, [volumeM3, distance, stairFloors, packing]);

  const low = Math.round((mid * 0.8) / 100) * 100;
  const high = Math.round((mid * 1.25) / 100) * 100;
  const fmt = (n: number) => `${n.toLocaleString("nb-NO")} ${currency}`;

  function push(next: Partial<{ from: string; to: string; km: string }>) {
    onChange?.({
      from: next.from ?? from,
      to: next.to ?? to,
      distanceKm: Math.max(0, Number(next.km ?? km) || 0),
    });
  }

  return (
    <section className="mt-6 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Calculator className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">{rt("price.title")}</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{rt("price.sub")}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="mv-from">{rt("price.from")}</Label>
          <Input
            id="mv-from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            onBlur={() => push({})}
            placeholder="Kristiansand"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mv-to">{rt("price.to")}</Label>
          <Input
            id="mv-to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            onBlur={() => push({})}
            placeholder="Oslo"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mv-km">{rt("price.km")}</Label>
          <Input
            id="mv-km"
            inputMode="numeric"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            onBlur={() => push({})}
            placeholder="320"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mv-floors">{rt("price.floors")}</Label>
          <Input id="mv-floors" inputMode="numeric" value={floors} onChange={(e) => setFloors(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Switch id="mv-pack" checked={packing} onCheckedChange={setPacking} />
          <Label htmlFor="mv-pack">{rt("price.packing")}</Label>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-primary/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{rt("price.range")}</p>
        <p className="mt-1 text-3xl font-bold text-primary">
          {fmt(low)} – {fmt(high)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{rt("price.disclaimer")}</p>
      </div>
    </section>
  );
}
