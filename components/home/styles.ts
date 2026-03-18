import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { Palette } from '@/constants/theme';
import { type ThemePalette, useThemePalette } from '@/hooks/use-theme-palette';

function makeActivitySectionStyles(p: ThemePalette) {
  return StyleSheet.create({
    container: {
      backgroundColor: p.surface,
      borderRadius: 12,
      padding: 16,
      gap: 12,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    list: { gap: 16 },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    rowDescription: { flex: 1 },
  });
}

function makeBalanceCardStyles(p: ThemePalette) {
  return StyleSheet.create({
    row: { flexDirection: 'row', gap: 12 },
    card: { borderRadius: 12, padding: 16, gap: 8, flex: 1 },
    cardFlex: { flex: 1 },
    cardAvailable: { backgroundColor: Palette.brandBlue },
    cardPending: { backgroundColor: p.surface },
    amount: { marginTop: 4 },
    skeletonAmount: { marginTop: 4 },
  });
}

export function useHomeStyles() {
  const palette = useThemePalette();
  return useMemo(
    () => ({
      activitySection: makeActivitySectionStyles(palette),
      balanceCard: makeBalanceCardStyles(palette),
    }),
    [palette],
  );
}
