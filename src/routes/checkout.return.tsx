import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } =>
    typeof search["session_id"] === "string" ? { session_id: search["session_id"] } : {},
  head: () => ({
    meta: [
      { title: "Payment complete — VolumCalc" },
      { name: "description", content: "Your VolumCalc payment has been completed." },
      { property: "og:title", content: "Payment complete — VolumCalc" },
      { property: "og:description", content: "Continue with your VolumCalc account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-lg text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
            <CheckCircle2 className="size-7" />
          </span>
          <h1 className="mt-5 text-3xl font-bold">{sessionId ? t("payment.complete") : t("payment.pending")}</h1>
          <p className="mt-3 text-muted-foreground">{t("payment.completeSub")}</p>
          <Button asChild size="lg" className="mt-7">
            <Link to="/upload">{t("payment.continue")}</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}