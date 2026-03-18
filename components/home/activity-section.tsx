import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette } from '@/constants/theme';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import type { ActivityItem, Currency } from '@/types/api';
import { formatAmountSigned } from '@/utils/currency';

import { useHomeStyles } from './styles';

const NUM_PREVIEW_ROWS = 3;

function ActivityRow({
  item,
  currency,
}: {
  item: ActivityItem;
  currency: Currency;
}) {
  const palette = useThemePalette();
  const { activitySection: styles } = useHomeStyles();
  const isPositive = item.amount >= 0;

  return (
    <View style={styles.row} testID={`activity-row-${item.id}`}>
      <ThemedText
        variant='bodySmall'
        color={palette.white}
        style={styles.rowDescription}
        numberOfLines={1}
        testID={`activity-description-${item.id}`}
      >
        {item.description}
      </ThemedText>
      <ThemedText
        variant='amountSmall'
        color={isPositive ? Palette.accentGreen : Palette.accentRed}
        testID={`activity-amount-${item.id}`}
      >
        {formatAmountSigned(item.amount, currency)}
      </ThemedText>
    </View>
  );
}

function ActivityRowSkeleton({ index }: { index: number }) {
  const { activitySection: styles } = useHomeStyles();

  return (
    <View style={styles.row} testID={`activity-skeleton-row-${index}`}>
      <Skeleton width='55%' height={14} borderRadius={4} />
      <Skeleton width={72} height={14} borderRadius={4} />
    </View>
  );
}

type ActivitySectionProps = {
  items: ActivityItem[];
  currency: Currency;
  loading: boolean;
  onViewAll: () => void;
  testID?: string;
};

export function ActivitySection({
  items,
  currency,
  loading,
  onViewAll,
  testID,
}: ActivitySectionProps) {
  const { t } = useTranslation();
  const palette = useThemePalette();
  const { activitySection: styles } = useHomeStyles();
  const preview = items.slice(0, NUM_PREVIEW_ROWS);

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <ThemedText variant='h4' color={palette.white}>
          {t('home.recentActivity')}
        </ThemedText>
        <Pressable onPress={onViewAll} testID='activity-view-all' hitSlop={8}>
          <ThemedText variant='label' color={Palette.ctaBlue}>
            {t('home.viewAll')}
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.list}>
        {loading
          ? Array.from({ length: NUM_PREVIEW_ROWS }).map((_, i) => (
              <ActivityRowSkeleton key={i} index={i} />
            ))
          : preview.map(item => (
              <ActivityRow key={item.id} item={item} currency={currency} />
            ))}
      </View>
    </View>
  );
}
