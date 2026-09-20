import { useI18n } from "@/lib/i18n";

const clientToken = import.meta.env["VITE_PAYMENTS_CLIENT_TOKEN"];

export function PaymentTestModeBanner() {
  const { t } = useI18n();
  if (clientToken?.startsWith("pk_live_")) return null;
  return (
    <div className="w-full border-b border-warning/30 bg-warning/15 px-4 py-2 text-center text-sm text-warning-foreground">
      {clientToken?.startsWith("pk_test_") ? t("payment.test") : t("payment.notLive")}
    </div>
  );
}