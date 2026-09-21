import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { VolumCalcLogo } from "@/components/VolumCalcLogo";

export function SiteFooter() {
  const { t, lang } = useI18n();

  return (
    <footer className="no-print border-t border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <VolumCalcLogo markClassName="size-9" />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">{t("footer.builtBy")}</p>
          </div>

          <div>
            <p className="text-sm font-semibold">{t("footer.product")}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/upload" className="transition-colors hover:text-foreground">
                  {t("nav.tryFree")}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="transition-colors hover:text-foreground">
                  {t("nav.pricing")}
                </Link>
              </li>
              <li>
                <Link to="/moving-inventory-list" className="transition-colors hover:text-foreground">
                  {lang === "no" ? "Inventarliste-guide" : "Inventory guide"}
                </Link>
              </li>
              <li>
                <Link to={lang === "no" ? "/flyttebil-kalkulator" : "/en/moving-van-calculator"} className="transition-colors hover:text-foreground">
                  {lang === "no" ? "Flyttebil-kalkulator" : "Van calculator"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">{t("footer.company")}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/om-oss" className="transition-colors hover:text-foreground">
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link to="/hjelp" className="transition-colors hover:text-foreground">
                  {t("nav.help")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-foreground">
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">{t("footer.legal")}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/personvern" className="transition-colors hover:text-foreground">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link to="/vilkar" className="transition-colors hover:text-foreground">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="transition-colors hover:text-foreground">
                  {t("footer.cookies")}
                </Link>
              </li>
              <li>
                <Link to="/databehandling" className="transition-colors hover:text-foreground">
                  {t("footer.dpa")}
                </Link>
              </li>
              <li>
                <Link to="/kjopsvilkar" className="transition-colors hover:text-foreground">
                  {t("footer.purchase")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
          <div>
            <p>© {new Date().getFullYear()} VolumCalc · volumcalc.com</p>
            <p className="mt-1">{t("footer.builtBy")}</p>
          </div>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
          >
            {t("nav.login")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
