import { useEffect } from "react";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, Link2, Loader2, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { VolumCalcLogo } from "@/components/VolumCalcLogo";

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
          <Link to="/" aria-label="VolumCalc home">
            <VolumCalcLogo markClassName="size-9" />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle className="mr-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/upload`);
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
