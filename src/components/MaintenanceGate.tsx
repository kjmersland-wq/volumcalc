import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Site is closed to the public during the upgrade; only these accounts get in.
const ALLOWED_EMAILS = ["kjmersland@gmail.com"];

export function MaintenanceGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const email0 = session?.user.email?.toLowerCase();
  if (session && email0 && ALLOWED_EMAILS.includes(email0)) return <>{children}</>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !ALLOWED_EMAILS.includes(data.user?.email?.toLowerCase() ?? "")) {
      if (!error) await supabase.auth.signOut();
      setError("Innlogging feilet.");
    }
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">VolumCalc</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Nettsiden er under større oppgradering og åpner igjen i november/desember.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          The website is undergoing a major upgrade and will reopen in November/December.
        </p>
        {loading ? (
          <div className="mt-6 flex justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <Input type="email" placeholder="E-post" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Passord" required value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" variant="outline" className="w-full" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              Logg inn
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
