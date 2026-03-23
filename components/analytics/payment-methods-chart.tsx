import { useMemo } from 'react';
import { View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { useAnalyticsStyles } from '@/components/analytics/styles';
import { ThemedText } from '@/components/themed-text';
import { Skeleton } from '@/components/ui/skeleton';
import type { TypeBreakdownSlice } from '@/hooks/use-analytics-data';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import { shallowCloneChartData } from '@/utils/gifted-charts';

type Props = {
  /** Activity-type breakdown from `useAnalyticsData` (replaces removed static `PAYMENT_METHODS`). */
  data: TypeBreakdownSlice[];
  loading?: boolean;
};

export function PaymentMethodsChart({ data: slices, loading = false }: Props) {
  const palette = useThemePalette();
  const { t } = useTranslation();
  const { paymentMethodsChart: styles } = useAnalyticsStyles();

  const pieData = useMemo(
    () =>
      slices.map(item => ({
        value: item.percent,
        color: item.color,
        strokeColor: palette.surface,
        strokeWidth: 2,
      })),
    [slices, palette.surface],
  );

  const hasData = slices.length > 0;

  return (
    <View style={[styles.card, { backgroundColor: palette.surface }]}>
      <ThemedText variant='h4' color={palette.white} style={styles.title}>
        {t('analytics.paymentMethods')}
      </ThemedText>

      <View style={styles.chartRow}>
        {loading ? (
          <Skeleton width={180} height={180} borderRadius={90} />
        ) : !hasData ? (
          <ThemedText
            variant='bodySmall'
            color={palette.textMuted}
            style={styles.empty}
          >
            {t('analytics.emptyActivityMix')}
          </ThemedText>
        ) : (
          <PieChart
            data={shallowCloneChartData(pieData)}
            donut
            radius={90}
            innerRadius={54}
            innerCircleColor={palette.surface}
            strokeColor={palette.surface}
            strokeWidth={2}
          />
        )}
      </View>

      {!loading && hasData && (
        <View style={styles.legend}>
          {slices.map(item => (
            <View key={item.type} style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: item.color }]}
              />
              <View>
                <ThemedText variant='caption' color={palette.textMuted}>
                  {t(item.labelKey)}
                </ThemedText>
                <ThemedText variant='bodySmall' color={palette.white}>
                  {item.percent}%
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
