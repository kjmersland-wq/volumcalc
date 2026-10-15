import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Printer, Search, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { beregn, DEFAULT_STOWAGE_FACTOR, type CalcChoices, type CalcDatabase } from "@/lib/move-calc";
import { MOVE_DATABASE, PREDEFINED_ROOMS, type RoomDef } from "@/lib/move-data";

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
      { title: "Flyttekalkulator — VolumCalc" },
      {
        name: "description",
        content:
          "Velg rom og gjenstander og få anbefalt volum (m³) og vekt (kg) for flyttelasset. Gratis, direkte i nettleseren.",
      },
      { property: "og:title", content: "Flyttekalkulator — VolumCalc" },
      {
        property: "og:description",
        content: "Rom for rom: regn ut m³ og kg for flyttingen og last ned en ryddig oversikt.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/upload" }],
  }),
  component: CalculatorPage,
});

const STORAGE_KEY = "volumcalc.calc.v2";
const SUPPORT_EMAIL = "support@volumcalc.com";

type CustomItem = { id: string; navn: string; m3: number; kg: number };
type SavedState = {
  rooms: RoomDef[];
  choices: CalcChoices;
  custom: Record<string, CustomItem[]>;
  factor: number;
};
type Form = {
  navn: string;
  telefon: string;
  epost: string;
  hent: string;
  lever: string;
  dato: string;
  tid: string;
  notater: string;
};
const emptyForm: Form = { navn: "", telefon: "", epost: "", hent: "", lever: "", dato: "", tid: "", notater: "" };

const fmt = (n: number, d = 2) => n.toFixed(d).replace(".", ",");
const num = (v: string) => Number(v.replace(",", "."));

function loadSaved(): Partial<SavedState> {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<SavedState>;
  } catch {
    return {};
  }
}

function CalculatorPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [rooms, setRooms] = useState<RoomDef[]>(PREDEFINED_ROOMS);
  const [choices, setChoices] = useState<CalcChoices>({});
  const [custom, setCustom] = useState<Record<string, CustomItem[]>>({});
  const [factor, setFactor] = useState(DEFAULT_STOWAGE_FACTOR);
  const [activeRoom, setActiveRoom] = useState(PREDEFINED_ROOMS[0]!.id);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<Form>(emptyForm);
  const [showErrors, setShowErrors] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Restore after mount (SSR renders the empty state, so no hydration mismatch).
  useEffect(() => {
    const saved = loadSaved();
    if (saved.rooms?.length) setRooms(saved.rooms);
    if (saved.choices) setChoices(saved.choices);
    if (saved.custom) setCustom(saved.custom);
    if (typeof saved.factor === "number" && saved.factor >= 1 && saved.factor <= 3) setFactor(saved.factor);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ rooms, choices, custom, factor }));
    } catch {
      /* private mode etc. — the calculator still works */
    }
  }, [loaded, rooms, choices, custom, factor]);

  // Built-in items plus the visitor's own, per room.
  const db: CalcDatabase = useMemo(() => {
    const merged: CalcDatabase = {};
    for (const room of rooms) {
      const own = Object.fromEntries(
        (custom[room.id] ?? []).map((c) => [c.id, { navn: c.navn, m3: c.m3, kg: c.kg, custom: true }]),
      );
      merged[room.id] = { ...(MOVE_DATABASE[room.id] ?? {}), ...own };
    }
    return merged;
  }, [rooms, custom]);

  const total = useMemo(() => beregn(choices, db, factor), [choices, db, factor]);
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

  const roomName = (id: string) => rooms.find((r) => r.id === id)?.navn ?? id;

  function setQty(room: string, id: string, qty: number) {
    const next = Math.max(0, Math.min(999, Math.floor(qty) || 0));
    setChoices((prev) => ({ ...prev, [room]: { ...(prev[room] ?? {}), [id]: next } }));
  }
  const qtyOf = (room: string, id: string) => choices[room]?.[id] ?? 0;

  const trimmed = query.trim().toLowerCase();
  const visibleItems = useMemo(() => {
    const rows: { room: string; id: string; navn: string; m3: number; kg: number; custom?: boolean }[] = [];
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
  const [ci, setCi] = useState({ navn: "", m3: "", kg: "" });

  function addRoom() {
    const name = newRoom.trim().replace(/\s+/g, " ").slice(0, 40);
    if (!name) return;
    if (rooms.some((r) => r.navn.toLowerCase() === name.toLowerCase())) {
      toast.error("Du har allerede et rom med det navnet.");
      return;
    }
    const id = `rom_${Date.now().toString(36)}`;
    setRooms((prev) => [...prev, { id, navn: name }]);
    setActiveRoom(id);
    setNewRoom("");
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
    const m3v = num(ci.m3);
    const kgv = num(ci.kg || "0");
    if (!navn || !(m3v > 0) || m3v > 100 || !(kgv >= 0) || kgv > 10000) {
      toast.error("Skriv inn navn og et gyldig volum (m³). Vekt (kg) er valgfritt.");
      return;
    }
    const id = `egen_${Date.now().toString(36)}`;
    setCustom((prev) => ({ ...prev, [activeRoom]: [...(prev[activeRoom] ?? []), { id, navn, m3: m3v, kg: kgv }] }));
    setQty(activeRoom, id, 1);
    setCi({ navn: "", m3: "", kg: "" });
  }

  function removeCustomItem(room: string, id: string) {
    setCustom((prev) => ({ ...prev, [room]: (prev[room] ?? []).filter((c) => c.id !== id) }));
    setQty(room, id, 0);
  }

  function resetAll() {
    if (!window.confirm("Nullstille alle valg?")) return;
    setChoices({});
    setCustom({});
    setRooms(PREDEFINED_ROOMS);
    setActiveRoom(PREDEFINED_ROOMS[0]!.id);
  }

  // ---- step 2 ----
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.epost.trim());
  const errors = {
    navn: !form.navn.trim(),
    telefon: form.telefon.replace(/\D/g, "").length < 6,
    epost: !emailOk,
    hent: !form.hent.trim(),
    lever: !form.lever.trim(),
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const setField = (k: keyof Form, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  function summaryText() {
    const lines = [
      "FLYTTEKALKULATOR — VOLUMCALC",
      `Netto: ${fmt(total.nettoM3)} m³ | Anbefalt (×${fmt(factor)}): ${fmt(total.anbefaltM3)} m³ | Vekt: ${total.totalKg} kg`,
      "",
      `Navn: ${form.navn}`,
      `Telefon: ${form.telefon}`,
      `E-post: ${form.epost}`,
      `Henteadresse: ${form.hent}`,
      `Leveringsadresse: ${form.lever}`,
      `Ønsket tidspunkt: ${[form.dato, form.tid].filter(Boolean).join(" kl. ") || "—"}`,
      `Notater: ${form.notater || "—"}`,
      "",
      ...rooms
        .filter((r) => perRoom[r.id])
        .flatMap((r) => [
          `${r.navn} (${fmt(perRoom[r.id]!.m3)} m³, ${Math.round(perRoom[r.id]!.kg)} kg)`,
          ...total.detaljer.filter((d) => d.rom === r.id).map((d) => `  ${d.antall} × ${d.navn}`),
        ]),
    ];
    return lines.join("\n");
  }

  function submit() {
    setShowErrors(true);
    if (hasErrors) {
      toast.error("Fyll ut alle feltene som er merket som påkrevd.");
      return;
    }
    // No backend in this flow: hand the summary to the visitor's mail app.
    const subject = encodeURIComponent(`Flytteforespørsel fra ${form.navn.trim()}`);
    const body = encodeURIComponent(summaryText());
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  }

  function downloadPdf() {
    const previous = document.title;
    document.title = `Flyttekalkulator ${form.dato || new Date().toISOString().slice(0, 10)}`;
    window.addEventListener("afterprint", () => (document.title = previous), { once: true });
    window.print();
  }

  const chosenCount = total.detaljer.reduce((s, d) => s + d.antall, 0);
  const today = new Date().toLocaleDateString("nb-NO");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="print:hidden">
        <SiteHeader />
      </div>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="print:hidden">
          <h1 className="text-2xl font-bold sm:text-3xl">Flyttekalkulator</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Velg rom og gjenstander, så regner vi ut volum og vekt. Tallene er et estimat — faktisk volum og vekt
            kan variere. Alt beregnes i nettleseren din.
          </p>
          <ol className="mt-5 flex gap-2 text-sm font-medium">
            {["Rom og gjenstander", "Resultat og flytteinfo"].map((label, i) => (
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
              <div className="border-b border-border bg-muted/40 p-3 md:border-b-0 md:border-r">
                <div className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible">
                  {rooms.map((room) => {
                    const stats = perRoom[room.id];
                    const active = room.id === activeRoom && !trimmed;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => {
                          setActiveRoom(room.id);
                          setQuery("");
                        }}
                        className={`shrink-0 rounded-xl px-3 py-2 text-left text-sm transition-colors md:w-full ${
                          active ? "bg-background font-semibold shadow-sm ring-1 ring-border" : "hover:bg-background/60"
                        }`}
                      >
                        <span className="block">
                          {stats ? `(${stats.antall} stk) ` : ""}
                          {room.navn}
                        </span>
                        {stats && (
                          <span className="block text-xs font-normal text-muted-foreground">
                            Totalt: {fmt(stats.m3, 1)} m³
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addRoom();
                  }}
                >
                  <Input
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="Eget rom …"
                    maxLength={40}
                    aria-label="Navn på nytt rom"
                  />
                  <Button type="submit" variant="outline" size="icon" aria-label="Legg til rom">
                    <Plus className="h-4 w-4" />
                  </Button>
                </form>
              </div>

              {/* Items */}
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                  <h2 className="font-semibold">{trimmed ? "Søkeresultater" : roomName(activeRoom)}</h2>
                  {!trimmed && !PREDEFINED_ROOMS.some((r) => r.id === activeRoom) && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeRoom(activeRoom)}>
                      <Trash2 className="mr-1 h-4 w-4" /> Fjern rom
                    </Button>
                  )}
                </div>
                <ul className="max-h-[28rem] divide-y divide-border overflow-y-auto">
                  {visibleItems.length === 0 && (
                    <li className="px-4 py-6 text-sm text-muted-foreground">
                      {trimmed ? "Ingen treff. Legg til gjenstanden under." : "Ingen gjenstander i dette rommet ennå — legg til under."}
                    </li>
                  )}
                  {visibleItems.map((item) => {
                    const qty = qtyOf(item.room, item.id);
                    return (
                      <li key={`${item.room}/${item.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.navn}</p>
                          <p className="text-xs text-muted-foreground">
                            {trimmed ? `${roomName(item.room)} · ` : ""}
                            {fmt(item.m3)} m³ · {item.kg} kg
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {item.custom && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Slett ${item.navn}`}
                              onClick={() => removeCustomItem(item.room, item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label={`Færre ${item.navn}`}
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
                            aria-label={`Flere ${item.navn}`}
                            onClick={() => setQty(item.room, item.id, qty + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
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
                      placeholder="Søk etter gjenstand i alle rom …"
                      className="pl-9"
                      aria-label="Søk etter gjenstand"
                    />
                  </div>
                  <form
                    className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_90px_90px_auto]"
                    onSubmit={(e) => {
                      e.preventDefault();
                      addCustomItem();
                    }}
                  >
                    <Input
                      className="col-span-2 sm:col-span-1"
                      value={ci.navn}
                      onChange={(e) => setCi({ ...ci, navn: e.target.value })}
                      placeholder={`Egen gjenstand i ${roomName(activeRoom).toLowerCase()}`}
                      maxLength={60}
                      aria-label="Navn på egen gjenstand"
                    />
                    <Input
                      value={ci.m3}
                      onChange={(e) => setCi({ ...ci, m3: e.target.value })}
                      placeholder="m³"
                      inputMode="decimal"
                      aria-label="Volum i kubikkmeter"
                    />
                    <Input
                      value={ci.kg}
                      onChange={(e) => setCi({ ...ci, kg: e.target.value })}
                      placeholder="kg"
                      inputMode="decimal"
                      aria-label="Vekt i kilo"
                    />
                    <Button type="submit" variant="outline" className="col-span-2 sm:col-span-1">
                      Legg til
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 -mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
              <div className="text-sm">
                <p className="font-semibold">
                  Netto {fmt(total.nettoM3)} m³ · Anbefalt {fmt(total.anbefaltM3)} m³ · {total.totalKg} kg
                </p>
                <p className="text-xs text-muted-foreground">{chosenCount} gjenstander valgt</p>
              </div>
              <div className="flex gap-2">
                {chosenCount > 0 && (
                  <Button type="button" variant="ghost" onClick={resetAll}>
                    Nullstill
                  </Button>
                )}
                <Button type="button" disabled={chosenCount === 0} onClick={() => setStep(2)}>
                  Neste
                </Button>
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="mt-6 space-y-6">
            <div className="print:hidden">
              <Totals total={total} factor={factor} setFactor={setFactor} />
            </div>

            {/* Printable report (also the on-screen summary) */}
            <article className="rounded-2xl border border-border bg-card p-5 print:border-0 print:p-0">
              <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">Flyttekalkulator — oversikt</h2>
                <span className="text-sm text-muted-foreground">Dato: {today}</span>
              </header>
              <dl className="mb-5 grid grid-cols-3 gap-3 text-center">
                <Stat label="Netto" value={`${fmt(total.nettoM3)} m³`} />
                <Stat label={`Anbefalt (×${fmt(factor)})`} value={`${fmt(total.anbefaltM3)} m³`} />
                <Stat label="Total vekt" value={`${total.totalKg} kg`} />
              </dl>
              <div className="space-y-4">
                {rooms
                  .filter((r) => perRoom[r.id])
                  .map((r) => (
                    <div key={r.id} className="break-inside-avoid">
                      <h3 className="flex justify-between border-b border-border pb-1 text-sm font-semibold">
                        <span>{r.navn}</span>
                        <span className="font-normal text-muted-foreground">
                          {fmt(perRoom[r.id]!.m3)} m³ · {Math.round(perRoom[r.id]!.kg)} kg
                        </span>
                      </h3>
                      <ul className="mt-1 text-sm">
                        {total.detaljer
                          .filter((d) => d.rom === r.id)
                          .map((d) => (
                            <li key={d.id} className="flex justify-between py-0.5">
                              <span>
                                {d.antall} × {d.navn}
                              </span>
                              <span className="text-muted-foreground">
                                {fmt(d.m3)} m³ · {Math.round(d.kg)} kg
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
              </div>
              <div className="mt-5 hidden border-t border-border pt-4 text-sm print:block">
                <h3 className="mb-1 font-semibold">Kontaktinfo</h3>
                <p>
                  {form.navn || "—"} · {form.telefon || "—"} · {form.epost || "—"}
                </p>
                <p>Henting: {form.hent || "—"}</p>
                <p>Levering: {form.lever || "—"}</p>
                <p>Ønsket tidspunkt: {[form.dato, form.tid].filter(Boolean).join(" kl. ") || "—"}</p>
                {form.notater && <p className="whitespace-pre-wrap">Notater: {form.notater}</p>}
                <p className="mt-3 text-xs text-muted-foreground">
                  Estimat fra VolumCalc — faktisk volum og vekt kan variere.
                </p>
              </div>
            </article>

            <form
              className="space-y-6 rounded-2xl border border-border bg-card p-5 print:hidden"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              noValidate
            >
              <h2 className="text-lg font-semibold">Flytteinfo</h2>
              <fieldset className="space-y-3">
                <legend className="mb-1 text-sm font-semibold text-muted-foreground">1. Kontaktinfo</legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Navn" required error={showErrors && errors.navn}>
                    <Input value={form.navn} onChange={(e) => setField("navn", e.target.value)} autoComplete="name" />
                  </Field>
                  <Field label="Telefon" required error={showErrors && errors.telefon}>
                    <Input
                      value={form.telefon}
                      onChange={(e) => setField("telefon", e.target.value)}
                      inputMode="tel"
                      autoComplete="tel"
                    />
                  </Field>
                  <Field label="E-post" required error={showErrors && errors.epost}>
                    <Input
                      type="email"
                      value={form.epost}
                      onChange={(e) => setField("epost", e.target.value)}
                      autoComplete="email"
                    />
                  </Field>
                </div>
              </fieldset>
              <fieldset className="space-y-3">
                <legend className="mb-1 text-sm font-semibold text-muted-foreground">2. Henteadresse</legend>
                <Field label="Adresse" required error={showErrors && errors.hent}>
                  <Input value={form.hent} onChange={(e) => setField("hent", e.target.value)} autoComplete="street-address" />
                </Field>
              </fieldset>
              <fieldset className="space-y-3">
                <legend className="mb-1 text-sm font-semibold text-muted-foreground">3. Leveringsadresse</legend>
                <Field label="Adresse" required error={showErrors && errors.lever}>
                  <Input value={form.lever} onChange={(e) => setField("lever", e.target.value)} />
                </Field>
              </fieldset>
              <fieldset className="space-y-3">
                <legend className="mb-1 text-sm font-semibold text-muted-foreground">4. Ønsket tidspunkt og notater</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Dato">
                    <Input type="date" value={form.dato} onChange={(e) => setField("dato", e.target.value)} />
                  </Field>
                  <Field label="Klokkeslett">
                    <Input type="time" value={form.tid} onChange={(e) => setField("tid", e.target.value)} />
                  </Field>
                </div>
                <Field label="Notater / ekstra info">
                  <Textarea
                    rows={4}
                    maxLength={1500}
                    value={form.notater}
                    onChange={(e) => setField("notater", e.target.value)}
                    placeholder="F.eks. etasje, heis, tung gjenstand, parkering …"
                  />
                </Field>
              </fieldset>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Tilbake
                </Button>
                <Button type="button" variant="outline" onClick={downloadPdf}>
                  <Printer className="mr-2 h-4 w-4" /> Last ned PDF
                </Button>
                <Button type="submit" className="flex-1 sm:flex-none">
                  <Send className="mr-2 h-4 w-4" /> Send inn
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                «Send inn» åpner e-postprogrammet ditt med oppsummeringen til {SUPPORT_EMAIL}. «Last ned PDF» åpner
                utskriftsdialogen — velg «Lagre som PDF».
              </p>
            </form>
          </section>
        )}
      </main>
      <div className="print:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}

function Totals({
  total,
  factor,
  setFactor,
}: {
  total: ReturnType<typeof beregn>;
  factor: number;
  setFactor: (n: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border bg-muted/40 p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Totalt ca.</p>
        <p className="text-2xl font-bold">{fmt(total.anbefaltM3)} m³</p>
        <p className="text-sm text-muted-foreground">
          {total.totalKg} kg · netto {fmt(total.nettoM3)} m³
        </p>
      </div>
      <div className="w-40">
        <Label htmlFor="stuefaktor" className="text-xs">
          Stuefaktor (anbefalt = netto ×)
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
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">
        {label} {required && <span className={error ? "text-destructive" : "text-muted-foreground"}>(må fylles)</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">Mangler eller er ugyldig.</p>}
    </div>
  );
}
