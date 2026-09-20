import { useEffect } from "react";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, Link2, Loader2, LogOut, Settings, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { VolumCalcLogo } from "@/components/VolumCalcLogo";
import { useCompany, useIsAdmin } from "@/hooks/useCompany";

export const Route = createFileRoute("/dashboard")({
  staticData: { sitemap: "exclude-subtree" },
  head: () => ({
    meta: [
      { title: "Dashboard — VolumCalc" },
      { name: "description", content: "Review incoming photo submissions and volume estimates." },
      { property: "og:title", content: "Dashboard — VolumCalc" },
      { property: "og:description", content: "Review incoming photo submissions and volume estimates." },
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const { t } = useI18n();
  const { session, loading } = useAuth();
  const { data: company } = useCompany();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center">
          <Link to="/" aria-label="VolumCalc home">
            <VolumCalcLogo markClassName="size-9" />
          </Link>
          {company?.company_name && (
            <div className="ml-3 hidden items-center gap-2 border-l border-border pl-3 sm:flex">
              {company.logo_url ? (
                <img src={company.logo_url} alt="" className="h-7 w-auto max-w-24 object-contain" />
              ) : (
                <span
                  className="flex size-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: company.brand_color }}
                >
                  {company.company_name.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="leading-tight">
                <p className="max-w-44 truncate text-sm font-semibold">{company.company_name}</p>
                {(company.org_number || company.phone) && (
                  <p className="max-w-44 truncate text-xs text-muted-foreground">
                    {[company.org_number, company.phone].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </div>
          )}
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle className="mr-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/upload${
                    company?.upload_token ? `?k=${company.upload_token}` : session ? `?c=${session.user.id}` : ""
                  }`,
                );
                toast.success(t("res.copied"));
              }}
            >
              <Link2 className="size-4" />
              <span className="hidden sm:inline">{t("dash.link")}</span>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">
                <LayoutGrid className="size-4" />
              </Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="ghost" size="sm" title="Admin">
                <Link to="/dashboard/admin">
                  <ShieldCheck className="size-4" />
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard/settings">
                <Settings className="size-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}
