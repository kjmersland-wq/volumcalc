import { Link } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { LanguageToggle } from "@/components/LanguageToggle";

export function SiteHeader() {
  const { t } = useI18n();
  const { session } = useAuth();

  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Boxes className="size-5" />
          </span>
          <span className="text-lg tracking-tight">CubicCalc</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link to="/" hash="how" className="transition-colors hover:text-foreground">
            {t("nav.how")}
          </Link>
          <Link to="/pricing" className="transition-colors hover:text-foreground">
            {t("nav.pricing")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          {session ? (
            <Button asChild size="sm">
              <Link to="/dashboard">{t("nav.dashboard")}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">{t("nav.login")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/upload">{t("nav.tryFree")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
