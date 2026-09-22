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
import { createEstimate, uploadRoomVideo, uploadRoomPhoto } from "@/lib/estimates.functions";
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

const DEMO_REPORT_ROOMS = [
  { room: "Stue / Living room", items: "3-seter sofa, sofabord, TV-benk, reol", m3: 6.4 },
  { room: "Kjøkken / Kitchen", items: "Spisebord, 4 stoler, kjøleskap, kasser", m3: 4.1 },
  { room: "Soverom 1 / Bedroom 1", items: "Dobbeltseng, kommode, garderobe", m3: 5.2 },
  { room: "Gang / Hallway", items: "Skohylle, speil, 6 flyttekasser", m3: 1.8 },
];

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

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Keeps each clip's base64 payload under the server's cap (see estimates.functions.ts).
const MAX_VIDEO_BASE64_CHARS = 6_000_000;

// Keeps each photo's base64 payload under the server's cap (see estimates.functions.ts).
const MAX_PHOTO_BASE64_CHARS = 10_000_000;

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

/** Waits for a live <video> to know its native frame size, so the canvas can be sized to match. */
function waitForVideoMetadata(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= 1 && video.videoWidth > 0) return Promise.resolve();
  return new Promise((resolve) => {
    const onLoaded = () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      resolve();
    };
    video.addEventListener("loadedmetadata", onLoaded);
  });
}

// H.264/mp4 first: hardware-accelerated on essentially every phone (and what
// Safari's MediaRecorder actually records), smaller files than VP8 at the
// same quality. VP9/webm next where mp4 isn't available — still smaller than
// plain webm's implicit VP8. Bare "video/webm" and undefined are the same
// fallbacks used before this change.
const RECORDING_MIME_TYPE_CANDIDATES = [
  "video/mp4;codecs=h264",
  "video/mp4",
  "video/webm;codecs=vp9",
  "video/webm",
];

function pickRecordingMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") {
    return undefined;
  }
  return RECORDING_MIME_TYPE_CANDIDATES.find((candidate) => MediaRecorder.isTypeSupported(candidate));
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the recording"));
    reader.readAsDataURL(blob);
  });
}

function UploadPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const submitEstimate = useServerFn(createEstimate);
  const uploadVideo = useServerFn(uploadRoomVideo);
  const uploadPhoto = useServerFn(uploadRoomPhoto);
  const analyzePhotos = useServerFn(analyzeRoomPhotos);
  const { c: companyId, k: companyToken } = Route.useSearch();
  const { session } = useAuth();
  const { data: ownCompany } = useCompany();
  const brandingFn = useServerFn(getCompanyByUploadToken);
  // Holds the raw camera feed off-screen; frames are drawn from here onto
  // canvasRef so zoom can be baked into what's actually recorded.
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasStreamRef = useRef<MediaStream | null>(null);
  const drawLoopRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  // Groups every clip/photo captured in this visit under one storage path
  // prefix; no estimate id exists yet at capture time. Lazily created on
  // first upload (shared by both the video and photo paths).
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
  const [recording, setRecording] = useState(false);
  const [startingCamera, setStartingCamera] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(MIN_ZOOM);
  const zoomLevelRef = useRef(MIN_ZOOM);
  // Filming is currently unused (photos took its place below), kept intact
  // in case it's re-enabled later — see startVideoCapture()/finishRecording().
  const [roomVideos, setRoomVideos] = useState<Record<string, { blob: Blob; seconds: number; url: string | null }>>(
    {},
  );
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
  const freePlan = !unlimitedAccount && !companyToken && !companyId;
  const [secondsLeft, setSecondsLeft] = useState(FREE_RECORDING_SECONDS);
  const [showUpsell, setShowUpsell] = useState(false);

  useEffect(() => {
    if (!recording || !freePlan) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          finishRecording();
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
    if (!recording) return;
    setElapsedSeconds(0);
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

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

  function adjustZoom(delta: number) {
    setZoomLevel((current) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round((current + delta) * 100) / 100));
      zoomLevelRef.current = next;
      return next;
    });
  }


  useEffect(() => {
    return () => {
      if (drawLoopRef.current !== null) {
        cancelAnimationFrame(drawLoopRef.current);
        drawLoopRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (canvasStreamRef.current) {
        canvasStreamRef.current.getTracks().forEach((track) => track.stop());
        canvasStreamRef.current = null;
      }
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

  /** Draws the raw camera frame onto the visible canvas, cropped/scaled by the current zoom
   * level — this is the frame MediaRecorder actually captures, so zoom ends up in the saved clip. */
  function drawZoomedFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.videoWidth > 0) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        const zoom = zoomLevelRef.current;
        const sw = video.videoWidth / zoom;
        const sh = video.videoHeight / zoom;
        const sx = (video.videoWidth - sw) / 2;
        const sy = (video.videoHeight - sh) / 2;
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      }
    }
    drawLoopRef.current = requestAnimationFrame(drawZoomedFrame);
  }

  async function startVideoCapture() {
    if (recording || startingCamera) return;
    if (freePlan && secondsLeft <= 0) {
      setShowUpsell(true);
      toast.error(t("upload.freeUsedUp"));
      return;
    }
    try {
      setStartingCamera(true);
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error(t("upload.cameraUnsupported"));
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;

      video.srcObject = stream;
      await video.play().catch(() => undefined);
      await waitForVideoMetadata(video);

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const canvasStream = canvas.captureStream(30);
      canvasStreamRef.current = canvasStream;

      recordedChunksRef.current = [];
      const mimeType = pickRecordingMimeType();
      const recorder = mimeType
        ? new MediaRecorder(canvasStream, { mimeType })
        : new MediaRecorder(canvasStream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();

      setRecording(true);
      drawLoopRef.current = requestAnimationFrame(drawZoomedFrame);
    } catch (error) {
      // isTypeSupported() only validates the codec string in the abstract — it
      // doesn't guarantee MediaRecorder can actually be constructed against
      // this specific canvas.captureStream() source, so log what really failed.
      console.error("Could not start filming", error);
      stopCameraTracks();
      toast.error(t("upload.cameraFailed"));
    } finally {
      setStartingCamera(false);
    }
  }

  function stopCameraTracks() {
    if (drawLoopRef.current !== null) {
      cancelAnimationFrame(drawLoopRef.current);
      drawLoopRef.current = null;
    }
    if (canvasStreamRef.current) {
      canvasStreamRef.current.getTracks().forEach((track) => track.stop());
      canvasStreamRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setZoomLevel(MIN_ZOOM);
    zoomLevelRef.current = MIN_ZOOM;
    setRecording(false);
  }

  /** Stops the recorder, saves the clip against the room being filmed, and confirms it. */
  function finishRecording() {
    const recorder = mediaRecorderRef.current;
    const room = selectedRoom;
    const seconds = elapsedSeconds;
    mediaRecorderRef.current = null;
    if (!recorder || recorder.state === "inactive") {
      stopCameraTracks();
      return;
    }
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || "video/webm" });
      recordedChunksRef.current = [];
      if (blob.size > 0) {
        setRoomVideos((prev) => ({ ...prev, [room]: { blob, seconds, url: null } }));
        toast.success(`${t("upload.savedToRoom")} ${room}`);
        void uploadRecordedVideo(room, blob);
      }
      stopCameraTracks();
    };
    recorder.stop();
  }

  /** Uploads a just-recorded clip right away, so it isn't lost if the visitor never submits the form. */
  async function uploadRecordedVideo(room: string, blob: Blob) {
    try {
      const base64 = await blobToBase64(blob);
      if (base64.length > MAX_VIDEO_BASE64_CHARS) {
        toast.error(t("upload.videoTooLarge"));
        return;
      }
      if (!sessionIdRef.current) sessionIdRef.current = crypto.randomUUID();
      const result = await uploadVideo({
        data: {
          session_id: sessionIdRef.current,
          room,
          mime_type: blob.type || "video/webm",
          data: base64,
        },
      });
      setRoomVideos((prev) => {
        const current = prev[room];
        // Ignore a stale result if the room was re-filmed while this upload was in flight.
        if (!current || current.blob !== blob) return prev;
        return { ...prev, [room]: { ...current, url: result.url } };
      });
    } catch (error) {
      console.error("Room video upload failed", room, error);
      toast.error(t("upload.videoSaveFailed"));
    }
  }

  /** Discards the current take (no save) and stops the camera. */
  function cancelRecording() {
    const recorder = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    if (recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.stop();
    }
    recordedChunksRef.current = [];
    stopCameraTracks();
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

      // Clips/photos were already uploaded right after being captured — just
      // carry forward the ones that finished uploading successfully.
      const room_video_urls = Object.entries(roomVideos)
        .filter((entry): entry is [string, { blob: Blob; seconds: number; url: string }] => Boolean(entry[1].url))
        .map(([room, video]) => ({ room, url: video.url }));
      const room_photo_urls = Object.entries(roomPhotos).flatMap(([room, photos]) =>
        photos.map((photo) => ({ room, url: photo.url })),
      );

      const created = await submitEstimate({
        data: {
          manual_items: manualItems,
          room_video_urls,
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

          {showUpsell && (
            <div className="mt-6 rounded-2xl border-2 border-primary bg-primary/5 p-6">
              <h2 className="text-xl font-bold">{t("upload.freeOverTitle")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("upload.freeOverBody")}</p>

              <div className="mt-5 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{t("upload.demoReportTitle")}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("upload.demoBadge")}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {DEMO_REPORT_ROOMS.map((row) => (
                    <li key={row.room} className="flex justify-between border-b border-border/60 pb-1.5">
                      <span>
                        {row.room}{" "}
                        <span className="text-muted-foreground">· {row.items}</span>
                      </span>
                      <span className="font-semibold tabular-nums">{row.m3.toFixed(1)} m³</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between text-sm font-bold">
                  <span>{t("upload.demoTotal")}</span>
                  <span className="tabular-nums">
                    {DEMO_REPORT_ROOMS.reduce((sum, row) => sum + row.m3, 0).toFixed(1)} m³
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{t("upload.demoNote")}</p>
              </div>

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
                {/* Off-screen: the raw camera feed, used only as the source drawZoomedFrame() reads from. */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
                />
                {/* Visible preview — also what MediaRecorder actually captures, so zoom is real. */}
                <canvas ref={canvasRef} className="aspect-video w-full object-cover" />
                <span className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">
                  <span className="size-2 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
                  🔴 {t("upload.recordingLive")} · {formatElapsed(elapsedSeconds)}
                </span>
                <span className="absolute left-3 top-12 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                  {t("upload.filmingRoom")}: {selectedRoom}
                </span>
                {freePlan && (
                  <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground tabular-nums">
                    {t("upload.freeLeft")}: {secondsLeft}s
                  </span>
                )}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/70 p-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-full text-white hover:bg-white/20 hover:text-white"
                    aria-label={t("upload.zoomOut")}
                    disabled={zoomLevel <= MIN_ZOOM}
                    onClick={() => adjustZoom(-ZOOM_STEP)}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="min-w-10 text-center text-xs font-bold text-white tabular-nums">
                    {Number(zoomLevel.toFixed(2))}x
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-full text-white hover:bg-white/20 hover:text-white"
                    aria-label={t("upload.zoomIn")}
                    disabled={zoomLevel >= MAX_ZOOM}
                    onClick={() => adjustZoom(ZOOM_STEP)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {freePlan ? t("upload.freeNote") : t("upload.unlimitedFilming")}
              </p>

              <Button
                size="lg"
                className="h-14 w-full bg-red-600 text-base font-bold text-white hover:bg-red-700"
                onClick={finishRecording}
              >
                {t("upload.stopRecording")}
              </Button>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="outline" onClick={goToNextRoom}>
                  {t("upload.nextRoom")}
                </Button>
                <Button type="button" variant="ghost" onClick={cancelRecording}>
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


              {/* Filming (startVideoCapture, the canvas/zoom pipeline below) is currently
                  unused in favor of photo upload here, kept intact in case it's re-enabled. */}
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
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
