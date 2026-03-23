import { useMemo } from 'react';
import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { useAnalyticsStyles } from '@/components/analytics/styles';
import { ThemedText } from '@/components/themed-text';
import { REGIONAL_DATA } from '@/hooks/use-analytics-data';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import { shallowCloneChartData } from '@/utils/gifted-charts';

/** Gifted Charts types this as `(label: string) => string`. */
function formatYLabel(label: string): string {
  const value = Number(label);
  if (Number.isNaN(value)) return label;
  if (value === 0) return '£0k';
  return `£${(value / 1000).toFixed(0)}k`;
}

export function RegionalChart() {
  const palette = useThemePalette();
  const { t } = useTranslation();
  const { regionalChart: styles } = useAnalyticsStyles();

  const mutedColor = palette.textMuted;

  const barData = useMemo(
    () =>
      REGIONAL_DATA.map(item => ({
        value: item.value,
        label: item.label,
        frontColor: item.frontColor,
        // Plain per-bar style objects — gifted-charts mutates data rows.
        labelTextStyle: { fontSize: AXIS_FONT_SIZE, color: mutedColor },
        topLabelTextStyle: { fontSize: TOP_LABEL_FONT_SIZE, color: mutedColor },
      })),
    [mutedColor],
  );

  const axisLabelStyle = useMemo(
    () => ({ fontSize: AXIS_FONT_SIZE, color: mutedColor }),
    [mutedColor],
  );

  return (
    <View style={[styles.card, { backgroundColor: palette.surface }]}>
      <ThemedText variant='h4' color={palette.white} style={styles.title}>
        {t('analytics.regionalPerformance')}
      </ThemedText>

      <BarChart
        data={shallowCloneChartData(barData)}
        width={280}
        height={200}
        barWidth={40}
        barBorderRadius={6}
        spacing={20}
        yAxisColor='transparent'
        xAxisColor={palette.surfaceElevated}
        yAxisTextStyle={axisLabelStyle}
        xAxisLabelTextStyle={axisLabelStyle}
        rulesColor={palette.surfaceElevated}
        rulesType='dashed'
        noOfSections={4}
        maxValue={160000}
        yAxisLabelWidth={50}
        formatYLabel={formatYLabel}
        backgroundColor={palette.surface}
        isAnimated
      />
    </View>
  );
}

const AXIS_FONT_SIZE = 11;
const TOP_LABEL_FONT_SIZE = 10;
