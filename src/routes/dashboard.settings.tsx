import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_ROOM_NAMES_NO, sanitizeRoomNames } from "@/lib/rooms";

export const Route = createFileRoute("/dashboard/settings")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Company settings — VolumCalc" },
      { name: "description", content: "Manage company branding, pricing, currency, and language in VolumCalc." },
      { property: "og:title", content: "Company settings — VolumCalc" },
      { property: "og:description", content: "Manage your company settings in VolumCalc." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

type Form = {
  company_name: string;
  logo_url: string;
  brand_color: string;
  price_per_m3: string;
  currency: string;
  default_language: string;
  org_number: string;
  address: string;
  phone: string;
  website: string;
  contact_email: string;
  room_names: string;
};

function SettingsPage() {
  const { t } = useI18n();
  const { session } = useAuth();
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["company", session?.user.id],
    enabled: Boolean(session),
    queryFn: async () => {
      const userId = session?.user.id;
      if (!userId) throw new Error("Authentication required");
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        company_name: data.company_name ?? "",
        logo_url: data.logo_url ?? "",
        brand_color: data.brand_color ?? "#2563eb",
        price_per_m3: String(data.price_per_m3 ?? 850),
        currency: data.currency ?? "NOK",
        default_language: data.default_language ?? "no",
        org_number: data.org_number ?? "",
        address: data.address ?? "",
        phone: data.phone ?? "",
        website: data.website ?? "",
        contact_email: data.contact_email ?? "",
        room_names: sanitizeRoomNames(data.room_names, DEFAULT_ROOM_NAMES_NO).join("\n"),
      });
    }
  }, [data]);

  async function save() {
    if (!form || !session) return;
    setSaving(true);
    const { error } = await supabase.from("companies").upsert({
      id: session.user.id,
      company_name: form.company_name,
      logo_url: form.logo_url || null,
      brand_color: form.brand_color,
      price_per_m3: Number(form.price_per_m3) || 0,
      currency: form.currency,
      default_language: form.default_language,
      org_number: form.org_number.trim() || null,
      address: form.address.trim() || null,
      phone: form.phone.trim() || null,
      website: form.website.trim() || null,
      contact_email: form.contact_email.trim() || null,
      room_names: sanitizeRoomNames(form.room_names, DEFAULT_ROOM_NAMES_NO),
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(t("set.saved"));
  }

  if (isLoading || !form) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">{t("set.title")}</h1>

      <div className="card-soft mt-8 space-y-5 p-6">
        <div className="space-y-1.5">
          <Label htmlFor="company_name">{t("set.name")}</Label>
          <Input
            id="company_name"
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
          />
        </div>
        <p className="text-sm text-muted-foreground">{t("set.brandingHelp")}</p>
        <div className="space-y-1.5">
          <Label htmlFor="logo_url">{t("set.logo")}</Label>
          <Input
            id="logo_url"
            placeholder="https://…"
            value={form.logo_url}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="brand_color">{t("set.color")}</Label>
            <Input
              id="brand_color"
              type="color"
              className="h-10 w-20 p-1"
              value={form.brand_color}
              onChange={(e) => setForm({ ...form, brand_color: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">{t("set.price")}</Label>
            <Input
              id="price"
              type="number"
              value={form.price_per_m3}
              onChange={(e) => setForm({ ...form, price_per_m3: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("set.currency")}</Label>
            <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["NOK", "SEK", "DKK", "EUR", "GBP", "USD"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("set.lang")}</Label>
            <Select
              value={form.default_language}
              onValueChange={(v) => setForm({ ...form, default_language: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">Norsk</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="org_number">{t("set.org")}</Label>
            <Input
              id="org_number"
              value={form.org_number}
              onChange={(e) => setForm({ ...form, org_number: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">{t("set.phone")}</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">{t("set.address")}</Label>
            <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact_email">{t("set.contactEmail")}</Label>
            <Input
              id="contact_email"
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="website">{t("set.website")}</Label>
            <Input
              id="website"
              placeholder="https://…"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="room_names">{t("set.rooms")}</Label>
          <Textarea
            id="room_names"
            rows={7}
            value={form.room_names}
            onChange={(e) => setForm({ ...form, room_names: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">{t("set.roomsHelp")}</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {t("set.save")}
        </Button>
      </div>
    </div>
  );
}
