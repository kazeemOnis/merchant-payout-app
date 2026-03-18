import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
import {
  type Locale,
  type Theme,
  useSettings,
} from '@/contexts/settings-context';
import { type ThemePalette, useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';

const THEMES: { value: Theme; labelKey: string }[] = [
  { value: 'dark', labelKey: 'settings.dark' },
  { value: 'light', labelKey: 'settings.light' },
];

const LOCALES: { value: Locale; labelKey: string }[] = [
  { value: 'en', labelKey: 'settings.languages.en' },
  { value: 'fr', labelKey: 'settings.languages.fr' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const { theme, setTheme, locale, setLocale } = useSettings();
  const palette = useThemePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <ThemedText variant='h4' color={palette.white}>
              {t('settings.title')}
            </ThemedText>
            <Pressable onPress={onClose} hitSlop={12}>
              <ThemedText variant='label' color={Palette.ctaBlue}>
                {t('common.close')}
              </ThemedText>
            </Pressable>
          </View>

          <ThemedText
            variant='caption'
            color={palette.textMuted}
            style={styles.sectionLabel}
          >
            {t('settings.theme')}
          </ThemedText>
          <View style={styles.optionGroup}>
            {THEMES.map(({ value, labelKey }) => (
              <Pressable
                key={value}
                style={[
                  styles.option,
                  theme === value && styles.optionSelected,
                ]}
                onPress={() => setTheme(value)}
                testID={`theme-option-${value}`}
              >
                <ThemedText
                  variant='body'
                  color={theme === value ? Palette.brandBlue : palette.white}
                >
                  {t(labelKey)}
                </ThemedText>
                {theme === value && (
                  <ThemedText variant='label' color={Palette.brandBlue}>
                    ✓
                  </ThemedText>
                )}
              </Pressable>
            ))}
          </View>

          <ThemedText
            variant='caption'
            color={palette.textMuted}
            style={styles.sectionLabel}
          >
            {t('settings.language')}
          </ThemedText>
          <View style={styles.optionGroup}>
            {LOCALES.map(({ value, labelKey }) => (
              <Pressable
                key={value}
                style={[
                  styles.option,
                  locale === value && styles.optionSelected,
                ]}
                onPress={() => setLocale(value)}
                testID={`locale-option-${value}`}
              >
                <ThemedText
                  variant='body'
                  color={locale === value ? Palette.brandBlue : palette.white}
                >
                  {t(labelKey)}
                </ThemedText>
                {locale === value && (
                  <ThemedText variant='label' color={Palette.brandBlue}>
                    ✓
                  </ThemedText>
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function makeStyles(p: ThemePalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: p.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 48,
      gap: 4,
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: p.surfaceElevated,
      alignSelf: 'center',
      marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    sectionLabel: { marginBottom: 4, marginTop: 16 },
    optionGroup: {
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: p.bgDark,
    },
    option: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: p.surfaceElevated,
    },
    optionSelected: { backgroundColor: p.surface },
  });
}
