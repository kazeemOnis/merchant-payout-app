import { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { Palette } from '@/constants/theme';
import { fontFamily, fontSize } from '@/constants/typography';
import { type ThemePalette, useThemePalette } from '@/hooks/use-theme-palette';

/**
 * Preset field types — sets sensible keyboard, autocomplete, and
 * textContentType defaults automatically. Any explicit TextInputProps
 * passed alongside will override these presets.
 */
export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'newPassword'
  | 'number'
  | 'decimal'
  | 'firstName'
  | 'lastName'
  | 'phone';

type TypePreset = Pick<
  TextInputProps,
  | 'keyboardType'
  | 'autoCapitalize'
  | 'autoComplete'
  | 'autoCorrect'
  | 'secureTextEntry'
  | 'textContentType'
>;

const TYPE_PRESETS: Record<InputType, TypePreset> = {
  text: {
    keyboardType: 'default',
    autoCapitalize: 'sentences',
    autoComplete: 'off',
    autoCorrect: true,
  },
  email: {
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    autoComplete: 'email',
    autoCorrect: false,
    textContentType: 'emailAddress',
  },
  password: {
    keyboardType: 'default',
    autoCapitalize: 'none',
    autoComplete: 'password',
    autoCorrect: false,
    secureTextEntry: true,
    textContentType: 'password',
  },
  newPassword: {
    keyboardType: 'default',
    autoCapitalize: 'none',
    autoComplete: 'new-password',
    autoCorrect: false,
    secureTextEntry: true,
    textContentType: 'newPassword',
  },
  number: {
    keyboardType: 'number-pad',
    autoCapitalize: 'none',
    autoComplete: 'off',
    autoCorrect: false,
  },
  decimal: {
    keyboardType: 'decimal-pad',
    autoCapitalize: 'none',
    autoComplete: 'off',
    autoCorrect: false,
  },
  firstName: {
    keyboardType: 'default',
    autoCapitalize: 'words',
    autoComplete: 'given-name',
    autoCorrect: false,
    textContentType: 'givenName',
  },
  lastName: {
    keyboardType: 'default',
    autoCapitalize: 'words',
    autoComplete: 'family-name',
    autoCorrect: false,
    textContentType: 'familyName',
  },
  phone: {
    keyboardType: 'phone-pad',
    autoCapitalize: 'none',
    autoComplete: 'tel',
    autoCorrect: false,
    textContentType: 'telephoneNumber',
  },
};

export type InputProps = TextInputProps & {
  /** Semantic field type — configures keyboard, autocomplete and textContentType */
  inputType?: InputType;
  label?: string;
  error?: string;
};

export function Input({
  inputType = 'text',
  label,
  error,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const palette = useThemePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  const preset = TYPE_PRESETS[inputType];

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TextInput
        // Preset defaults first — explicit props in `rest` override them
        {...preset}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
          style,
        ]}
        placeholderTextColor={palette.textMuted}
        onFocus={e => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={e => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function makeStyles(p: ThemePalette) {
  return StyleSheet.create({
    wrapper: {
      width: '100%',
      gap: 6,
    },
    label: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.sm,
      fontWeight: '500',
      lineHeight: Math.round(fontSize.sm * 1.5),
      color: p.white,
    },
    input: {
      backgroundColor: p.surface,
      color: p.white,
      fontFamily: fontFamily.regular,
      fontSize: fontSize.base,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: p.surfaceElevated,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    inputFocused: {
      borderColor: Palette.brandBlue,
    },
    inputError: {
      borderColor: Palette.accentPink,
    },
    errorText: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.xs,
      lineHeight: Math.round(fontSize.xs * 1.5),
      color: Palette.accentPink,
    },
  });
}
