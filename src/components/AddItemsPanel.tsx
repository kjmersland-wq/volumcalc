import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Loader2, Plus, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { addEstimateItems, uploadRoomPhoto } from "@/lib/estimates.functions";
import { analyzeRoomPhotos } from "@/lib/analyze-photos.functions";
import { compressImage, blobToDataUrl } from "@/lib/images";
import { roomTemplateForName } from "@/lib/rooms";
import { catalogForRoom, itemDisplayName, roomDisplayName } from "@/lib/volume-database";

type Props = {
  estimateId: string;
  token: string;
  rooms: { id: string; name: string }[];
  lang: string;
  rt: (key: string) => string;
  onAdded: () => void;
};

type Suggestion = { key: string; quantity: number; checked: boolean };

const NO_ROOM = "";

/**
 * "Forgot something?" — add items to an existing report, either by taking a
 * new photo (AI suggests what it sees; you tick what is right) or by typing
 * the item in, optionally starting from the catalogue. Everything lands in the
 * chosen room and the volume, vehicle and time estimates update at once.
 */
export function AddItemsPanel({ estimateId, token, rooms, lang, rt, onAdded }: Props) {
  const upload = useServerFn(uploadRoomPhoto);
  const analyze = useServerFn(analyzeRoomPhotos);
  const addItems = useServerFn(addEstimateItems);
  const fileInput = useRef<HTMLInputElement>(null);

  const [roomId, setRoomId] = useState(NO_ROOM);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [catalogKey, setCatalogKey] = useState("");
  const [form, setForm] = useState({ name: "", qty: "1", l: "", w: "", h: "" });

  const roomName = rooms.find((room) => room.id === roomId)?.name ?? "Other";
  const catalog = useMemo(() => catalogForRoom(roomTemplateForName(roomName)), [roomName]);
  const catalogByKey = useMemo(() => new Map(catalog.map((item) => [item.key, item])), [catalog]);
  const label = (item: { name: string; name_no: string }) => itemDisplayName(item, lang);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const blob = await compressImage(file);
        const dataUrl = await blobToDataUrl(blob);
        const result = await upload({
          data: {
            session_id: estimateId,
            room: roomName,
            mime_type: "image/jpeg",
            data: dataUrl.slice(dataUrl.indexOf(",") + 1),
          },
        });
        setPhotos((prev) => [...prev, result.url]);
      }
      setSuggestions(null);
    } catch (error) {
      console.error("Photo upload failed", error);
      toast.error(rt("add.photoFailed"));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function suggest() {
    if (!photos.length || analyzing) return;
    setAnalyzing(true);
    try {
      const result = await analyze({ data: { room: roomName, photo_urls: photos.slice(0, 10) } });
      if ("error" in result) {
        console.error("Photo analysis failed", result.error);
        toast.error(rt("add.analyzeFailed"));
        return;
      }
      if (!result.suggestions.length) {
        setSuggestions([]);
        toast(rt("add.noneFound"));
        return;
      }
      setSuggestions(result.suggestions.map((s) => ({ key: s.key, quantity: s.quantity, checked: true })));
    } catch (error) {
      console.error("Photo analysis failed", error);
      toast.error(rt("add.analyzeFailed"));
    } finally {
      setAnalyzing(false);
    }
  }

  async function save(
    items: {
      name: string;
      name_no: string;
      category: string;
      quantity: number;
      length_cm: number;
      width_cm: number;
      height_cm: number;
      confidence: number;
    }[],
  ) {
    if (!items.length) return;
    setSaving(true);
    try {
      const photo = photos[0] ?? null;
      await addItems({
        data: {
          id: estimateId,
          token,
          room_id: roomId || null,
          items: items.map((item) => ({ ...item, photo_url: photo })),
        },
      });
      toast.success(rt("add.added"));
      setPhotos([]);
      setSuggestions(null);
      setCatalogKey("");
      setForm({ name: "", qty: "1", l: "", w: "", h: "" });
      onAdded();
    } catch (error) {
      console.error("Add items failed", error);
      toast.error(rt("add.failed"));
    } finally {
      setSaving(false);
    }
  }

  function addSuggested() {
    const chosen = (suggestions ?? []).filter((s) => s.checked && s.quantity > 0);
    void save(
      chosen.flatMap((s) => {
        const item = catalogByKey.get(s.key);
        if (!item) return [];
        return [
          {
            name: item.name,
            name_no: item.name_no,
            category: item.category,
            quantity: s.quantity,
            length_cm: item.length_cm,
            width_cm: item.width_cm,
            height_cm: item.height_cm,
            confidence: 0.8,
          },
        ];
      }),
    );
  }

  function addManual() {
    const name = form.name.trim();
    const quantity = Math.round(Number(form.qty));
    const [l, w, h] = [Number(form.l), Number(form.w), Number(form.h)];
    if (!name || !(quantity >= 1) || !(l > 0) || !(w > 0) || !(h > 0)) {
      toast.error(rt("add.needFields"));
      return;
    }
    const picked = catalogKey ? catalogByKey.get(catalogKey) : undefined;
    void save([
      {
        name: picked && label(picked) === name ? picked.name : name,
        name_no: picked && label(picked) === name ? picked.name_no : name,
        category: picked?.category ?? "other",
        quantity,
        length_cm: l,
        width_cm: w,
        height_cm: h,
        confidence: 1,
      },
    ]);
  }

  function pickCatalog(key: string) {
    setCatalogKey(key);
    const item = catalogByKey.get(key);
    if (!item) return;
    setForm({
      name: label(item),
      qty: form.qty || "1",
      l: String(item.length_cm),
      w: String(item.width_cm),
      h: String(item.height_cm),
    });
  }

  const checkedCount = (suggestions ?? []).filter((s) => s.checked).length;

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
            setSuggestions(null);
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

      {/* New photos */}
      <div className="mt-5">
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="sr-only"
          id="add-photo"
          onChange={(event) => void onFiles(event.target.files)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" disabled={uploading} onClick={() => fileInput.current?.click()}>
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            {rt("add.photo")}
          </Button>
          {photos.length > 0 && (
            <Button size="sm" onClick={() => void suggest()} disabled={analyzing || uploading}>
              {analyzing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {analyzing ? rt("add.analyzing") : rt("add.analyze")}
            </Button>
          )}
        </div>
        {photos.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {photos.map((url, index) => (
              <li key={url} className="relative">
                <img src={url} alt="" className="size-16 rounded-lg border border-border object-cover" />
                <button
                  type="button"
                  aria-label={rt("add.removePhoto")}
                  onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-background p-0.5 shadow ring-1 ring-border"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {suggestions && suggestions.length > 0 && (
          <div className="mt-4 rounded-lg border border-border p-4">
            <p className="text-sm font-medium">{rt("add.suggestions")}</p>
            <ul className="mt-3 space-y-2">
              {suggestions.map((suggestion, index) => {
                const item = catalogByKey.get(suggestion.key);
                if (!item) return null;
                return (
                  <li key={suggestion.key} className="flex items-center gap-3">
                    <Checkbox
                      id={`sg-${suggestion.key}`}
                      checked={suggestion.checked}
                      onCheckedChange={(value) =>
                        setSuggestions((prev) =>
                          (prev ?? []).map((s, i) => (i === index ? { ...s, checked: value === true } : s)),
                        )
                      }
                    />
                    <Label htmlFor={`sg-${suggestion.key}`} className="flex-1 text-sm font-normal">
                      {label(item)}
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      className="h-8 w-20"
                      aria-label={rt("add.qty")}
                      value={suggestion.quantity}
                      onChange={(event) =>
                        setSuggestions((prev) =>
                          (prev ?? []).map((s, i) =>
                            i === index ? { ...s, quantity: Math.max(1, Number(event.target.value) || 1) } : s,
                          ),
                        )
                      }
                    />
                  </li>
                );
              })}
            </ul>
            <Button className="mt-4" size="sm" disabled={saving || checkedCount === 0} onClick={addSuggested}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {rt("add.addSelected")} ({checkedCount})
            </Button>
          </div>
        )}
      </div>

      {/* Manual */}
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
            <div className="flex gap-2">
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
            </div>
          </div>
        </div>
        <Button className="mt-4" size="sm" onClick={addManual} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          {rt("add.add")}
        </Button>
      </div>
    </section>
  );
}
