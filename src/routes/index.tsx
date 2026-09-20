import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Sparkles, FileText, ShieldCheck, Palette, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useI18n } from "@/lib/i18n";
import heroRoom from "@/assets/hero-room.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VolumCalc — AI volume estimates from room photos" },
      {
        name: "description",
        content:
          "Turn room photos into itemised, room-by-room cubic metre estimates for private moves and moving companies.",
      },
      { property: "og:title", content: "VolumCalc — AI volume estimates from room photos" },
      {
        property: "og:description",
        content: "Itemised m³ estimates from customer photos, ready for quoting and truck planning.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useI18n();

  const steps = [
    { icon: Camera, title: t("how.1t"), body: t("how.1d") },
    { icon: Sparkles, title: t("how.2t"), body: t("how.2d") },
    { icon: FileText, title: t("how.3t"), body: t("how.3d") },
  ];

  const features = [
    { icon: Sparkles, title: t("feat.1t"), body: t("feat.1d") },
    { icon: ShieldCheck, title: t("feat.2t"), body: t("feat.2d") },
    { icon: FileText, title: t("feat.3t"), body: t("feat.3d") },
    { icon: Palette, title: t("feat.4t"), body: t("feat.4d") },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="surface-hero border-b border-border/60">
          <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-12 px-4 py-14 md:py-20 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-3 py-1 text-xs font-medium text-primary shadow-sm">
                <Sparkles className="size-3.5 text-primary" />
                {t("hero.badge")}
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
                {t("hero.title1")} <span className="text-gradient">{t("hero.title2")}</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t("hero.sub")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/upload">
                    {t("hero.cta")}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/auth">{t("hero.cta2")}</Link>
                </Button>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
                {[
                  { k: "10×", v: t("hero.stat1") },
                  { k: "120+", v: t("hero.stat2") },
                  { k: "−70 %", v: t("hero.stat3") },
                ].map((s) => (
                  <div key={s.k}>
                    <dt className="text-2xl font-bold text-primary">{s.k}</dt>
                    <dd className="text-xs text-muted-foreground">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <img
                src={heroRoom}
                alt="Living room with furniture and moving boxes ready to be measured"
                width={1408}
                height={1008}
                className="w-full rounded-2xl border border-border object-cover shadow-[var(--shadow-lift)]"
              />
              <div className="card-soft absolute -bottom-6 left-4 w-56 p-4 sm:left-8">
                <p className="text-xs text-muted-foreground">{t("res.total")}</p>
                <p className="text-3xl font-bold">28,4 m³</p>
                <p className="mt-1 text-xs text-success">14 {t("res.items")}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">{t("how.title")}</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="card-soft lift p-6">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <step.icon className="size-5" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  0{i + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
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
          <div className="card-soft flex flex-col items-start gap-6 overflow-hidden p-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">{t("cta.title")}</h2>
              <p className="mt-2 text-muted-foreground">{t("cta.sub")}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {[t("feat.1t"), t("feat.3t"), t("feat.4t")].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-4 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Button asChild size="lg">
              <Link to="/auth">
                {t("nav.tryFree")}
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
