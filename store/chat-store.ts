import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/utils/storage';
import type { ChatMessage, ConnectionStatus } from '@/types/chat';

export type PendingMessage = {
  tempId: string;
  roomId: string;
  content: string;
  createdAt: string;
};

type ChatState = {
  messages: ChatMessage[]; // newest-first — matches inverted FlatList
  connectionStatus: ConnectionStatus;
  typingUsers: Record<string, string>; // userId → displayName
  pendingQueue: PendingMessage[]; // persisted across restarts
  // Actions
  setMessages: (messages: ChatMessage[]) => void;
  prependMessages: (older: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  ackMessage: (tempId: string, serverMessage: ChatMessage) => void;
  markDelivered: (messageId: string, deliveredAt: string) => void;
  markRead: (messageId: string, readAt: string) => void;
  failMessage: (tempId: string) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setTyping: (userId: string, displayName: string, isTyping: boolean) => void;
  enqueueMessage: (
    roomId: string,
    content: string,
    authorId: string,
    authorName: string,
  ) => PendingMessage;
  removeFromQueue: (tempId: string) => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      connectionStatus: 'idle',
      typingUsers: {},
      pendingQueue: [],

      setMessages: messages => set({ messages }),

      // Append older messages to the end (inverted FlatList: end = top of screen)
      prependMessages: older =>
        set(state => ({ messages: [...state.messages, ...older] })),

      addMessage: message =>
        set(state => ({ messages: [message, ...state.messages] })),

      ackMessage: (tempId, serverMessage) =>
        set(state => ({
          messages: state.messages.map(m =>
            m.tempId === tempId ? { ...serverMessage, tempId } : m,
          ),
          pendingQueue: state.pendingQueue.filter(p => p.tempId !== tempId),
        })),

      markDelivered: (messageId, deliveredAt) =>
        set(state => ({
          messages: state.messages.map(m =>
            m.id === messageId || m.tempId === messageId
              ? { ...m, status: 'delivered', deliveredAt }
              : m,
          ),
        })),

      markRead: (messageId, readAt) =>
        set(state => ({
          messages: state.messages.map(m =>
            m.id === messageId || m.tempId === messageId
              ? { ...m, status: 'read', readAt }
              : m,
          ),
        })),

      failMessage: tempId =>
        set(state => ({
          messages: state.messages.map(m =>
            m.tempId === tempId ? { ...m, status: 'failed' } : m,
          ),
        })),

      setConnectionStatus: connectionStatus => set({ connectionStatus }),

      setTyping: (userId, displayName, isTyping) =>
        set(state => {
          const next = { ...state.typingUsers };
          if (isTyping) {
            next[userId] = displayName;
          } else {
            delete next[userId];
          }
          return { typingUsers: next };
        }),

      enqueueMessage: (roomId, content, authorId, authorName) => {
        const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const createdAt = new Date().toISOString();
        const pending: PendingMessage = { tempId, roomId, content, createdAt };
        const optimistic: ChatMessage = {
          id: tempId,
          tempId,
          roomId,
          authorId,
          authorName,
          content,
          createdAt,
          status: 'sending',
        };
        set(state => ({
          pendingQueue: [...state.pendingQueue, pending],
          messages: [optimistic, ...state.messages],
        }));
        return pending;
      },

      removeFromQueue: tempId =>
        set(state => ({
          pendingQueue: state.pendingQueue.filter(p => p.tempId !== tempId),
        })),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => mmkvStorage),
      // Persist last 100 messages and the full pending queue
      partialize: state => ({
        messages: state.messages.slice(0, 100),
        pendingQueue: state.pendingQueue,
      }),
    },
  ),
);

export const getChatStore = () => useChatStore.getState();
