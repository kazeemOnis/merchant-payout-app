import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AccountHeader } from '@/components/account/account-header';
import { ExternalLinkRow } from '@/components/account/external-link-row';
import { SectionCard } from '@/components/account/section-card';
import { ACCOUNT_EXTERNAL_URLS } from '@/constants/account-links';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import { analytics } from '@/services/analytics';

export default function SupportScreen() {
  const { t } = useTranslation();
  const palette = useThemePalette();

  useFocusEffect(
    useCallback(() => {
      analytics.screen('account_support');
    }, []),
  );

  return (
    <View style={[styles.root, { backgroundColor: palette.bgDark }]}>
      <AccountHeader title={t('account.support.screenTitle')} />
      <ScrollView
        style={styles.scrollFill}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard titleKey='account.support.linksTitle'>
          <ExternalLinkRow
            title={t('account.support.helpCenter')}
            url={ACCOUNT_EXTERNAL_URLS.helpCenter}
          />
          <ExternalLinkRow
            title={t('account.support.terms')}
            url={ACCOUNT_EXTERNAL_URLS.terms}
          />
          <ExternalLinkRow
            title={t('account.support.privacy')}
            url={ACCOUNT_EXTERNAL_URLS.privacy}
            last
          />
        </SectionCard>
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
});
