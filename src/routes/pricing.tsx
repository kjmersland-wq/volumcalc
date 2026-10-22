import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, UserRound, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { px } from "@/lib/pricing-i18n";
import { useI18n } from "@/lib/i18n";
import type { PlanKey } from "@/lib/paddle-prices";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { toast } from "sonner";

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
  const { user } = useAuth();
  const { openCheckout, loading } = usePaddleCheckout();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"private" | "business">("private");

  useEffect(() => {
    if (window.location.hash === "#business") setTab("business");
  }, []);

  const buy = async (plan: PlanKey) => {
    if (!user) {
      toast(px(lang, "loginFirst"));
      navigate({ to: "/auth" });
      return;
    }
    try {
      await openCheckout({
        plan,
        quantity: 1,
        ...(user.email ? { customerEmail: user.email } : {}),
        customData: { userId: user.id },
        successUrl: `${window.location.origin}/dashboard?checkout=success`,
      });
    } catch (error) {
      console.error(error);
      toast.error("Checkout could not be opened. Please try again.");
    }
  };

  const plans = [
    {
      name: "Business",
      priceEur: 130 as number | null,
      priceLabel: null as string | null,
      desc: px(lang, "bizDesc"),
      features: [px(lang, "fCore"), px(lang, "fBrand"), px(lang, "fRate"), px(lang, "fEmbed")],
      featured: true,
      paid: true,
    },
    {
      name: "Enterprise",
      priceEur: null,
      priceLabel: px(lang, "talk"),
      desc: px(lang, "entDesc"),
      features: [px(lang, "fAll"), px(lang, "fBranches"), px(lang, "fApi"), px(lang, "fContact")],
      featured: false,
      paid: false,
    },
  ];

  const privatePlans = [
    {
      name: px(lang, "single"),
      priceEur: 11,
      plan: "single" as PlanKey,
      desc: px(lang, "oneMove"),
      features: [px(lang, "fChecklist"), px(lang, "fPdfLink"), px(lang, "fSaved")],
      featured: true,
    },
    {
      name: px(lang, "three"),
      priceEur: 25,
      plan: "three_pack" as PlanKey,
      desc: px(lang, "save", { x: `€${3 * 11 - 25}` }),
      features: [px(lang, "fThree"), px(lang, "fChecklist"), px(lang, "fPdfLink")],
      featured: false,
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
          <div role="tablist" className="mx-auto mb-10 flex w-fit gap-1 rounded-xl bg-muted p-1">
            {(
              [
                { key: "private", label: t("price.private"), icon: UserRound },
                { key: "business", label: t("price.business"), icon: Building2 },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>

          {tab === "private" && (
            <>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <UserRound className="size-5" />
            </span>
            <h2 className="text-2xl font-bold">{t("price.private")}</h2>
          </div>
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {privatePlans.map((plan) => {
              return (
                <div
                  key={plan.name}
                  className={cn(
                    "card-soft flex flex-col p-7",
                    plan.featured &&
                      "border-primary shadow-[var(--shadow-lift)]",
                  )}
                >
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-4 text-3xl font-bold">
                    €{plan.priceEur}
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
                  <Button
                    className="mt-8"
                    variant={plan.featured ? "default" : "outline"}
                    disabled={loading}
                    onClick={() => buy(plan.plan)}
                  >
                    {px(lang, "buy")}
                  </Button>
                </div>
              );
            })}
          </div>

            </>
          )}

          {tab === "business" && (
            <>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Building2 className="size-5" />
            </span>
            <h2 className="text-2xl font-bold">{t("price.business")}</h2>
          </div>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            {plans.map((plan) => {
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
                    {plan.priceEur !== null ? (
                      <>
                        €{plan.priceEur}
                        <span className="text-base font-medium text-muted-foreground">
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
                  {plan.paid ? (
                    <>
                      <Button
                        className="mt-8"
                        variant="default"
                        disabled={loading}
                        onClick={() => buy("business")}
                      >
                        {px(lang, "subscribe")}
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
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
