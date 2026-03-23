import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAccountStyles } from '@/components/account/styles';
import { ThemedText } from '@/components/themed-text';
import { useThemePalette } from '@/hooks/use-theme-palette';

type Props = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  last?: boolean;
  testID?: string;
};

/** Tappable row with chevron — for account hub navigation. */
export function MenuNavRow({
  title,
  subtitle,
  onPress,
  last = false,
  testID,
}: Props) {
  const palette = useThemePalette();
  const { menuNavRow: styles } = useAccountStyles();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: palette.surfaceElevated,
        },
        pressed && { opacity: 0.85 },
      ]}
      testID={testID}
    >
      <View style={styles.textBlock}>
        <ThemedText variant='body' color={palette.white}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText
            variant='caption'
            color={palette.textMuted}
            style={styles.subtitle}
          >
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <Ionicons name='chevron-forward' size={20} color={palette.textMuted} />
    </Pressable>
  );
}
