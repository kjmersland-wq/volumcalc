import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { VolumCalcLogo } from "@/components/VolumCalcLogo";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useCompany } from "@/hooks/useCompany";

export function SiteHeader() {
  const { t } = useI18n();
  const { session } = useAuth();
  const { data: company } = useCompany();

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
          <Link to="/" hash="how" className="transition-colors hover:text-foreground">
            {t("nav.how")}
          </Link>
          <Link to="/pricing" className="transition-colors hover:text-foreground">
            {t("nav.pricing")}
          </Link>
          <Link to="/hjelp" className="transition-colors hover:text-foreground">
            {t("nav.help")}
          </Link>
          <Link to="/contact" className="transition-colors hover:text-foreground">
            {t("nav.contact")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          {session ? (
            <Button asChild size="sm">
              <Link to="/dashboard">{t("nav.dashboard")}</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/upload">{t("nav.tryFree")}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
