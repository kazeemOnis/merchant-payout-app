/**
 * Typography system
 *
 * Inter       — UI copy: headings, body, labels, navigation
 * IBMPlexMono — Financial / numeric display: amounts, IBANs, account numbers, codes
 */

export const fontFamily = {
  // Inter — primary UI font
  regular: 'Inter',
  italic: 'Inter-Italic',

  // IBMPlexMono — financial / numeric display
  mono: 'IBMPlexMono-Regular',
  monoLight: 'IBMPlexMono-Light',
  monoMedium: 'IBMPlexMono-Medium',
  monoSemiBold: 'IBMPlexMono-SemiBold',
  monoBold: 'IBMPlexMono-Bold',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 36,
  '4xl': 48,
} as const;

export const typography = {
  // Headings
  h1: {
    fontFamily: fontFamily.monoBold,
    fontSize: fontSize['3xl'],
    lineHeight: 44,
    textTransform: 'uppercase',
  },
  h2: {
    fontFamily: fontFamily.monoBold,
    fontSize: fontSize['2xl'],
    lineHeight: 38,
    textTransform: 'uppercase' as const,
  },
  h3: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xl,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    fontWeight: '600' as const,
    lineHeight: 28,
  },

  // Body — Inter
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    fontWeight: '500' as const,
    lineHeight: 20,
  },

  // Financial / numeric — IBMPlexMono
  amount: {
    fontFamily: fontFamily.monoBold,
    fontSize: fontSize['2xl'],
    lineHeight: 36,
  },
  amountLarge: {
    fontFamily: fontFamily.monoBold,
    fontSize: fontSize['4xl'],
    lineHeight: 56,
  },
  amountSmall: {
    fontFamily: fontFamily.monoMedium,
    fontSize: fontSize.base,
    lineHeight: 24,
  },
  accountNumber: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  code: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
