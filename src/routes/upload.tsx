import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, ChevronDown, Copy, Loader2, LockKeyhole, Minus, Plus, Printer, Search, Send, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { beregn, DEFAULT_STOWAGE_FACTOR, type CalcChoices, type CalcDatabase } from "@/lib/move-calc";
import { MOVE_DATABASE, PREDEFINED_ROOMS, type RoomDef } from "@/lib/move-data";
import { createEstimate } from "@/lib/estimates.functions";
import { USER_VERIFIED_SECURITY_LABEL } from "@/lib/volume-database";
import { recommendVehicle } from "@/lib/volume";
import { dimensionVolumeM3, type ItemStatus } from "@/lib/item-status";
import { xl } from "@/lib/extra-labels";
import { cx, roomLabel, type CalcKey } from "@/lib/calc-i18n";
import { ItemStatusToggle } from "@/components/ItemStatusToggle";
import { LANG_LABELS, SUPPORTED_LANGS, translate, useI18n, type Lang } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useUnlimitedEstimates } from "@/hooks/useCompany";

export const Route = createFileRoute("/upload")({
  staticData: { sitemap: true },
  // Kept so existing company/upload links with ?c=…&k=… still resolve.
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
      { title: "Moving calculator — VolumCalc" },
      {
        name: "description",
        content:
          "Pick rooms and items from the checklist and get recommended volume (m³), weight (kg) and vehicle size for your move. Free, right in your browser.",
      },
      { property: "og:title", content: "Moving calculator — VolumCalc" },
      {
        property: "og:description",
        content: "Room by room: calculate m³ and kg for your move and get a recommended vehicle.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/upload" }],
  }),
  component: CalculatorPage,
});

const STORAGE_KEY = "volumcalc.calc.v2";

type CustomItem = {
  id: string;
  navn: string;
  /** Volume per unit in m³. */
  m3: number;
  /** Weight per unit in kg (0 = not given). */
  kg: number;
  l?: number;
  w?: number;
  h?: number;
  notes?: string;
};
type Statuses = Record<string, Exclude<ItemStatus, "moving">>;
type SavedState = {
  rooms: RoomDef[];
  choices: CalcChoices;
  custom: Record<string, CustomItem[]>;
  statuses: Statuses;
  factor: number;
  pdfLang: Lang;
};
type Form = {
  navn: string;
  telefon: string;
  epost: string;
  hent: string;
  hentEtasje: string;
  hentHeis: boolean;
  hentBaer: string;
  hentMobil: string;
  lever: string;
  leverEtasje: string;
  leverHeis: boolean;
  leverBaer: string;
  leverMobil: string;
  dato: string;
  tid: string;
  notater: string;
};
const emptyForm: Form = {
  navn: "",
  telefon: "",
  epost: "",
  hent: "",
  hentEtasje: "",
  hentHeis: false,
  hentBaer: "",
  hentMobil: "",
  lever: "",
  leverEtasje: "",
  leverHeis: false,
  leverBaer: "",
  leverMobil: "",
  dato: "",
  tid: "",
  notater: "",
};
const emptyCustom = { navn: "", l: "", w: "", h: "", antall: "1", kg: "", notater: "" };

const num = (v: string) => Number(v.replace(",", "."));
const statusKey = (room: string, id: string) => `${room}/${id}`;

function loadSaved(): Partial<SavedState> {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<SavedState>;
  } catch {
    return {};
  }
}

function CalculatorPage() {
  const search = Route.useSearch();
  const create = useServerFn(createEstimate);
  const { lang } = useI18n();
  const { session } = useAuth();
  const paid = useUnlimitedEstimates();

  /** Visitor arrived through a moving company's own link: the company pays, the visitor sends a request. */
  const companyLink = Boolean(search.k);

  const [step, setStep] = useState<1 | 2>(1);
  const [rooms, setRooms] = useState<RoomDef[]>(PREDEFINED_ROOMS);
  const [choices, setChoices] = useState<CalcChoices>({});
  const [custom, setCustom] = useState<Record<string, CustomItem[]>>({});
  const [statuses, setStatuses] = useState<Statuses>({});
  const [factor, setFactor] = useState(DEFAULT_STOWAGE_FACTOR);
  const [pdfLang, setPdfLang] = useState<Lang>(lang);
  /** Until the visitor picks a PDF language themselves, the PDF follows the site language. */
  const pdfLangChosen = useRef(false);
  const [activeRoom, setActiveRoom] = useState(PREDEFINED_ROOMS[0]!.id);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<Form>(emptyForm);
  const [showErrors, setShowErrors] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ id: string; token: string; emailed: boolean } | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [roomSheet, setRoomSheet] = useState(false);

  // Restore after mount (SSR renders the empty state, so no hydration mismatch).
  useEffect(() => {
    const saved = loadSaved();
    if (saved.rooms?.length) {
      // Predefined rooms always come from the current catalogue; only the visitor's own rooms are restored.
      const own = saved.rooms.filter((r) => !PREDEFINED_ROOMS.some((p) => p.id === r.id));
      setRooms([...PREDEFINED_ROOMS, ...own]);
    }
    if (saved.choices) setChoices(saved.choices);
    if (saved.custom) setCustom(saved.custom);
    if (saved.statuses) setStatuses(saved.statuses);
    if (typeof saved.factor === "number" && saved.factor >= 1 && saved.factor <= 3) setFactor(saved.factor);
    if (saved.pdfLang && (SUPPORTED_LANGS as string[]).includes(saved.pdfLang)) {
      pdfLangChosen.current = true;
      setPdfLang(saved.pdfLang);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!pdfLangChosen.current) setPdfLang(lang);
  }, [lang]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ rooms, choices, custom, statuses, factor, ...(pdfLangChosen.current ? { pdfLang } : {}) }));
    } catch {
      /* private mode etc. — the calculator still works */
    }
  }, [loaded, rooms, choices, custom, statuses, factor, pdfLang]);

  // Built-in items plus the visitor's own, per room.
  const db: CalcDatabase = useMemo(() => {
    const merged: CalcDatabase = {};
    for (const room of rooms) {
      const own = Object.fromEntries(
        (custom[room.id] ?? []).map((c) => [
          c.id,
          {
            navn: c.navn,
            m3: c.m3,
            kg: c.kg,
            custom: true,
            ...(c.l && c.w && c.h ? { dim: `${c.l} × ${c.w} × ${c.h} cm` } : {}),
            ...(c.notes ? { notes: c.notes } : {}),
          },
        ]),
      );
      merged[room.id] = { ...(MOVE_DATABASE[room.id] ?? {}), ...own };
    }
    return merged;
  }, [rooms, custom]);

  const statusOf = (room: string, id: string): ItemStatus => statuses[statusKey(room, id)] ?? "moving";

  // "Not moving" never counts; "maybe" counts but is tracked separately.
  const { counted, maybeOnly, notMovingOnly } = useMemo(() => {
    const counted: CalcChoices = {};
    const maybeOnly: CalcChoices = {};
    const notMovingOnly: CalcChoices = {};
    for (const room of Object.keys(choices)) {
      for (const [id, qty] of Object.entries(choices[room] ?? {})) {
        if (!(qty > 0)) continue;
        const status = statuses[statusKey(room, id)] ?? "moving";
        const target = status === "not_moving" ? notMovingOnly : counted;
        (target[room] ??= {})[id] = qty;
        if (status === "maybe") (maybeOnly[room] ??= {})[id] = qty;
      }
    }
    return { counted, maybeOnly, notMovingOnly };
  }, [choices, statuses]);

  const total = useMemo(() => beregn(counted, db, factor), [counted, db, factor]);
  const maybeTotal = useMemo(() => beregn(maybeOnly, db, factor), [maybeOnly, db, factor]);
  const notMovingTotal = useMemo(() => beregn(notMovingOnly, db, factor), [notMovingOnly, db, factor]);
  const vehicleKey = recommendVehicle(total.anbefaltM3);

  const perRoom = useMemo(() => {
    const map: Record<string, { antall: number; m3: number; kg: number }> = {};
    for (const d of total.detaljer) {
      const r = (map[d.rom] ??= { antall: 0, m3: 0, kg: 0 });
      r.antall += d.antall;
      r.m3 += d.m3;
      r.kg += d.kg;
    }
    return map;
  }, [total]);

  const roomName = (id: string, l: Lang = lang) => {
    const room = rooms.find((r) => r.id === id);
    return room ? roomLabel(l, room.id, room.navn) : id;
  };

  // Number formatting follows the language (comma except English).
  const fmtIn = (l: Lang, n: number, d = 2) => {
    const text = n.toFixed(d);
    return l === "en" ? text : text.replace(".", ",");
  };
  const fmt = (n: number, d = 2) => fmtIn(lang, n, d);
  const fmtP = (n: number, d = 2) => fmtIn(pdfLang, n, d);
  const T = (key: CalcKey, vars?: Record<string, string | number>) => cx(lang, key, vars);
  const L = (key: Parameters<typeof xl>[1], vars?: Record<string, string | number>) => xl(pdfLang, key, vars);

  // PDF + share link exist only for a saved estimate that the visitor paid for.
  const unlocked = Boolean(sent) && !companyLink;

  function setQty(room: string, id: string, qty: number) {
    const next = Math.max(0, Math.min(999, Math.floor(qty) || 0));
    setChoices((prev) => ({ ...prev, [room]: { ...(prev[room] ?? {}), [id]: next } }));
  }
  const qtyOf = (room: string, id: string) => choices[room]?.[id] ?? 0;

  function setStatus(room: string, id: string, status: ItemStatus) {
    setStatuses((prev) => {
      const { [statusKey(room, id)]: _old, ...rest } = prev;
      return status === "moving" ? rest : { ...rest, [statusKey(room, id)]: status };
    });
  }

  const trimmed = query.trim().toLowerCase();
  const visibleItems = useMemo(() => {
    const rows: { room: string; id: string; navn: string; m3: number; kg: number; custom?: boolean; dim?: string; notes?: string }[] = [];
    const roomIds = trimmed ? rooms.map((r) => r.id) : [activeRoom];
    for (const room of roomIds) {
      for (const [id, item] of Object.entries(db[room] ?? {})) {
        if (!trimmed || item.navn.toLowerCase().includes(trimmed)) rows.push({ room, id, ...item });
      }
    }
    return rows;
  }, [db, rooms, activeRoom, trimmed]);

  // Add-your-own forms
  const [newRoom, setNewRoom] = useState("");
  const [ci, setCi] = useState(emptyCustom);
  const ciPreview = (() => {
    const l = num(ci.l);
    const w = num(ci.w);
    const h = num(ci.h);
    const q = Math.floor(num(ci.antall));
    return l > 0 && w > 0 && h > 0 && q >= 1 ? dimensionVolumeM3(l, w, h, q) : 0;
  })();

  function addRoom() {
    const name = newRoom.trim().replace(/\s+/g, " ").slice(0, 40);
    if (!name) return;
    if (rooms.some((r) => r.navn.toLowerCase() === name.toLowerCase())) {
      toast.error(T("roomExists"));
      return;
    }
    const id = `rom_${Date.now().toString(36)}`;
    setRooms((prev) => [...prev, { id, navn: name }]);
    setActiveRoom(id);
    setNewRoom("");
    setRoomSheet(false);
  }

  function removeRoom(id: string) {
    setRooms((prev) => prev.filter((r) => r.id !== id));
    setChoices((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
    setCustom((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
    if (activeRoom === id) setActiveRoom(PREDEFINED_ROOMS[0]!.id);
  }

  function addCustomItem() {
    const navn = ci.navn.trim().slice(0, 60);
    const l = num(ci.l);
    const w = num(ci.w);
    const h = num(ci.h);
    const antall = Math.floor(num(ci.antall));
    const kgv = ci.kg.trim() ? num(ci.kg) : 0;
    const dims = [l, w, h];
    if (!navn || dims.some((d) => !(d > 0) || d > 5000) || !(antall >= 1) || antall > 999 || !(kgv >= 0) || kgv > 10000) {
      toast.error(T("errCustom"));
      return;
    }
    const id = `egen_${Date.now().toString(36)}`;
    const item: CustomItem = {
      id,
      navn,
      m3: dimensionVolumeM3(l, w, h),
      kg: kgv,
      l,
      w,
      h,
      ...(ci.notater.trim() ? { notes: ci.notater.trim().slice(0, 300) } : {}),
    };
    setCustom((prev) => ({ ...prev, [activeRoom]: [...(prev[activeRoom] ?? []), item] }));
    setQty(activeRoom, id, antall);
    setCi(emptyCustom);
  }

  function removeCustomItem(room: string, id: string) {
    setCustom((prev) => ({ ...prev, [room]: (prev[room] ?? []).filter((c) => c.id !== id) }));
    setQty(room, id, 0);
    setStatus(room, id, "moving");
  }

  function resetAll() {
    if (!window.confirm(T("confirmReset"))) return;
    setChoices({});
    setCustom({});
    setStatuses({});
    setRooms(PREDEFINED_ROOMS);
    setActiveRoom(PREDEFINED_ROOMS[0]!.id);
    setSent(null);
  }

  // ---- step 2 ----
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.epost.trim());
  // A request to a moving company needs full contact + addresses; a paying
  // visitor saving their own estimate can leave the details out.
  const errors = companyLink
    ? {
        navn: !form.navn.trim(),
        telefon: form.telefon.replace(/\D/g, "").length < 6,
        epost: !emailOk,
        hent: !form.hent.trim(),
        lever: !form.lever.trim(),
      }
    : { navn: false, telefon: false, epost: false, hent: false, lever: false };
  const hasErrors = Object.values(errors).some(Boolean);
  const setField = <K extends keyof Form>(k: K, v: Form[K]) => setForm((prev) => ({ ...prev, [k]: v }));

  const siteLine = (adresse: string, etasje: string, heis: boolean, baer: string, mobil: string) =>
    [
      adresse || "—",
      `${L("floor")}: ${etasje || "—"}`,
      heis ? L("elevator") : L("noElevator"),
      `${L("carry")}: ${baer ? `${baer} m` : "—"}`,
      `${L("mobile")}: ${mobil || "—"}`,
    ].join(" · ");

  async function submit() {
    setShowErrors(true);
    if (hasErrors) {
      toast.error(T("errFill"));
      return;
    }
    const all = beregn(choices, db, factor);
    const manual_items = all.detaljer.map((d) => {
      const own = (custom[d.rom] ?? []).find((c) => c.id === d.id);
      return {
        room: roomLabel("no", d.rom, rooms.find((r) => r.id === d.rom)?.navn ?? d.rom).slice(0, 50),
        name: d.navn.slice(0, 120),
        name_no: d.navn.slice(0, 120),
        category: (own ? "custom" : d.rom).slice(0, 80),
        quantity: d.antall,
        length_cm: own?.l ?? 0,
        width_cm: own?.w ?? 0,
        height_cm: own?.h ?? 0,
        volume_m3: d.m3 / d.antall,
        security_label: USER_VERIFIED_SECURITY_LABEL,
        status: statusOf(d.rom, d.id),
        custom: Boolean(own),
        weight_kg: d.kg > 0 ? d.kg / d.antall : null,
        notes: own?.notes ?? null,
      };
    });
    const carry = (v: string) => (v.trim() && num(v) >= 0 ? Math.round(num(v)) : null);
    const noteParts = [form.tid ? `${xl("no", "time")}: ${form.tid}` : "", form.notater.trim()].filter(Boolean);

    setSending(true);
    try {
      const result = await create({
        data: {
          manual_items,
          ...(form.navn.trim() ? { customer_name: form.navn.trim() } : {}),
          ...(form.telefon.trim() ? { customer_phone: form.telefon.trim() } : {}),
          ...(emailOk ? { customer_email: form.epost.trim() } : {}),
          ...(form.dato ? { move_date: form.dato } : {}),
          ...(noteParts.length ? { notes: noteParts.join("\n") } : {}),
          from: {
            address: form.hent.trim(),
            floor: form.hentEtasje.trim(),
            elevator: form.hentHeis,
            carry_m: carry(form.hentBaer),
            mobile: form.hentMobil.trim(),
          },
          to: {
            address: form.lever.trim(),
            floor: form.leverEtasje.trim(),
            elevator: form.leverHeis,
            carry_m: carry(form.leverBaer),
            mobile: form.leverMobil.trim(),
          },
          report_language: pdfLang,
          ...(search.k ? { company_token: search.k } : {}),
        },
      });
      setSent({ id: result.id, token: result.share_token, emailed: result.emailed });
    } catch (error) {
      console.error("Could not submit the estimate", error);
      const message = error instanceof Error ? error.message : "";
      if (message.includes("AUTH_REQUIRED") || message.includes("NO_CREDITS")) {
        setBlocked(true);
        toast.error(T("payLocked"));
      } else if (message.includes("COMPANY_QUOTA_EXCEEDED")) {
        toast.error(T("errQuota"));
      } else {
        toast.error(T("errFallback"));
      }
    } finally {
      setSending(false);
    }
  }

  const reportUrl = sent
    ? `${typeof window === "undefined" ? "" : window.location.origin}/estimate/${sent.id}?token=${sent.token}`
    : "";

  function downloadPdf() {
    if (!unlocked) return;
    const previous = document.title;
    document.title = `VolumCalc ${form.dato || new Date().toISOString().slice(0, 10)} (${pdfLang.toUpperCase()})`;
    window.addEventListener("afterprint", () => (document.title = previous), { once: true });
    window.print();
  }

  const chosenCount =
    total.detaljer.reduce((s, d) => s + d.antall, 0) + notMovingTotal.detaljer.reduce((s, d) => s + d.antall, 0);
  const today = new Date().toLocaleDateString(pdfLang === "no" ? "nb-NO" : pdfLang === "en" ? "en-GB" : pdfLang);
  const bufferPercent = Math.round((factor - 1) * 100);

  const pickRoom = (id: string) => {
    setActiveRoom(id);
    setQuery("");
    setRoomSheet(false);
  };

  const roomButton = (room: RoomDef) => {
    const stats = perRoom[room.id];
    const active = room.id === activeRoom && !trimmed;
    return (
      <button
        type="button"
        onClick={() => pickRoom(room.id)}
        aria-current={active ? "true" : undefined}
        className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
          active ? "bg-background font-semibold shadow-sm ring-1 ring-border" : "hover:bg-background/60"
        }`}
      >
        <span className="block">
          {stats ? `(${stats.antall} ${T("pcs")}) ` : ""}
          {roomName(room.id)}
        </span>
        {stats && (
          <span className="block text-xs font-normal text-muted-foreground">{T("roomTotal", { n: fmt(stats.m3, 1) })}</span>
        )}
      </button>
    );
  }

  const addRoomForm = (className = "") => {
    return (
      <form
        className={`flex gap-2 ${className}`}
        onSubmit={(e) => {
          e.preventDefault();
          addRoom();
        }}
      >
        <Input
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder={T("ownRoom")}
          maxLength={40}
          aria-label={T("ownRoomAria")}
        />
        <Button type="submit" variant="outline" size="icon" aria-label={T("addRoom")}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="print:hidden">
        <SiteHeader />
      </div>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="print:hidden">
          <h1 className="text-2xl font-bold sm:text-3xl">{T("title")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{T("intro")}</p>
          <ol className="mt-5 flex flex-wrap gap-2 text-sm font-medium">
            {[T("step1"), T("step2")].map((label, i) => (
              <li
                key={label}
                className={`rounded-full px-3 py-1 ${step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {i + 1}. {label}
              </li>
            ))}
          </ol>
        </div>

        {step === 1 && (
          <section className="mt-6 print:hidden">
            <div className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[260px_1fr]">
              {/* Rooms */}
              <div className="min-w-0 border-b border-border bg-muted/40 p-3 md:border-b-0 md:border-r">
                {/* Mobile: one button that opens the full room list */}
                <div className="flex gap-2 md:hidden">
                  <button
                    type="button"
                    onClick={() => setRoomSheet(true)}
                    className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl bg-background px-3 py-2.5 text-left shadow-sm ring-1 ring-border"
                    aria-haspopup="dialog"
                  >
                    <span className="min-w-0">
                      <span className="block text-xs text-muted-foreground">{T("chooseRoom")}</span>
                      <span className="block truncate text-sm font-semibold">{roomName(activeRoom)}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      {perRoom[activeRoom] ? `${perRoom[activeRoom]!.antall} ${T("pcs")}` : ""}
                      <ChevronDown className="size-4" />
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-auto min-h-11 w-11 shrink-0 rounded-xl"
                    aria-label={T("addRoom")}
                    onClick={() => setRoomSheet(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Desktop: full sidebar */}
                <div className="hidden md:block">
                  <div className="flex flex-col gap-2">
                    {rooms.map(roomButton)}
                  </div>
                  {addRoomForm("mt-3")}
                </div>
              </div>

              {/* Items */}
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                  <h2 className="font-semibold">{trimmed ? T("searchResults") : roomName(activeRoom)}</h2>
                  {!trimmed && !PREDEFINED_ROOMS.some((r) => r.id === activeRoom) && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeRoom(activeRoom)}>
                      <Trash2 className="mr-1 h-4 w-4" /> {T("removeRoom")}
                    </Button>
                  )}
                </div>
                <ul className="max-h-[28rem] divide-y divide-border overflow-y-auto">
                  {visibleItems.length === 0 && (
                    <li className="px-4 py-6 text-sm text-muted-foreground">{trimmed ? T("noMatch") : T("emptyRoom")}</li>
                  )}
                  {visibleItems.map((item) => {
                    const qty = qtyOf(item.room, item.id);
                    const status = statusOf(item.room, item.id);
                    return (
                      <li
                        key={`${item.room}/${item.id}`}
                        className={`px-4 py-2.5 ${status === "maybe" ? "bg-warning/10" : status === "not_moving" ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {item.navn}
                              {item.custom && (
                                <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">
                                  {xl(lang, "custom")}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {trimmed ? `${roomName(item.room)} · ` : ""}
                              {item.dim ? `${item.dim} · ` : ""}
                              {fmt(item.m3)} m³{item.kg > 0 ? ` · ${item.kg} kg` : ""}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {item.custom && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`${T("deleteItem")} ${item.navn}`}
                                onClick={() => removeCustomItem(item.room, item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              aria-label={`${T("fewer")} ${item.navn}`}
                              disabled={qty === 0}
                              onClick={() => setQty(item.room, item.id, qty - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center text-sm font-semibold tabular-nums">{qty}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              aria-label={`${T("more")} ${item.navn}`}
                              onClick={() => setQty(item.room, item.id, qty + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {qty > 0 && (
                          <ItemStatusToggle
                            className="mt-2"
                            lang={lang}
                            value={status}
                            onChange={(next) => setStatus(item.room, item.id, next)}
                            label={item.navn}
                          />
                        )}
                        {item.notes && <p className="mt-1 text-xs text-muted-foreground">{item.notes}</p>}
                      </li>
                    );
                  })}
                </ul>

                <div className="space-y-3 border-t border-border p-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={T("search")}
                      className="pl-9"
                      aria-label={T("search")}
                    />
                  </div>
                  <form
                    className="space-y-2 rounded-xl border border-dashed border-border p-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      addCustomItem();
                    }}
                  >
                    <p className="text-sm font-medium">{T("customTitle", { room: roomName(activeRoom) })}</p>
                    <Input
                      value={ci.navn}
                      onChange={(e) => setCi({ ...ci, navn: e.target.value })}
                      placeholder={T("customName")}
                      maxLength={60}
                      aria-label={T("customName")}
                    />
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {(
                        [
                          ["l", T("length")],
                          ["w", T("width")],
                          ["h", T("height")],
                          ["antall", T("qty")],
                          ["kg", T("weight")],
                        ] as const
                      ).map(([key, label]) => (
                        <div key={key} className="space-y-1">
                          <Label htmlFor={`ci-${key}`} className="text-xs">
                            {label}
                            {key === "kg" && <span className="text-muted-foreground"> {T("optional")}</span>}
                          </Label>
                          <Input
                            id={`ci-${key}`}
                            value={ci[key]}
                            onChange={(e) => setCi({ ...ci, [key]: e.target.value })}
                            inputMode="decimal"
                          />
                        </div>
                      ))}
                    </div>
                    <Input
                      value={ci.notater}
                      onChange={(e) => setCi({ ...ci, notater: e.target.value })}
                      placeholder={T("customNotes")}
                      maxLength={300}
                      aria-label={T("customNotes")}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        {ciPreview > 0 ? T("volumePreview", { n: fmt(ciPreview) }) : T("volumePreview", { n: "…" })}
                      </p>
                      <Button type="submit" variant="outline">
                        <Plus className="mr-1 h-4 w-4" /> {T("add")}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 -mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
              <div className="text-sm">
                <p className="font-semibold">
                  {T("netRec", { a: fmt(total.nettoM3), b: fmt(total.anbefaltM3), c: total.totalKg })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {T("itemsChosen", { n: chosenCount })}
                  {total.detaljer.length > 0 && <> · {translate(vehicleKey, lang)}</>}
                  {maybeTotal.nettoM3 > 0 && <> · {T("ofWhichMaybe", { n: fmt(maybeTotal.nettoM3) })}</>}
                </p>
              </div>
              <div className="flex gap-2">
                {chosenCount > 0 && (
                  <Button type="button" variant="ghost" onClick={resetAll}>
                    {T("reset")}
                  </Button>
                )}
                <Button type="button" disabled={chosenCount === 0} onClick={() => setStep(2)}>
                  {T("next")}
                </Button>
              </div>
            </div>

            <Sheet open={roomSheet} onOpenChange={setRoomSheet}>
              <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl px-4 pb-6 pt-5">
                <SheetTitle>{T("chooseRoom")}</SheetTitle>
                <SheetDescription className="sr-only">{T("chooseRoom")}</SheetDescription>
                {addRoomForm("mt-3")}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {rooms.map(roomButton)}
                </div>
              </SheetContent>
            </Sheet>
          </section>
        )}

        {step === 2 && (
          <section className="mt-6 space-y-6">
            <div className="space-y-3 print:hidden">
              <Totals
                total={total}
                factor={factor}
                setFactor={setFactor}
                vehicle={translate(vehicleKey, lang)}
                T={T}
                fmt={fmt}
              />
              <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
                <div className="space-y-1">
                  <Label htmlFor="pdf-lang" className="text-xs">
                    {xl(lang, "pdfLang")}
                  </Label>
                  <select
                    id="pdf-lang"
                    value={pdfLang}
                    onChange={(e) => {
                      pdfLangChosen.current = true;
                      setPdfLang(e.target.value as Lang);
                    }}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {SUPPORTED_LANGS.map((code) => (
                      <option key={code} value={code}>
                        {LANG_LABELS[code]}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="max-w-md text-xs text-muted-foreground">{T("pdfNote")}</p>
              </div>
            </div>

            {/* Overview: always on screen; printable (= PDF) only once the estimate is saved and unlocked */}
            <article
              className={`rounded-2xl border border-border bg-card p-5 print:border-0 print:p-0 ${unlocked ? "" : "print:hidden"}`}
            >
              <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">{L("reportTitle")}</h2>
                <span className="text-sm text-muted-foreground">
                  {L("date")}: {today}
                </span>
              </header>
              <dl className="mb-5 grid grid-cols-3 gap-3 text-center">
                <Stat label={L("net")} value={`${fmtP(total.nettoM3)} m³`} />
                <Stat label={`${L("recommended")} (×${fmtP(factor)})`} value={`${fmtP(total.anbefaltM3)} m³`} />
                <Stat label={L("weight")} value={`${total.totalKg} kg`} />
              </dl>

              <div className="mb-5 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 print:border-current">
                <Truck className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{L("vehicle")}</p>
                  <p className="text-base font-semibold">{translate(vehicleKey, pdfLang)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{L("buffer", { p: bufferPercent })}</p>
                  {maybeTotal.nettoM3 > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {L("maybeVolume")}: {fmtP(maybeTotal.nettoM3)} m³
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {rooms
                  .filter((r) => perRoom[r.id])
                  .map((r) => (
                    <div key={r.id} className="break-inside-avoid">
                      <h3 className="flex justify-between border-b border-border pb-1 text-sm font-semibold">
                        <span>{roomName(r.id, pdfLang)}</span>
                        <span className="font-normal text-muted-foreground">
                          {fmtP(perRoom[r.id]!.m3)} m³ · {Math.round(perRoom[r.id]!.kg)} kg
                        </span>
                      </h3>
                      <ul className="mt-1 text-sm">
                        {total.detaljer
                          .filter((d) => d.rom === r.id)
                          .map((d) => {
                            const status = statusOf(d.rom, d.id);
                            const own = db[d.rom]?.[d.id];
                            return (
                              <li
                                key={d.id}
                                className={`flex justify-between gap-3 py-0.5 ${
                                  status === "maybe" ? "-mx-1 rounded bg-warning/20 px-1 print:border print:border-current" : ""
                                }`}
                              >
                                <span>
                                  {d.antall} × {d.navn}
                                  {own?.custom && (
                                    <span className="text-muted-foreground">
                                      {" "}
                                      ({L("custom")}
                                      {own.dim ? `, ${own.dim}` : ""})
                                    </span>
                                  )}
                                  {status === "maybe" && <strong className="ml-1 text-xs uppercase">{L("maybe")}</strong>}
                                  {own?.notes && <span className="block text-xs text-muted-foreground">{own.notes}</span>}
                                </span>
                                <span className="shrink-0 text-muted-foreground">
                                  {fmtP(d.m3)} m³ · {Math.round(d.kg)} kg
                                </span>
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  ))}
              </div>

              {maybeTotal.detaljer.length > 0 && (
                <div className="mt-5 break-inside-avoid rounded-xl border border-warning/50 bg-warning/10 p-3 text-sm print:border-current">
                  <h3 className="font-semibold">
                    {L("maybeSection")} — {fmtP(maybeTotal.nettoM3)} m³
                  </h3>
                  <p className="text-xs text-muted-foreground">{L("maybeNote")}</p>
                  <ul className="mt-1">
                    {maybeTotal.detaljer.map((d) => (
                      <li key={`${d.rom}/${d.id}`}>
                        {d.antall} × {d.navn} <span className="text-muted-foreground">({roomName(d.rom, pdfLang)})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {notMovingTotal.detaljer.length > 0 && (
                <div className="mt-4 break-inside-avoid text-sm text-muted-foreground">
                  <h3 className="font-semibold">{L("notMovingSection")}</h3>
                  <ul className="mt-1">
                    {notMovingTotal.detaljer.map((d) => (
                      <li key={`${d.rom}/${d.id}`}>
                        {d.antall} × {d.navn} ({roomName(d.rom, pdfLang)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-5 hidden border-t border-border pt-4 text-sm print:block">
                <h3 className="mb-1 font-semibold">{L("contact")}</h3>
                <p>
                  {form.navn || "—"} · {form.telefon || "—"} · {form.epost || "—"}
                </p>
                <p>
                  {L("pickup")}: {siteLine(form.hent, form.hentEtasje, form.hentHeis, form.hentBaer, form.hentMobil)}
                </p>
                <p>
                  {L("delivery")}: {siteLine(form.lever, form.leverEtasje, form.leverHeis, form.leverBaer, form.leverMobil)}
                </p>
                <p>
                  {L("wishedDate")}: {[form.dato, form.tid].filter(Boolean).join(" · ") || "—"}
                </p>
                {form.notater && (
                  <p className="whitespace-pre-wrap">
                    {L("notes")}: {form.notater}
                  </p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">{L("disclaimer")}</p>
              </div>
            </article>

            {/* Printing without an unlocked estimate yields only this note */}
            {!unlocked && <p className="hidden text-sm print:block">{T("payPrintNote")}</p>}

            {sent ? (
              <div className="space-y-4 rounded-2xl border border-success/40 bg-success/5 p-5 print:hidden">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Check className="size-5 text-success" /> {T("sentTitle")}
                </h2>
                {companyLink ? (
                  <p className="text-sm text-muted-foreground">
                    {T("sentCompany")} {sent.emailed ? T("sentCompanyEmailed") : T("sentCompanyDash")}
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">{T("sentSaved")}</p>
                    <div className="flex gap-2">
                      <Input readOnly value={reportUrl} className="text-xs" aria-label={T("reportLink")} />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={T("copyLink")}
                        onClick={() => {
                          void navigator.clipboard.writeText(reportUrl);
                          toast.success(T("linkCopied"));
                        }}
                      >
                        <Copy className="size-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild>
                        <Link to="/estimate/$id" params={{ id: sent.id }} search={{ token: sent.token }}>
                          {T("openReport")}
                        </Link>
                      </Button>
                      <Button type="button" variant="outline" onClick={downloadPdf}>
                        <Printer className="mr-2 h-4 w-4" /> {T("downloadPdf")}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : !companyLink && !paid ? (
              <Paywall T={T} signedIn={Boolean(session)} noCredits={blocked || Boolean(session)} onBack={() => setStep(1)} />
            ) : (
              <form
                className="space-y-6 rounded-2xl border border-border bg-card p-5 print:hidden"
                onSubmit={(e) => {
                  e.preventDefault();
                  void submit();
                }}
                noValidate
              >
                <h2 className="text-lg font-semibold">{T("moveInfo")}</h2>
                <fieldset className="space-y-3">
                  <legend className="mb-1 text-sm font-semibold text-muted-foreground">{T("contactLegend")}</legend>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field T={T} label={T("nameF")} required={companyLink} error={showErrors && errors.navn}>
                      <Input value={form.navn} onChange={(e) => setField("navn", e.target.value)} autoComplete="name" />
                    </Field>
                    <Field T={T} label={T("phoneF")} required={companyLink} error={showErrors && errors.telefon}>
                      <Input
                        value={form.telefon}
                        onChange={(e) => setField("telefon", e.target.value)}
                        inputMode="tel"
                        autoComplete="tel"
                      />
                    </Field>
                    <Field T={T} label={T("emailF")} required={companyLink} error={showErrors && errors.epost}>
                      <Input
                        type="email"
                        value={form.epost}
                        onChange={(e) => setField("epost", e.target.value)}
                        autoComplete="email"
                      />
                    </Field>
                  </div>
                </fieldset>

                <SiteFields
                  T={T}
                  title={T("pickupLegend")}
                  idPrefix="pickup"
                  required={companyLink}
                  error={showErrors && errors.hent}
                  address={form.hent}
                  floor={form.hentEtasje}
                  elevator={form.hentHeis}
                  carry={form.hentBaer}
                  mobile={form.hentMobil}
                  onAddress={(v) => setField("hent", v)}
                  onFloor={(v) => setField("hentEtasje", v)}
                  onElevator={(v) => setField("hentHeis", v)}
                  onCarry={(v) => setField("hentBaer", v)}
                  onMobile={(v) => setField("hentMobil", v)}
                  autoComplete="street-address"
                />
                <SiteFields
                  T={T}
                  title={T("deliveryLegend")}
                  idPrefix="delivery"
                  required={companyLink}
                  error={showErrors && errors.lever}
                  address={form.lever}
                  floor={form.leverEtasje}
                  elevator={form.leverHeis}
                  carry={form.leverBaer}
                  mobile={form.leverMobil}
                  onAddress={(v) => setField("lever", v)}
                  onFloor={(v) => setField("leverEtasje", v)}
                  onElevator={(v) => setField("leverHeis", v)}
                  onCarry={(v) => setField("leverBaer", v)}
                  onMobile={(v) => setField("leverMobil", v)}
                />

                <fieldset className="space-y-3">
                  <legend className="mb-1 text-sm font-semibold text-muted-foreground">{T("dateLegend")}</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field T={T} label={T("dateF")}>
                      <Input type="date" value={form.dato} onChange={(e) => setField("dato", e.target.value)} />
                    </Field>
                    <Field T={T} label={T("timeF")}>
                      <Input type="time" value={form.tid} onChange={(e) => setField("tid", e.target.value)} />
                    </Field>
                  </div>
                  <Field T={T} label={T("notesF")}>
                    <Textarea
                      rows={4}
                      maxLength={1500}
                      value={form.notater}
                      onChange={(e) => setField("notater", e.target.value)}
                      placeholder={T("notesPh")}
                    />
                  </Field>
                </fieldset>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    {T("back")}
                  </Button>
                  <Button type="submit" className="flex-1 sm:flex-none" disabled={sending}>
                    {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {companyLink ? T("sendToCompany") : T("saveUnlock")}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {companyLink ? T("footCompany") : `${T("footShare")}${T("footPdf")}`}
                </p>
              </form>
            )}
          </section>
        )}
      </main>
      <div className="print:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}

/** Shown instead of the PDF / share-link / save form to visitors without a paid estimate. */
function Paywall({
  T,
  signedIn,
  noCredits,
  onBack,
}: {
  T: (key: CalcKey) => string;
  signedIn: boolean;
  noCredits: boolean;
  onBack: () => void;
}) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 print:hidden">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <LockKeyhole className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">{T("payTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{noCredits && signedIn ? T("payNoCredits") : T("payBody")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/pricing">{T("payBuy")}</Link>
            </Button>
            {!signedIn && (
              <Button asChild variant="outline">
                <Link to="/auth">{T("payLogin")}</Link>
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={onBack}>
              {T("back")}
            </Button>
          </div>
          {!signedIn && <p className="mt-3 text-xs text-muted-foreground">{T("payHint")}</p>}
        </div>
      </div>
    </div>
  );
}

function SiteFields(props: {
  T: (key: CalcKey) => string;
  title: string;
  idPrefix: string;
  required: boolean;
  error: boolean;
  address: string;
  floor: string;
  elevator: boolean;
  carry: string;
  mobile: string;
  autoComplete?: string;
  onAddress: (v: string) => void;
  onFloor: (v: string) => void;
  onElevator: (v: boolean) => void;
  onCarry: (v: string) => void;
  onMobile: (v: string) => void;
}) {
  const { T } = props;
  return (
    <fieldset className="space-y-3">
      <legend className="mb-1 text-sm font-semibold text-muted-foreground">{props.title}</legend>
      <Field T={T} label={T("addressF")} required={props.required} error={props.error}>
        <Input
          value={props.address}
          onChange={(e) => props.onAddress(e.target.value)}
          {...(props.autoComplete ? { autoComplete: props.autoComplete } : {})}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-4">
        <Field T={T} label={T("floorF")}>
          <Input value={props.floor} onChange={(e) => props.onFloor(e.target.value)} inputMode="numeric" maxLength={20} />
        </Field>
        <Field T={T} label={T("carryF")}>
          <Input value={props.carry} onChange={(e) => props.onCarry(e.target.value)} inputMode="numeric" />
        </Field>
        <Field T={T} label={T("mobileF")}>
          <Input value={props.mobile} onChange={(e) => props.onMobile(e.target.value)} inputMode="tel" maxLength={40} />
        </Field>
        <div className="flex items-end pb-2">
          <label htmlFor={`lift-${props.idPrefix}`} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              id={`lift-${props.idPrefix}`}
              type="checkbox"
              checked={props.elevator}
              onChange={(e) => props.onElevator(e.target.checked)}
              className="size-4 rounded border-input accent-primary"
            />
            {T("liftF")}
          </label>
        </div>
      </div>
    </fieldset>
  );
}

function Totals({
  total,
  factor,
  setFactor,
  vehicle,
  T,
  fmt,
}: {
  total: ReturnType<typeof beregn>;
  factor: number;
  setFactor: (n: number) => void;
  vehicle: string;
  T: (key: CalcKey) => string;
  fmt: (n: number, d?: number) => string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border bg-muted/40 p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{T("totalApprox")}</p>
        <p className="text-2xl font-bold">{fmt(total.anbefaltM3)} m³</p>
        <p className="text-sm text-muted-foreground">
          {total.totalKg} kg · {T("netShort")} {fmt(total.nettoM3)} m³ · {T("recVehicle")}: {vehicle}
        </p>
      </div>
      <div className="w-44">
        <Label htmlFor="stuefaktor" className="text-xs">
          {T("stowage")}
        </Label>
        <Input
          id="stuefaktor"
          inputMode="decimal"
          defaultValue={fmt(factor)}
          key={factor}
          onBlur={(e) => {
            const v = num(e.target.value);
            setFactor(v >= 1 && v <= 3 ? v : DEFAULT_STOWAGE_FACTOR);
          }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3 print:border print:border-border">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-bold">{value}</dd>
    </div>
  );
}

function Field({
  T,
  label,
  required,
  error,
  children,
}: {
  T: (key: CalcKey) => string;
  label: string;
  required?: boolean | undefined;
  error?: boolean | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">
        {label} {required && <span className={error ? "text-destructive" : "text-muted-foreground"}>{T("required")}</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{T("invalid")}</p>}
    </div>
  );
}
