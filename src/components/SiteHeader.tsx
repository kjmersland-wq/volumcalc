import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VolumCalcLogo } from "@/components/VolumCalcLogo";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useCompany } from "@/hooks/useCompany";

export function SiteHeader() {
  const { t } = useI18n();
  const { session } = useAuth();
  const { data: company } = useCompany();
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [
    { to: "/upload", label: t("nav.calc") },
    { to: "/pricing", label: t("nav.pricing") },
    { to: "/hjelp", label: t("nav.help") },
    { to: "/for-flyttebyraer", label: t("hero.cta2") },
  ] as const;

  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="VolumCalc home">
            <VolumCalcLogo markClassName="size-9" />
          </Link>
          {session && company?.company_name && (
            <span className="hidden items-center gap-2 border-l border-border pl-3 text-sm font-medium sm:flex">
              {company.logo_url && (
                <img src={company.logo_url} alt="" className="h-6 w-auto max-w-24 object-contain" />
              )}
              <span className="max-w-40 truncate">{company.company_name}</span>
            </span>
          )}
        </div>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link to="/upload" className="transition-colors hover:text-foreground">
            {t("nav.calc")}
          </Link>
          <Link to="/" hash="how" className="transition-colors hover:text-foreground">
            {t("nav.how")}
          </Link>
          <Link to="/pricing" className="transition-colors hover:text-foreground">
            {t("nav.pricing")}
          </Link>
          <Link to="/hjelp" className="transition-colors hover:text-foreground">
            {t("nav.help")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/for-flyttebyraer"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground lg:inline"
          >
            {t("hero.cta2")}
          </Link>
          <LanguageToggle />
          {session ? (
            <Button asChild size="sm">
              <Link to="/dashboard">{t("nav.dashboard")}</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                <Link to="/auth">{t("nav.login")}</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link to="/upload">{t("nav.tryFree")}</Link>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-72">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">VolumCalc</SheetDescription>
          <nav className="mt-8 flex flex-col gap-1 text-base">
            <Link
              to="/"
              hash="how"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 hover:bg-muted"
            >
              {t("nav.how")}
            </Link>
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            {!session && (
              <Link
                to="/upload"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-primary px-3 py-2.5 text-center font-medium text-primary-foreground"
              >
                {t("nav.tryFree")}
              </Link>
            )}
            {!session && (
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 font-medium text-primary hover:bg-muted"
              >
                {t("nav.login")}
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
