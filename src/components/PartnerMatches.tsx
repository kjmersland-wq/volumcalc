import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { countryName, countryOptions } from "@/lib/countries";
import type { Lang } from "@/lib/i18n";
import { getMoveDetails, matchPartners, sendQuoteRequests, setMoveDetails } from "@/lib/partners.functions";

type Props = {
  estimateId: string;
  token: string;
  rt: (key: string) => string;
  lang: Lang;
  defaultName?: string;
  defaultEmail?: string;
  /** Called when the partner data cannot be loaded (e.g. migration not applied yet). */
  onUnavailable?: () => void;
};

const MAIL_LANGS = ["no", "en", "pl"] as const;

/** 3–5 partners that cover the customer's route and volume, with one "Send request" action. */
export function PartnerMatches({ estimateId, token, rt, lang, defaultName = "", defaultEmail = "", onUnavailable }: Props) {
  const queryClient = useQueryClient();
  const match = useServerFn(matchPartners);
  const loadDetails = useServerFn(getMoveDetails);
  const saveDetails = useServerFn(setMoveDetails);
  const send = useServerFn(sendQuoteRequests);

  const [fromCountry, setFromCountry] = useState("");
  const [toCountry, setToCountry] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  const matches = useQuery({
    queryKey: ["partner-matches", estimateId],
    queryFn: () => match({ data: { estimateId, token } }),
    retry: false,
  });
  const details = useQuery({
    queryKey: ["move-details", estimateId],
    queryFn: () => loadDetails({ data: { estimateId, token } }),
    retry: false,
  });

  useEffect(() => {
    if (details.data) {
      setFromCountry(details.data.fromCountry ?? "");
      setToCountry(details.data.toCountry ?? "");
    }
  }, [details.data]);

  // Everyone not yet contacted starts ticked, so one click sends to all matches.
  useEffect(() => {
    if (matches.data) {
      setSelected(new Set(matches.data.partners.filter((p) => !p.alreadySent).map((p) => p.id)));
    }
  }, [matches.data]);

  const saveRoute = useMutation({
    mutationFn: (next: { from: string; to: string }) =>
      saveDetails({
        data: { estimateId, token, fromCountry: next.from || null, toCountry: next.to || null },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["partner-matches", estimateId] });
      void queryClient.invalidateQueries({ queryKey: ["move-details", estimateId] });
    },
    onError: () => toast.error(rt("pm.error")),
  });

  const sendRequests = useMutation({
    mutationFn: () =>
      send({
        data: {
          estimateId,
          token,
          partnerIds: [...selected],
          senderName: name.trim(),
          replyTo: email.trim(),
          ...(message.trim() ? { message: message.trim() } : {}),
          reportUrl: `${window.location.origin}/estimate/${estimateId}?token=${token}`,
          lang: (MAIL_LANGS as readonly string[]).includes(lang) ? (lang as (typeof MAIL_LANGS)[number]) : "en",
          consent: true as const,
        },
      }),
    onSuccess: (result) => {
      if (result.sent.length) toast.success(`${rt("pm.sent")} ${result.sent.join(", ")}`);
      if (result.failed.length) toast.error(`${rt("pm.failed")} ${result.failed.join(", ")}`);
      void queryClient.invalidateQueries({ queryKey: ["partner-matches", estimateId] });
    },
    onError: () => toast.error(rt("pm.error")),
  });

  function changeRoute(next: { from?: string; to?: string }) {
    const from = next.from ?? fromCountry;
    const to = next.to ?? toCountry;
    setFromCountry(from);
    setToCountry(to);
    if (from && to) saveRoute.mutate({ from, to });
  }

  function toggle(id: string, on: boolean) {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (on) copy.add(id);
      else copy.delete(id);
      return copy;
    });
  }

  const canSend = selected.size > 0 && name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email) && consent;
  const partners = matches.data?.partners ?? [];

  // The partner tables may not exist yet (migration pending): stay out of the way.
  useEffect(() => {
    if (matches.isError) onUnavailable?.();
  }, [matches.isError, onUnavailable]);
  if (matches.isError) return null;

  return (
    <section className="no-print mt-6 rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">{rt("pm.title")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{rt("pm.sub")}</p>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium">{rt("pm.routeTitle")}</legend>
        <p className="text-xs text-muted-foreground">{rt("pm.routeHelp")}</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {(
            [
              ["from", rt("pm.from"), fromCountry],
              ["to", rt("pm.to"), toCountry],
            ] as const
          ).map(([key, label, value]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`pm-${key}`}>{label}</Label>
              <select
                id={`pm-${key}`}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={value}
                onChange={(e) => changeRoute({ [key]: e.target.value })}
              >
                <option value="">{rt("pm.choose")}</option>
                {countryOptions(lang).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </fieldset>

      {matches.isLoading || saveRoute.isPending ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
        </p>
      ) : matches.data?.missingRoute ? null : partners.length === 0 ? (
        <p className="mt-5 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">{rt("pm.none")}</p>
      ) : (
        <>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {partners.map((partner) => (
              <li key={partner.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                {partner.alreadySent ? (
                  <Check className="size-4 shrink-0 text-success" />
                ) : (
                  <Checkbox
                    id={`pm-${partner.id}`}
                    checked={selected.has(partner.id)}
                    onCheckedChange={(on) => toggle(partner.id, on === true)}
                  />
                )}
                <Label htmlFor={`pm-${partner.id}`} className="min-w-0 flex-1 cursor-pointer">
                  <span className="block truncate text-sm font-medium">{partner.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {countryName(partner.country, lang)}
                    {partner.alreadySent ? ` · ${rt("pm.alreadySent")}` : ""}
                  </span>
                </Label>
              </li>
            ))}
          </ul>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pm-name">{rt("mov.yourName")}</Label>
              <Input id="pm-name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pm-email">{rt("mov.yourEmail")}</Label>
              <Input id="pm-email" type="email" value={email} maxLength={180} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="pm-msg">{rt("mov.message")}</Label>
              <Textarea id="pm-msg" rows={3} maxLength={1500} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2">
            <Checkbox id="pm-consent" checked={consent} onCheckedChange={(on) => setConsent(on === true)} />
            <Label htmlFor="pm-consent" className="text-sm font-normal leading-snug">
              {rt("pm.consent")}
            </Label>
          </div>

          <Button
            className="mt-4"
            size="lg"
            disabled={sendRequests.isPending}
            onClick={() => {
              if (!canSend) {
                toast.error(rt("pm.missing"));
                return;
              }
              sendRequests.mutate();
            }}
          >
            {sendRequests.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {rt("pm.send")}
          </Button>
        </>
      )}
    </section>
  );
}
