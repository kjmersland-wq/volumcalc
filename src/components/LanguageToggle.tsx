import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Vi lager en liste med språk, tilhørende flagg og visningsnavn
const languages = [
  { code: "no", flag: "🇳🇴", label: "NO" },
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "pl", flag: "🇵🇱", label: "PL" },
] as const;

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();

  return (
    <div className={cn("no-print flex items-center rounded-full border border-border p-0.5 text-xs bg-white shadow-sm", className)}>
      {languages.map(({ code, flag, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code as any)} // Tvinger type her i tilfelle i18n-biblioteket må oppdateres etterpå
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium transition-colors",
            lang === code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span>{flag}</span>
          <span className="uppercase">{label}</span>
        </button>
      ))}
    </div>
  );
}
