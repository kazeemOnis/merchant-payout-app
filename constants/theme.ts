/**
 * Checkout.com brand palette
 * Source: dashboard.checkout.com CSS variables
 */
export const Palette = {
  // Backgrounds
  bgDark: '#1b1c22', // --rb-bg-dark-200
  surface: '#272932', // --rb-dark
  surfaceElevated: '#424249', // --rb-dark-100

  // Brand blues
  brandBlue: '#186aff',
  ctaBlue: '#4098ff', // --rb-blue-200
  ctaBluePressed: '#1b5dd6', // --rb-blue-600
  accentBlueLight: '#cfe5ff', // --rb-blue-500

  // Text
  white: '#ffffff', // --rb-neutral
  textMuted: '#777478', // --rb-dark-200

  // Accents
  accentOrange: '#ffc183', // --rb-orange
  accentPink: '#ffc4b7', // --pink
  accentGreen: '#4ade80', // income / positive amounts
  accentRed: '#f87171', // expense / negative amounts

  // Light mode
  lightBg: '#f4f2f2', // --rb-grey-200
} as const;

/**
 * Semantic Colors — light / dark variants.
 * Used by useThemeColor, ThemedText, ThemedView, and tab navigator.
 */
export const Colors = {
  light: {
    text: '#111111',
    background: '#ffffff',
    tint: Palette.brandBlue,
    icon: '#6c6c70',
    tabIconDefault: '#6c6c70',
    tabIconSelected: Palette.brandBlue,
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    tint: Palette.ctaBlue,
    icon: '#888888',
    tabIconDefault: '#888888',
    tabIconSelected: Palette.ctaBlue,
  },
} as const;
