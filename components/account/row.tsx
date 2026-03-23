import { StyleSheet, Switch, View } from 'react-native';

import { useAccountStyles } from '@/components/account/styles';
import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
import { useThemePalette } from '@/hooks/use-theme-palette';

interface RowProps {
  label: string;
  last?: boolean;
  children: React.ReactNode;
}

/** Generic row inside a SectionCard — label on left, control on right. */
export function Row({ label, last = false, children }: RowProps) {
  const palette = useThemePalette();
  const { row: styles } = useAccountStyles();

  return (
    <View
      style={[
        styles.row,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: palette.surfaceElevated,
        },
      ]}
    >
      <ThemedText variant='body' color={palette.white} style={styles.label}>
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

interface SwitchRowProps {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  last?: boolean;
}

export function SwitchRow({
  label,
  value,
  onValueChange,
  last,
}: SwitchRowProps) {
  return (
    <Row label={label} last={last}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#3a3a3c', true: Palette.brandBlue }}
        thumbColor={Palette.white}
      />
    </Row>
  );
}
