import { Copy, Facebook, Linkedin, Mail, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useI18n, type Lang } from "@/lib/i18n";

const shareCopy: Record<Lang, { title: string; text: string; label: string; copied: string; email: string; more: string }> = {
  en: { title: "VolumCalc — Moving volume, made clear", text: "Get a clear, room-by-room moving volume estimate with VolumCalc.", label: "Share VolumCalc", copied: "Link copied", email: "Share by email", more: "More" },
  no: { title: "VolumCalc — Flyttevolum, gjort enkelt", text: "Få en tydelig volumberegning rom for rom med VolumCalc.", label: "Del VolumCalc", copied: "Lenke kopiert", email: "Del med e-post", more: "Flere" },
  sv: { title: "VolumCalc — Flyttvolym, gjord enkel", text: "Få en tydlig volymberäkning rum för rum med VolumCalc.", label: "Dela VolumCalc", copied: "Länken har kopierats", email: "Dela via e-post", more: "Fler" },
  da: { title: "VolumCalc — Flyttevolumen, gjort enkelt", text: "Få en tydelig volumenberegning rum for rum med VolumCalc.", label: "Del VolumCalc", copied: "Link kopieret", email: "Del via e-mail", more: "Flere" },
  fi: { title: "VolumCalc — Muuttovolyymi selkeästi", text: "Saat selkeän huonekohtaisen tilavuusarvion VolumCalcilla.", label: "Jaa VolumCalc", copied: "Linkki kopioitu", email: "Jaa sähköpostilla", more: "Lisää" },
  de: { title: "VolumCalc — Umzugsvolumen klar berechnet", text: "Erhalten Sie mit VolumCalc eine klare Volumenschätzung, Raum für Raum.", label: "VolumCalc teilen", copied: "Link kopiert", email: "Per E-Mail teilen", more: "Mehr" },
  nl: { title: "VolumCalc — Verhuisvolume helder berekend", text: "Krijg met VolumCalc een duidelijk volumeoverzicht, kamer voor kamer.", label: "VolumCalc delen", copied: "Link gekopieerd", email: "Delen via e-mail", more: "Meer" },
  fr: { title: "VolumCalc — Le volume du déménagement, simplifié", text: "Obtenez avec VolumCalc une estimation claire, pièce par pièce.", label: "Partager VolumCalc", copied: "Lien copié", email: "Partager par e-mail", more: "Plus" },
  pl: { title: "VolumCalc — Objętość przeprowadzki prosto obliczona", text: "Uzyskaj przejrzyste obliczenie objętości, pokój po pokoju, dzięki VolumCalc.", label: "Udostępnij VolumCalc", copied: "Link skopiowany", email: "Udostępnij e-mailem", more: "Więcej" },
  es: { title: "VolumCalc — El volumen de tu mudanza, más claro", text: "Obtén con VolumCalc una estimación clara, habitación por habitación.", label: "Compartir VolumCalc", copied: "Enlace copiado", email: "Compartir por correo", more: "Más" },
  it: { title: "VolumCalc — Il volume del trasloco, più chiaro", text: "Ottieni con VolumCalc una stima chiara, stanza per stanza.", label: "Condividi VolumCalc", copied: "Link copiato", email: "Condividi via e-mail", more: "Altro" },
  pt: { title: "VolumCalc — O volume da mudança, simplificado", text: "Obtenha com o VolumCalc uma estimativa clara, divisão a divisão.", label: "Partilhar VolumCalc", copied: "Ligação copiada", email: "Partilhar por e-mail", more: "Mais" },
};

export function LandingShareButtons() {
  const { lang } = useI18n();
  const copy = shareCopy[lang];

  function shareUrl() {
    return typeof window === "undefined" ? "https://www.volumcalc.com/" : window.location.href.split("?")[0].split("#")[0];
  }

  function open(href: string) {
    window.open(href, "_blank", "noopener,noreferrer,width=720,height=640");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl());
    toast.success(copy.copied);
  }

  async function nativeShare() {
    if (navigator.share) {
      await navigator.share({ title: copy.title, text: copy.text, url: shareUrl() });
      return;
    }
    await copyLink();
  }

  const encodedUrl = () => encodeURIComponent(shareUrl());
  const encodedMessage = () => encodeURIComponent(`${copy.text} ${shareUrl()}`);

  return (
    <section className="no-print border-y border-border bg-muted/25" aria-label={copy.label}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-foreground">{copy.label}</p>
          <p className="mt-1 text-sm text-muted-foreground">{copy.text}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="icon" onClick={() => open(`https://wa.me/?text=${encodedMessage()}`)} aria-label="WhatsApp" title="WhatsApp"><MessageCircle className="size-4" /></Button>
          <Button type="button" variant="outline" size="icon" onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl()}`)} aria-label="Facebook" title="Facebook"><Facebook className="size-4" /></Button>
          <Button type="button" variant="outline" size="icon" onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl()}`)} aria-label="LinkedIn" title="LinkedIn"><Linkedin className="size-4" /></Button>
          <Button type="button" variant="outline" size="icon" onClick={() => open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(copy.text)}&url=${encodedUrl()}`)} aria-label="X" title="X"><span className="text-sm font-bold" aria-hidden="true">X</span></Button>
          <Button type="button" variant="outline" size="icon" onClick={() => { window.location.href = `mailto:?subject=${encodeURIComponent(copy.title)}&body=${encodeURIComponent(`${copy.text}\n\n${shareUrl()}`)}`; }} aria-label={copy.email} title={copy.email}><Mail className="size-4" /></Button>
          <Button type="button" variant="outline" size="icon" onClick={copyLink} aria-label={copy.copied} title={copy.copied}><Copy className="size-4" /></Button>
          <Button type="button" size="sm" onClick={nativeShare}><Share2 className="size-4" />{copy.more}</Button>
        </div>
      </div>
    </section>
  );
}