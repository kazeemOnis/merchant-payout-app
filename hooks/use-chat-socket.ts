import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { chatWsClient } from '@/services/websocket/client';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store/chat-store';

const ROOM_ID = 'general';

export function useChatSocket() {
  const { token, merchant, isAuthenticated } = useAuthStore();
  const {
    addMessage,
    ackMessage,
    markDelivered,
    markRead,
    failMessage,
    setConnectionStatus,
    setTyping,
    pendingQueue,
    setMessages,
  } = useChatStore();

  // Keep a stable ref to pendingQueue so the reconnect callback always sees latest
  const pendingQueueRef = useRef(pendingQueue);
  useEffect(() => {
    pendingQueueRef.current = pendingQueue;
  }, [pendingQueue]);

  useEffect(() => {
    if (!isAuthenticated || !token || !merchant) return;

    // ── Status changes → store ───────────────────────────────────────────
    chatWsClient.onStatusChange = status => {
      setConnectionStatus(status);
      if (status === 'connected') {
        // Drain any queued messages on reconnect
        pendingQueueRef.current.forEach(pending => {
          chatWsClient.send({
            type: 'message',
            payload: { tempId: pending.tempId, roomId: pending.roomId, content: pending.content },
          });
        });
      }
    };

    // ── Server event listeners → store ───────────────────────────────────
    const off = [
      chatWsClient.on('message', payload => addMessage(payload)),
      chatWsClient.on('message_ack', payload => ackMessage(payload.tempId, payload.message)),
      chatWsClient.on('message_delivered', payload =>
        markDelivered(payload.messageId, payload.deliveredAt),
      ),
      chatWsClient.on('message_read', payload => markRead(payload.messageId, payload.readAt)),
      chatWsClient.on('message_error', payload => failMessage(payload.tempId)),
      chatWsClient.on('typing', payload =>
        setTyping(payload.userId, payload.displayName, payload.isTyping),
      ),
    ];

    // ── Connect ──────────────────────────────────────────────────────────
    chatWsClient.connect({
      token,
      roomId: ROOM_ID,
      name: merchant.name,
      accountId: merchant.accountId,
      email: merchant.email,
    });

    // ── Reconnect on app foreground ──────────────────────────────────────
    const appStateSub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && chatWsClient.status === 'disconnected' && token && merchant) {
        chatWsClient.connect({
          token,
          roomId: ROOM_ID,
          name: merchant.name,
          accountId: merchant.accountId,
          email: merchant.email,
        });
      }
    });

    // ── Reconnect on network return ──────────────────────────────────────
    const unsubNetInfo = NetInfo.addEventListener(netState => {
      if (!netState.isConnected) {
        setConnectionStatus('disconnected');
      } else if (netState.isConnected && chatWsClient.status === 'disconnected' && token && merchant) {
        chatWsClient.connect({
          token,
          roomId: ROOM_ID,
          name: merchant.name,
          accountId: merchant.accountId,
          email: merchant.email,
        });
      }
    });

    return () => {
      off.forEach(remove => remove());
      appStateSub.remove();
      unsubNetInfo();
      chatWsClient.disconnect();
      // Reset ephemeral state on unmount
      setConnectionStatus('idle');
      setMessages([]);
    };
  }, [isAuthenticated, token, merchant]);
}
