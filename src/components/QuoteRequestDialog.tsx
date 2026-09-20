import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { HandCoins, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { requestQuote } from "@/lib/estimates.functions";

export function QuoteRequestDialog({ id, token }: { id: string; token: string }) {
  const { t } = useI18n();
  const send = useServerFn(requestQuote);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });

  const mutation = useMutation({
    mutationFn: async () =>
      send({
        data: {
          id,
          token,
          name: form.name.trim(),
          phone: form.phone.trim() || undefined,
          email: form.email.trim() || undefined,
          message: form.message.trim() || undefined,
        },
      }),
    onSuccess: () => {
      toast.success(t("quote.sent"));
      setOpen(false);
      setForm({ name: "", phone: "", email: "", message: "" });
    },
    onError: () => toast.error(t("quote.required")),
  });

  const valid = form.name.trim().length > 0 && (form.phone.trim().length > 0 || form.email.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <HandCoins className="size-4" />
          {t("rep.requestQuote")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("quote.title")}</DialogTitle>
          <DialogDescription>{t("quote.sub")}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!valid) {
              toast.error(t("quote.required"));
              return;
            }
            mutation.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="q-name">{t("quote.name")}</Label>
            <Input
              id="q-name"
              value={form.name}
              maxLength={120}
              required
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="q-phone">{t("quote.phone")}</Label>
              <Input
                id="q-phone"
                value={form.phone}
                maxLength={40}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="q-email">{t("quote.email")}</Label>
              <Input
                id="q-email"
                type="email"
                value={form.email}
                maxLength={160}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="q-message">{t("quote.message")}</Label>
            <Textarea
              id="q-message"
              rows={3}
              maxLength={2000}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
          </div>
          <Button type="submit" className="w-full" disabled={!valid || mutation.isPending}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {t("quote.send")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
