import { createContext, useCallback, useContext, useState } from "react";
import {
  type Language,
  type TranslationKey,
  htmlLang,
  languageCookie,
  translations,
} from "~/lib/i18n";

interface LanguageContextValue {
  language: Language;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: Language;
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState(initialLanguage);

  const toggleLanguage = useCallback(() => {
    const next = language === "zh" ? "en" : "zh";
    setLanguage(next);
    // A cookie (not localStorage) so the server renders this language next time.
    document.cookie = `${languageCookie}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = htmlLang[next];
  }, [language]);

  const t = useCallback(
    (key: TranslationKey) => {
      return translations[language][key];
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
