import { useMemo } from 'react';

import { Palette } from '@/constants/theme';
import { useSettingsStore } from '@/store/settings-store';

const darkTokens = {
  bgDark: '#000000',
  surface: '#1a1a1a',
  surfaceElevated: '#2d2d2d',
  white: '#ffffff',
  textMuted: '#888888',
};

const lightTokens = {
  bgDark: '#ffffff',
  surface: '#f2f2f7',
  surfaceElevated: '#e5e5ea',
  white: '#111111',
  textMuted: '#6c6c70',
};

/** Keys overridden per light/dark theme (string values, not Palette literals). */
type ThemeOverrideKeys = keyof typeof darkTokens;

export type ThemePalette = Omit<typeof Palette, ThemeOverrideKeys> & {
  bgDark: string;
  surface: string;
  surfaceElevated: string;
  white: string;
  textMuted: string;
};

export function useThemePalette(): ThemePalette {
  const theme = useSettingsStore(s => s.theme);
  return useMemo(
    () => ({ ...Palette, ...(theme === 'dark' ? darkTokens : lightTokens) }),
    [theme],
  );
}
