export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatUser {
  id: string; // merchant.accountId
  displayName: string; // merchant.name
  email: string; // merchant.email
}

export interface ChatMessage {
  id: string;
  tempId?: string; // client-generated UUID for optimistic updates
  roomId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string; // ISO 8601
  deliveredAt?: string;
  readAt?: string;
  status: MessageStatus;
}

export interface PaginatedMessagesResponse {
  items: ChatMessage[];
  next_cursor: string | null;
  has_more: boolean;
}

// ─── WebSocket protocol ────────────────────────────────────────────────────
// Client → Server

export type ClientEvent =
  | { type: 'message'; payload: { tempId: string; roomId: string; content: string } }
  | { type: 'typing'; payload: { roomId: string; isTyping: boolean } }
  | { type: 'read'; payload: { messageIds: string[]; roomId: string } }
  | { type: 'ping' };

// Server → Client

export type ServerEvent =
  | { type: 'message'; payload: ChatMessage }
  | { type: 'message_ack'; payload: { tempId: string; message: ChatMessage } }
  | { type: 'message_delivered'; payload: { messageId: string; deliveredAt: string } }
  | { type: 'message_read'; payload: { messageId: string; readAt: string; readerId: string } }
  | { type: 'message_error'; payload: { tempId: string; error: string } }
  | { type: 'typing'; payload: { userId: string; displayName: string; roomId: string; isTyping: boolean } }
  | { type: 'user_joined'; payload: { user: ChatUser; roomId: string } }
  | { type: 'user_left'; payload: { userId: string; roomId: string } }
  | { type: 'pong' };
