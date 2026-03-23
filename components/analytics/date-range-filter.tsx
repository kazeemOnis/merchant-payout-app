import { Pressable, View } from 'react-native';

import { useAnalyticsStyles } from '@/components/analytics/styles';
import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
import { useThemePalette } from '@/hooks/use-theme-palette';
import type { DateRange } from '@/store/analytics-store';

const RANGES: DateRange[] = ['24h', '7d', '30d', '90d', '1y'];

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeFilter({ value, onChange }: Props) {
  const palette = useThemePalette();
  const { dateRangeFilter: styles } = useAnalyticsStyles();

  return (
    <View style={styles.row}>
      {RANGES.map(range => {
        const active = value === range;
        return (
          <Pressable
            key={range}
            onPress={() => onChange(range)}
            style={[
              styles.pill,
              { backgroundColor: active ? Palette.brandBlue : palette.surface },
            ]}
            testID={`date-range-${range}`}
          >
            <ThemedText
              variant='label'
              color={active ? Palette.white : palette.textMuted}
            >
              {range.toUpperCase()}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
