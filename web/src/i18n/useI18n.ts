import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "signage_locale";

type Translations = Record<string, string>;

const loaded: Record<string, Translations> = {};

async function loadLocale(locale: string): Promise<Translations> {
  if (loaded[locale]) return loaded[locale];
  try {
    const mod = await import(`./${locale}.json`);
    loaded[locale] = mod.default;
    return mod.default;
  } catch {
    const mod = await import("./es.json");
    loaded["es"] = mod.default;
    return mod.default;
  }
}

export function useI18n() {
  const [locale, setLocaleState] = useState(() => localStorage.getItem(STORAGE_KEY) || "es");
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    loadLocale(locale).then(setTranslations);
  }, [locale]);

  const setLocale = useCallback((l: string) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback((key: string, fallback?: string) => {
    return translations[key] ?? fallback ?? key;
  }, [translations]);

  return { t, locale, setLocale };
}
