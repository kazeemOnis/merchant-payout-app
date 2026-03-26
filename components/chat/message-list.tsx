import { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
  type ViewabilityConfig,
  type ViewToken,
} from 'react-native';

import { MessageBubble } from '@/components/chat/message-bubble';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { chatWsClient } from '@/services/websocket/client';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store/chat-store';
import type { ChatMessage } from '@/types/chat';

const ROOM_ID = 'general';

const viewabilityConfig: ViewabilityConfig = {
  itemVisiblePercentThreshold: 100,
};

export function MessageList() {
  const palette = useThemePalette();
  const { merchant } = useAuthStore();
  const messages = useChatStore(s => s.messages);
  const connectionStatus = useChatStore(s => s.connectionStatus);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = useChatMessages(ROOM_ID);

  // Track which messages we've already sent read receipts for
  const readSentRef = useRef(new Set<string>());

  const handleRetry = useCallback(
    (message: ChatMessage) => {
      if (!message.tempId) return;
      chatWsClient.send({
        type: 'message',
        payload: { tempId: message.tempId, roomId: ROOM_ID, content: message.content },
      });
    },
    [],
  );

  // Send read receipts for messages scrolled into view that are from others
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!merchant || connectionStatus !== 'connected') return;

      const unread = viewableItems
        .map(t => t.item as ChatMessage)
        .filter(
          m =>
            m.authorId !== merchant.accountId &&
            m.status !== 'read' &&
            !readSentRef.current.has(m.id),
        )
        .map(m => m.id);

      if (unread.length > 0) {
        unread.forEach(id => readSentRef.current.add(id));
        chatWsClient.send({ type: 'read', payload: { messageIds: unread, roomId: ROOM_ID } });
      }
    },
    [merchant, connectionStatus],
  );

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageBubble
        message={item}
        isMine={item.authorId === merchant?.accountId}
        onRetry={handleRetry}
      />
    ),
    [merchant, handleRetry],
  );

  return (
    <FlatList
      data={messages}
      keyExtractor={item => item.tempId ?? item.id}
      renderItem={renderItem}
      inverted
      contentContainerStyle={styles.content}
      // Load older messages when the user scrolls to the top (bottom in inverted)
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.3}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator color={palette.textMuted} style={styles.loader} />
        ) : null
      }
      // TypingIndicator sits at the bottom (ListHeaderComponent in inverted list)
      ListHeaderComponent={<TypingIndicator />}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      removeClippedSubviews
      windowSize={10}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    paddingBottom: 8,
    gap: 4,
  },
  loader: {
    paddingVertical: 16,
  },
});
