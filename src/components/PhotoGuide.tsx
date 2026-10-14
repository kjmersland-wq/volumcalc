import { Camera, Sun, LayoutGrid } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function PhotoGuide() {
  const { t } = useI18n();
  const tips = [
    { icon: Camera, title: t("photo.1t"), body: t("photo.1d") },
    { icon: Sun, title: t("photo.2t"), body: t("photo.2d") },
    { icon: LayoutGrid, title: t("photo.3t"), body: t("photo.3d") },
  ];
  return (
    <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
      <p className="text-sm font-semibold">{t("photo.title")}</p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-3">
        {tips.map((tip) => (
          <li key={tip.title} className="flex gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <tip.icon className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-medium">{tip.title}</span>
              <span className="block text-xs leading-relaxed text-muted-foreground">{tip.body}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
