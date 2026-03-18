import { View } from 'react-native';

import { usePayoutStyles } from '@/components/payouts/styles';
import { ThemedText } from '@/components/themed-text';
import { useThemePalette } from '@/hooks/use-theme-palette';

export function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const palette = useThemePalette();
  const { summaryRowStyles } = usePayoutStyles();

  return (
    <View style={summaryRowStyles.row}>
      <ThemedText variant='label' color={palette.textMuted}>
        {label}
      </ThemedText>
      {children}
    </View>
  );
}
