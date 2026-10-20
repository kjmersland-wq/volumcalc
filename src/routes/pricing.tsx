import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
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
import { PURCHASES_ENABLED } from "@/lib/purchases";
import { px } from "@/lib/pricing-i18n";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { approxPrice, formatApproxInline } from "@/lib/currency";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Pricing — moving volume calculator and m³ estimates | VolumCalc" },
      {
        name: "description",
        content:
          "The m³ moving volume calculator is free. Buy a single estimate or a 3-pack to save, share and download a PDF — or choose a plan for your moving company.",
      },
      { property: "og:title", content: "Pricing — moving volume calculator and m³ estimates | VolumCalc" },
      {
        property: "og:description",
        content:
          "Free moving volume calculator. Single estimates, 3-packs and plans for moving companies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/pricing" }],
  }),
  component: Pricing,
});

function Pricing() {
  const { t, lang } = useI18n();
  const [checkout, setCheckout] = useState<{ priceId: string; name: string } | null>(null);

  const { session } = useAuth();
  const navigate = useNavigate();

  /** Purchases are credited to an account, so the buyer must be signed in first. */
  function startCheckout(priceId: string, name: string) {
    if (!PURCHASES_ENABLED) return;
    if (!session) {
      toast(px(lang, "loginFirst"));
      void navigate({ to: "/auth" });
      return;
    }
    setCheckout({ priceId, name });
  }

  const plans = [
    {
      name: "Business",
      priceNok: 1490 as number | null,
      priceLabel: null as string | null,
      desc: px(lang, "bizDesc"),
      features: [px(lang, "fCore"), px(lang, "fBrand"), px(lang, "fRate"), px(lang, "fEmbed")],
      featured: true,
      priceId: "volumcalc_business_monthly_nok" as string | null,
    },
    {
      name: "Enterprise",
      priceNok: null,
      priceLabel: px(lang, "talk"),
      desc: px(lang, "entDesc"),
      features: [px(lang, "fAll"), px(lang, "fBranches"), px(lang, "fApi"), px(lang, "fContact")],
      featured: false,
      priceId: null,
    },
  ];

  const privatePlans = [
    {
      name: px(lang, "single"),
      priceNok: 129,
      desc: px(lang, "oneMove"),
      features: [px(lang, "fChecklist"), px(lang, "fPdfLink"), px(lang, "fSaved")],
      priceId: "volumcalc_single_estimate_nok" as string | null,
    },
    {
      name: px(lang, "three"),
      priceNok: 299,
      desc: px(lang, "save", { x: formatApproxInline(88, lang) }),
      features: [px(lang, "fThree"), px(lang, "fChecklist"), px(lang, "fPdfLink")],
      priceId: "volumcalc_three_estimates_nok" as string | null,
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
            {privatePlans.map((plan) => {
              const price = approxPrice(plan.priceNok, lang);
              return (
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
                    {price.prefix}
                    {price.amount}{" "}
                    <span className="text-base font-medium text-muted-foreground">
                      {price.currency}
                    </span>
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
                    <>
                      <Button
                        className="mt-8"
                        variant={
                          plan.priceId === "volumcalc_single_estimate_nok" ? "default" : "outline"
                        }
                        disabled={!PURCHASES_ENABLED}
                        onClick={() => startCheckout(plan.priceId!, plan.name)}
                      >
                        <LockKeyhole className="size-4" />
                        {PURCHASES_ENABLED ? t("payment.buy") : px(lang, "comingSoon")}
                      </Button>
                    </>
                  ) : (
                    <Button asChild className="mt-8" variant="outline">
                      <Link to="/upload">{t("price.cta")}</Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-20 flex items-center gap-3 border-t border-border pt-16">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Building2 className="size-5" />
            </span>
            <h2 className="text-2xl font-bold">{t("price.business")}</h2>
          </div>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            {plans.map((plan) => {
              const price = plan.priceNok !== null ? approxPrice(plan.priceNok, lang) : null;
              return (
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
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-4 text-3xl font-bold">
                    {price ? (
                      <>
                        {price.prefix}
                        {price.amount}
                        <span className="text-base font-medium text-muted-foreground">
                          {" "}
                          {price.currency}
                          {t("price.month")}
                        </span>
                      </>
                    ) : (
                      plan.priceLabel
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
                    <>
                      <Button
                        className="mt-8"
                        variant="default"
                        disabled={!PURCHASES_ENABLED}
                        onClick={() => startCheckout(plan.priceId!, plan.name)}
                      >
                        <LockKeyhole className="size-4" />
                        {PURCHASES_ENABLED ? t("payment.subscribe") : px(lang, "comingSoon")}
                      </Button>
                    </>
                  ) : (
                    <Button asChild className="mt-8" variant="outline">
                      <Link to="/auth">{t("price.cta")}</Link>
                    </Button>
                  )}
                </div>
              );
            })}
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
