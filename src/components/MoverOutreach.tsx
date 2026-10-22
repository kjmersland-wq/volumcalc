import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Mail, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sendEstimateToMovers } from "@/lib/outreach.functions";

type Row = { company: string; email: string };

type Props = {
  estimateId: string;
  token: string;
  rt: (key: string) => string;
  /** Language the report is shown in; used as the e-mail's starting language. */
  defaultLang?: string;
  /** Customer's transport insurance choice; prepended to the e-mail text. */
  insurance?: boolean;
  /** Time estimate from the report, included in the e-mail when present. */
  time?: { crew: number; total: number; low: number; high: number };
};

const MAIL_LANGS = [
  { value: "no", label: "Norsk" },
  { value: "en", label: "English" },
  { value: "pl", label: "Polski" },
] as const;
type MailLang = (typeof MAIL_LANGS)[number]["value"];

function insuranceLine(lang: MailLang, insurance: boolean | undefined): string {
  if (insurance === undefined) return "";
  const text = {
    no: insurance ? "Transportforsikring ønskes inkludert i tilbudet." : "Transportforsikring er ikke ønsket.",
    en: insurance ? "Please include transport insurance in the quote." : "Transport insurance is not wanted.",
    pl: insurance
      ? "Prosimy o uwzględnienie ubezpieczenia transportu w ofercie."
      : "Ubezpieczenie transportu nie jest wymagane.",
  } as const;
  return text[lang];
}

/** E-mail delivery of the report to any moving company the customer found and typed in. */
export function MoverOutreach({ estimateId, token, rt, defaultLang, insurance, time }: Props) {
  const send = useServerFn(sendEstimateToMovers);
  const [rows, setRows] = useState<Row[]>([{ company: "", email: "" }]);
  const [name, setName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [mailLang, setMailLang] = useState<MailLang>(
    MAIL_LANGS.some((l) => l.value === defaultLang) ? (defaultLang as MailLang) : "en",
  );

  async function submit() {
    const recipients = rows.map((r) => r.email.trim()).filter(Boolean);
    if (!recipients.length || !name.trim() || !replyTo.trim()) {
      toast.error(rt("mov.missing"));
      return;
    }
    setSending(true);
    try {
      const reportUrl = `${window.location.origin}/estimate/${estimateId}?token=${token}`;
      const result = await send({
        data: {
          estimateId,
          token,
          recipients,
          replyTo: replyTo.trim(),
          senderName: name.trim(),
          message: [insuranceLine(mailLang, insurance), message].filter(Boolean).join("\n\n"),
          reportUrl,
          lang: mailLang,
          ...(time ? { time } : {}),
        },
      });
      if (result.sent > 0) toast.success(`${rt("mov.sent")} (${result.sent})`);
      if (result.failed.length) toast.error(`${rt("mov.failed")}: ${result.failed.join(", ")}`);
    } catch {
      toast.error(rt("mov.failed"));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="no-print mt-6 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Mail className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">{rt("mov.title")}</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{rt("mov.sub")}</p>

      <div className="mt-6 space-y-3">
        <p className="text-sm font-medium">{rt("mov.listTitle")}</p>
        <p className="text-xs text-muted-foreground">{rt("mov.listHelp")}</p>
        {rows.map((row, index) => (
          <div key={row.company + index} className="flex items-center gap-2">
            <Input
              className="w-44 shrink-0"
              placeholder={rt("mov.company")}
              value={row.company}
              maxLength={120}
              onChange={(e) =>
                setRows((prev) => prev.map((r, i) => (i === index ? { ...r, company: e.target.value } : r)))
              }
            />
            <Input
              type="email"
              placeholder="post@firma.no"
              value={row.email}
              onChange={(e) =>
                setRows((prev) => prev.map((r, i) => (i === index ? { ...r, email: e.target.value } : r)))
              }
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setRows((prev) => [...prev, { company: "", email: "" }])}>
          <Plus className="size-4" />
          {rt("mov.addManual")}
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="mov-name">{rt("mov.yourName")}</Label>
          <Input id="mov-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mov-email">{rt("mov.yourEmail")}</Label>
          <Input id="mov-email" type="email" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="mov-lang">{rt("mov.lang")}</Label>
          <Select value={mailLang} onValueChange={(value) => setMailLang(value as MailLang)}>
            <SelectTrigger id="mov-lang" className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MAIL_LANGS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="mov-msg">{rt("mov.message")}</Label>
          <Textarea id="mov-msg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
      </div>

      <Button className="mt-4" onClick={submit} disabled={sending}>
        {sending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
        {rt("mov.send")}
      </Button>
    </section>
  );
}
