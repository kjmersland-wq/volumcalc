import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, Check, Download, Link2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { m3, money, shortDate } from "@/lib/format";

export const Route = createFileRoute("/estimate/$id")({
  head: () => ({
    meta: [
      { title: "Volume estimate — CubicCalc" },
      { name: "description", content: "Itemised cubic metre estimate generated from customer photos." },
      { property: "og:title", content: "Volume estimate — CubicCalc" },
      { property: "og:description", content: "Itemised cubic metre estimate generated from photos." },
      { name: "robots", content: "noindex" },
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
};

function EstimatePage() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Record<string, Partial<Item>>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["estimate", id],
    queryFn: async () => {
      const [{ data: estimate }, { data: items }, { data: company }] = await Promise.all([
        supabase.from("estimates").select("*").eq("id", id).maybeSingle(),
        supabase.from("estimate_items").select("*").eq("estimate_id", id).order("volume_m3", { ascending: false }),
        session
          ? supabase.from("companies").select("*").eq("id", session.user.id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      return { estimate, items: (items ?? []) as Item[], company };
    },
  });

  const saveItem = useMutation({
    mutationFn: async ({ item, patch }: { item: Item; patch: Partial<Item> }) => {
      const l = Number(patch.length_cm ?? item.length_cm);
      const w = Number(patch.width_cm ?? item.width_cm);
      const h = Number(patch.height_cm ?? item.height_cm);
      const q = Number(patch.quantity ?? item.quantity);
      const volume = Math.round(((l * w * h * q) / 1_000_000) * 100) / 100;
      const { error } = await supabase
        .from("estimate_items")
        .update({ length_cm: l, width_cm: w, height_cm: h, quantity: q, volume_m3: volume })
        .eq("id", item.id);
      if (error) throw error;
      await recalcTotal();
    },
    onSuccess: () => {
      setEditing({});
      queryClient.invalidateQueries({ queryKey: ["estimate", id] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from("estimate_items").delete().eq("id", itemId);
      if (error) throw error;
      await recalcTotal();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["estimate", id] }),
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
      toast.success(t("dash.approved"));
      queryClient.invalidateQueries({ queryKey: ["estimate", id] });
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
    },
  });

  async function recalcTotal() {
    const { data: rows } = await supabase.from("estimate_items").select("volume_m3").eq("estimate_id", id);
    const total = Math.round((rows ?? []).reduce((sum, r) => sum + Number(r.volume_m3), 0) * 100) / 100;
    await supabase.from("estimates").update({ total_volume_m3: total }).eq("id", id);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const estimate = data?.estimate;
  if (!estimate) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
          {t("res.notFound")}
        </main>
        <SiteFooter />
      </div>
    );
  }

  const items = data.items;
  const company = data.company as { price_per_m3: number; currency: string; company_name: string } | null;
  const total = items.reduce((sum, i) => sum + Number(i.volume_m3), 0);
  const canEdit = Boolean(session);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("res.title")}</p>
              <h1 className="text-3xl font-bold">
                {estimate.customer_name || `#${String(estimate.id).slice(0, 8).toUpperCase()}`}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {shortDate(estimate.created_at, lang)}
                {estimate.address ? ` · ${estimate.address}` : ""}
                {estimate.customer_phone ? ` · ${estimate.customer_phone}` : ""}
              </p>
            </div>
            <div className="no-print flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/estimate/${estimate.id}`,
                  );
                  toast.success(t("res.copied"));
                }}
              >
                <Link2 className="size-4" />
                {t("res.share")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="size-4" />
                {t("res.pdf")}
              </Button>
              {canEdit && estimate.status !== "approved" && (
                <Button size="sm" onClick={() => approve.mutate()}>
                  <Check className="size-4" />
                  {t("dash.approve")}
                </Button>
              )}
            </div>
          </div>

          <div className="card-soft mt-8 grid gap-6 p-6 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("res.total")}</p>
              <p className="mt-1 flex items-center gap-2 text-4xl font-extrabold text-primary">
                <Boxes className="size-7" />
                {m3(total)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("res.items")}</p>
              <p className="mt-1 text-4xl font-extrabold">{items.length}</p>
            </div>
            {company && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("res.estimated")}</p>
                <p className="mt-1 text-4xl font-extrabold">
                  {money(total * Number(company.price_per_m3), company.currency, lang)}
                </p>
              </div>
            )}
          </div>

          <div className="card-soft mt-8 overflow-hidden">
            <div className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>{t("res.item")}</span>
              <span>{t("res.volume")}</span>
            </div>
            <ul className="divide-y divide-border">
              {items.map((item) => {
                const patch = editing[item.id];
                return (
                  <li key={item.id} className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      {item.photo_url ? (
                        <img
                          src={item.photo_url}
                          alt=""
                          loading="lazy"
                          className="size-14 shrink-0 rounded-lg border border-border object-cover"
                        />
                      ) : (
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Boxes className="size-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {lang === "no" ? item.name_no || item.name : item.name}
                          {item.quantity > 1 && (
                            <span className="text-muted-foreground"> × {item.quantity}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(item.length_cm)} × {Math.round(item.width_cm)} ×{" "}
                          {Math.round(item.height_cm)} cm
                        </p>
                      </div>
                      <div className="text-right">
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
                          {Math.round(item.confidence * 100)}% {t("res.confidence")}
                        </Badge>
                      </div>
                    </div>

                    {canEdit && (
                      <div className="no-print mt-3 flex flex-wrap items-center gap-2">
                        {(["length_cm", "width_cm", "height_cm", "quantity"] as const).map((field) => (
                          <Input
                            key={field}
                            type="number"
                            className="h-8 w-20"
                            value={String(patch?.[field] ?? item[field])}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], [field]: Number(e.target.value) },
                              }))
                            }
                          />
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!patch || saveItem.isPending}
                          onClick={() => saveItem.mutate({ item, patch: patch ?? {} })}
                        >
                          {t("dash.saveItem")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deleteItem.mutate(item.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {estimate.photo_urls?.length > 0 && (
            <section className="mt-8">
              <h2 className="font-semibold">{t("res.photos")}</h2>
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

          <p className="mt-8 text-xs text-muted-foreground">{t("res.disclaimer")}</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
