import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  adminImportPartners,
  adminListPartners,
  adminSavePartner,
  type AdminPartnerRow,
} from "@/lib/admin.functions";
import { ROUTE_COUNTRIES } from "@/lib/countries";
import { useI18n } from "@/lib/i18n";

type PartnerForm = {
  id: string | undefined;
  name: string;
  website: string;
  country_code: string;
  lead_email: string;
  serves_from: string;
  serves_to: string;
  min_m3: string;
  max_m3: string;
  languages: string;
  priority: string;
  active: boolean;
  agreed: boolean;
  agreement_note: string;
};

const emptyPartner: PartnerForm = {
  id: undefined,
  name: "",
  website: "",
  country_code: "NO",
  lead_email: "",
  serves_from: "",
  serves_to: "",
  min_m3: "",
  max_m3: "",
  languages: "",
  priority: "100",
  active: true,
  agreed: false,
  agreement_note: "",
};

const splitList = (value: string, upper: boolean) =>
  value
    .split(/[\s,;]+/)
    .map((v) => (upper ? v.toUpperCase() : v.toLowerCase()).trim())
    .filter(Boolean);

type ImportRow = {
  name: string;
  lead_email: string;
  country_code: string;
  serves_from: string[];
  serves_to: string[];
  min_m3: number | null;
  max_m3: number | null;
  languages: string[];
};

// Country-code domains of the route countries, used when a line only has a name and an e-mail.
const TLD_COUNTRY: Record<string, string> = { uk: "GB" };
for (const code of ROUTE_COUNTRIES) TLD_COUNTRY[code.toLowerCase()] = code;

/**
 * One partner per line: name; e-mail; country; picks up in; delivers to; min m3; max m3; languages.
 * Only the name and the e-mail are required. A missing country is taken from the e-mail's
 * domain (.no, .pl, .de …). Empty "picks up in" means the home country, empty "delivers to"
 * means every route country.
 */
function parseImport(text: string): { rows: ImportRow[]; bad: number } {
  const rows: ImportRow[] = [];
  let bad = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const cols = line.split(line.includes(";") ? ";" : ",").map((c) => c.trim());
    const [name = "", email = "", country = "", from = "", to = "", min = "", max = "", langs = ""] = cols;
    const tld = email.split(".").pop()?.toLowerCase() ?? "";
    const code = (country || TLD_COUNTRY[tld] || "").toUpperCase();
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !/^[A-Z]{2}$/.test(code)) {
      bad += 1;
      continue;
    }
    rows.push({
      name,
      lead_email: email,
      country_code: code,
      serves_from: from ? splitList(from, true) : [code],
      serves_to: to ? splitList(to, true) : [...ROUTE_COUNTRIES],
      min_m3: min === "" || Number.isNaN(Number(min)) ? null : Number(min),
      max_m3: max === "" || Number.isNaN(Number(max)) ? null : Number(max),
      languages: langs ? splitList(langs, false) : [],
    });
  }
  return { rows, bad };
}

const toForm = (p: AdminPartnerRow): PartnerForm => ({
  id: p.id,
  name: p.name,
  website: p.website ?? "",
  country_code: p.country_code,
  lead_email: p.lead_email,
  serves_from: p.serves_from.join(", "),
  serves_to: p.serves_to.join(", "),
  min_m3: p.min_m3 == null ? "" : String(p.min_m3),
  max_m3: p.max_m3 == null ? "" : String(p.max_m3),
  languages: p.languages.join(", "),
  priority: String(p.priority),
  active: p.active,
  agreed: Boolean(p.agreed_at),
  agreement_note: p.agreement_note ?? "",
});

/** Admin-only list and form for the partner directory used by "Relevante firmaer". */
export function AdminPartners({ enabled }: { enabled: boolean }) {
  const { lang } = useI18n();
  const no = lang === "no";
  const queryClient = useQueryClient();
  const list = useServerFn(adminListPartners);
  const save = useServerFn(adminSavePartner);
  const [form, setForm] = useState<PartnerForm>(emptyPartner);
  const set = <K extends keyof PartnerForm>(key: K, value: PartnerForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const importFn = useServerFn(adminImportPartners);
  const [importText, setImportText] = useState("");
  const [importActive, setImportActive] = useState(true);
  const parsed = parseImport(importText);
  const importMutation = useMutation({
    mutationFn: () => importFn({ data: { rows: parsed.rows.slice(0, 300), active: importActive } }),
    onSuccess: (result) => {
      toast.success(
        no
          ? `${result.inserted} lagt til, ${result.skipped} fantes fra før`
          : `${result.inserted} added, ${result.skipped} already existed`,
      );
      setImportText("");
      void queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
    },
    onError: () => toast.error(no ? "Importen feilet. Sjekk radene." : "Import failed. Check the rows."),
  });

  const partners = useQuery({
    queryKey: ["admin-partners"],
    enabled,
    retry: false,
    queryFn: () => list(),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      save({
        data: {
          ...(form.id ? { id: form.id } : {}),
          name: form.name.trim(),
          ...(form.website.trim() ? { website: form.website.trim() } : {}),
          country_code: form.country_code,
          lead_email: form.lead_email.trim(),
          serves_from: splitList(form.serves_from, true),
          serves_to: splitList(form.serves_to, true),
          min_m3: form.min_m3.trim() === "" ? null : Number(form.min_m3),
          max_m3: form.max_m3.trim() === "" ? null : Number(form.max_m3),
          languages: splitList(form.languages, false),
          priority: Math.round(Number(form.priority) || 0),
          active: form.active,
          agreed: form.agreed,
          ...(form.agreement_note.trim() ? { agreement_note: form.agreement_note.trim() } : {}),
        },
      }),
    onSuccess: () => {
      toast.success(no ? "Partner lagret" : "Partner saved");
      setForm(emptyPartner);
      void queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
    },
    onError: () => toast.error(no ? "Kunne ikke lagre. Sjekk feltene." : "Could not save. Check the fields."),
  });

  return (
    <section className="card-soft p-6">
      <h2 className="font-semibold">{no ? "Partnere for tilbudsforespørsler" : "Partners for quote requests"}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        {no
          ? "Firmaer som har sagt ja til å motta forespørsler. Landkoder (NO, PL …) styrer hvilke ruter de vises på. Legg bare inn firmaer du har avtale med."
          : "Companies that agreed to receive requests. Country codes (NO, PL …) decide which routes they appear on. Only add companies you have an agreement with."}
      </p>

      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
      >
        <TextField id="p-name" label={no ? "Firmanavn" : "Company name"} value={form.name} required onChange={(v) => set("name", v)} />
        <TextField id="p-email" label={no ? "E-post for forespørsler" : "Lead e-mail"} type="email" value={form.lead_email} required onChange={(v) => set("lead_email", v)} />
        <TextField id="p-web" label={no ? "Nettside" : "Website"} value={form.website} onChange={(v) => set("website", v)} />
        <div className="space-y-1.5">
          <Label htmlFor="p-country">{no ? "Hjemland" : "Home country"}</Label>
          <select
            id="p-country"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={form.country_code}
            onChange={(e) => set("country_code", e.target.value)}
          >
            {ROUTE_COUNTRIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
        <TextField id="p-from" label={no ? "Henter fra (koder)" : "Picks up in (codes)"} value={form.serves_from} placeholder="NO, SE" onChange={(v) => set("serves_from", v)} />
        <TextField id="p-to" label={no ? "Leverer til (koder)" : "Delivers to (codes)"} value={form.serves_to} placeholder="PL, DE" onChange={(v) => set("serves_to", v)} />
        <TextField id="p-min" label={no ? "Minste volum (m³)" : "Min volume (m³)"} type="number" value={form.min_m3} onChange={(v) => set("min_m3", v)} />
        <TextField id="p-max" label={no ? "Største volum (m³)" : "Max volume (m³)"} type="number" value={form.max_m3} onChange={(v) => set("max_m3", v)} />
        <TextField id="p-lang" label={no ? "Språk (koder)" : "Languages (codes)"} value={form.languages} placeholder="no, en, pl" onChange={(v) => set("languages", v)} />
        <TextField id="p-prio" label={no ? "Prioritet (lavest først)" : "Priority (lowest first)"} type="number" value={form.priority} onChange={(v) => set("priority", v)} />
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="p-note">{no ? "Notat om avtalen" : "Agreement note"}</Label>
          <Textarea id="p-note" rows={2} maxLength={500} value={form.agreement_note} onChange={(e) => set("agreement_note", e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.active} onCheckedChange={(on) => set("active", on === true)} />
            {no ? "Aktiv (vises for kunder)" : "Active (shown to customers)"}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.agreed} onCheckedChange={(on) => set("agreed", on === true)} />
            {no ? "Avtale inngått" : "Agreement in place"}
          </label>
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {form.id ? (no ? "Lagre endringer" : "Save changes") : no ? "Legg til partner" : "Add partner"}
          </Button>
          {form.id && (
            <Button type="button" variant="ghost" onClick={() => setForm(emptyPartner)}>
              {no ? "Avbryt" : "Cancel"}
            </Button>
          )}
        </div>
      </form>

      <div className="mt-8 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">{no ? "Importer flere partnere" : "Import several partners"}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {no
            ? "Én partner per linje. Du trenger bare navn og e-post: «Firmanavn; epost@firma.no». Landet hentes fra e-postens endelse (.no, .pl, .de …), eller skriv det som tredje kolonne. Valgfritt etterpå: henter fra; leverer til; min m³; maks m³; språk (tomt = hjemlandet og alle land). Legg bare inn firmaer og adresser du har lov til å bruke."
            : "One partner per line. Only a name and an e-mail are needed: “Company name; mail@company.com”. The country is taken from the e-mail's ending (.no, .pl, .de …), or add it as a third column. Optional after that: picks up in; delivers to; min m³; max m³; languages (empty = home country and all countries). Only add companies and addresses you may use."}
        </p>
        <Textarea
          rows={5}
          className="mt-3 font-mono text-xs"
          placeholder="Eksempel AS; post@eksempel.no"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={importActive} onCheckedChange={(on) => setImportActive(on === true)} />
            {no ? "Aktiver direkte" : "Activate immediately"}
          </label>
          <Button
            type="button"
            variant="outline"
            disabled={parsed.rows.length === 0 || importMutation.isPending}
            onClick={() => importMutation.mutate()}
          >
            {importMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {no ? `Importer ${parsed.rows.length} partnere` : `Import ${parsed.rows.length} partners`}
          </Button>
          {parsed.bad > 0 && (
            <span className="text-xs text-warning-foreground">
              {no
                ? `${parsed.bad} linjer ble ignorert (mangler navn, e-post eller land)`
                : `${parsed.bad} lines skipped (missing name, e-mail or country)`}
            </span>
          )}
        </div>
      </div>

      <div className="mt-8">
        {partners.isLoading ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : partners.isError ? (
          <p className="text-sm text-muted-foreground">
            {no ? "Partnertabellen finnes ikke ennå. Kjør migrasjonen først." : "The partner table does not exist yet. Run the migration first."}
          </p>
        ) : (partners.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">{no ? "Ingen partnere ennå." : "No partners yet."}</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {(partners.data ?? []).map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">
                    {p.name} <span className="text-muted-foreground">({p.country_code})</span>
                    {!p.active && <span className="ml-2 text-xs text-warning-foreground">{no ? "inaktiv" : "inactive"}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.serves_from.join(", ") || "—"} → {p.serves_to.join(", ") || "—"}
                    {p.min_m3 != null || p.max_m3 != null ? ` · ${p.min_m3 ?? 0}–${p.max_m3 ?? "∞"} m³` : ""}
                    {p.agreed_at ? "" : ` · ${no ? "uten avtale" : "no agreement"}`}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setForm(toForm(p));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <Pencil className="size-4" />
                  {no ? "Rediger" : "Edit"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        step={type === "number" ? "any" : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
