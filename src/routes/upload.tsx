import { useEffect, useMemo, useRef, useState } from "react";
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
import { createEstimate } from "@/lib/estimates.functions";
import { getCompanyByUploadToken } from "@/lib/admin.functions";
import {
  USER_VERIFIED_SECURITY_LABEL,
  VOLUME_DATABASE,
} from "@/lib/volume-database";
import { recommendedVolume } from "@/lib/volume";
import { useAuth } from "@/hooks/useAuth";
import { useCompany, useUnlimitedPhotos } from "@/hooks/useCompany";
import { Link } from "@tanstack/react-router";
import {
  defaultRoomNames,
  localizedTemplateName,
  roomTemplateForName,
  sanitizeRoomNames,
} from "@/lib/rooms";

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
      { title: "Room video checklist — VolumCalc" },
      {
        name: "description",
        content:
          "Film each room at your own pace, then complete a calm, friendly checklist for a clear cubic metre estimate.",
      },
      { property: "og:title", content: "Room video checklist — VolumCalc" },
      {
        property: "og:description",
        content:
          "Record your rooms, confirm your checklist, and get a tidy moving volume report without the stress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UploadPage,
});

const FREE_RECORDING_SECONDS = 20;

type Stage = "idle" | "saving";
type QuantityByRoom = Record<string, Record<string, number>>;

function createInitialQuantities(roomNames: string[]): QuantityByRoom {
  return roomNames.reduce(
    (acc, room) => ({
      ...acc,
      [room]: VOLUME_DATABASE[roomTemplateForName(room)].reduce(
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
    next[room] = VOLUME_DATABASE[roomTemplateForName(room)].reduce(
      (items, item) => ({ ...items, [item.key]: existing[item.key] ?? 0 }),
      {} as Record<string, number>,
    );
    return next;
  }, {} as QuantityByRoom);
}

function firstRoomName(roomNames: string[]) {
  return roomNames[0] ?? "Living room";
}

function UploadPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const submitEstimate = useServerFn(createEstimate);
  const { c: companyId, k: companyToken } = Route.useSearch();
  const { session } = useAuth();
  const { data: ownCompany } = useCompany();
  const brandingFn = useServerFn(getCompanyByUploadToken);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
  const [recording, setRecording] = useState(false);
  const [startingCamera, setStartingCamera] = useState(false);
  const [editingRooms, setEditingRooms] = useState(false);
  const [newRoom, setNewRoom] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [quantities, setQuantities] = useState<QuantityByRoom>(() =>
    createInitialQuantities(defaultRoomNames("en")),
  );
  const [form, setForm] = useState({ name: "", phone: "", date: "", address: "" });
  const busy = stage !== "idle";

  const unlimitedAccount = useUnlimitedPhotos();
  const freePlan = !unlimitedAccount && !companyToken && !companyId;
  const [secondsLeft, setSecondsLeft] = useState(FREE_RECORDING_SECONDS);
  const [showUpsell, setShowUpsell] = useState(false);

  useEffect(() => {
    if (!recording || !freePlan) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          stopVideoCapture();
          setShowUpsell(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording, freePlan]);

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

  function goToNextRoom() {
    const index = roomNames.indexOf(selectedRoom);
    setSelectedRoom(roomNames[(index + 1) % roomNames.length] ?? selectedRoom);
  }


  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (recording && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => undefined);
    }
  }, [recording]);

  async function startVideoCapture() {
    if (recording || startingCamera) return;
    try {
      setStartingCamera(true);
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error(t("upload.cameraUnsupported"));
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setRecording(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        void videoRef.current.play().catch(() => undefined);
      }
    } catch {
      toast.error(t("upload.cameraFailed"));
      setRecording(false);
    } finally {
      setStartingCamera(false);
    }
  }

  function stopVideoCapture() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setRecording(false);
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

  const manualItems = useMemo(
    () =>
      roomNames.flatMap((room) =>
        VOLUME_DATABASE[roomTemplateForName(room)]
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
      const created = await submitEstimate({
        data: {
          manual_items: manualItems,
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

          {showUpsell && (
            <div className="mt-6 rounded-2xl border-2 border-primary bg-primary/5 p-6">
              <h2 className="text-xl font-bold">{t("upload.freeOverTitle")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("upload.freeOverBody")}</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button asChild size="lg">
                  <Link to="/pricing">{t("upload.freeOverCta")}</Link>
                </Button>
                <Button variant="ghost" size="lg" onClick={() => setShowUpsell(false)}>
                  {t("upload.freeOverDismiss")}
                </Button>
              </div>
            </div>
          )}

          {recording ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <Label htmlFor="room">{t("upload.roomSelectorLabel")}</Label>
                <select
                  id="room"
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
                  {t("upload.roomTemplate")}: {localizedTemplateName(selectedTemplateRoom, lang)}
                </p>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-border bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="aspect-video w-full object-cover"
                />
                <span className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                  <span className="size-2 animate-pulse rounded-full bg-red-500" />
                  {t("upload.filmingRoom")}: {selectedRoom}
                </span>
                {freePlan && (
                  <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground tabular-nums">
                    {t("upload.freeLeft")}: {secondsLeft}s
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                {freePlan ? t("upload.freeNote") : t("upload.unlimitedFilming")}
              </p>

              <Button
                size="lg"
                className="h-14 w-full bg-red-600 text-base font-bold text-white hover:bg-red-700"
                onClick={stopVideoCapture}
              >
                {t("upload.stopRecording")}
              </Button>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="outline" onClick={goToNextRoom}>
                  {t("upload.nextRoom")}
                </Button>
                <Button type="button" variant="ghost" onClick={stopVideoCapture}>
                  {t("upload.cancelRecording")}
                </Button>
              </div>
            </div>
          ) : (
            <>
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


              <Button
                size="lg"
                className="mt-4 h-14 w-full text-base font-bold"
                disabled={startingCamera}
                onClick={startVideoCapture}
              >
                {startingCamera ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Camera className="size-5" />
                )}
                {startingCamera ? t("upload.startingCamera") : t("upload.startRecording")}
              </Button>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {t("upload.skipToChecklist")}
              </p>

              <div className="mt-7 flex gap-4 rounded-xl border border-primary/20 bg-primary-soft/70 p-5">
                <Info className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h2 className="font-semibold">{t("upload.guideTitle")}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t("upload.guide")}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {VOLUME_DATABASE[selectedTemplateRoom].map((item) => {
                  const qty = quantities[selectedRoom]?.[item.key] ?? 0;
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                    >
                      <div>
                        <p className="font-medium">{lang === "no" ? item.name_no : item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.length_cm}×{item.width_cm}×{item.height_cm} cm ·{" "}
                          {item.volume_m3.toFixed(2)} m³
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
                        <span className="inline-flex min-w-10 justify-center text-lg font-semibold">
                          {qty}
                        </span>
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
                })}
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
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
