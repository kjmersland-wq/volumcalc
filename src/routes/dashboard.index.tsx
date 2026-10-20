import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, ChevronDown, Code2, Link2, Loader2, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { m3, shortDate } from "@/lib/format";
import { useCompany } from "@/hooks/useCompany";
import {
  ESTIMATE_STATUSES,
  STATUS_BADGE,
  normalizeStatus,
  type EstimateStatus,
} from "@/lib/estimate-status";

export const Route = createFileRoute("/dashboard/")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Estimates dashboard — VolumCalc" },
      { name: "description", content: "Review and manage incoming moving volume estimates." },
      { property: "og:title", content: "Estimates dashboard — VolumCalc" },
      { property: "og:description", content: "Review and manage incoming moving volume estimates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardHome,
});

function DashboardHome() {
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const { data: company } = useCompany();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "all" | EstimateStatus>("active");
  const [dateFilter, setDateFilter] = useState<"any" | "7" | "30" | "90">("any");
  const [volumeFilter, setVolumeFilter] = useState<"any" | "s" | "m" | "l" | "xl">("any");

  const { data, isLoading } = useQuery({
    queryKey: ["estimates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estimates")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: quotes } = useQuery({
    queryKey: ["quote-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const markHandled = useMutation({
    mutationFn: async (quoteId: string) => {
      const { error } = await supabase.from("quote_requests").update({ handled: true }).eq("id", quoteId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quote-requests"] }),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EstimateStatus }) => {
      const { error } = await supabase.from("estimates").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["estimates"] }),
    onError: () => toast.error(t("dash.deleteFailed")),
  });

  const deleteEstimate = useMutation({
    mutationFn: async (estimateId: string) => {
      const { error } = await supabase.from("estimates").delete().eq("id", estimateId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
      queryClient.invalidateQueries({ queryKey: ["quote-requests"] });
    },
    onError: () => toast.error(t("dash.deleteFailed")),
  });


  const all = useMemo(() => data ?? [], [data]);

  const stats = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const live = all.filter((e) => normalizeStatus(e.status) !== "archived");
    const newThisWeek = live.filter((e) => now - new Date(e.created_at).getTime() <= 7 * day).length;
    const avg = live.length ? live.reduce((sum, e) => sum + Number(e.total_volume_m3 || 0), 0) / live.length : 0;
    const awaiting = live.filter((e) => ["new", "viewed"].includes(normalizeStatus(e.status))).length;
    const accepted = live.filter((e) => normalizeStatus(e.status) === "accepted").length;
    const month = live
      .filter((e) => now - new Date(e.created_at).getTime() <= 30 * day)
      .reduce((sum, e) => sum + Number(e.total_volume_m3 || 0), 0);
    return { newThisWeek, avg, awaiting, accepted, month };
  }, [all]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const now = Date.now();
    const days = dateFilter === "any" ? null : Number(dateFilter);
    return all.filter((e) => {
      const status = normalizeStatus(e.status);
      if (statusFilter === "active" ? status === "archived" : statusFilter !== "all" && status !== statusFilter) return false;
      if (days !== null && now - new Date(e.created_at).getTime() > days * 24 * 60 * 60 * 1000) return false;
      const v = Number(e.total_volume_m3 || 0);
      if (volumeFilter === "s" && !(v < 10)) return false;
      if (volumeFilter === "m" && !(v >= 10 && v < 25)) return false;
      if (volumeFilter === "l" && !(v >= 25 && v < 50)) return false;
      if (volumeFilter === "xl" && !(v >= 50)) return false;
      if (!needle) return true;
      return [e.report_title, e.customer_name, e.customer_email, e.customer_phone, e.address, e.move_to]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle));
    });
  }, [all, search, statusFilter, dateFilter, volumeFilter]);

  const origin = typeof window === "undefined" ? "https://www.volumcalc.com" : window.location.origin;
  const customerLink = company?.upload_token ? `${origin}/upload?k=${company.upload_token}` : "";
  const embedCode = customerLink
    ? `<iframe src="${customerLink}" title="VolumCalc" width="100%" height="1000" style="border:0;max-width:960px" loading="lazy"></iframe>`
    : "";
  const copy = (text: string) => {
    void navigator.clipboard.writeText(text).then(() => toast.success(t("dash.copied")));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const estimates = filtered;

  const selectClass = "h-9 rounded-md border border-input bg-background px-2 text-sm";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("dash.title")}</h1>
        {customerLink && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => copy(customerLink)}>
              <Link2 className="size-4" />
              {t("dash.copyLink")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => copy(embedCode)}>
              <Code2 className="size-4" />
              {t("dash.copyEmbed")}
            </Button>
          </div>
        )}
      </div>
      {customerLink && <p className="mt-1 text-xs text-muted-foreground">{t("dash.linkHelp")}</p>}

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { k: t("dash.statNewWeek"), v: String(stats.newThisWeek) },
          { k: t("dash.statOpen"), v: String(stats.awaiting) },
          { k: t("dash.statAccepted"), v: String(stats.accepted) },
          { k: t("dash.statAvg"), v: m3(stats.avg, lang) },
          { k: t("dash.statMonth"), v: m3(stats.month, lang) },
        ].map((stat) => (
          <div key={stat.k} className="card-soft p-4">
            <dt className="text-xs text-muted-foreground">{stat.k}</dt>
            <dd className="mt-1 text-xl font-bold">{stat.v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[14rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("dash.search")}
            className="pl-9"
            aria-label={t("dash.search")}
          />
        </div>
        <select
          className={selectClass}
          aria-label={t("dash.fStatus")}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
        >
          <option value="active">{t("dash.fActive")}</option>
          <option value="all">{t("dash.fAll")}</option>
          {ESTIMATE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`dash.st.${status}`)}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          aria-label={t("dash.fDate")}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
        >
          <option value="any">{t("dash.dAny")}</option>
          <option value="7">{t("dash.d7")}</option>
          <option value="30">{t("dash.d30")}</option>
          <option value="90">{t("dash.d90")}</option>
        </select>
        <select
          className={selectClass}
          aria-label={t("dash.fVolume")}
          value={volumeFilter}
          onChange={(e) => setVolumeFilter(e.target.value as typeof volumeFilter)}
        >
          <option value="any">{t("dash.vAny")}</option>
          <option value="s">{t("dash.vS")}</option>
          <option value="m">{t("dash.vM")}</option>
          <option value="l">{t("dash.vL")}</option>
          <option value="xl">{t("dash.vXL")}</option>
        </select>
      </div>

      {all.length === 0 ? (
        <div className="card-soft mt-8 p-10 text-center text-muted-foreground">{t("dash.empty")}</div>
      ) : estimates.length === 0 ? (
        <div className="card-soft mt-4 p-10 text-center text-muted-foreground">{t("dash.noMatch")}</div>
      ) : (
        <div className="card-soft mt-4 overflow-hidden">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
            <span>{t("dash.customer")}</span>
            <span>{t("dash.date")}</span>
            <span>{t("res.total")}</span>
            <span>{t("dash.status")}</span>
            <span />
          </div>
          <ul className="divide-y divide-border">
            {estimates.map((e) => (
              <li
                key={e.id}
                className="grid grid-cols-2 items-center gap-3 px-5 py-4 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:gap-4"
              >
                <div className="col-span-2 sm:col-span-1">
                  <p className="font-medium">
                    {e.report_title || e.customer_name || `#${String(e.id).slice(0, 8).toUpperCase()}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[e.report_title ? e.customer_name : null, e.address || e.customer_phone].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">{shortDate(e.created_at, lang)}</span>
                <span className="text-sm font-semibold">{m3(e.total_volume_m3)}</span>
                <span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={t("dash.changeStatus")}
                        className="inline-flex items-center gap-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Badge variant="secondary" className={STATUS_BADGE[normalizeStatus(e.status)]}>
                          {t(`dash.st.${normalizeStatus(e.status)}`)}
                          <ChevronDown className="ml-1 size-3" />
                        </Badge>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {ESTIMATE_STATUSES.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          disabled={normalizeStatus(e.status) === status}
                          onSelect={() => setStatus.mutate({ id: e.id, status })}
                        >
                          {t(`dash.st.${status}`)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </span>
                <div className="flex items-center justify-end gap-1">
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/estimate/$id" params={{ id: e.id }}>
                      {t("dash.open")}
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={t("dash.delete")}
                        className="text-muted-foreground hover:text-destructive"
                        disabled={deleteEstimate.isPending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("dash.deleteTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("dash.deleteDesc")}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("dash.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteEstimate.mutate(e.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {t("dash.delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="mt-12 text-xl font-bold">{t("dash.quotes")}</h2>
      {(quotes ?? []).length === 0 ? (
        <div className="card-soft mt-4 p-8 text-center text-muted-foreground">{t("dash.quotesEmpty")}</div>
      ) : (
        <ul className="card-soft mt-4 divide-y divide-border">
          {(quotes ?? []).map((q) => (
            <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="font-medium">{q.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[q.phone, q.email].filter(Boolean).join(" · ")} · {shortDate(q.created_at, lang)}
                </p>
                {q.message && <p className="mt-1 text-sm text-muted-foreground">{q.message}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="ghost">
                  <Link to="/estimate/$id" params={{ id: q.estimate_id }}>
                    {t("dash.open")}
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
                {q.handled ? (
                  <Badge variant="secondary" className="bg-success/15 text-success">
                    {t("dash.handled")}
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => markHandled.mutate(q.id)}>
                    {t("dash.markHandled")}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}
