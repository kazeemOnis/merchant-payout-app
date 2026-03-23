import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { useAnalyticsStyles } from '@/components/analytics/styles';
import { ThemedText } from '@/components/themed-text';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette } from '@/constants/theme';
import type { TrendPoint } from '@/hooks/use-analytics-data';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import type { DateRange } from '@/store/analytics-store';
import { shallowCloneChartData } from '@/utils/gifted-charts';

const RANGE_LABELS: Record<DateRange, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '1y': 'Last 12 months',
};

/** Gifted Charts types this as `(label: string) => string` — values are numeric strings on the axis. */
function formatYLabel(label: string): string {
  const value = Number(label);
  if (Number.isNaN(value)) return label;
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1000) return `£${(value / 1000).toFixed(0)}k`;
  return `£${value}`;
}

interface Props {
  data: TrendPoint[];
  range: DateRange;
  loading?: boolean;
}

export function RevenueChart({ data, range, loading = false }: Props) {
  const palette = useThemePalette();
  const { t } = useTranslation();
  const { revenueChart: styles } = useAnalyticsStyles();

  /** Plain objects only — do not reuse one StyleSheet-backed style across points (lib mutates). */
  const axisLabelStyle = useMemo(
    () => ({ fontSize: AXIS_FONT_SIZE, color: palette.textMuted }),
    [palette.textMuted],
  );

  const chartData = useMemo(
    () =>
      data.map(point => ({
        value: point.value,
        label: point.label,
        dataPointColor: Palette.brandBlue,
        // Fresh object per point so gifted-charts can attach internal props.
        labelTextStyle: { ...axisLabelStyle },
      })),
    [data, axisLabelStyle],
  );

  const maxValue = data.length ? Math.max(...data.map(d => d.value)) : 0;
  const yAxisMax = Math.max(Math.ceil(maxValue / 10000) * 10000, 10000);

  return (
    <View style={[styles.card, { backgroundColor: palette.surface }]}>
      <View style={styles.header}>
        <ThemedText variant='h4' color={palette.white}>
          {t('analytics.revenueTrend')}
        </ThemedText>
        <View style={styles.rangeLabel}>
          <Ionicons
            name='calendar-outline'
            size={14}
            color={palette.textMuted}
          />
          <ThemedText variant='caption' color={palette.textMuted}>
            {RANGE_LABELS[range]}
          </ThemedText>
        </View>
      </View>

      {loading ? (
        <Skeleton width='100%' height={180} borderRadius={8} />
      ) : (
        <LineChart
          data={shallowCloneChartData(chartData)}
          width={280}
          height={180}
          color={Palette.brandBlue}
          thickness={2}
          curved
          hideDataPoints={data.length > 10}
          dataPointsColor={Palette.brandBlue}
          dataPointsRadius={3}
          yAxisColor='transparent'
          xAxisColor={palette.surfaceElevated}
          yAxisTextStyle={axisLabelStyle}
          xAxisLabelTextStyle={axisLabelStyle}
          rulesColor={palette.surfaceElevated}
          rulesType='dashed'
          noOfSections={4}
          maxValue={yAxisMax}
          yAxisLabelWidth={50}
          formatYLabel={formatYLabel}
          backgroundColor={palette.surface}
          isAnimated
        />
      )}
    </View>
  );
}

const AXIS_FONT_SIZE = 11;
