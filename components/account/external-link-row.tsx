import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAccountStyles } from '@/components/account/styles';
import { ThemedText } from '@/components/themed-text';
import { useThemePalette } from '@/hooks/use-theme-palette';

type Props = {
  title: string;
  url: string;
  last?: boolean;
};

export function ExternalLinkRow({ title, url, last = false }: Props) {
  const palette = useThemePalette();
  const { externalLinkRow: styles } = useAccountStyles();

  const onPress = () => {
    void WebBrowser.openBrowserAsync(url);
  };

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
    >
      <ThemedText variant='body' color={palette.white} style={styles.label}>
        {title}
      </ThemedText>
      <View style={styles.trailing}>
        <Ionicons name='open-outline' size={18} color={palette.textMuted} />
      </View>
    </Pressable>
  );
}
