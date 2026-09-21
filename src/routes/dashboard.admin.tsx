import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { useIsAdmin } from "@/hooks/useCompany";
import { useLocalizedMeta } from "@/lib/use-localized-meta";
import {
  adminCreateCompany,
  adminListCompanies,
  adminRotateUploadToken,
  adminSetPassword,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/dashboard/admin")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Company accounts — VolumCalc admin" },
      {
        name: "description",
        content: "Create and manage moving company accounts, branding and secret share links.",
      },
      { property: "og:title", content: "Company accounts — VolumCalc admin" },
      {
        property: "og:description",
        content: "Create and manage moving company accounts in VolumCalc.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const emptyForm = {
  email: "",
  password: "",
  company_name: "",
  org_number: "",
  address: "",
  phone: "",
  website: "",
  logo_url: "",
  brand_color: "#2563eb",
  price_per_m3: "850",
  is_demo: false,
};

function AdminPage() {
  const { t } = useI18n();
  useLocalizedMeta({
    title: `${t("admin.nav")} — VolumCalc`,
    description: t("admin.sub"),
  });
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const list = useServerFn(adminListCompanies);
  const create = useServerFn(adminCreateCompany);
  const rotate = useServerFn(adminRotateUploadToken);
  const setPassword = useServerFn(adminSetPassword);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-companies"],
    enabled: isAdmin,
    queryFn: () => list(),
  });

  const createMutation = useMutation({
    mutationFn: async () =>
      create({
        data: {
          email: form.email.trim(),
          password: form.password,
          company_name: form.company_name.trim(),
          ...(form.org_number.trim() ? { org_number: form.org_number.trim() } : {}),
          ...(form.address.trim() ? { address: form.address.trim() } : {}),
          ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
          ...(form.website.trim() ? { website: form.website.trim() } : {}),
          ...(form.logo_url.trim() ? { logo_url: form.logo_url.trim() } : {}),
          brand_color: form.brand_color,
          price_per_m3: Number(form.price_per_m3) || 0,
          is_demo: form.is_demo,
        },
      }),
    onSuccess: () => {
      toast.success(t("admin.created"));
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
    },
    onError: (error: Error) => toast.error(error.message || t("admin.failed")),
  });

  const rotateMutation = useMutation({
    mutationFn: (id: string) => rotate({ data: { id } }),
    onSuccess: () => {
      toast.success(t("admin.rotated"));
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
    },
    onError: () => toast.error(t("admin.failed")),
  });

  if (!isAdmin) {
    return (
      <div className="card-soft p-10 text-center text-muted-foreground">{t("admin.onlyAdmin")}</div>
    );
  }

  const linkFor = (token: string) =>
    `${typeof window === "undefined" ? "https://volumcalc.com" : window.location.origin}/upload?k=${token}`;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ShieldCheck className="size-6 text-primary" />
          {t("admin.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("admin.sub")}</p>
      </div>

      <section className="card-soft p-6">
        <h2 className="font-semibold">{t("admin.new")}</h2>
        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <Field
            label={t("admin.company")}
            value={form.company_name}
            onChange={(v) => setForm({ ...form, company_name: v })}
            required
          />
          <Field
            label={t("admin.email")}
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            required
          />
          <Field
            label={t("admin.password")}
            type="text"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            required
          />
          <Field
            label={t("admin.org")}
            value={form.org_number}
            onChange={(v) => setForm({ ...form, org_number: v })}
          />
          <Field
            label={t("admin.address")}
            value={form.address}
            onChange={(v) => setForm({ ...form, address: v })}
          />
          <Field
            label={t("admin.phone")}
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
          <Field
            label={t("admin.website")}
            value={form.website}
            onChange={(v) => setForm({ ...form, website: v })}
          />
          <Field
            label={t("admin.logo")}
            value={form.logo_url}
            onChange={(v) => setForm({ ...form, logo_url: v })}
          />
          <div className="space-y-1.5">
            <Label htmlFor="color">{t("admin.color")}</Label>
            <Input
              id="color"
              type="color"
              className="h-10 w-20 p-1"
              value={form.brand_color}
              onChange={(e) => setForm({ ...form, brand_color: e.target.value })}
            />
          </div>
          <Field
            label={t("admin.price")}
            type="number"
            value={form.price_per_m3}
            onChange={(v) => setForm({ ...form, price_per_m3: v })}
          />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.is_demo}
              onChange={(e) => setForm({ ...form, is_demo: e.target.checked })}
              className="size-4 accent-[var(--color-primary)]"
            />
            {t("admin.demo")}
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {t("admin.create")}
            </Button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-semibold">{t("admin.list")}</h2>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {(data ?? []).map((company) => (
              <li key={company.id} className="card-soft flex flex-wrap items-center gap-4 p-5">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt=""
                    className="h-10 w-auto max-w-28 object-contain"
                  />
                ) : (
                  <span
                    className="flex size-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: company.brand_color }}
                  >
                    {company.company_name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-48 flex-1">
                  <p className="font-medium">
                    {company.company_name}
                    {company.is_demo && (
                      <span className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">
                        {t("demo.badge")}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {company.contact_email} · {company.estimates} {t("admin.estimates")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(linkFor(company.upload_token));
                      toast.success(t("admin.copy"));
                    }}
                  >
                    <Copy className="size-4" />
                    {t("admin.link")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => rotateMutation.mutate(company.id)}
                  >
                    <RefreshCw className="size-4" />
                    {t("admin.rotate")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      const password = window.prompt(t("admin.setPassword"));
                      if (!password || password.length < 8) return;
                      try {
                        await setPassword({ data: { id: company.id, password } });
                        toast.success(t("admin.passwordSet"));
                      } catch {
                        toast.error(t("admin.failed"));
                      }
                    }}
                  >
                    {t("admin.setPassword")}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Button asChild variant="link" className="mt-4 px-0">
          <Link to="/demo">{t("admin.demoLink")}</Link>
        </Button>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  const id = label.replace(/\W+/g, "-").toLowerCase();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
