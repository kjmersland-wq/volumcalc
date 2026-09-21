import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Copy,
  FileText,
  Infinity as InfinityIcon,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useCompany, useIsAdmin, useUnlimitedPhotos } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { m3, shortDate } from "@/lib/format";
import { LANG_LABELS, SUPPORTED_LANGS } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/account")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "My page — VolumCalc" },
      { name: "description", content: "Your VolumCalc account: personal details, security, report access and activity." },
      { property: "og:title", content: "My page — VolumCalc" },
      { property: "og:description", content: "Manage your VolumCalc account details, security and report access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

type ProfileForm = {
  full_name: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  account_type: string;
  preferred_report_language: string;
  notification_email: string;
};

const EMPTY: ProfileForm = {
  full_name: "",
  phone: "",
  address: "",
  postal_code: "",
  city: "",
  country: "",
  account_type: "private",
  preferred_report_language: "en",
  notification_email: "",
};

function AccountPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { data: company } = useCompany();
  const isAdmin = useIsAdmin();
  const unlimited = useUnlimitedPhotos();

  const [form, setForm] = useState<ProfileForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [changing, setChanging] = useState(false);

  const userId = session?.user.id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: estimates } = useQuery({
    queryKey: ["account-estimates", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estimates")
        .select("id, report_title, customer_name, total_volume_m3, created_at, status")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!session) return;
    setForm({
      ...EMPTY,
      ...(profile
        ? {
            full_name: profile.full_name ?? "",
            phone: profile.phone ?? "",
            address: profile.address ?? "",
            postal_code: profile.postal_code ?? "",
            city: profile.city ?? "",
            country: profile.country ?? "",
            account_type: profile.account_type ?? "private",
            preferred_report_language: profile.preferred_report_language ?? "en",
            notification_email: profile.notification_email ?? "",
          }
        : { notification_email: session.user.email ?? "" }),
    });
  }, [profile, session]);

  const stats = useMemo(() => {
    const rows = estimates ?? [];
    return {
      count: rows.length,
      volume: rows.reduce((sum, r) => sum + (Number(r.total_volume_m3) || 0), 0),
      latest: rows[0] ?? null,
    };
  }, [estimates]);

  const uploadLink = useMemo(() => {
    if (typeof window === "undefined" || !session) return "";
    const base = `${window.location.origin}/upload`;
    return company?.upload_token ? `${base}?k=${company.upload_token}` : `${base}?c=${session.user.id}`;
  }, [company?.upload_token, session]);

  async function saveProfile() {
    if (!form || !userId) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: form.full_name.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      postal_code: form.postal_code.trim() || null,
      city: form.city.trim() || null,
      country: form.country.trim() || null,
      account_type: form.account_type,
      preferred_report_language: form.preferred_report_language,
      notification_email: form.notification_email.trim() || null,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Your details were saved.");
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    }
  }

  async function changePassword() {
    if (password.length < 8) {
      toast.error("Use at least 8 characters.");
      return;
    }
    if (password !== password2) {
      toast.error("The two passwords do not match.");
      return;
    }
    setChanging(true);
    const { error } = await supabase.auth.updateUser({ password });
    setChanging(false);
    if (error) toast.error(error.message);
    else {
      setPassword("");
      setPassword2("");
      toast.success("Password updated.");
    }
  }

  if (!session || isLoading || !form) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const email = session.user.email ?? "";
  const initials = (form.full_name || company?.company_name || email).slice(0, 2).toUpperCase();

  return (
    <div className="space-y-8">
      {/* Identity card */}
      <section className="card-soft flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
            {initials}
          </span>
          <div>
            <h1 className="text-2xl font-bold leading-tight">
              {form.full_name || company?.company_name || "My page"}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" /> {email}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="secondary">
                {form.account_type === "company" ? (
                  <Building2 className="mr-1 size-3" />
                ) : (
                  <User className="mr-1 size-3" />
                )}
                {form.account_type === "company" ? "Company account" : "Private account"}
              </Badge>
              {isAdmin && (
                <Badge>
                  <ShieldCheck className="mr-1 size-3" /> Administrator
                </Badge>
              )}
              {unlimited && (
                <Badge variant="outline">
                  <InfinityIcon className="mr-1 size-3" /> Unlimited photos
                </Badge>
              )}
              <Badge variant="outline">
                <BadgeCheck className="mr-1 size-3" /> Member since {shortDate(session.user.created_at, "en")}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/settings">Company settings</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/upload">New calculation</Link>
          </Button>
        </div>
      </section>

      {/* Activity */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card-soft p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Reports</p>
          <p className="mt-1 text-2xl font-bold">{stats.count}</p>
        </div>
        <div className="card-soft p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total volume</p>
          <p className="mt-1 text-2xl font-bold">{m3(stats.volume)}</p>
        </div>
        <div className="card-soft p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Latest report</p>
          <p className="mt-1 truncate text-2xl font-bold">
            {stats.latest ? shortDate(stats.latest.created_at, "en") : "—"}
          </p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          {/* Personal details */}
          <section className="card-soft space-y-5 p-6">
            <div>
              <h2 className="text-lg font-semibold">Personal details</h2>
              <p className="text-sm text-muted-foreground">
                Used on your reports and when moving companies contact you.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notification_email">Notification email</Label>
                <Input
                  id="notification_email"
                  type="email"
                  value={form.notification_email}
                  onChange={(e) => setForm({ ...form, notification_email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="postal_code">Postal code</Label>
                <Input
                  id="postal_code"
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Account type</Label>
                <Select value={form.account_type} onValueChange={(v) => setForm({ ...form, account_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private individual</SelectItem>
                    <SelectItem value="company">Moving company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Default report language</Label>
                <Select
                  value={form.preferred_report_language}
                  onValueChange={(v) => setForm({ ...form, preferred_report_language: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGS.map((code) => (
                      <SelectItem key={code} value={code}>
                        {LANG_LABELS[code]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={saveProfile} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save details
            </Button>
          </section>

          {/* Security */}
          <section className="card-soft space-y-5 p-6">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Lock className="size-4" /> Security
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign-in email: <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pw1">New password</Label>
                <Input id="pw1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pw2">Repeat password</Label>
                <Input id="pw2" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
              </div>
            </div>
            <Button variant="outline" onClick={changePassword} disabled={changing}>
              {changing && <Loader2 className="size-4 animate-spin" />}
              Update password
            </Button>
          </section>
        </div>

        <div className="space-y-8">
          {/* Report access */}
          <section className="card-soft space-y-4 p-6">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="size-4" /> Report form access
              </h2>
              <p className="text-sm text-muted-foreground">
                Share this link to let customers film their rooms and send you a report.
              </p>
            </div>
            <div className="flex gap-2">
              <Input readOnly value={uploadLink} className="text-xs" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(uploadLink);
                  toast.success("Link copied");
                }}
                aria-label="Copy link"
              >
                <Copy className="size-4" />
              </Button>
            </div>
            <Button asChild variant="secondary" className="w-full">
              <Link to="/upload">Open the report form</Link>
            </Button>
          </section>

          {/* Recent reports */}
          <section className="card-soft space-y-3 p-6">
            <h2 className="text-lg font-semibold">Recent reports</h2>
            {(estimates ?? []).slice(0, 6).map((e) => (
              <Link
                key={e.id}
                to="/estimate/$id"
                params={{ id: e.id }}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/60"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {e.report_title || e.customer_name || e.id.slice(0, 8)}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {shortDate(e.created_at, "en")} · {m3(Number(e.total_volume_m3) || 0)}
                  </span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
            {(estimates ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No reports yet.</p>
            )}
            <Button asChild variant="ghost" className="w-full">
              <Link to="/dashboard">View all reports</Link>
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
