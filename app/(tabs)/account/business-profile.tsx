import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AccountHeader } from '@/components/account/account-header';
import { SectionCard } from '@/components/account/section-card';
import { ThemedText } from '@/components/themed-text';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import { analytics } from '@/services/analytics';
import { useAuthStore } from '@/store/auth-store';

export default function BusinessProfileScreen() {
  const { t } = useTranslation();
  const palette = useThemePalette();
  const { merchant } = useAuthStore();

  useFocusEffect(
    useCallback(() => {
      analytics.screen('account_business_profile');
    }, []),
  );

  if (!merchant) {
    return null;
  }

  return (
    <View style={[styles.root, { backgroundColor: palette.bgDark }]}>
      <AccountHeader title={t('account.businessProfile.screenTitle')} />
      <ScrollView
        style={styles.scrollFill}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard titleKey='account.businessProfile.detailsTitle'>
          <DetailRow
            label={t('account.businessProfile.businessName')}
            value={merchant.name}
          />
          <DetailRow
            label={t('account.businessProfile.email')}
            value={merchant.email}
          />
          <DetailRow
            label={t('account.businessProfile.accountId')}
            value={merchant.accountId}
            last
          />
        </SectionCard>

        <SectionCard titleKey='account.businessProfile.userManagementTitle'>
          <View style={styles.placeholder}>
            <ThemedText
              variant='body'
              color={palette.textMuted}
              style={styles.placeholderText}
            >
              {t('account.businessProfile.userManagementBody')}
            </ThemedText>
          </View>
        </SectionCard>
      </ScrollView>
    </View>
  );
}

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  const palette = useThemePalette();

  return (
    <View
      style={[
        styles.row,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: palette.surfaceElevated,
        },
      ]}
    >
      <ThemedText
        variant='caption'
        color={palette.textMuted}
        style={styles.detailLabel}
      >
        {label}
      </ThemedText>
      <ThemedText variant='body' color={palette.white}>
        {value}
      </ThemedText>
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
    gap: 20,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  detailLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  placeholder: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  placeholderText: {
    lineHeight: 22,
  },
});
