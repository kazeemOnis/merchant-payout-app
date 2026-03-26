import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InputBar } from '@/components/chat/input-bar';
import { MessageList } from '@/components/chat/message-list';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useChatSocket } from '@/hooks/use-chat-socket';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useChatStore } from '@/store/chat-store';

const ROOM_ID = 'general';

export default function ChatScreen() {
  const palette = useThemePalette();
  const router = useRouter();
  const { setMessages, prependMessages } = useChatStore();

  // Connect to WS — cleans up on unmount
  useChatSocket();

  // Load message history on mount
  const { data, isSuccess } = useChatMessages(ROOM_ID);
  useEffect(() => {
    if (!isSuccess || !data) return;
    // Flatten all pages; first page = most recent
    const allMessages = data.pages.flatMap(p => p.items);
    setMessages(allMessages);
  }, [isSuccess]);

  // Prepend older pages when user scrolls up (subsequent pages)
  useEffect(() => {
    if (!data || data.pages.length < 2) return;
    const latestPage = data.pages[data.pages.length - 1];
    prependMessages(latestPage.items);
  }, [data?.pages.length]);

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: palette.bgDark }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: palette.surfaceElevated }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name='chevron.right' size={20} color={palette.white} style={styles.backIcon} />
        </TouchableOpacity>
        <ThemedText variant='h3' color={palette.white} style={styles.title}>
          Support Chat
        </ThemedText>
      </View>

      {/* Messages */}
      <View style={styles.messages}>
        <MessageList />
      </View>

      {/* Input */}
      <InputBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    transform: [{ scaleX: -1 }],
  },
  title: {
    flex: 1,
  },
  messages: {
    flex: 1,
  },
});
