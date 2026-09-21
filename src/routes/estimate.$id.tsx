import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Boxes,
  Check,
  Download,
  Link2,
  Loader2,
  Minus,
  Package,
  Pencil,
  Plus,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ShareButtons } from "@/components/ShareButtons";
import { QuoteRequestDialog } from "@/components/QuoteRequestDialog";
import { useI18n, translate, SUPPORTED_LANGS, LANG_LABELS, type Lang } from "@/lib/i18n";
import { reportLangs } from "@/lib/report-langs";
import { MovePriceEstimator } from "@/components/MovePriceEstimator";
import { MoverOutreach } from "@/components/MoverOutreach";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { claimEstimate, getSharedEstimate } from "@/lib/estimates.functions";
import { m3, money, shortDate } from "@/lib/format";
import { useLocalizedMeta } from "@/lib/use-localized-meta";
import { recommendVehicle, recommendedVolume, storageUnitM2 } from "@/lib/volume";
import { getStoredItemLabel, getStoredRoomLabel } from "@/lib/volume-database";

export const Route = createFileRoute("/estimate/$id")({
  staticData: { sitemap: false },
  validateSearch: (search: Record<string, unknown>): { token?: string } => {
    const token = search["token"];
    return typeof token === "string" && token ? { token } : {};
  },
  head: () => ({
    meta: [
      { title: "Estimate report — VolumCalc" },
      {
        name: "description",
        content:
          "Itemised cubic metre estimate and inventory review generated from room video and checklist.",
      },
      { property: "og:title", content: "Estimate report — VolumCalc" },
      {
        property: "og:description",
        content: "Itemised cubic metre estimate and inventory review.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EstimatePage,
});

type Item = {
  id: string;
  name: string;
  name_no: string | null;
  quantity: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  volume_m3: number;
  confidence: number;
  photo_url: string | null;
  room_id: string | null;
  notes: string | null;
  tags: string[];
  is_included: boolean;
};

type Room = { id: string; name: string; sort_order: number };

type Logistics = {
  storage_enabled: boolean;
  storage_company: string;
  storage_address: string;
  storage_contact: string;
  storage_phone: string;
  delivery_address: string;
  delivery_floor: string;
  delivery_elevator: boolean;
  delivery_carry_distance: string;
  delivery_notes: string;
  packing_requested: boolean;
  packing_level: string;
  packing_materials: Record<string, number>;
  packing_notes: string;
};

const MATERIALS = ["boxes", "bubble", "paper", "tape", "wardrobe", "mattress", "blanket"] as const;

const TAGS = [
  { value: "disassemble", key: "rep.tag.disassemble" },
  { value: "fragile", key: "rep.tag.fragile" },
  { value: "heavy", key: "rep.tag.heavy" },
  { value: "discard", key: "rep.tag.discard" },
] as const;

const CHECKLIST = ["rep.check1", "rep.check2", "rep.check3", "rep.check4"] as const;

function itemVolume(item: Item, patch: Partial<Item> = {}) {
  const l = Number(patch.length_cm ?? item.length_cm);
  const w = Number(patch.width_cm ?? item.width_cm);
  const h = Number(patch.height_cm ?? item.height_cm);
  const q = Number(patch.quantity ?? item.quantity);
  return Math.round(((l * w * h * q) / 1_000_000) * 100) / 100;
}

function EstimatePage() {
  const { id } = Route.useParams();
  const { token } = Route.useSearch();
  const { lang } = useI18n();
  const { session, loading: authLoading } = useAuth();
  const loadShared = useServerFn(getSharedEstimate);
  const claim = useServerFn(claimEstimate);
  const queryClient = useQueryClient();

  const [renamingRoom, setRenamingRoom] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("");
  const [view, setView] = useState<"customer" | "business">("customer");
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [access, setAccess] = useState<{
    access_floor: string;
    has_elevator: boolean;
    carry_distance_m: string;
    access_notes: string;
  } | null>(null);
  const [internalNotes, setInternalNotes] = useState<string | null>(null);
  const [hourly, setHourly] = useState("1200");
  const [hours, setHours] = useState("5");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const initialReportLang: Lang = String(lang) === "dk" ? "da" : lang;
  const [reportLang, setReportLang] = useState<Lang>(initialReportLang);
  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const [tenderMode, setTenderMode] = useState(false);
  const [logistics, setLogistics] = useState<Logistics | null>(null);

  // Report labels follow the chosen report language; user-entered text is untouched.
  const rt = (key: string) => reportLangs[reportLang]?.[key] ?? translate(key, reportLang);

  const { data, isLoading } = useQuery({
    queryKey: ["estimate", id, session?.user.id ?? "guest"],
    enabled: !authLoading,
    queryFn: async () => {
      if (!session) {
        if (!token)
          return { estimate: null, items: [] as Item[], rooms: [] as Room[], company: null };
        const shared = await loadShared({ data: { id, token } });
        if (!shared)
          return { estimate: null, items: [] as Item[], rooms: [] as Room[], company: null };
        return {
          estimate: shared.estimate,
          items: shared.items as unknown as Item[],
          rooms: shared.rooms as Room[],
          company: null,
        };
      }
      const [{ data: estimate }, { data: items }, { data: rooms }, { data: company }] =
        await Promise.all([
          supabase.from("estimates").select("*").eq("id", id).maybeSingle(),
          supabase
            .from("estimate_items")
            .select("*")
            .eq("estimate_id", id)
            .is("deleted_at", null)
            .order("volume_m3", { ascending: false }),
          supabase
            .from("estimate_rooms")
            .select("id,name,sort_order")
            .eq("estimate_id", id)
            .order("sort_order"),
          supabase.from("companies").select("*").eq("id", session.user.id).maybeSingle(),
        ]);
      // An estimate that no company owns yet is only reachable through its share
      // link; the company can take ownership of it from here.
      if (!estimate && token) {
        const shared = await loadShared({ data: { id, token } });
        if (shared) {
          return {
            estimate: shared.estimate,
            items: shared.items as unknown as Item[],
            rooms: shared.rooms as Room[],
            company,
            unclaimed: true,
          };
        }
      }
      return {
        estimate,
        items: (items ?? []) as unknown as Item[],
        rooms: (rooms ?? []) as Room[],
        company,
      };
    },
  });

  const estimate = data?.estimate as
    | (Record<string, unknown> & {
        id: string;
        status: string;
        created_at: string;
        customer_name: string | null;
        customer_phone: string | null;
        address: string | null;
        photo_urls: string[] | null;
        access_floor: number | null;
        has_elevator: boolean | null;
        carry_distance_m: number | null;
        access_notes: string | null;
        internal_notes?: string | null;
        share_token?: string;
      })
    | null
    | undefined;

  useEffect(() => {
    if (!estimate) return;
    setAccess(
      (prev) =>
        prev ?? {
          access_floor: estimate.access_floor != null ? String(estimate.access_floor) : "",
          has_elevator: Boolean(estimate.has_elevator),
          carry_distance_m:
            estimate.carry_distance_m != null ? String(estimate.carry_distance_m) : "",
          access_notes: estimate.access_notes ?? "",
        },
    );
    setInternalNotes((prev) => prev ?? estimate.internal_notes ?? "");
    const e = estimate as Record<string, unknown>;
    setLogistics(
      (prev) =>
        prev ?? {
          storage_enabled: Boolean(e["storage_enabled"]),
          storage_company: (e["storage_company"] as string) ?? "",
          storage_address: (e["storage_address"] as string) ?? "",
          storage_contact: (e["storage_contact"] as string) ?? "",
          storage_phone: (e["storage_phone"] as string) ?? "",
          delivery_address: (e["delivery_address"] as string) ?? "",
          delivery_floor: (e["delivery_floor"] as string) ?? "",
          delivery_elevator: Boolean(e["delivery_elevator"]),
          delivery_carry_distance: (e["delivery_carry_distance"] as string) ?? "",
          delivery_notes: (e["delivery_notes"] as string) ?? "",
          packing_requested: Boolean(e["packing_requested"]),
          packing_level: (e["packing_level"] as string) ?? "fragile",
          packing_materials: (e["packing_materials"] as Record<string, number>) ?? {},
          packing_notes: (e["packing_notes"] as string) ?? "",
        },
    );
    setTenderMode(Boolean(e["tender_mode"]));
    const saved = e["report_language"];
    if (
      saved === "no" ||
      saved === "en" ||
      saved === "sv" ||
      saved === "da" ||
      saved === "dk" ||
      saved === "fi" ||
      saved === "de" ||
      saved === "nl" ||
      saved === "fr" ||
      saved === "pl" ||
      saved === "es" ||
      saved === "it" ||
      saved === "pt"
    ) {
      setReportLang(saved === "dk" ? "da" : saved);
    }
  }, [estimate]);

  useEffect(() => {
    if (session) setView("business");
  }, [session]);

  async function recalcTotal() {
    const { data: rows } = await supabase
      .from("estimate_items")
      .select("volume_m3,is_included")
      .eq("estimate_id", id)
      .is("deleted_at", null);
    const total =
      Math.round(
        (rows ?? [])
          .filter((r) => (r as { is_included?: boolean }).is_included !== false)
          .reduce((sum, r) => sum + Number(r.volume_m3), 0) * 100,
      ) / 100;
    await supabase.from("estimates").update({ total_volume_m3: total }).eq("id", id);
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["estimate", id] });

  const patchItem = useMutation({
    mutationFn: async ({ item, patch }: { item: Item; patch: Partial<Item> }) => {
      const payload: TablesUpdate<"estimate_items"> = { ...patch };
      if (
        patch.length_cm !== undefined ||
        patch.width_cm !== undefined ||
        patch.height_cm !== undefined ||
        patch.quantity !== undefined
      ) {
        payload.volume_m3 = itemVolume(item, patch);
      }
      const { error } = await supabase.from("estimate_items").update(payload).eq("id", item.id);
      if (error) throw error;
      await recalcTotal();
    },
    onSuccess: invalidate,
    onError: () => toast.error(rt("upload.failed")),
  });

  const softDelete = useMutation({
    mutationFn: async ({ itemId, restore }: { itemId: string; restore?: boolean }) => {
      const { error } = await supabase
        .from("estimate_items")
        .update({ deleted_at: restore ? null : new Date().toISOString() })
        .eq("id", itemId);
      if (error) throw error;
      await recalcTotal();
    },
    onSuccess: invalidate,
  });

  const claimEstimateMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Missing share token");
      await claim({ data: { id, token } });
    },
    onSuccess: () => {
      toast.success(rt("rep.saved"));
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
    },
    onError: () => toast.error(rt("upload.failed")),
  });

  const approve = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("estimates")
        .update({ status: "approved", company_id: session?.user.id ?? null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(rt("dash.approved"));
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
    },
  });

  const renameRoom = useMutation({
    mutationFn: async ({ roomId, name }: { roomId: string; name: string }) => {
      const cleanName = name.trim();
      if (!cleanName) throw new Error("empty");
      const { error } = await supabase
        .from("estimate_rooms")
        .update({ name: cleanName })
        .eq("id", roomId);
      if (error) throw error;
    },
    onSuccess: () => {
      setRenamingRoom(null);
      invalidate();
    },
  });

  const moveItem = useMutation({
    mutationFn: async ({ itemId, roomId }: { itemId: string; roomId: string | null }) => {
      const { error } = await supabase
        .from("estimate_items")
        .update({ room_id: roomId })
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const saveAccess = useMutation({
    mutationFn: async () => {
      if (!access) return;
      const { error } = await supabase
        .from("estimates")
        .update({
          access_floor: access.access_floor === "" ? null : Number(access.access_floor),
          has_elevator: access.has_elevator,
          carry_distance_m: access.carry_distance_m === "" ? null : Number(access.carry_distance_m),
          access_notes: access.access_notes.trim() || null,
          internal_notes: (internalNotes ?? "").trim() || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(rt("rep.saved"));
      invalidate();
    },
    onError: () => toast.error(rt("upload.failed")),
  });

  const saveLogistics = useMutation({
    mutationFn: async () => {
      if (!logistics) return;
      const { error } = await supabase
        .from("estimates")
        .update({
          storage_enabled: logistics.storage_enabled,
          storage_company: logistics.storage_company.trim() || null,
          storage_address: logistics.storage_address.trim() || null,
          storage_contact: logistics.storage_contact.trim() || null,
          storage_phone: logistics.storage_phone.trim() || null,
          delivery_address: logistics.delivery_address.trim() || null,
          delivery_floor: logistics.delivery_floor.trim() || null,
          delivery_elevator: logistics.delivery_elevator,
          delivery_carry_distance: logistics.delivery_carry_distance.trim() || null,
          delivery_notes: logistics.delivery_notes.trim() || null,
          packing_requested: logistics.packing_requested,
          packing_level: logistics.packing_level,
          packing_materials: logistics.packing_materials,
          packing_notes: logistics.packing_notes.trim() || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(rt("rep.saved"));
      invalidate();
    },
    onError: () => toast.error(rt("upload.failed")),
  });

  const saveReportSettings = useMutation({
    mutationFn: async (patch: TablesUpdate<"estimates">) => {
      const { error } = await supabase.from("estimates").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const items = useMemo(() => data?.items ?? [], [data]);
  const rooms = data?.rooms ?? [];
  const included = items.filter((item) => item.is_included !== false);
  const netVolume =
    Math.round(included.reduce((sum, i) => sum + Number(i.volume_m3), 0) * 100) / 100;
  const gross = recommendedVolume(netVolume);
  const reportTitle =
    ((estimate as Record<string, unknown> | undefined)?.["report_title"] as string | null) ||
    estimate?.customer_name ||
    rt("res.title");
  useLocalizedMeta({
    title: `${reportTitle} — VolumCalc`,
    description: rt("res.disclaimer"),
  });

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
          {rt("res.notFound")}
        </main>
        <SiteFooter />
      </div>
    );
  }

  const company = data?.company as {
    price_per_m3: number;
    currency: string;
    company_name: string;
    logo_url?: string | null;
    org_number?: string | null;
    address?: string | null;
    phone?: string | null;
    contact_email?: string | null;
    website?: string | null;
  } | null;
  const currency = company?.currency ?? "NOK";
  const unclaimed = Boolean((data as { unclaimed?: boolean } | undefined)?.unclaimed);
  const canEdit = Boolean(session) && !unclaimed;
  const businessView = canEdit && view === "business";
  const shareToken = (estimate.share_token as string | undefined) ?? token;

  const statusKey =
    estimate.status === "approved"
      ? "rep.status.processed"
      : items.length
        ? "rep.status.ready"
        : "rep.status.draft";

  const displayItemName = (item: Item) => getStoredItemLabel(item, reportLang);
  const editableItemName = (item: Item) => (lang === "no" ? item.name_no || item.name : item.name);
  const displayRoomName = (name: string) => getStoredRoomLabel(name, reportLang);
  const editableRoomName = (name: string) => getStoredRoomLabel(name, lang);

  const groups = [
    ...rooms.map((room) => ({
      ...room,
      displayName: displayRoomName(room.name),
      items: items.filter((item) => item.room_id === room.id),
    })),
    ...(items.some((item) => !item.room_id)
      ? [
          {
            id: "other",
            name: rt("res.other"),
            displayName: rt("res.other"),
            sort_order: 999,
            items: items.filter((item) => !item.room_id),
          },
        ]
      : []),
  ].filter((group) => group.items.length > 0);

  function copySecretLink() {
    const url = `${window.location.origin}/estimate/${id}${shareToken ? `?token=${shareToken}` : ""}`;
    navigator.clipboard.writeText(url);
    toast.success(rt("res.copied"));
  }

  function exportCsv() {
    const rows = [
      ["Room", "Item", "Qty", "L cm", "W cm", "H cm", "m3", "Included", "Tags", "Notes"],
      ...groups.flatMap((group) =>
        group.items.map((item) => [
          group.displayName,
          displayItemName(item),
          item.quantity,
          Math.round(item.length_cm),
          Math.round(item.width_cm),
          Math.round(item.height_cm),
          item.volume_m3,
          item.is_included === false ? "no" : "yes",
          (item.tags ?? []).join("|"),
          (item.notes ?? "").replace(/[\n;]/g, " "),
        ]),
      ),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `volumcalc-${String(id).slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10">
          {company && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-4">
                {company.logo_url && (
                  <img
                    src={company.logo_url}
                    alt=""
                    className="h-12 w-auto max-w-40 object-contain"
                  />
                )}
                <div>
                  <p className="text-lg font-bold">{company.company_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[company.org_number, company.address].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {company.phone && <p>{company.phone}</p>}
                {company.contact_email && <p>{company.contact_email}</p>}
                {company.website && <p>{company.website}</p>}
              </div>
            </div>
          )}

          {unclaimed && (
            <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-5">
              <p className="text-sm text-muted-foreground">{rt("rep.claimHelp")}</p>
              <Button
                size="sm"
                onClick={() => claimEstimateMutation.mutate()}
                disabled={claimEstimateMutation.isPending}
              >
                {claimEstimateMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                {rt("dash.claim")}
              </Button>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {rt("rep.estimateId")} #{String(estimate.id).slice(0, 8).toUpperCase()}
                </p>
                <Badge
                  variant="secondary"
                  className={
                    statusKey === "rep.status.processed"
                      ? "bg-success/15 text-success"
                      : statusKey === "rep.status.ready"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                  }
                >
                  {rt(statusKey)}
                </Badge>
              </div>
              {titleDraft !== null ? (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Input
                    autoFocus
                    value={titleDraft}
                    placeholder={rt("rep.titlePlaceholder")}
                    onChange={(event) => setTitleDraft(event.target.value)}
                    className="h-11 max-w-md text-lg font-semibold"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      saveReportSettings.mutate({ report_title: titleDraft.trim() || null });
                      toast.success(rt("rep.titleSaved"));
                      setTitleDraft(null);
                    }}
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setTitleDraft(null)}>
                    {rt("rep.cancel")}
                  </Button>
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">{reportTitle}</h1>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="no-print"
                      aria-label={rt("rep.titleEdit")}
                      onClick={() => setTitleDraft(reportTitle)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  )}
                </div>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                {shortDate(estimate.created_at, reportLang)}
                {estimate.address ? ` · ${estimate.address}` : ""}
                {estimate.customer_phone ? ` · ${estimate.customer_phone}` : ""}
              </p>
            </div>
            <div className="no-print flex flex-wrap items-center gap-2">
              {shareToken && (
                <Button variant="outline" size="sm" onClick={copySecretLink}>
                  <Link2 className="size-4" />
                  {rt("rep.shareSecret")}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="size-4" />
                {rt("rep.pdf")}
              </Button>
              {!businessView && shareToken && (
                <QuoteRequestDialog id={String(estimate.id)} token={shareToken} />
              )}
              {canEdit && estimate.status !== "approved" && (
                <Button size="sm" onClick={() => approve.mutate()}>
                  <Check className="size-4" />
                  {rt("dash.approve")}
                </Button>
              )}
            </div>
          </div>

          {canEdit && (
            <Tabs
              value={view}
              onValueChange={(value) => setView(value as "customer" | "business")}
              className="no-print mt-6"
            >
              <TabsList>
                <TabsTrigger value="customer">{rt("rep.viewCustomer")}</TabsTrigger>
                <TabsTrigger value="business">{rt("rep.viewBusiness")}</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {canEdit && (
            <div className="no-print mt-4 grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="report-lang">{rt("rep.reportLang")}</Label>
                <Select
                  value={reportLang}
                  onValueChange={(value) => {
                    setReportLang(value as Lang);
                    saveReportSettings.mutate({ report_language: value });
                  }}
                >
                  <SelectTrigger id="report-lang">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGS.map((code) => (
                      <SelectItem key={code} value={code}>
                        {LANG_LABELS[code]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{rt("rep.reportLangHelp")}</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Switch
                    id="tender"
                    checked={tenderMode}
                    onCheckedChange={(value) => {
                      setTenderMode(value);
                      saveReportSettings.mutate({ tender_mode: value });
                    }}
                  />
                  <Label htmlFor="tender">{rt("rep.tender")}</Label>
                </div>
                <p className="text-xs text-muted-foreground">{rt("rep.tenderHelp")}</p>
              </div>
            </div>
          )}

          {/* Summary cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="card-soft p-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {rt("rep.netVolume")}
              </p>
              <p className="mt-2 flex items-center gap-2 text-3xl font-extrabold text-primary">
                <Boxes className="size-6" />
                {m3(netVolume)}
              </p>
            </div>
            <div className="card-soft p-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {rt("rep.recommended")}
              </p>
              <p className="mt-2 flex items-center gap-2 text-3xl font-extrabold">
                <Truck className="size-6 text-primary" />
                {m3(gross)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{rt(recommendVehicle(gross))}</p>
              {!businessView && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {rt("rep.storage")} {storageUnitM2(gross)} m²
                </p>
              )}
            </div>
            <div className="card-soft p-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {rt("rep.counts")}
              </p>
              <p className="mt-2 flex items-center gap-2 text-3xl font-extrabold">
                <Package className="size-6 text-primary" />
                {included.length}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {included.length} {rt("rep.itemsWord")} · {groups.length} {rt("rep.roomsWord")}
              </p>
            </div>
          </div>

          {!businessView && !tenderMode && (
            <MovePriceEstimator
              volumeM3={gross}
              currency={currency}
              rt={rt}
              defaults={{
                from: ((estimate as Record<string, unknown>)["move_from"] as string) ?? "",
                to: ((estimate as Record<string, unknown>)["move_to"] as string) ?? "",
                distanceKm: Number((estimate as Record<string, unknown>)["move_distance_km"] ?? 0),
              }}
              {...(canEdit
                ? {
                    onChange: (value: { from: string; to: string; distanceKm: number }) =>
                      saveReportSettings.mutate({
                        move_from: value.from || null,
                        move_to: value.to || null,
                        move_distance_km: value.distanceKm || null,
                      }),
                  }
                : {})}
            />
          )}

          {!businessView && shareToken && (
            <MoverOutreach estimateId={String(estimate.id)} token={shareToken} rt={rt} />
          )}

          <ShareButtons
            title={`${rt("res.title")} — VolumCalc`}
            text={`${rt("res.title")}: ${m3(netVolume)} · ${included.length} ${rt("res.items")}`}
            langOverride={reportLang}
          />

          {/* Rooms & items */}
          <div className="mt-8 space-y-6">
            {groups.map((group) => (
              <section key={group.id} className="card-soft overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-4">
                  {renamingRoom === group.id ? (
                    <form
                      className="no-print flex gap-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (!roomName.trim()) return;
                        renameRoom.mutate({ roomId: group.id, name: roomName });
                      }}
                    >
                      <Input
                        value={roomName}
                        onChange={(event) => setRoomName(event.target.value)}
                        maxLength={80}
                        autoFocus
                        className="h-9 w-56"
                        aria-label={rt("res.renameRoom")}
                      />
                      <Button size="sm" type="submit" disabled={!roomName.trim()}>
                        {rt("dash.saveItem")}
                      </Button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold">{group.displayName}</h2>
                      {canEdit && group.id !== "other" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="no-print size-8"
                          aria-label={rt("res.renameRoom")}
                          onClick={() => {
                            setRenamingRoom(group.id);
                            setRoomName(group.name);
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                  <p className="text-sm font-semibold text-primary">
                    {rt("res.roomTotal")}:{" "}
                    {m3(
                      group.items
                        .filter((item) => item.is_included !== false)
                        .reduce((sum, item) => sum + Number(item.volume_m3), 0),
                    )}
                  </p>
                </div>

                <ul className="divide-y divide-border">
                  {group.items.map((item) => (
                    <li
                      key={item.id}
                      className={item.is_included === false ? "px-5 py-4 opacity-60" : "px-5 py-4"}
                    >
                      <div className="flex items-start gap-4">
                        {item.photo_url ? (
                          <img
                            src={item.photo_url}
                            alt=""
                            loading="lazy"
                            className="size-16 shrink-0 rounded-lg border border-border object-cover"
                          />
                        ) : (
                          <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <Boxes className="size-5" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          {canEdit ? (
                            <Input
                              defaultValue={editableItemName(item)}
                              maxLength={120}
                              className="h-9 max-w-xs font-medium"
                              aria-label={rt("res.item")}
                              onBlur={(e) => {
                                const value = e.target.value.trim();
                                if (!value) {
                                  e.target.value = editableItemName(item);
                                  return;
                                }
                                const current = editableItemName(item);
                                if (value === current) return;
                                patchItem.mutate({
                                  item,
                                  patch: lang === "no" ? { name_no: value } : { name: value },
                                });
                              }}
                            />
                          ) : (
                            <p className="truncate font-medium">{displayItemName(item)}</p>
                          )}

                          <p className="mt-1 text-xs text-muted-foreground">
                            {Math.round(item.length_cm)} × {Math.round(item.width_cm)} ×{" "}
                            {Math.round(item.height_cm)} cm · {m3(item.volume_m3)}
                          </p>

                          {canEdit && (
                            <div className="no-print mt-2 flex flex-wrap items-center gap-2">
                              <div className="flex items-center gap-1 rounded-md border border-input">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-8"
                                  aria-label="-"
                                  disabled={item.quantity <= 1}
                                  onClick={() =>
                                    patchItem.mutate({
                                      item,
                                      patch: { quantity: item.quantity - 1 },
                                    })
                                  }
                                >
                                  <Minus className="size-3.5" />
                                </Button>
                                <span className="w-6 text-center text-sm font-semibold">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-8"
                                  aria-label="+"
                                  onClick={() =>
                                    patchItem.mutate({
                                      item,
                                      patch: { quantity: item.quantity + 1 },
                                    })
                                  }
                                >
                                  <Plus className="size-3.5" />
                                </Button>
                              </div>

                              {(["length_cm", "width_cm", "height_cm"] as const).map((field) => (
                                <Input
                                  key={field}
                                  type="number"
                                  min={1}
                                  defaultValue={String(Math.round(item[field]))}
                                  className="h-8 w-20"
                                  aria-label={rt("res.dims")}
                                  onBlur={(e) => {
                                    const value = Number(e.target.value);
                                    if (!value || value <= 0) {
                                      e.target.value = String(Math.round(item[field]));
                                      return;
                                    }
                                    if (value === Math.round(item[field])) return;
                                    patchItem.mutate({ item, patch: { [field]: value } });
                                  }}
                                />
                              ))}

                              <label className="sr-only" htmlFor={`room-${item.id}`}>
                                {rt("res.moveRoom")}
                              </label>
                              <select
                                id={`room-${item.id}`}
                                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                                value={item.room_id ?? ""}
                                onChange={(event) =>
                                  moveItem.mutate({
                                    itemId: item.id,
                                    roomId: event.target.value || null,
                                  })
                                }
                              >
                                <option value="">{rt("res.other")}</option>
                                {rooms.map((room) => (
                                  <option key={room.id} value={room.id}>
                                    {editableRoomName(room.name)}
                                  </option>
                                ))}
                              </select>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                aria-label={rt("dash.deleteItem")}
                                onClick={() => {
                                  softDelete.mutate({ itemId: item.id });
                                  toast(rt("rep.itemDeleted"), {
                                    action: {
                                      label: rt("rep.undo"),
                                      onClick: () =>
                                        softDelete.mutate({ itemId: item.id, restore: true }),
                                    },
                                  });
                                }}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          )}

                          {/* Tags */}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {TAGS.map((tag) => {
                              const active = (item.tags ?? []).includes(tag.value);
                              if (!canEdit && !active) return null;
                              return (
                                <button
                                  key={tag.value}
                                  type="button"
                                  disabled={!canEdit}
                                  onClick={() =>
                                    patchItem.mutate({
                                      item,
                                      patch: {
                                        tags: active
                                          ? (item.tags ?? []).filter((v) => v !== tag.value)
                                          : [...(item.tags ?? []), tag.value],
                                      },
                                    })
                                  }
                                  className={
                                    active
                                      ? "rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                      : "rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                                  }
                                >
                                  {rt(tag.key)}
                                </button>
                              );
                            })}
                          </div>

                          {/* Note */}
                          {canEdit ? (
                            <form
                              className="no-print mt-2 flex gap-2"
                              onSubmit={(event) => {
                                event.preventDefault();
                                const value = (noteDraft[item.id] ?? item.notes ?? "").trim();
                                patchItem.mutate({ item, patch: { notes: value || null } });
                              }}
                            >
                              <Input
                                className="h-8 max-w-md"
                                placeholder={rt("rep.addNote")}
                                maxLength={500}
                                value={noteDraft[item.id] ?? item.notes ?? ""}
                                onChange={(e) =>
                                  setNoteDraft((prev) => ({ ...prev, [item.id]: e.target.value }))
                                }
                              />
                              <Button size="sm" variant="outline" type="submit">
                                {rt("dash.saveItem")}
                              </Button>
                            </form>
                          ) : (
                            item.notes && (
                              <p className="mt-2 text-sm text-muted-foreground">{item.notes}</p>
                            )
                          )}
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <p className="font-semibold">{m3(item.volume_m3)}</p>
                          <Badge
                            variant="secondary"
                            className={
                              item.confidence >= 0.8
                                ? "bg-success/15 text-success"
                                : item.confidence >= 0.6
                                  ? "bg-warning/20 text-warning-foreground"
                                  : "bg-destructive/10 text-destructive"
                            }
                          >
                            {Math.round(item.confidence * 100)}% {rt("res.confidence")}
                          </Badge>
                          {canEdit ? (
                            <div className="no-print flex items-center gap-2">
                              <Switch
                                id={`inc-${item.id}`}
                                checked={item.is_included !== false}
                                onCheckedChange={(value) =>
                                  patchItem.mutate({ item, patch: { is_included: value } })
                                }
                              />
                              <Label
                                htmlFor={`inc-${item.id}`}
                                className="text-xs text-muted-foreground"
                              >
                                {item.is_included === false
                                  ? rt("rep.excluded")
                                  : rt("rep.included")}
                              </Label>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {item.is_included === false ? rt("rep.excluded") : rt("rep.included")}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {/* Access & conditions */}
          {access && (
            <section className="card-soft mt-8 p-6">
              <h2 className="text-lg font-bold">{rt("rep.accessTitle")}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="floor">{rt("rep.floor")}</Label>
                  <Input
                    id="floor"
                    type="number"
                    min={0}
                    max={60}
                    disabled={!canEdit}
                    value={access.access_floor}
                    onChange={(e) => setAccess({ ...access, access_floor: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="carry">{rt("rep.carry")}</Label>
                  <Input
                    id="carry"
                    type="number"
                    min={0}
                    max={2000}
                    disabled={!canEdit}
                    placeholder="15"
                    value={access.carry_distance_m}
                    onChange={(e) => setAccess({ ...access, carry_distance_m: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">{rt("rep.carryHelp")}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Checkbox
                  id="elevator"
                  disabled={!canEdit}
                  checked={access.has_elevator}
                  onCheckedChange={(value) =>
                    setAccess({ ...access, has_elevator: value === true })
                  }
                />
                <Label htmlFor="elevator">{rt("rep.elevator")}</Label>
              </div>
              <div className="mt-4 space-y-1.5">
                <Label htmlFor="access-notes">{rt("rep.generalNotes")}</Label>
                <Textarea
                  id="access-notes"
                  rows={3}
                  maxLength={2000}
                  disabled={!canEdit}
                  placeholder={rt("rep.generalNotesPh")}
                  value={access.access_notes}
                  onChange={(e) => setAccess({ ...access, access_notes: e.target.value })}
                />
              </div>
              {canEdit && (
                <Button
                  className="no-print mt-4"
                  size="sm"
                  onClick={() => saveAccess.mutate()}
                  disabled={saveAccess.isPending}
                >
                  {saveAccess.isPending && <Loader2 className="size-4 animate-spin" />}
                  {rt("rep.saveAccess")}
                </Button>
              )}
            </section>
          )}

          {/* Storage, delivery and packing */}
          {logistics && (
            <div className="mt-8 space-y-6">
              <section className="card-soft p-6">
                <h2 className="text-lg font-bold">{rt("rep.storageTitle")}</h2>
                <div className="mt-4 flex items-center gap-2">
                  <Checkbox
                    id="storage-enabled"
                    disabled={!canEdit}
                    checked={logistics.storage_enabled}
                    onCheckedChange={(value) =>
                      setLogistics({ ...logistics, storage_enabled: value === true })
                    }
                  />
                  <Label htmlFor="storage-enabled">{rt("rep.storageEnabled")}</Label>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="storage-company">{rt("rep.storageCompany")}</Label>
                    <Input
                      id="storage-company"
                      disabled={!canEdit}
                      maxLength={160}
                      value={logistics.storage_company}
                      onChange={(e) =>
                        setLogistics({ ...logistics, storage_company: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="storage-contact">{rt("rep.storageContact")}</Label>
                    <Input
                      id="storage-contact"
                      disabled={!canEdit}
                      maxLength={160}
                      value={logistics.storage_contact}
                      onChange={(e) =>
                        setLogistics({ ...logistics, storage_contact: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="storage-address">{rt("rep.storageAddress")}</Label>
                    <Input
                      id="storage-address"
                      disabled={!canEdit}
                      maxLength={240}
                      value={logistics.storage_address}
                      onChange={(e) =>
                        setLogistics({ ...logistics, storage_address: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="storage-phone">{rt("rep.storagePhone")}</Label>
                    <Input
                      id="storage-phone"
                      disabled={!canEdit}
                      maxLength={40}
                      value={logistics.storage_phone}
                      onChange={(e) =>
                        setLogistics({ ...logistics, storage_phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </section>

              <section className="card-soft p-6">
                <h2 className="text-lg font-bold">{rt("rep.deliveryTitle")}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="delivery-address">{rt("rep.deliveryAddress")}</Label>
                    <Input
                      id="delivery-address"
                      disabled={!canEdit}
                      maxLength={240}
                      value={logistics.delivery_address}
                      onChange={(e) =>
                        setLogistics({ ...logistics, delivery_address: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="delivery-floor">{rt("rep.deliveryFloor")}</Label>
                    <Input
                      id="delivery-floor"
                      disabled={!canEdit}
                      maxLength={40}
                      value={logistics.delivery_floor}
                      onChange={(e) =>
                        setLogistics({ ...logistics, delivery_floor: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="delivery-carry">{rt("rep.deliveryCarry")}</Label>
                    <Input
                      id="delivery-carry"
                      disabled={!canEdit}
                      maxLength={20}
                      value={logistics.delivery_carry_distance}
                      onChange={(e) =>
                        setLogistics({ ...logistics, delivery_carry_distance: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Checkbox
                    id="delivery-elevator"
                    disabled={!canEdit}
                    checked={logistics.delivery_elevator}
                    onCheckedChange={(value) =>
                      setLogistics({ ...logistics, delivery_elevator: value === true })
                    }
                  />
                  <Label htmlFor="delivery-elevator">{rt("rep.deliveryElevator")}</Label>
                </div>
                <div className="mt-4 space-y-1.5">
                  <Label htmlFor="delivery-notes">{rt("rep.deliveryNotes")}</Label>
                  <Textarea
                    id="delivery-notes"
                    rows={3}
                    maxLength={2000}
                    disabled={!canEdit}
                    value={logistics.delivery_notes}
                    onChange={(e) => setLogistics({ ...logistics, delivery_notes: e.target.value })}
                  />
                </div>
              </section>

              <section className="card-soft p-6">
                <h2 className="text-lg font-bold">{rt("rep.packingTitle")}</h2>
                <div className="mt-4 flex items-center gap-2">
                  <Checkbox
                    id="packing"
                    disabled={!canEdit}
                    checked={logistics.packing_requested}
                    onCheckedChange={(value) =>
                      setLogistics({ ...logistics, packing_requested: value === true })
                    }
                  />
                  <Label htmlFor="packing">{rt("rep.packingRequested")}</Label>
                </div>

                <div className="mt-4 max-w-xs space-y-1.5">
                  <Label htmlFor="packing-level">{rt("rep.packingLevel")}</Label>
                  <Select
                    value={logistics.packing_level}
                    onValueChange={(value) => setLogistics({ ...logistics, packing_level: value })}
                  >
                    <SelectTrigger id="packing-level" disabled={!canEdit}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fragile">{rt("rep.packingLevel.fragile")}</SelectItem>
                      <SelectItem value="partial">{rt("rep.packingLevel.partial")}</SelectItem>
                      <SelectItem value="full">{rt("rep.packingLevel.full")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <p className="mt-6 text-sm font-semibold">{rt("rep.materials")}</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  {MATERIALS.map((key) => (
                    <div key={key} className="space-y-1.5">
                      <Label htmlFor={`mat-${key}`}>{rt(`mat.${key}`)}</Label>
                      <Input
                        id={`mat-${key}`}
                        type="number"
                        min={0}
                        max={999}
                        disabled={!canEdit}
                        value={String(logistics.packing_materials[key] ?? 0)}
                        onChange={(e) =>
                          setLogistics({
                            ...logistics,
                            packing_materials: {
                              ...logistics.packing_materials,
                              [key]: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-1.5">
                  <Label htmlFor="packing-notes">{rt("rep.packingNotes")}</Label>
                  <Textarea
                    id="packing-notes"
                    rows={3}
                    maxLength={2000}
                    disabled={!canEdit}
                    value={logistics.packing_notes}
                    onChange={(e) => setLogistics({ ...logistics, packing_notes: e.target.value })}
                  />
                </div>

                {canEdit && (
                  <Button
                    className="no-print mt-4"
                    size="sm"
                    onClick={() => saveLogistics.mutate()}
                    disabled={saveLogistics.isPending}
                  >
                    {saveLogistics.isPending && <Loader2 className="size-4 animate-spin" />}
                    {rt("rep.saveExtras")}
                  </Button>
                )}
              </section>
            </div>
          )}

          {/* Business-only panel */}
          {businessView && (
            <section className="card-soft mt-8 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold">{rt("rep.internalTitle")}</h2>
                <Button variant="outline" size="sm" className="no-print" onClick={exportCsv}>
                  <Download className="size-4" />
                  {rt("rep.export")}
                </Button>
              </div>

              {!tenderMode && (
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="hourly">{rt("rep.hourly")}</Label>
                    <Input
                      id="hourly"
                      type="number"
                      min={0}
                      value={hourly}
                      onChange={(e) => setHourly(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="hours">{rt("rep.hours")}</Label>
                    <Input
                      id="hours"
                      type="number"
                      min={0}
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    />
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {rt("rep.hourly")}
                    </p>
                    <p className="text-xl font-bold">
                      {money(Number(hourly || 0) * Number(hours || 0), currency, reportLang)}
                    </p>
                    {company && !tenderMode && (
                      <>
                        <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                          {rt("rep.fixed")}
                        </p>
                        <p className="text-xl font-bold">
                          {money(netVolume * Number(company.price_per_m3), currency, reportLang)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <p className="text-sm font-semibold">{rt("rep.checklist")}</p>
                <ul className="mt-2 space-y-2">
                  {CHECKLIST.map((key) => (
                    <li key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={key}
                        checked={Boolean(checked[key])}
                        onCheckedChange={(value) =>
                          setChecked((prev) => ({ ...prev, [key]: value === true }))
                        }
                      />
                      <Label htmlFor={key} className="text-sm font-normal">
                        {rt(key)}
                      </Label>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 space-y-1.5">
                <Label htmlFor="internal">{rt("rep.internalNotes")}</Label>
                <Textarea
                  id="internal"
                  rows={3}
                  maxLength={2000}
                  value={internalNotes ?? ""}
                  onChange={(e) => setInternalNotes(e.target.value)}
                />
                <Button
                  className="no-print mt-2"
                  size="sm"
                  variant="outline"
                  onClick={() => saveAccess.mutate()}
                  disabled={saveAccess.isPending}
                >
                  {rt("dash.saveItem")}
                </Button>
              </div>
            </section>
          )}

          {estimate.photo_urls && estimate.photo_urls.length > 0 && (
            <section className="mt-8">
              <h2 className="font-semibold">{rt("res.photos")}</h2>
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {estimate.photo_urls.map((url: string) => (
                  <img
                    key={url}
                    src={url}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full rounded-xl border border-border object-cover"
                  />
                ))}
              </div>
            </section>
          )}

          <p className="mt-8 text-xs text-muted-foreground">{rt("res.disclaimer")}</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
