import { createContext, useContext, useEffect, useState } from 'react';
import { translations } from '../lib/translations';

const STORAGE_KEY = 'beantrip:lang';
const LanguageContext = createContext(null);

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'es', label: 'Español' },
];

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(STORAGE_KEY) || 'en');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const t = (key, vars) => {
    let str = translations[lang]?.[key] ?? translations.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) str = str.replace(`{${k}}`, v);
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
