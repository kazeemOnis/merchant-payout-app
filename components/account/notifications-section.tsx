import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, View } from 'react-native';

import { SwitchRow } from '@/components/account/row';
import { SectionCard } from '@/components/account/section-card';
import { useAccountStyles } from '@/components/account/styles';
import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import { useAccountStore } from '@/store/account-store';
import { useOnboardingStore } from '@/store/onboarding-store';

export function NotificationsSection() {
  const { t } = useTranslation();
  const palette = useThemePalette();
  const { notificationsSection: styles } = useAccountStyles();
  const { notificationPermission } = useOnboardingStore();
  const {
    notifPayoutSuccess,
    notifPayoutFailure,
    setNotifPayoutSuccess,
    setNotifPayoutFailure,
  } = useAccountStore();

  const isDenied = notificationPermission === 'denied';

  return (
    <SectionCard titleKey='account.notifications.title'>
      {isDenied ? (
        <View
          style={[styles.banner, { backgroundColor: palette.surfaceElevated }]}
        >
          <Ionicons
            name='notifications-off-outline'
            size={18}
            color={palette.textMuted}
          />
          <ThemedText
            variant='bodySmall'
            color={palette.textMuted}
            style={styles.bannerText}
          >
            {t('account.notifications.disabledBanner')}
          </ThemedText>
          <Pressable onPress={() => Linking.openSettings()} hitSlop={8}>
            <ThemedText variant='label' color={Palette.ctaBlue}>
              {t('account.notifications.openSettings')}
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <>
          <SwitchRow
            label={t('account.notifications.payoutSuccess')}
            value={notifPayoutSuccess}
            onValueChange={setNotifPayoutSuccess}
          />
          <SwitchRow
            label={t('account.notifications.payoutFailure')}
            value={notifPayoutFailure}
            onValueChange={setNotifPayoutFailure}
            last
          />
        </>
      )}
    </SectionCard>
  );
}
