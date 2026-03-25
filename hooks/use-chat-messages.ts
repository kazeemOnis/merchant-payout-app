import { useInfiniteQuery } from '@tanstack/react-query';

import { getChatMessages } from '@/services/api/chat';

export const chatMessagesKey = (roomId: string) => ['chat', 'messages', roomId] as const;

export function useChatMessages(roomId: string) {
  return useInfiniteQuery({
    queryKey: chatMessagesKey(roomId),
    queryFn: ({ pageParam }) => getChatMessages(roomId, pageParam as string | null),
    initialPageParam: null as string | null,
    getNextPageParam: lastPage => lastPage.next_cursor,
    // WS handles real-time updates — only fetch history on mount / pagination
    staleTime: Infinity,
  });
}
