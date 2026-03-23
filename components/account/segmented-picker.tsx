import { Pressable, View } from 'react-native';

import { useAccountStyles } from '@/components/account/styles';
import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
import { useThemePalette } from '@/hooks/use-theme-palette';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedPickerProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  /** When set, each segment gets `testID={`${testIDPrefix}-${value}`}` */
  testIDPrefix?: string;
};

/**
 * Horizontal pill-style segments (used for currency, theme, locale, etc.).
 */
export function SegmentedPicker<T extends string>({
  value,
  onChange,
  options,
  testIDPrefix,
}: SegmentedPickerProps<T>) {
  const palette = useThemePalette();
  const { segmentedPicker: styles } = useAccountStyles();

  return (
    <View style={styles.segmented}>
      {options.map(({ value: optionValue, label }) => {
        const selected = value === optionValue;
        return (
          <Pressable
            key={optionValue}
            testID={testIDPrefix ? `${testIDPrefix}-${optionValue}` : undefined}
            onPress={() => onChange(optionValue)}
            style={[
              styles.segment,
              { borderColor: palette.surfaceElevated },
              selected && {
                backgroundColor: Palette.brandBlue,
                borderColor: Palette.brandBlue,
              },
            ]}
          >
            <ThemedText
              variant='label'
              color={selected ? Palette.white : palette.textMuted}
            >
              {label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
