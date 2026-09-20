import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Send, Mail, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { sendContactMessage } from "@/lib/contact.functions";

const empty = { name: "", email: "", phone: "", subject: "", message: "", company: "" };

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const { t, lang } = useI18n();
  const submit = useServerFn(sendContactMessage);
  const [form, setForm] = useState(empty);
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: async () =>
      submit({
        data: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          subject: form.subject.trim(),
          message: form.message.trim(),
          locale: lang,
          company: form.company,
        },
      }),
    onSuccess: () => {
      setDone(true);
      setForm(empty);
      toast.success(t("contact.sent"));
    },
    onError: () => toast.error(t("contact.error")),
  });

  const valid =
    form.name.trim().length >= 2 &&
    /.+@.+\..+/.test(form.email.trim()) &&
    form.subject.trim().length >= 2 &&
    form.message.trim().length >= 10;

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-success/10">
          <ShieldCheck className="size-6 text-success" />
        </div>
        <h3 className="text-lg font-semibold">{t("contact.sentTitle")}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t("contact.sent")}</p>
        <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>
          {t("contact.another")}
        </Button>
      </div>
    );
  }

  return (
    <form
      className={compact ? "space-y-4" : "space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"}
      onSubmit={(event) => {
        event.preventDefault();
        if (!valid) {
          toast.error(t("contact.required"));
          return;
        }
        mutation.mutate();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="c-name">{t("contact.name")}</Label>
          <Input
            id="c-name"
            value={form.name}
            maxLength={120}
            required
            autoComplete="name"
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-email">{t("contact.email")}</Label>
          <Input
            id="c-email"
            type="email"
            value={form.email}
            maxLength={180}
            required
            autoComplete="email"
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="c-phone">{t("contact.phone")}</Label>
          <Input
            id="c-phone"
            value={form.phone}
            maxLength={40}
            autoComplete="tel"
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-subject">{t("contact.subject")}</Label>
          <Input
            id="c-subject"
            value={form.subject}
            maxLength={160}
            required
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="c-message">{t("contact.message")}</Label>
        <Textarea
          id="c-message"
          rows={compact ? 4 : 6}
          maxLength={4000}
          value={form.message}
          required
          placeholder={t("contact.placeholder")}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        />
      </div>

      {/* honeypot */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        value={form.company}
        onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">{t("contact.privacy")}</p>
        <Button type="submit" size="lg" disabled={!valid || mutation.isPending}>
          {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {t("contact.send")}
        </Button>
      </div>
    </form>
  );
}

export function ContactDetails() {
  const { t } = useI18n();
  return (
    <div className="space-y-4 text-sm">
      <a
        href="mailto:kjell@volumcalc.com"
        className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
      >
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Mail className="size-5" />
        </span>
        <span>
          <span className="block font-medium text-foreground">{t("contact.emailUs")}</span>
          <span className="text-muted-foreground">kjell@volumcalc.com</span>
        </span>
      </a>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Phone className="size-5" />
        </span>
        <span>
          <span className="block font-medium text-foreground">{t("contact.response")}</span>
          <span className="text-muted-foreground">{t("contact.responseTime")}</span>
        </span>
      </div>
    </div>
  );
}
