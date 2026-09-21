import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, LayoutGrid, Link2, Lock, Settings } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/demo")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Company dashboard demo — VolumCalc" },
      {
        name: "description",
        content:
          "See how a moving company's own VolumCalc dashboard looks: own logo, own secret upload link and only their own estimates.",
      },
      { property: "og:title", content: "Company dashboard demo — VolumCalc" },
      {
        property: "og:description",
        content: "A demo of the branded VolumCalc dashboard for moving companies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemoPage,
});

const DEMO = {
  name: "Nordvest Flytteservice AS",
  org: "999 111 222",
  address: "Havnegata 14, 4610 Kristiansand",
  phone: "+47 38 00 11 22",
  email: "post@nordvestflytting.no",
  color: "#0f766e",
  token: "demo-link-1a2b3c4d",
};

const ROWS = [
  {
    id: "A91F20C4",
    customer: "Familien Hansen",
    address: "Skippergata 8, Kristiansand",
    volume: "34,2 m³",
    status: "approved",
  },
  {
    id: "77D3B0A1",
    customer: "Ingrid Lie",
    address: "Vestre Strandgate 2, Kristiansand",
    volume: "18,6 m³",
    status: "pending",
  },
  {
    id: "5C8E1AB9",
    customer: "Bergli Eiendom",
    address: "Setesdalsveien 41, Vennesla",
    volume: "62,9 m³",
    status: "pending",
  },
];

function DemoPage() {
  const { t, lang } = useI18n();
  const orgNumberLabel =
    {
      no: "Org.nr.",
      en: "Reg. no.",
      sv: "Org.nr.",
      da: "CVR-nr.",
      fi: "Y-tunnus",
      de: "Reg.-Nr.",
      nl: "KvK-nr.",
      fr: "N° d’entreprise",
      pl: "Nr rej.",
      es: "N.º reg.",
      it: "N. reg.",
      pt: "N.º reg.",
    }[lang] ?? "Reg. no.";

  const intlLocale =
    {
      no: "nb-NO",
      en: "en-GB",
      sv: "sv-SE",
      da: "da-DK",
      dk: "da-DK",
      fi: "fi-FI",
      de: "de-DE",
      nl: "nl-NL",
      fr: "fr-FR",
      pl: "pl-PL",
      es: "es-ES",
      it: "it-IT",
      pt: "pt-PT",
    }[lang] ?? "en-GB";

  const formatDemoDate = (day: number) =>
    new Intl.DateTimeFormat(intlLocale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(Date.UTC(2026, 8, day)));

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span
              className="flex size-9 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: DEMO.color }}
            >
              NF
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{DEMO.name}</p>
              <p className="text-xs text-muted-foreground">
                {orgNumberLabel} {DEMO.org} · {DEMO.phone}
              </p>
            </div>
            <Badge variant="secondary" className="ml-1">
              {t("demo.badge")}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button variant="outline" size="sm" disabled>
              <Link2 className="size-4" />
              <span className="hidden sm:inline">{t("dash.link")}</span>
            </Button>
            <Button variant="ghost" size="sm" disabled>
              <LayoutGrid className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled>
              <Settings className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-bold">{t("demo.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("demo.sub")}</p>

        <div className="card-soft mt-6 flex flex-wrap items-center gap-3 p-5">
          <Lock className="size-5 text-primary" />
          <div className="flex-1 text-sm">
            <p className="font-medium">{t("admin.link")}</p>
            <p className="truncate text-muted-foreground">
              https://volumcalc.com/upload?k={DEMO.token}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(`https://volumcalc.com/upload?k=${DEMO.token}`);
              toast.success(t("admin.copy"));
            }}
          >
            <Copy className="size-4" />
            {t("admin.copy")}
          </Button>
        </div>

        <div className="card-soft mt-8 overflow-hidden">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
            <span>{t("dash.customer")}</span>
            <span>{t("dash.date")}</span>
            <span>{t("res.total")}</span>
            <span>{t("dash.status")}</span>
          </div>
          <ul className="divide-y divide-border">
            {ROWS.map((row, index) => (
              <li
                key={row.id}
                className="grid grid-cols-2 items-center gap-3 px-5 py-4 sm:grid-cols-[2fr_1fr_1fr_1fr]"
              >
                <div className="col-span-2 sm:col-span-1">
                  <p className="font-medium">{row.customer}</p>
                  <p className="text-xs text-muted-foreground">{row.address}</p>
                </div>
                <span className="text-sm text-muted-foreground">{formatDemoDate(index + 3)}</span>
                <span className="text-sm font-semibold">{row.volume}</span>
                <span>
                  <Badge
                    variant="secondary"
                    className={
                      row.status === "approved"
                        ? "bg-success/15 text-success"
                        : "bg-warning/20 text-warning-foreground"
                    }
                  >
                    {row.status === "approved" ? t("dash.approved") : t("dash.pending")}
                  </Badge>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-soft mt-8 flex flex-wrap items-center justify-between gap-4 border-primary/25 bg-primary-soft/50 p-6">
          <div>
            <p className="font-semibold">{t("demo.cta")}</p>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t("demo.isolation")}</p>
          </div>
          <Button asChild>
            <Link to="/contact">{t("nav.contact")}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
