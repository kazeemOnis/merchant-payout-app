import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { Palette } from '@/constants/theme';
import { type ThemePalette, useThemePalette } from '@/hooks/use-theme-palette';

function makeSlideStyles() {
  return StyleSheet.create({
    container: { flex: 1 },
    textContent: {
      paddingHorizontal: 24,
      paddingTop: 48,
      paddingBottom: 24,
    },
    title: { marginBottom: 16 },
    subtitle: { lineHeight: 26 },
    animationContainer: {
      flex: 1,
      marginHorizontal: 16,
      marginBottom: 8,
    },
    animation: {
      flex: 1,
      width: '100%',
    },
  });
}

function makeDotsStyles(p: ThemePalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dot: {
      borderRadius: 4,
      height: 8,
    },
    dotActive: {
      width: 24,
      backgroundColor: Palette.brandBlue,
    },
    dotInactive: {
      width: 8,
      opacity: 0.5,
      backgroundColor: p.textMuted,
    },
  });
}

export function useOnboardingStyles() {
  const palette = useThemePalette();
  return useMemo(
    () => ({
      slide: makeSlideStyles(),
      dots: makeDotsStyles(palette),
    }),
    [palette],
  );
}
