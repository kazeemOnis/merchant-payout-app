import { useMemo } from 'react';

import { Palette } from '@/constants/theme';
import { useSettings } from '@/contexts/settings-context';

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

export type ThemePalette = typeof Palette & typeof darkTokens;

export function useThemePalette(): ThemePalette {
  const { theme } = useSettings();
  return useMemo(
    () => ({ ...Palette, ...(theme === 'dark' ? darkTokens : lightTokens) }),
    [theme],
  );
}
