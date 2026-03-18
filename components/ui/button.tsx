import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

import { Palette } from '@/constants/theme';
import { fontFamily, fontSize } from '@/constants/typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && pressedStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      accessibilityRole='button'
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size='small'
          color={variant === 'primary' ? Palette.white : Palette.brandBlue}
          testID='button-activity-indicator'
        />
      ) : (
        <Text
          style={[styles.label, labelStyles[variant], labelSizeStyles[size]]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  // Variants
  primary: {
    backgroundColor: Palette.brandBlue,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Palette.brandBlue,
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Sizes — padding: .75rem 1.5rem (12 24) for md, scaled for sm/lg
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },

  label: {
    fontFamily: fontFamily.regular,
    fontWeight: '500',
    // line-height: 1.5em relative to font size applied per size below
  },
});

// Pressed state background colours (replaces CSS transition)
const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: Palette.ctaBluePressed },
  secondary: { backgroundColor: Palette.accentBlueLight + '1A' }, // tinted
  ghost: { backgroundColor: Palette.surfaceElevated },
});

// Label colour per variant
const labelStyles = StyleSheet.create({
  primary: { color: Palette.white },
  secondary: { color: Palette.brandBlue },
  ghost: { color: Palette.brandBlue },
});

// Font size + lineHeight per size
// font-size: 1rem / font-weight: 500 / line-height: 1.5em
const labelSizeStyles = StyleSheet.create({
  sm: { fontSize: fontSize.sm, lineHeight: Math.round(fontSize.sm * 1.5) },
  md: { fontSize: fontSize.base, lineHeight: Math.round(fontSize.base * 1.5) },
  lg: { fontSize: fontSize.md, lineHeight: Math.round(fontSize.md * 1.5) },
});
