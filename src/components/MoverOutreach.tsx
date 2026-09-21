import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Loader2, Mail, Plus, Trash2 } from "lucide-react";
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
import { MOVERS, MOVER_COUNTRIES } from "@/lib/movers";
import { sendEstimateToMovers } from "@/lib/outreach.functions";

type Row = { company: string; email: string };

type Props = {
  estimateId: string;
  token: string;
  rt: (key: string) => string;
};

/** Catalogue of movers that accept tenders + email delivery of the report. */
export function MoverOutreach({ estimateId, token, rt }: Props) {
  const send = useServerFn(sendEstimateToMovers);
  const [country, setCountry] = useState("all");
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const list = useMemo(
    () => (country === "all" ? MOVERS : MOVERS.filter((m) => m.country === country)),
    [country],
  );

  function addRow(company: string) {
    setRows((prev) =>
      prev.some((r) => r.company === company) ? prev : [...prev, { company, email: "" }],
    );
  }

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
          message,
          reportUrl,
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

      <div className="mt-4 max-w-xs">
        <Label htmlFor="mov-country">{rt("mov.country")}</Label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger id="mov-country" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{rt("mov.allCountries")}</SelectItem>
            {MOVER_COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((mover) => (
          <div
            key={mover.name}
            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {mover.flag} {mover.name}
              </p>
              <p className="text-xs text-muted-foreground">{mover.country}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button asChild variant="ghost" size="sm">
                <a href={mover.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={() => addRow(mover.name)}>
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-sm font-medium">{rt("mov.listTitle")}</p>
        <p className="text-xs text-muted-foreground">{rt("mov.listHelp")}</p>
        {rows.map((row, index) => (
          <div key={row.company + index} className="flex items-center gap-2">
            <span className="w-44 shrink-0 truncate text-sm">{row.company}</span>
            <Input
              type="email"
              placeholder={rt("mov.emailPlaceholder")}
              value={row.email}
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((r, i) => (i === index ? { ...r, email: e.target.value } : r)),
                )
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRows((prev) => [...prev, { company: rt("mov.manual"), email: "" }])}
        >
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
          <Input
            id="mov-email"
            type="email"
            value={replyTo}
            onChange={(e) => setReplyTo(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="mov-msg">{rt("mov.message")}</Label>
          <Textarea
            id="mov-msg"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </div>

      <Button className="mt-4" onClick={submit} disabled={sending}>
        {sending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
        {rt("mov.send")}
      </Button>
    </section>
  );
}
