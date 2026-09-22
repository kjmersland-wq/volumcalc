import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, UserRound, Building2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Pricing for individuals and movers — VolumCalc" },
      {
        name: "description",
        content:
          "Plans for movers and storage providers, from a free starter tier to unlimited estimates.",
      },
      { property: "og:title", content: "Pricing for individuals and movers — VolumCalc" },
      {
        property: "og:description",
        content:
          "Simple monthly plans for video-based cubic volume estimates and checklist workflows.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const { t, lang } = useI18n();
  const [checkout, setCheckout] = useState<{ priceId: string; name: string } | null>(null);

  const plans = [
    {
      name: "Business",
      price: "1 490",
      desc: lang === "no" ? "300 beregninger per måned" : "300 estimates per month",
      features:
        lang === "no"
          ? ["Alle basisfunksjoner", "Egen logo og farger", "Pris per m³ og tilbud", "PDF-rapport"]
          : ["All core features", "Your logo and colours", "Rate per m³ and quotes", "PDF report"],
      featured: true,
      priceId: "volumcalc_business_monthly_nok",
    },
    {
      name: "Enterprise",
      price: lang === "no" ? "Kontakt oss" : "Talk to us",
      desc: lang === "no" ? "Ubegrenset volum" : "Unlimited volume",
      features:
        lang === "no"
          ? ["Alt i Business", "Flere avdelinger", "API og integrasjoner", "Egen kundekontakt"]
          : [
              "Everything in Business",
              "Multiple branches",
              "API and integrations",
              "Dedicated contact",
            ],
      featured: false,
      priceId: null,
    },
  ];

  const privatePlans = [
    {
      name: lang === "no" ? "Én beregning" : "Single estimate",
      price: "129",
      desc: lang === "no" ? "For én flytting" : "For one move",
      features:
        lang === "no"
          ? ["Bilder + sjekkliste", "Romvis sortering", "PDF-rapport"]
          : ["Room video + checklist", "Room grouping", "PDF report"],
      priceId: "volumcalc_single_estimate_nok",
    },
    {
      name: lang === "no" ? "3 beregninger" : "3 estimates",
      price: "299",
      desc: lang === "no" ? "Spar 88 NOK" : "Save 88 NOK",
      features:
        lang === "no"
          ? ["3 komplette beregninger", "Bilder + sjekkliste", "PDF-rapporter"]
          : ["3 complete estimates", "Room video + checklist", "PDF reports"],
      priceId: "volumcalc_three_estimates_nok",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="surface-hero border-b border-border/60 px-4 py-16 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">{t("price.title")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("price.sub")}</p>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <UserRound className="size-5" />
            </span>
            <h2 className="text-2xl font-bold">{t("price.private")}</h2>
          </div>
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {privatePlans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "card-soft flex flex-col p-7",
                  plan.priceId === "volumcalc_single_estimate_nok" &&
                    "border-primary shadow-[var(--shadow-lift)]",
                )}
              >
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-4 text-3xl font-bold">
                  {plan.price}{" "}
                  <span className="text-base font-medium text-muted-foreground">NOK</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="mt-0.5 size-4 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.priceId ? (
                  <Button
                    className="mt-8"
                    variant={
                      plan.priceId === "volumcalc_single_estimate_nok" ? "default" : "outline"
                    }
                    onClick={() => setCheckout({ priceId: plan.priceId, name: plan.name })}
                  >
                    <LockKeyhole className="size-4" />
                    {t("payment.buy")}
                  </Button>
                ) : (
                  <Button asChild className="mt-8" variant="outline">
                    <Link to="/upload">{t("price.cta")}</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-20 flex items-center gap-3 border-t border-border pt-16">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Building2 className="size-5" />
            </span>
            <h2 className="text-2xl font-bold">{t("price.business")}</h2>
          </div>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
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
                {plan.priceId ? (
                  <Button
                    className="mt-8"
                    variant="default"
                    onClick={() => setCheckout({ priceId: plan.priceId, name: plan.name })}
                  >
                    <LockKeyhole className="size-4" />
                    {t("payment.subscribe")}
                  </Button>
                ) : (
                  <Button asChild className="mt-8" variant="outline">
                    <Link to="/auth">{t("price.cta")}</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
      <Dialog open={Boolean(checkout)} onOpenChange={(open) => !open && setCheckout(null)}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto p-0">
          <DialogHeader className="border-b border-border px-6 py-5 pr-12">
            <DialogTitle>{checkout?.name}</DialogTitle>
            <DialogDescription>{t("payment.secure")}</DialogDescription>
          </DialogHeader>
          <div className="min-h-[560px] px-2 pb-5 sm:px-5">
            {checkout && (
              <StripeEmbeddedCheckout key={checkout.priceId} priceId={checkout.priceId} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
