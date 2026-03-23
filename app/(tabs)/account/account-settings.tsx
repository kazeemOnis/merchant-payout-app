import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AccountHeader } from '@/components/account/account-header';
import { ApiKeysSection } from '@/components/account/api-keys-section';
import { NotificationsSection } from '@/components/account/notifications-section';
import { PaymentMethodsSection } from '@/components/account/payment-methods-section';
import { SecuritySection } from '@/components/account/security-section';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import { analytics } from '@/services/analytics';

export default function AccountSettingsScreen() {
  const { t } = useTranslation();
  const palette = useThemePalette();

  useFocusEffect(
    useCallback(() => {
      analytics.screen('account_settings');
    }, []),
  );

  return (
    <View style={[styles.root, { backgroundColor: palette.bgDark }]}>
      <AccountHeader title={t('account.accountSettings.screenTitle')} />
      <ScrollView
        style={styles.scrollFill}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sections}>
          <PaymentMethodsSection />
          <SecuritySection />
          <NotificationsSection />
          <ApiKeysSection />
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
