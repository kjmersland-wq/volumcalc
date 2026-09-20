import { Copy, Facebook, Linkedin, Mail, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

type ShareButtonsProps = {
  title: string;
  text: string;
};

export function ShareButtons({ title, text }: ShareButtonsProps) {
  const { t, lang } = useI18n();

  function getShareUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    return url.toString();
  }

  function openShare(href: string) {
    window.open(href, "_blank", "noopener,noreferrer,width=720,height=640");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(getShareUrl());
    toast.success(t("res.copied"));
  }

  async function nativeShare() {
    const url = getShareUrl();
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }
    await copyLink();
  }

  const encodedUrl = encodeURIComponent(typeof window === "undefined" ? "" : getShareUrl());
  const encodedText = encodeURIComponent(`${text} ${typeof window === "undefined" ? "" : getShareUrl()}`);

  return (
    <section className="no-print mt-6 border-y border-border py-5" aria-labelledby="share-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="share-heading" className="font-semibold">{t("share.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("share.sub")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="icon" onClick={() => openShare(`https://wa.me/?text=${encodedText}`)} aria-label={t("share.whatsapp")} title={t("share.whatsapp")}>
            <MessageCircle className="size-4" />
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)} aria-label={t("share.facebook")} title={t("share.facebook")}>
            <Facebook className="size-4" />
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={() => openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)} aria-label={t("share.linkedin")} title={t("share.linkedin")}>
            <Linkedin className="size-4" />
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={() => openShare(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodedUrl}`)} aria-label={t("share.x")} title={t("share.x")}>
            <span className="text-sm font-bold" aria-hidden="true">X</span>
          </Button>
          <Button type="button" variant="outline" size="icon" asChild>
            <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}`} aria-label={t("share.email")} title={t("share.email")}>
              <Mail className="size-4" />
            </a>
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={copyLink} aria-label={t("res.share")} title={t("res.share")}>
            <Copy className="size-4" />
          </Button>
          <Button type="button" size="sm" onClick={nativeShare}>
            <Share2 className="size-4" />
            {t("share.more")}
          </Button>
        </div>
      </div>
    </section>
  );
}