import { useEffect } from "react";
import { LandingPage } from "@/components/LandingPage";
import { useI18n, type Lang } from "@/lib/i18n";

export function LanguageLanding({ lang }: { lang: Lang }) {
  const { lang: current, setLang } = useI18n();

  useEffect(() => {
    if (current !== lang) setLang(lang);
  }, [current, lang, setLang]);

  return <LandingPage />;
}
