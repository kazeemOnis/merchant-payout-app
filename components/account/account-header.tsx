import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccountStyles } from '@/components/account/styles';
import { ThemedText } from '@/components/themed-text';
import { useThemePalette } from '@/hooks/use-theme-palette';

type Props = {
  title: string;
};

/** Top bar with back + title when the account stack hides the native header. */
export function AccountHeader({ title }: Props) {
  const router = useRouter();
  const palette = useThemePalette();
  const insets = useSafeAreaInsets();
  const { accountHeader: styles } = useAccountStyles();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + 4,
          backgroundColor: palette.bgDark,
        },
      ]}
    >
      <Pressable
        accessibilityRole='button'
        accessibilityLabel='Back'
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backHit, pressed && { opacity: 0.7 }]}
        hitSlop={12}
      >
        <Ionicons name='chevron-back' size={28} color={palette.white} />
      </Pressable>
      <ThemedText
        variant='h4'
        color={palette.white}
        style={styles.title}
        numberOfLines={1}
      >
        {title}
      </ThemedText>
    </View>
  );
}
