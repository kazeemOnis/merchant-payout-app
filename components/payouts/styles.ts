import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { fontFamily, fontSize } from '@/constants/typography';
import { type ThemePalette, useThemePalette } from '@/hooks/use-theme-palette';

function makeSharedStyles(p: ThemePalette) {
  return StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1, backgroundColor: p.bgDark },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 24,
      gap: 16,
    },
    title: { marginBottom: 4 },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: p.surface,
      backgroundColor: p.bgDark,
    },
  });
}

function makeFormStepStyles(p: ThemePalette) {
  return StyleSheet.create({
    inputCard: {
      backgroundColor: p.surface,
      borderRadius: 12,
      padding: 16,
      gap: 8,
    },
    cardLabel: { marginBottom: 2 },
    amountRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    amountInput: {
      flex: 1,
      fontFamily: fontFamily.monoBold,
      fontSize: fontSize['3xl'],
      includeFontPadding: false,
      padding: 0,
    },
    ibanInput: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.base,
      color: p.white,
      padding: 0,
      includeFontPadding: false,
    },
    ibanDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: p.surfaceElevated,
    },
    fieldError: { marginTop: 2 },
  });
}

function makeConfirmStepStyles(p: ThemePalette) {
  return StyleSheet.create({
    backButton: { marginBottom: 8 },
    subtitle: { marginTop: -8, marginBottom: 8 },
    summaryCard: {
      backgroundColor: p.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      overflow: 'hidden',
    },
    ibanValue: { flex: 1, textAlign: 'right', marginLeft: 24 },
    biometricNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 4,
    },
  });
}

function makeResultStepStyles(p: ThemePalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: p.bgDark },
    resultContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      gap: 16,
    },
    lottie: { width: 180, height: 180 },
    title: { textAlign: 'center' },
    message: { textAlign: 'center' },
    button: { marginTop: 8, width: '100%' },
  });
}

function makeSummaryRowStyles(p: ThemePalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: p.surfaceElevated,
    },
  });
}

function makeCurrencyPickerStyles(p: ThemePalette) {
  return StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: p.surfaceElevated,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: p.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 40,
      gap: 4,
    },
    sheetTitle: { marginBottom: 8 },
    option: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: p.surfaceElevated,
    },
  });
}

export function usePayoutStyles() {
  const palette = useThemePalette();
  return useMemo(
    () => ({
      sharedStyles: makeSharedStyles(palette),
      formStepStyles: makeFormStepStyles(palette),
      confirmStepStyles: makeConfirmStepStyles(palette),
      resultStepStyles: makeResultStepStyles(palette),
      summaryRowStyles: makeSummaryRowStyles(palette),
      currencyPickerStyles: makeCurrencyPickerStyles(palette),
    }),
    [palette],
  );
}
