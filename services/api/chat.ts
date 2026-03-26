import { CHAT_SERVER_URL } from '@/constants';
import { useAuthStore } from '@/store/auth-store';
import type { PaginatedMessagesResponse } from '@/types/chat';

async function chatRequest<T>(path: string): Promise<T> {
  const token = useAuthStore.getState().token;
  const res = await fetch(`${CHAT_SERVER_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Chat API error ${res.status}`);
  return res.json() as Promise<T>;
}

export function getChatMessages(
  roomId: string,
  cursor: string | null,
  limit = 30,
): Promise<PaginatedMessagesResponse> {
  const params = new URLSearchParams({ roomId, limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  return chatRequest<PaginatedMessagesResponse>(`/api/chat/messages?${params}`);
}
