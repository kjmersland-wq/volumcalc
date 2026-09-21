import { Copy, Facebook, Linkedin, Mail, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { translate, useI18n, type Lang } from "@/lib/i18n";

type ShareButtonsProps = {
  title: string;
  text: string;
  langOverride?: Lang;
};

export function ShareButtons({ title, text, langOverride }: ShareButtonsProps) {
  const { t, lang } = useI18n();
  const activeLang = langOverride ?? lang;
  const shareText = (key: string) => translate(key, activeLang);

  function getShareUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", activeLang);
    return url.toString();
  }

  function openShare(href: string) {
    window.open(href, "_blank", "noopener,noreferrer,width=720,height=640");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(getShareUrl());
    toast.success(langOverride ? translate("res.copied", activeLang) : t("res.copied"));
  }

  async function nativeShare() {
    const url = getShareUrl();
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }
    await copyLink();
  }

  function shareUrl(baseUrl: string, includeText = false) {
    const encodedUrl = encodeURIComponent(getShareUrl());
    const encodedText = encodeURIComponent(`${text} ${getShareUrl()}`);
    openShare(includeText ? `${baseUrl}${encodedText}` : `${baseUrl}${encodedUrl}`);
  }

  function shareByEmail() {
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${getShareUrl()}`)}`;
  }

  return (
    <section className="no-print mt-6 border-y border-border py-5" aria-labelledby="share-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="share-heading" className="font-semibold">
            {shareText("share.title")}
          </h2>
          <p className="text-sm text-muted-foreground">{shareText("share.sub")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => shareUrl("https://wa.me/?text=", true)}
            aria-label={shareText("share.whatsapp")}
            title={shareText("share.whatsapp")}
          >
            <MessageCircle className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => shareUrl("https://www.facebook.com/sharer/sharer.php?u=")}
            aria-label={shareText("share.facebook")}
            title={shareText("share.facebook")}
          >
            <Facebook className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => shareUrl("https://www.linkedin.com/sharing/share-offsite/?url=")}
            aria-label={shareText("share.linkedin")}
            title={shareText("share.linkedin")}
          >
            <Linkedin className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() =>
              openShare(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getShareUrl())}`,
              )
            }
            aria-label={shareText("share.x")}
            title={shareText("share.x")}
          >
            <span className="text-sm font-bold" aria-hidden="true">
              X
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={shareByEmail}
            aria-label={shareText("share.email")}
            title={shareText("share.email")}
          >
            <Mail className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={copyLink}
            aria-label={shareText("res.share")}
            title={shareText("res.share")}
          >
            <Copy className="size-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={nativeShare}
            aria-label={shareText("share.more")}
            title={shareText("share.more")}
          >
            <Share2 className="size-4" />
            {shareText("share.more")}
          </Button>
        </div>
      </div>
    </section>
  );
}
