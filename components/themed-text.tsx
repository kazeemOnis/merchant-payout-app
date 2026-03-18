import { Text, type TextProps } from 'react-native';

import { Palette } from '@/constants/theme';
import { typography, type TypographyVariant } from '@/constants/typography';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  /**
   * Typography variant from the design system.
   * Maps directly to a style in constants/typography.ts.
   * Defaults to 'body'.
   */
  variant?: TypographyVariant;
  /**
   * Explicit color override — bypasses theme resolution.
   * Use for brand highlights, muted text, or fixed-background contexts.
   */
  color?: string;
  /** Theme-aware overrides when you need different colors per scheme. */
  lightColor?: string;
  darkColor?: string;
};

export function ThemedText({
  style,
  variant = 'body',
  color,
  lightColor,
  darkColor,
  ...rest
}: ThemedTextProps) {
  const themeColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'text',
  );

  return (
    <Text
      style={[typography[variant], { color: color ?? themeColor }, style]}
      {...rest}
    />
  );
}

/**
 * Convenience preset — brand blue highlight for inline text spans.
 * Usage: <ThemedText>Normal text <Highlight>blue word</Highlight></ThemedText>
 */
export function Highlight({
  children,
  style,
  ...rest
}: Omit<ThemedTextProps, 'color'>) {
  return (
    <ThemedText color={Palette.brandBlue} {...rest} style={style}>
      {children}
    </ThemedText>
  );
}
