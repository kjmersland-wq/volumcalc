import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ExternalLink, Loader2, Send, Star } from "lucide-react";
import { toast } from "sonner";
import { PartnerMatches } from "@/components/PartnerMatches";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { countryOptions } from "@/lib/countries";
import type { Lang } from "@/lib/i18n";
import { getMoveDetails, setMoveDetails } from "@/lib/partners.functions";
import { findTopMoversForEstimate, sendRequestsToTopMovers } from "@/lib/places.functions";

type Props = {
  estimateId: string;
  token: string;
  rt: (key: string) => string;
  lang: Lang;
  defaultName?: string;
  defaultEmail?: string;
  /** Called when neither the live lookup nor the partner list can be used. */
  onUnavailable?: () => void;
};

const MAIL_LANGS = ["no", "en", "pl"] as const;

/**
 * The best-rated movers for the customer's route (Google rating and reviews), top five first.
 * Companies with a public e-mail get a checkbox; the rest link to their own contact page.
 * Falls back to the curated partner list when the live lookup is not set up.
 */
export function TopMovers({ estimateId, token, rt, lang, defaultName = "", defaultEmail = "", onUnavailable }: Props) {
  const queryClient = useQueryClient();
  const find = useServerFn(findTopMoversForEstimate);
  const send = useServerFn(sendRequestsToTopMovers);
  const loadDetails = useServerFn(getMoveDetails);
  const saveDetails = useServerFn(setMoveDetails);

  const [fromCountry, setFromCountry] = useState("");
  const [toCountry, setToCountry] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  const top = useQuery({
    queryKey: ["top-movers", estimateId],
    queryFn: () => find({ data: { estimateId, token } }),
    retry: false,
    staleTime: 5 * 60 * 1000,
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

  // Everyone with an e-mail who has not been contacted yet starts ticked.
  useEffect(() => {
    if (top.data?.movers) {
      setSelected(new Set(top.data.movers.filter((m) => m.canEmail && !m.alreadySent).map((m) => m.placeId)));
    }
  }, [top.data]);

  const saveRoute = useMutation({
    mutationFn: (next: { from: string; to: string }) =>
      saveDetails({ data: { estimateId, token, fromCountry: next.from || null, toCountry: next.to || null } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["top-movers", estimateId] });
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
          placeIds: [...selected],
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
      void queryClient.invalidateQueries({ queryKey: ["top-movers", estimateId] });
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

  const unavailable = top.isError || top.data?.available === false;
  if (unavailable) {
    return (
      <PartnerMatches
        estimateId={estimateId}
        token={token}
        rt={rt}
        lang={lang}
        defaultName={defaultName}
        defaultEmail={defaultEmail}
        {...(onUnavailable ? { onUnavailable } : {})}
      />
    );
  }

  const movers = top.data?.movers ?? [];
  const canSend = selected.size > 0 && name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email) && consent;
  const fmt = (n: number) => n.toLocaleString(lang === "no" ? "nb-NO" : lang, { maximumFractionDigits: 1 });

  return (
    <section className="no-print mt-6 rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">{rt("tm.title")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{rt("tm.sub")}</p>

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
              <Label htmlFor={`tm-${key}`}>{label}</Label>
              <select
                id={`tm-${key}`}
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

      {top.isLoading || saveRoute.isPending ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {rt("tm.loading")}
        </p>
      ) : top.data?.missingRoute ? null : movers.length === 0 ? (
        <p className="mt-5 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">{rt("tm.none")}</p>
      ) : (
        <>
          <ol className="mt-5 space-y-3">
            {movers.map((m, index) => (
              <li key={m.placeId} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="size-3.5 fill-current text-warning-foreground" />
                    {fmt(m.rating)} · {m.reviews} {rt("tm.reviews")}
                    {m.address ? ` · ${m.address}` : ""}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <a className="inline-flex items-center gap-1 text-primary hover:underline" href={m.website} target="_blank" rel="noopener noreferrer">
                      {rt("tm.website")} <ExternalLink className="size-3" />
                    </a>
                    {m.phone && <span className="text-muted-foreground">{m.phone}</span>}
                  </div>
                </div>
                {m.alreadySent ? (
                  <span className="flex shrink-0 items-center gap-1 text-xs text-success">
                    <Check className="size-4" />
                    {rt("pm.alreadySent")}
                  </span>
                ) : m.canEmail ? (
                  <Checkbox
                    aria-label={m.name}
                    checked={selected.has(m.placeId)}
                    onCheckedChange={(on) => toggle(m.placeId, on === true)}
                    className="mt-1"
                  />
                ) : (
                  <Button asChild size="sm" variant="outline" className="shrink-0">
                    <a href={m.contactUrl} target="_blank" rel="noopener noreferrer">
                      {rt("tm.contact")}
                    </a>
                  </Button>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-muted-foreground">{rt("tm.source")}</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tm-name">{rt("mov.yourName")}</Label>
              <Input id="tm-name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tm-email">{rt("mov.yourEmail")}</Label>
              <Input id="tm-email" type="email" value={email} maxLength={180} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="tm-msg">{rt("mov.message")}</Label>
              <Textarea id="tm-msg" rows={3} maxLength={1500} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2">
            <Checkbox id="tm-consent" checked={consent} onCheckedChange={(on) => setConsent(on === true)} />
            <Label htmlFor="tm-consent" className="text-sm font-normal leading-snug">
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
