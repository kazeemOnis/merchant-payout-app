import { useCallback, useRef, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { OfflineBanner } from '@/components/chat/offline-banner';
import { ThemedText } from '@/components/themed-text';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { chatWsClient } from '@/services/websocket/client';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store/chat-store';

const ROOM_ID = 'general';
const TYPING_DEBOUNCE_MS = 300;
const TYPING_STOP_DELAY_MS = 2_000;

export function InputBar() {
  const palette = useThemePalette();
  const { merchant, token } = useAuthStore();
  const { enqueueMessage, connectionStatus } = useChatStore();
  const [text, setText] = useState('');
  const isTypingRef = useRef(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendTyping = useCallback((isTyping: boolean) => {
    chatWsClient.send({ type: 'typing', payload: { roomId: ROOM_ID, isTyping } });
    isTypingRef.current = isTyping;
  }, []);

  const stopTyping = useCallback(() => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    sendTyping(false);
  }, [sendTyping]);

  const handleChangeText = useCallback(
    (value: string) => {
      setText(value);

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        if (value.trim() && !isTypingRef.current) {
          sendTyping(true);
        }
      }, TYPING_DEBOUNCE_MS);

      // Auto-stop after 2s of no input
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        if (isTypingRef.current) stopTyping();
      }, TYPING_STOP_DELAY_MS);
    },
    [sendTyping, stopTyping],
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || !merchant) return;

    stopTyping();
    setText('');

    const pending = enqueueMessage(ROOM_ID, trimmed, merchant.accountId, merchant.name);

    // Send immediately if connected; otherwise the WS hook drains on reconnect
    if (connectionStatus === 'connected' && token) {
      chatWsClient.send({
        type: 'message',
        payload: { tempId: pending.tempId, roomId: ROOM_ID, content: trimmed },
      });
    }
  }, [text, merchant, token, connectionStatus, enqueueMessage, stopTyping]);

  const isOffline = connectionStatus === 'disconnected';
  const canSend = text.trim().length > 0;

  return (
    <View style={[styles.wrapper, { backgroundColor: palette.bgDark }]}>
      <OfflineBanner />
      <View style={[styles.row, { borderTopColor: palette.surfaceElevated }]}>
        <TextInput
          value={text}
          onChangeText={handleChangeText}
          placeholder='Message'
          placeholderTextColor={palette.textMuted}
          multiline
          maxLength={2000}
          style={[
            styles.input,
            {
              color: palette.white,
              backgroundColor: palette.surface,
            },
          ]}
          returnKeyType='default'
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!canSend}
          style={[
            styles.sendButton,
            {
              backgroundColor: canSend ? palette.brandBlue : palette.surfaceElevated,
            },
          ]}
          accessibilityLabel='Send message'
        >
          <ThemedText
            variant='body'
            color={canSend ? '#ffffff' : palette.textMuted}
            style={styles.sendLabel}
          >
            {'↑'}
          </ThemedText>
        </TouchableOpacity>
      </View>
      {isOffline && (
        <View style={styles.queueNote}>
          <ThemedText variant='caption' color={palette.textMuted}>
            Messages queued — will send when reconnected
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
    lineHeight: 20,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: -2,
  },
  queueNote: {
    alignItems: 'center',
    paddingBottom: 6,
  },
});
