import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useAnalyticsStyles } from '@/components/analytics/styles';
import { ThemedText } from '@/components/themed-text';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette } from '@/constants/theme';
import type { SummaryCard } from '@/hooks/use-analytics-data';
import { type ThemePalette, useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';

const CARD_PLACEHOLDERS: Pick<
  SummaryCard,
  'id' | 'labelKey' | 'iconName' | 'iconColor'
>[] = [
  {
    id: 'revenue',
    labelKey: 'analytics.revenue',
    iconName: 'cash-outline',
    iconColor: '#186aff',
  },
  {
    id: 'transactions',
    labelKey: 'analytics.transactions',
    iconName: 'card-outline',
    iconColor: '#7c3aed',
  },
  {
    id: 'successRate',
    labelKey: 'analytics.successRate',
    iconName: 'trending-up-outline',
    iconColor: '#16a34a',
  },
  {
    id: 'countries',
    labelKey: 'analytics.countries',
    iconName: 'globe-outline',
    iconColor: '#ea580c',
  },
];

interface Props {
  cards: SummaryCard[];
  loading: boolean;
}

function LoadedSummaryValues({
  card,
  palette,
  styles,
}: {
  card: SummaryCard;
  palette: ThemePalette;
  styles: ReturnType<typeof useAnalyticsStyles>['summaryCards'];
}) {
  return (
    <>
      <ThemedText variant='h3' color={palette.white} style={styles.value}>
        {card.value}
      </ThemedText>
      <View style={styles.deltaRow}>
        <Ionicons
          name='trending-up-outline'
          size={13}
          color={card.positive ? Palette.accentGreen : Palette.accentRed}
        />
        <ThemedText
          variant='caption'
          color={card.positive ? Palette.accentGreen : Palette.accentRed}
        >
          {card.delta}
        </ThemedText>
      </View>
    </>
  );
}

export function SummaryCards({ cards, loading }: Props) {
  const palette = useThemePalette();
  const { t } = useTranslation();
  const { summaryCards: styles } = useAnalyticsStyles();

  const display = loading ? CARD_PLACEHOLDERS : cards;

  return (
    <View style={styles.grid}>
      {display.map(card => (
        <View
          key={card.id}
          testID={`summary-card-${card.id}`}
          style={[styles.card, { backgroundColor: palette.surface }]}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: card.iconColor + '22' },
              ]}
            >
              <Ionicons
                name={
                  card.iconName as React.ComponentProps<typeof Ionicons>['name']
                }
                size={18}
                color={card.iconColor}
              />
            </View>
            <ThemedText variant='caption' color={palette.textMuted}>
              {t(card.labelKey)}
            </ThemedText>
          </View>

          {loading ? (
            <>
              <Skeleton
                width={80}
                height={28}
                borderRadius={6}
                style={styles.value}
              />
              <Skeleton width={50} height={14} borderRadius={4} />
            </>
          ) : (
            <LoadedSummaryValues
              card={card as SummaryCard}
              palette={palette}
              styles={styles}
            />
          )}
        </View>
      ))}
    </View>
  );
}
