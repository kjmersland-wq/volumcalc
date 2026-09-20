import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — CubicCalc" },
      {
        name: "description",
        content: "Plans for movers and storage providers, from a free starter tier to unlimited estimates.",
      },
      { property: "og:title", content: "Pricing — CubicCalc" },
      {
        property: "og:description",
        content: "Simple monthly plans for AI cubic volume estimates.",
      },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const { t, lang } = useI18n();

  const plans = [
    {
      name: "Starter",
      price: "0",
      desc: lang === "no" ? "10 beregninger per måned" : "10 estimates per month",
      features:
        lang === "no"
          ? ["Opplastingslenke", "AI-volumberegning", "Delbar rapport"]
          : ["Upload link", "AI volume estimate", "Shareable report"],
      featured: false,
    },
    {
      name: "Business",
      price: "1 490",
      desc: lang === "no" ? "300 beregninger per måned" : "300 estimates per month",
      features:
        lang === "no"
          ? ["Alt i Starter", "Egen logo og farger", "Pris per m³ og tilbud", "PDF-rapport"]
          : ["Everything in Starter", "Your logo and colours", "Rate per m³ and quotes", "PDF report"],
      featured: true,
    },
    {
      name: "Enterprise",
      price: lang === "no" ? "Kontakt oss" : "Talk to us",
      desc: lang === "no" ? "Ubegrenset volum" : "Unlimited volume",
      features:
        lang === "no"
          ? ["Alt i Business", "Flere avdelinger", "API og integrasjoner", "Egen kundekontakt"]
          : ["Everything in Business", "Multiple branches", "API and integrations", "Dedicated contact"],
      featured: false,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="surface-hero px-4 py-16 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">{t("price.title")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("price.sub")}</p>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "card-soft relative flex flex-col p-8",
                plan.featured && "border-primary shadow-[var(--shadow-lift)]",
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {t("price.popular")}
                </span>
              )}
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="mt-4 text-3xl font-bold">
                {plan.price}
                {plan.price.match(/^[0-9\s]+$/) && (
                  <span className="text-base font-medium text-muted-foreground">
                    {" "}
                    NOK{t("price.month")}
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8" variant={plan.featured ? "default" : "outline"}>
                <Link to="/auth">{t("price.cta")}</Link>
              </Button>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
