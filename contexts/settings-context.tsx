import { createContext, useCallback, useContext, useState } from 'react';
import { MMKV } from 'react-native-mmkv';

export type Theme = 'dark' | 'light';
export type Locale = 'en' | 'fr';

const storage = new MMKV({ id: 'settings' });

type SettingsContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const SettingsContext = createContext<SettingsContextValue>({
  theme: 'dark',
  setTheme: () => {},
  locale: 'en',
  setLocale: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (storage.getString('theme') as Theme | undefined) ?? 'dark',
  );
  const [locale, setLocaleState] = useState<Locale>(
    () => (storage.getString('locale') as Locale | undefined) ?? 'en',
  );

  const setTheme = useCallback((value: Theme) => {
    storage.set('theme', value);
    setThemeState(value);
  }, []);

  const setLocale = useCallback((value: Locale) => {
    storage.set('locale', value);
    setLocaleState(value);
  }, []);

  return (
    <SettingsContext.Provider value={{ theme, setTheme, locale, setLocale }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
