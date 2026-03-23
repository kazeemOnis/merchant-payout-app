import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AccountHeader } from '@/components/account/account-header';
import { PreferencesSection } from '@/components/account/preferences-section';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import { analytics } from '@/services/analytics';

export default function AccountSettingsPreferencesScreen() {
  const { t } = useTranslation();
  const palette = useThemePalette();

  useFocusEffect(
    useCallback(() => {
      analytics.screen('account_settings_preferences');
    }, []),
  );

  return (
    <View style={[styles.root, { backgroundColor: palette.bgDark }]}>
      <AccountHeader title={t('account.settings.screenTitle')} />
      <ScrollView
        style={styles.scrollFill}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sections}>
          <PreferencesSection />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollFill: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  sections: {
    gap: 20,
  },
});
