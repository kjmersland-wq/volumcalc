import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, Check, FileText, Palette, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/for-flyttebyraer")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "For moving companies — branded estimates and customer links | VolumCalc" },
      {
        name: "description",
        content:
          "Give customers a professional volume estimate under your own brand. Dashboard with all estimates, your price per m³ and secret customer links.",
      },
      { property: "og:title", content: "For moving companies | VolumCalc" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/for-flyttebyraer" }],
  }),
  component: ForMovingCompanies,
});

function ForMovingCompanies() {
  const { t } = useI18n();

  const features = [
    { icon: Boxes, title: t("feat.1t"), body: t("feat.1d") },
    { icon: Scale, title: t("feat.2t"), body: t("feat.2d") },
    { icon: FileText, title: t("feat.3t"), body: t("feat.3d") },
    { icon: Palette, title: t("feat.4t"), body: t("feat.4d") },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="surface-hero border-b border-border/60 px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl">{t("agency.title")}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">{t("agency.sub")}</p>
            <ul className="mx-auto mt-6 max-w-2xl space-y-2 text-left text-sm text-muted-foreground">
              {[t("agency.b1"), t("agency.b2"), t("agency.b3")].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/pricing" hash="business">
                  {t("agency.cta")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">{t("nav.login")}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-muted/40 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold sm:text-4xl">{t("feat.title")}</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="card-soft flex gap-4 p-6">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <f.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="card-soft flex flex-col items-start gap-6 p-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">{t("cta.title")}</h2>
              <p className="mt-2 text-muted-foreground">{t("cta.sub")}</p>
            </div>
            <Button asChild size="lg">
              <Link to="/auth">
                {t("price.cta")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
