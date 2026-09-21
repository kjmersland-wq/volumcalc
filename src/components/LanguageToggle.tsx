import { useState, useRef, useEffect } from "react";
import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const languages = [
  {
    code: "en",
    label: "GB",
    name: "English",
    path: "/",
    flagUrl: "https://flagcdn.com/w40/gb.png",
  },
  {
    code: "no",
    label: "NO",
    name: "Norsk",
    path: "/no",
    flagUrl: "https://flagcdn.com/w40/no.png",
  },
  {
    code: "sv",
    label: "SE",
    name: "Svenska",
    path: "/se",
    flagUrl: "https://flagcdn.com/w40/se.png",
  },
  {
    code: "da",
    label: "DK",
    name: "Dansk",
    path: "/dk",
    flagUrl: "https://flagcdn.com/w40/dk.png",
  },
  {
    code: "fi",
    label: "FI",
    name: "Suomi",
    path: "/fi",
    flagUrl: "https://flagcdn.com/w40/fi.png",
  },
  {
    code: "de",
    label: "DE",
    name: "Deutsch",
    path: "/de",
    flagUrl: "https://flagcdn.com/w40/de.png",
  },
  {
    code: "nl",
    label: "NL",
    name: "Nederlands",
    path: "/nl",
    flagUrl: "https://flagcdn.com/w40/nl.png",
  },
  {
    code: "fr",
    label: "FR",
    name: "Français",
    path: "/fr",
    flagUrl: "https://flagcdn.com/w40/fr.png",
  },
  {
    code: "pl",
    label: "PL",
    name: "Polski",
    path: "/pl",
    flagUrl: "https://flagcdn.com/w40/pl.png",
  },
  {
    code: "es",
    label: "ES",
    name: "Español",
    path: "/es",
    flagUrl: "https://flagcdn.com/w40/es.png",
  },
  {
    code: "it",
    label: "IT",
    name: "Italiano",
    path: "/it",
    flagUrl: "https://flagcdn.com/w40/it.png",
  },
  {
    code: "pt",
    label: "PT",
    name: "Português",
    path: "/pt",
    flagUrl: "https://flagcdn.com/w40/pt.png",
  },
] as const;

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === lang) || languages[0];

  return (
    <div
      ref={dropdownRef}
      className={cn("no-print relative inline-block text-left z-50", className)}
    >
      {/* Hovedknapp - Lyst design som matcher VolumCalc-headeren */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t("nav.chooseLanguage")}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
      >
        <img
          src={currentLang.flagUrl}
          alt=""
          aria-hidden="true"
          className="h-4 w-4 rounded-full object-cover border border-gray-100"
        />
        <span className="text-xs font-bold tracking-wider text-gray-700">{currentLang.label}</span>
        <svg
          className={cn(
            "h-3 w-3 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Rullegardinliste - Lys bakgrunn */}
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-1 max-h-[70vh] w-44 origin-top-right overflow-y-auto rounded-xl border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLang(item.code as Lang);
                setIsOpen(false);
                window.location.assign(item.path);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-gray-50",
                lang === item.code ? "bg-gray-100 font-semibold text-gray-900" : "text-gray-600",
              )}
            >
              <img
                src={item.flagUrl}
                alt=""
                aria-hidden="true"
                className="h-4 w-4 rounded-full object-cover border border-gray-100"
              />
              <span className="w-5 text-xs font-bold tracking-wider">{item.label}</span>
              <span className="truncate text-xs font-medium">{item.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
