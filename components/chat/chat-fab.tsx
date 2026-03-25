import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemePalette } from '@/hooks/use-theme-palette';

export function ChatFab() {
  const palette = useThemePalette();
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push('/account/chat')}
      style={[styles.fab, { backgroundColor: palette.brandBlue }]}
      accessibilityLabel='Open chat'
      accessibilityRole='button'
    >
      <IconSymbol name='bubble.left.and.bubble.right.fill' size={22} color='#ffffff' />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
