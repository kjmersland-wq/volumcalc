import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addEstimateItems } from "@/lib/estimates.functions";
import { roomTemplateForName } from "@/lib/rooms";
import { catalogForRoom, itemDisplayName, roomDisplayName } from "@/lib/volume-database";
import { xl } from "@/lib/extra-labels";
import type { Lang } from "@/lib/i18n";

type Props = {
  estimateId: string;
  token: string;
  rooms: { id: string; name: string }[];
  lang: string;
  rt: (key: string) => string;
  onAdded: () => void;
};

const NO_ROOM = "";
const EMPTY_FORM = { name: "", qty: "1", l: "", w: "", h: "", kg: "", notes: "" };

/**
 * "Forgot something?" — add items to an existing report: pick one from the
 * catalogue or type your own with length, width and height. Everything lands
 * in the chosen room and the volume, vehicle and time estimates update at once.
 */
export function AddItemsPanel({ estimateId, token, rooms, lang, rt, onAdded }: Props) {
  const addItems = useServerFn(addEstimateItems);

  const [roomId, setRoomId] = useState(NO_ROOM);
  const [saving, setSaving] = useState(false);
  const [catalogKey, setCatalogKey] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const roomName = rooms.find((room) => room.id === roomId)?.name ?? "Other";
  const catalog = useMemo(() => catalogForRoom(roomTemplateForName(roomName)), [roomName]);
  const catalogByKey = useMemo(() => new Map(catalog.map((item) => [item.key, item])), [catalog]);
  const label = (item: { name: string; name_no: string }) => itemDisplayName(item, lang);

  const l = Number(form.l);
  const w = Number(form.w);
  const h = Number(form.h);
  const qty = Math.round(Number(form.qty));
  const previewM3 = l > 0 && w > 0 && h > 0 && qty >= 1 ? (l * w * h * qty) / 1_000_000 : 0;

  async function addManual() {
    const name = form.name.trim();
    const kg = form.kg.trim() ? Number(form.kg.replace(",", ".")) : null;
    if (!name || !(qty >= 1) || !(l > 0) || !(w > 0) || !(h > 0) || (kg !== null && !(kg >= 0))) {
      toast.error(rt("add.needFields"));
      return;
    }
    const picked = catalogKey ? catalogByKey.get(catalogKey) : undefined;
    const isCatalogItem = Boolean(picked && label(picked) === name);
    setSaving(true);
    try {
      await addItems({
        data: {
          id: estimateId,
          token,
          room_id: roomId || null,
          items: [
            {
              name: isCatalogItem ? picked!.name : name,
              name_no: isCatalogItem ? picked!.name_no : name,
              category: picked?.category ?? "other",
              quantity: qty,
              length_cm: l,
              width_cm: w,
              height_cm: h,
              confidence: 1,
              custom: !isCatalogItem,
              weight_kg: kg,
              notes: form.notes.trim() || null,
            },
          ],
        },
      });
      toast.success(rt("add.added"));
      setCatalogKey("");
      setForm(EMPTY_FORM);
      onAdded();
    } catch (error) {
      console.error("Add items failed", error);
      toast.error(rt("add.failed"));
    } finally {
      setSaving(false);
    }
  }

  function pickCatalog(key: string) {
    setCatalogKey(key);
    const item = catalogByKey.get(key);
    if (!item) return;
    setForm({
      ...form,
      name: label(item),
      qty: form.qty || "1",
      l: String(item.length_cm),
      w: String(item.width_cm),
      h: String(item.height_cm),
    });
  }

  return (
    <section className="no-print mt-8 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Plus className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">{rt("add.title")}</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{rt("add.sub")}</p>

      <div className="mt-4 max-w-xs space-y-1.5">
        <Label htmlFor="add-room">{rt("add.room")}</Label>
        <select
          id="add-room"
          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          value={roomId}
          onChange={(event) => {
            setRoomId(event.target.value);
            setCatalogKey("");
          }}
        >
          <option value={NO_ROOM}>{rt("res.other")}</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {roomDisplayName(room.name, lang)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-sm font-medium">{rt("add.manual")}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="add-catalog">{rt("add.fromCatalog")}</Label>
            <select
              id="add-catalog"
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={catalogKey}
              onChange={(event) => pickCatalog(event.target.value)}
            >
              <option value="">—</option>
              {catalog.map((item) => (
                <option key={item.key} value={item.key}>
                  {label(item)} · {item.length_cm}×{item.width_cm}×{item.height_cm} cm
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-name">{rt("add.name")}</Label>
            <Input
              id="add-name"
              maxLength={120}
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-qty">{rt("add.qty")}</Label>
            <Input
              id="add-qty"
              type="number"
              min={1}
              max={999}
              value={form.qty}
              onChange={(event) => setForm({ ...form, qty: event.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="add-l">{rt("add.dims")}</Label>
            <div className="flex flex-wrap items-center gap-2">
              {(["l", "w", "h"] as const).map((field) => (
                <Input
                  key={field}
                  id={field === "l" ? "add-l" : undefined}
                  type="number"
                  min={1}
                  max={5000}
                  placeholder={field === "l" ? "L" : field === "w" ? "B / W" : "H"}
                  className="w-24"
                  value={form[field]}
                  onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                />
              ))}
              {previewM3 > 0 && (
                <span className="text-sm text-muted-foreground">
                  = {previewM3.toFixed(2)} m³
                </span>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-kg">{xl(lang as Lang, "weightKg")}</Label>
            <Input
              id="add-kg"
              inputMode="decimal"
              value={form.kg}
              onChange={(event) => setForm({ ...form, kg: event.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-notes">{xl(lang as Lang, "notes")}</Label>
            <Input
              id="add-notes"
              maxLength={500}
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
          </div>
        </div>
        <Button className="mt-4" size="sm" onClick={() => void addManual()} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          {rt("add.add")}
        </Button>
      </div>
    </section>
  );
}
