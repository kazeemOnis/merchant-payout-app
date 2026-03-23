import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/utils/storage';

export type Theme = 'dark' | 'light';
export type Locale = 'en' | 'fr';

type SettingsState = {
  theme: Theme;
  locale: Locale;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      theme: 'dark',
      locale: 'en',
      setTheme: (theme: Theme) => set({ theme }),
      setLocale: (locale: Locale) => set({ locale }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: state => ({ theme: state.theme, locale: state.locale }),
    },
  ),
);
