import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useAccountStyles } from '@/components/account/styles';
import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { useAuthStore } from '@/store/auth-store';

export function ProfileCard() {
  const { merchant } = useAuthStore();
  const { t } = useTranslation();
  const { profileCard: styles } = useAccountStyles();

  if (!merchant) return null;

  return (
    <View style={styles.card}>
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Ionicons name='person-outline' size={28} color={Palette.white} />
        </View>
        <View style={styles.info}>
          <ThemedText
            variant='caption'
            color={Palette.accentBlueLight}
            style={styles.label}
          >
            {t('account.businessAccount')}
          </ThemedText>
          <ThemedText variant='h4' color={Palette.white}>
            {merchant.name}
          </ThemedText>
          <ThemedText
            variant='accountNumber'
            color={Palette.accentBlueLight}
            style={styles.accountId}
          >
            ID: {merchant.accountId}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}
