import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Info, Loader2, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { createEstimate, uploadRoomPhoto } from "@/lib/estimates.functions";
import { analyzeRoomPhotos } from "@/lib/analyze-photos.functions";
import { getCompanyByUploadToken } from "@/lib/admin.functions";
import {
  USER_VERIFIED_SECURITY_LABEL,
  VOLUME_DATABASE,
  CROSS_ROOM_ITEMS,
  catalogForRoom,
  type VolumeDatabaseItem,
} from "@/lib/volume-database";
import { recommendedVolume } from "@/lib/volume";
import { useAuth } from "@/hooks/useAuth";
import { useCompany, useUnlimitedPhotos } from "@/hooks/useCompany";
import { defaultRoomNames, roomTemplateForName, sanitizeRoomNames } from "@/lib/rooms";

export const Route = createFileRoute("/upload")({
  staticData: { sitemap: true },
  validateSearch: (search: Record<string, unknown>): { c?: string; k?: string } => {
    const c = search["c"];
    const k = search["k"];
    return {
      ...(typeof c === "string" && c ? { c } : {}),
      ...(typeof k === "string" && k ? { k } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Room photo checklist — VolumCalc" },
      {
        name: "description",
        content:
          "Photograph each room at your own pace, then complete a calm, friendly checklist for a clear cubic metre estimate.",
      },
      { property: "og:title", content: "Room photo checklist — VolumCalc" },
      {
        property: "og:description",
        content:
          "Photograph your rooms, confirm your checklist, and get a tidy moving volume report without the stress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/upload" }],
  }),
  component: UploadPage,
});

type Stage = "idle" | "saving";
type QuantityByRoom = Record<string, Record<string, number>>;

function createInitialQuantities(roomNames: string[]): QuantityByRoom {
  return roomNames.reduce(
    (acc, room) => ({
      ...acc,
      [room]: catalogForRoom(roomTemplateForName(room)).reduce(
        (items, item) => ({ ...items, [item.key]: 0 }),
        {} as Record<string, number>,
      ),
    }),
    {} as QuantityByRoom,
  );
}

function syncRoomQuantities(prev: QuantityByRoom, roomNames: string[]): QuantityByRoom {
  return roomNames.reduce((next, room) => {
    const existing = prev[room] ?? {};
    next[room] = catalogForRoom(roomTemplateForName(room)).reduce(
      (items, item) => ({ ...items, [item.key]: existing[item.key] ?? 0 }),
      {} as Record<string, number>,
    );
    return next;
  }, {} as QuantityByRoom);
}

function firstRoomName(roomNames: string[]) {
  return roomNames[0] ?? "Living room";
}

// Keeps each photo's base64 payload under the server's cap (see estimates.functions.ts).
const MAX_PHOTO_BASE64_CHARS = 10_000_000;

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the photo"));
    reader.readAsDataURL(blob);
  });
}

function UploadPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const submitEstimate = useServerFn(createEstimate);
  const uploadPhoto = useServerFn(uploadRoomPhoto);
  const analyzePhotos = useServerFn(analyzeRoomPhotos);
  const { c: companyId, k: companyToken } = Route.useSearch();
  const { session } = useAuth();
  const { data: ownCompany } = useCompany();
  const brandingFn = useServerFn(getCompanyByUploadToken);
  // Groups every photo captured in this visit under one storage path prefix;
  // no estimate id exists yet at capture time. Lazily created on first upload.
  const sessionIdRef = useRef<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { data: branding } = useQuery({
    queryKey: ["upload-branding", companyToken],
    enabled: Boolean(companyToken),
    queryFn: () => {
      if (!companyToken) throw new Error("Missing upload token");
      return brandingFn({ data: { token: companyToken } });
    },
  });

  const linkedRoomNames = (branding as { room_names?: string[] } | null | undefined)?.room_names;
  const baseRoomNames = useMemo(
    () => sanitizeRoomNames(linkedRoomNames ?? ownCompany?.room_names, defaultRoomNames(lang)),
    [linkedRoomNames, ownCompany?.room_names, lang],
  );

  const [customRooms, setCustomRooms] = useState<string[] | null>(null);
  const roomNames = customRooms ?? baseRoomNames;

  const [selectedRoom, setSelectedRoom] = useState<string>(() => firstRoomName(defaultRoomNames("en")));
  const [roomPhotos, setRoomPhotos] = useState<Record<string, { url: string }[]>>({});
  const [analyzingPhotos, setAnalyzingPhotos] = useState(false);
  const [editingRooms, setEditingRooms] = useState(false);
  const [newRoom, setNewRoom] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [quantities, setQuantities] = useState<QuantityByRoom>(() =>
    createInitialQuantities(defaultRoomNames("en")),
  );
  const [form, setForm] = useState({ name: "", phone: "", date: "", address: "" });
  const busy = stage !== "idle";

  const unlimitedAccount = useUnlimitedPhotos();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("volumcalc.rooms");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) setCustomRooms(sanitizeRoomNames(parsed, parsed));
      }
    } catch {
      /* ignore unreadable storage */
    }
  }, []);

  useEffect(() => {
    setSelectedRoom((current) => (roomNames.includes(current) ? current : firstRoomName(roomNames)));
    setQuantities((current) => syncRoomQuantities(current, roomNames));
  }, [roomNames]);

  function persistRooms(next: string[]) {
    setCustomRooms(next);
    try {
      window.localStorage.setItem("volumcalc.rooms", JSON.stringify(next));
    } catch {
      /* ignore unwritable storage */
    }
  }

  function addRoom() {
    const name = newRoom.trim();
    if (!name) return;
    if (roomNames.some((room) => room.toLowerCase() === name.toLowerCase())) {
      toast.error(t("upload.roomExists"));
      return;
    }
    persistRooms([...roomNames, name]);
    setNewRoom("");
    setSelectedRoom(name);
    toast.success(t("upload.roomAdded"));
  }

  function renameRoom(index: number, value: string) {
    const next = roomNames.map((room, i) => (i === index ? value : room));
    persistRooms(next);
    setSelectedRoom((current) => (current === roomNames[index] ? value || current : current));
  }

  function removeRoom(index: number) {
    if (roomNames.length <= 1) {
      toast.error(t("upload.roomLast"));
      return;
    }
    persistRooms(roomNames.filter((_, i) => i !== index));
    toast.success(t("upload.roomRemoved"));
  }

  function resetRooms() {
    setCustomRooms(null);
    try {
      window.localStorage.removeItem("volumcalc.rooms");
    } catch {
      /* ignore */
    }
  }

  /** Handles the photo <input>'s onChange — one or more files picked via camera or gallery. */
  function handlePhotoFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = ""; // allow picking the same file again later
    const room = selectedRoom;
    for (const file of files) {
      void uploadRoomPhotoFile(room, file);
    }
  }

  /** Uploads one picked photo right away, so it isn't lost if the visitor never submits the form. */
  async function uploadRoomPhotoFile(room: string, file: File) {
    try {
      const base64 = await blobToBase64(file);
      if (base64.length > MAX_PHOTO_BASE64_CHARS) {
        toast.error(t("upload.photoTooLarge"));
        return;
      }
      if (!sessionIdRef.current) sessionIdRef.current = crypto.randomUUID();
      const result = await uploadPhoto({
        data: {
          session_id: sessionIdRef.current,
          room,
          mime_type: file.type || "image/jpeg",
          data: base64,
        },
      });
      setRoomPhotos((prev) => ({
        ...prev,
        [room]: [...(prev[room] ?? []), { url: result.url }],
      }));
      toast.success(`${t("upload.savedToRoom")} ${room}`);
    } catch (error) {
      console.error("Room photo upload failed", room, error);
      toast.error(t("upload.photoSaveFailed"));
    }
  }

  function removeRoomPhoto(room: string, index: number) {
    setRoomPhotos((prev) => ({
      ...prev,
      [room]: (prev[room] ?? []).filter((_, i) => i !== index),
    }));
  }

  /** Suggests quantities from this room's photos and pre-fills only the items
   * the visitor hasn't already set themselves — never overwrites their input. */
  async function analyzePhotosForRoom(room: string) {
    const photos = roomPhotos[room] ?? [];
    if (photos.length === 0 || analyzingPhotos) return;
    setAnalyzingPhotos(true);
    try {
      const result = await analyzePhotos({
        data: { room, photo_urls: photos.map((photo) => photo.url) },
      });
      if ("error" in result) {
        // Admin/unlimited-only button — safe and actively useful right now to
        // show the exact diagnostic message instead of a generic toast.
        console.error("Photo analysis failed", room, result.error);
        toast.error(result.error);
        return;
      }
      let appliedCount = 0;
      setQuantities((prev) => {
        const current = prev[room] ?? {};
        const next = { ...current };
        for (const suggestion of result.suggestions) {
          if ((current[suggestion.key] ?? 0) === 0) {
            next[suggestion.key] = suggestion.quantity;
            appliedCount++;
          }
        }
        return { ...prev, [room]: next };
      });
      toast.success(appliedCount > 0 ? t("upload.analyzeSuggested") : t("upload.analyzeNoneFound"));
    } catch (error) {
      console.error("Photo analysis failed", room, error);
      toast.error(t("upload.analyzeFailed"));
    } finally {
      setAnalyzingPhotos(false);
    }
  }

  function changeQuantity(itemKey: string, delta: number) {
    setQuantities((prev) => {
      const current = prev[selectedRoom]?.[itemKey] ?? 0;
      const next = Math.max(0, current + delta);
      return {
        ...prev,
        [selectedRoom]: {
          ...(prev[selectedRoom] ?? {}),
          [itemKey]: next,
        },
      };
    });
  }

  function renderChecklistItem(item: VolumeDatabaseItem) {
    const qty = quantities[selectedRoom]?.[item.key] ?? 0;
    return (
      <div
        key={item.key}
        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
      >
        <div>
          <p className="font-medium">{lang === "no" ? item.name_no : item.name}</p>
          <p className="text-sm text-muted-foreground">
            {item.length_cm}×{item.width_cm}×{item.height_cm} cm · {item.volume_m3.toFixed(2)} m³
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => changeQuantity(item.key, -1)}
            disabled={qty <= 0}
            aria-label={`Decrease quantity ${lang === "no" ? item.name_no : item.name}`}
          >
            <Minus className="size-4" />
          </Button>
          <span className="inline-flex min-w-10 justify-center text-lg font-semibold">{qty}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => changeQuantity(item.key, 1)}
            aria-label={`Increase quantity ${lang === "no" ? item.name_no : item.name}`}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  const manualItems = useMemo(
    () =>
      roomNames.flatMap((room) =>
        catalogForRoom(roomTemplateForName(room))
          .map((item) => ({
            room,
            name: item.name,
            name_no: item.name_no,
            category: item.category,
            quantity: quantities[room]?.[item.key] ?? 0,
            length_cm: item.length_cm,
            width_cm: item.width_cm,
            height_cm: item.height_cm,
            volume_m3: item.volume_m3,
            security_label: USER_VERIFIED_SECURITY_LABEL,
          }))
          .filter((item) => item.quantity > 0),
      ),
    [quantities, roomNames],
  );

  const netVolume = useMemo(
    () =>
      Math.round(manualItems.reduce((sum, item) => sum + item.quantity * item.volume_m3, 0) * 100) /
      100,
    [manualItems],
  );
  const grossVolume = recommendedVolume(netVolume);
  const selectedTemplateRoom = roomTemplateForName(selectedRoom);

  async function handleSubmit() {
    try {
      setStage("saving");

      // Photos were already uploaded right after being captured — just carry
      // forward the ones that finished uploading successfully.
      const room_photo_urls = Object.entries(roomPhotos).flatMap(([room, photos]) =>
        photos.map((photo) => ({ room, url: photo.url })),
      );

      const created = await submitEstimate({
        data: {
          manual_items: manualItems,
          room_photo_urls,
          ...(form.name.trim() ? { customer_name: form.name.trim() } : {}),
          ...(form.phone.trim() ? { customer_phone: form.phone.trim() } : {}),
          ...(form.date ? { move_date: form.date } : {}),
          ...(form.address.trim() ? { address: form.address.trim() } : {}),
          ...(companyId ?? session?.user.id
            ? { company_id: (companyId ?? session?.user.id) as string }
            : {}),
          ...(companyToken ? { company_token: companyToken } : {}),
        },
      });
      navigate({
        to: "/estimate/$id",
        params: { id: created.id },
        search: { token: created.share_token },
      });
    } catch (error) {
      console.error(error);
      setStage("idle");
      if (error instanceof Error && error.message === "NO_CREDITS") {
        toast.error(t("upload.noCredits"), {
          action: { label: t("upload.seePricing"), onClick: () => navigate({ to: "/pricing" }) },
        });
        return;
      }
      if (error instanceof Error && error.message === "COMPANY_QUOTA_EXCEEDED") {
        const companyName = branding?.company_name ?? t("upload.companyQuotaExceededFallbackName");
        toast.error(
          `${t("upload.companyQuotaExceededPrefix")} ${companyName} ${t("upload.companyQuotaExceededSuffix")}`,
        );
        return;
      }
      toast.error(t("upload.failed"));
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12">
          {branding && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              {branding.logo_url ? (
                <img
                  src={branding.logo_url}
                  alt=""
                  className="h-10 w-auto max-w-32 object-contain"
                />
              ) : (
                <span
                  className="flex size-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: branding.brand_color }}
                >
                  {branding.company_name.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="text-sm">
                <p className="text-muted-foreground">{t("upload.forCompany")}</p>
                <p className="font-semibold">{branding.company_name}</p>
              </div>
            </div>
          )}

          <h1 className="text-3xl font-bold sm:text-4xl">{t("upload.title")}</h1>
          <p className="mt-3 text-muted-foreground">
            {t("upload.sub")} {t("upload.securityLabel")}: {USER_VERIFIED_SECURITY_LABEL}.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="room-checklist">{t("upload.selectRoom")}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRooms((v) => !v)}
                  >
                    <Pencil className="size-4" />
                    {editingRooms ? t("upload.doneEditing") : t("upload.editRooms")}
                  </Button>
                </div>
                <select
                  id="room-checklist"
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedRoom}
                  onChange={(event) => setSelectedRoom(event.target.value)}
                >
                  {roomNames.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>

                {editingRooms && (
                  <div className="mt-4 space-y-2">
                    {roomNames.map((room, index) => (
                      <div key={`${room}-${index}`} className="flex items-center gap-2">
                        <Input
                          value={room}
                          aria-label={t("upload.renameRoom")}
                          onChange={(event) => renameRoom(index, event.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={t("upload.removeRoom")}
                          onClick={() => removeRoom(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="ghost" size="sm" onClick={resetRooms}>
                      {t("upload.resetRooms")}
                    </Button>
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <Input
                    value={newRoom}
                    placeholder={t("upload.addRoomPh")}
                    onChange={(event) => setNewRoom(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addRoom();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addRoom}>
                    <Plus className="size-4" />
                    <span className="hidden sm:inline">{t("upload.addRoom")}</span>
                  </Button>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  {t("upload.roomHint")}
                </p>
              </div>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={handlePhotoFilesSelected}
              />
              <Button
                type="button"
                size="lg"
                className="mt-4 h-14 w-full text-base font-bold"
                onClick={() => photoInputRef.current?.click()}
              >
                <Camera className="size-5" />
                {t("upload.takePhoto")}
              </Button>

              {(roomPhotos[selectedRoom]?.length ?? 0) > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {roomPhotos[selectedRoom]!.map((photo, index) => (
                    <div
                      key={photo.url}
                      className="relative aspect-square overflow-hidden rounded-lg border border-border"
                    >
                      <img src={photo.url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        aria-label={t("upload.removePhoto")}
                        className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white"
                        onClick={() => removeRoomPhoto(selectedRoom, index)}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {unlimitedAccount && (roomPhotos[selectedRoom]?.length ?? 0) > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 w-full"
                  disabled={analyzingPhotos}
                  onClick={() => analyzePhotosForRoom(selectedRoom)}
                >
                  {analyzingPhotos ? <Loader2 className="size-4 animate-spin" /> : null}
                  {analyzingPhotos ? t("upload.analyzing") : t("upload.analyzePhotos")}
                </Button>
              )}

              <div className="mt-7 flex gap-4 rounded-xl border border-primary/20 bg-primary-soft/70 p-5">
                <Info className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h2 className="font-semibold">{t("upload.guideTitle")}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t("upload.guide")}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  {t("upload.roomSpecificItems")}
                </h2>
                <div className="mt-3 space-y-3">
                  {VOLUME_DATABASE[selectedTemplateRoom].map(renderChecklistItem)}
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  {t("upload.crossRoomItems")}
                </h2>
                <div className="mt-3 space-y-3">
                  {CROSS_ROOM_ITEMS.map(renderChecklistItem)}
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  {t("upload.netVolumeLabel")}: {netVolume.toFixed(2)} m³
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("upload.grossVolumeLabel")}: {grossVolume.toFixed(2)} m³
                </p>
              </div>

              <div className="card-soft mt-8 p-6">
                <h2 className="font-semibold">{t("upload.details")}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">{t("upload.name")}</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">{t("upload.phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="date">{t("upload.date")}</Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address">{t("upload.address")}</Label>
                    <Input
                      id="address"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Button size="lg" className="mt-8 w-full" disabled={busy} onClick={handleSubmit}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                {busy ? t("upload.saving") : t("upload.submit")}
              </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
