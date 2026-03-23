import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppMetaCard } from '@/components/account/app-meta-card';
import { MenuNavRow } from '@/components/account/menu-nav-row';
import { ProfileCard } from '@/components/account/profile-card';
import { SectionCard } from '@/components/account/section-card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import { analytics, Events } from '@/services/analytics';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';

export default function AccountHubScreen() {
  const { t } = useTranslation();
  const palette = useThemePalette();
  const locale = useSettingsStore(s => s.locale);
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  const appVersion = Constants.expoConfig?.version ?? '—';
  const lastUpdatedLabel = new Intl.DateTimeFormat(
    locale === 'fr' ? 'fr-FR' : 'en-GB',
    { day: 'numeric', month: 'short', year: 'numeric' },
  ).format(new Date());

  useFocusEffect(
    useCallback(() => {
      analytics.screen('account');
    }, []),
  );

  const handleSignOut = () => {
    analytics.track(Events.SIGN_OUT);
    analytics.reset();
    clearAuth();
    router.replace('/sign-in');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.bgDark }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText
          variant='h2'
          color={palette.white}
          style={styles.screenTitle}
        >
          {t('account.title')}
        </ThemedText>

        <ProfileCard />

        <SectionCard titleKey='account.menu.sectionTitle'>
          <MenuNavRow
            title={t('account.menu.businessProfile')}
            subtitle={t('account.menu.businessProfileSubtitle')}
            onPress={() => router.push('/account/business-profile')}
            testID='nav-business-profile'
          />
          <MenuNavRow
            title={t('account.menu.accountSettings')}
            subtitle={t('account.menu.accountSettingsSubtitle')}
            onPress={() => router.push('/account/account-settings')}
            testID='nav-account-settings'
          />
          <MenuNavRow
            title={t('account.menu.support')}
            subtitle={t('account.menu.supportSubtitle')}
            onPress={() => router.push('/account/support')}
            testID='nav-support'
          />
          <MenuNavRow
            title={t('account.menu.settings')}
            subtitle={t('account.menu.settingsSubtitle')}
            onPress={() => router.push('/account/settings')}
            last
            testID='nav-settings'
          />
        </SectionCard>

        <View style={styles.metaSection}>
          <ThemedText
            variant='caption'
            color={palette.textMuted}
            style={styles.metaSectionTitle}
          >
            {t('account.appMeta.sectionTitle').toUpperCase()}
          </ThemedText>
          <AppMetaCard
            appVersion={appVersion}
            lastUpdatedLabel={lastUpdatedLabel}
          />
        </View>

        <Button
          label={t('account.signOut')}
          variant='destructive'
          onPress={handleSignOut}
          fullWidth
          size='lg'
          style={styles.signOut}
          testID='sign-out-button'
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
  },
  screenTitle: {
    marginBottom: 4,
  },
  metaSection: {
    gap: 8,
  },
  metaSectionTitle: {
    paddingHorizontal: 4,
    letterSpacing: 0.6,
  },
  signOut: {
    marginTop: 8,
  },
});
