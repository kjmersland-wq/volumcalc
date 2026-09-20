import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { m3, shortDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Estimates dashboard — VolumCalc" },
      { name: "description", content: "Review and manage photo-based moving volume estimates." },
      { property: "og:title", content: "Estimates dashboard — VolumCalc" },
      { property: "og:description", content: "Review and manage photo-based moving volume estimates." },
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


  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const estimates = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("dash.title")}</h1>

      {estimates.length === 0 ? (
        <div className="card-soft mt-8 p-10 text-center text-muted-foreground">{t("dash.empty")}</div>
      ) : (
        <div className="card-soft mt-8 overflow-hidden">
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
                  <p className="font-medium">{e.customer_name || `#${String(e.id).slice(0, 8).toUpperCase()}`}</p>
                  <p className="text-xs text-muted-foreground">{e.address || e.customer_phone || ""}</p>
                </div>
                <span className="text-sm text-muted-foreground">{shortDate(e.created_at, lang)}</span>
                <span className="text-sm font-semibold">{m3(e.total_volume_m3)}</span>
                <span>
                  <Badge
                    variant="secondary"
                    className={
                      e.status === "approved" ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground"
                    }
                  >
                    {e.status === "approved" ? t("dash.approved") : t("dash.pending")}
                  </Badge>
                </span>
                <Button asChild size="sm" variant="ghost">
                  <Link to="/estimate/$id" params={{ id: e.id }}>
                    {t("dash.open")}
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
