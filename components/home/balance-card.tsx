import { View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette } from '@/constants/theme';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import type { Currency } from '@/types/api';
import { formatAmount } from '@/utils/currency';

import { useHomeStyles } from './styles';

type BalanceCardProps = {
  label: string;
  amount: number;
  currency: Currency;
  variant: 'available' | 'pending';
  testID?: string;
  style?: ViewStyle;
};

type BalanceCardsSkeletonProps = {
  testID?: string;
};

export function BalanceCard({
  label,
  amount,
  currency,
  variant,
  testID,
  style,
}: BalanceCardProps) {
  const palette = useThemePalette();
  const { balanceCard: styles } = useHomeStyles();
  const isAvailable = variant === 'available';

  return (
    <View
      style={[
        styles.card,
        isAvailable ? styles.cardAvailable : styles.cardPending,
        style,
      ]}
      testID={testID}
    >
      <ThemedText
        variant='label'
        color={isAvailable ? Palette.accentBlueLight : palette.textMuted}
      >
        {label}
      </ThemedText>
      <ThemedText
        variant='amount'
        color={isAvailable ? Palette.white : palette.white}
        style={styles.amount}
        numberOfLines={1}
        adjustsFontSizeToFit
        testID={testID ? `${testID}-amount` : undefined}
      >
        {formatAmount(amount, currency)}
      </ThemedText>
    </View>
  );
}

export function BalanceCardsSkeleton({ testID }: BalanceCardsSkeletonProps) {
  const { balanceCard: styles } = useHomeStyles();

  return (
    <View style={styles.row} testID={testID}>
      <View style={[styles.card, styles.cardAvailable, styles.cardFlex]}>
        <Skeleton width={80} height={14} borderRadius={4} />
        <Skeleton
          width={120}
          height={32}
          borderRadius={4}
          style={styles.skeletonAmount}
        />
      </View>
      <View style={[styles.card, styles.cardPending, styles.cardFlex]}>
        <Skeleton width={60} height={14} borderRadius={4} />
        <Skeleton
          width={90}
          height={32}
          borderRadius={4}
          style={styles.skeletonAmount}
        />
      </View>
    </View>
  );
}

export function BalanceCards({
  available,
  pending,
  currency,
  loading,
}: {
  available: number;
  pending: number;
  currency: Currency;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const { balanceCard: styles } = useHomeStyles();

  if (loading) {
    return <BalanceCardsSkeleton testID='balance-skeleton' />;
  }

  return (
    <View style={styles.row}>
      <BalanceCard
        label={t('home.available')}
        amount={available}
        currency={currency}
        variant='available'
        testID='balance-available'
        style={styles.cardFlex}
      />
      <BalanceCard
        label={t('home.pending')}
        amount={pending}
        currency={currency}
        variant='pending'
        testID='balance-pending'
        style={styles.cardFlex}
      />
    </View>
  );
}
