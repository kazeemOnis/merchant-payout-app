import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  tempId?: string;
  roomId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
  status: 'sent' | 'delivered' | 'read';
}

const MAX_MESSAGES_PER_ROOM = 500;

class RoomStore {
  private rooms = new Map<string, ChatMessage[]>();

  private getRoom(roomId: string): ChatMessage[] {
    if (!this.rooms.has(roomId)) this.rooms.set(roomId, []);
    return this.rooms.get(roomId)!;
  }

  addMessage(msg: Omit<ChatMessage, 'id' | 'status' | 'createdAt'>): ChatMessage {
    const message: ChatMessage = {
      ...msg,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      status: 'sent',
    };
    const messages = this.getRoom(msg.roomId);
    messages.push(message);
    if (messages.length > MAX_MESSAGES_PER_ROOM) messages.shift();
    return message;
  }

  setDelivered(messageId: string, roomId: string): string | null {
    const messages = this.getRoom(roomId);
    const msg = messages.find(m => m.id === messageId);
    if (!msg || msg.status !== 'sent') return null;
    const deliveredAt = new Date().toISOString();
    msg.deliveredAt = deliveredAt;
    msg.status = 'delivered';
    return deliveredAt;
  }

  setRead(messageId: string, roomId: string): string | null {
    const messages = this.getRoom(roomId);
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return null;
    const readAt = new Date().toISOString();
    msg.readAt = readAt;
    msg.status = 'read';
    return readAt;
  }

  getPaginated(
    roomId: string,
    cursor: string | null,
    limit: number,
  ): { items: ChatMessage[]; next_cursor: string | null; has_more: boolean } {
    const all = this.getRoom(roomId);
    let endIndex = all.length;

    if (cursor) {
      const idx = all.findIndex(m => m.id === cursor);
      if (idx !== -1) endIndex = idx;
    }

    const startIndex = Math.max(0, endIndex - limit);
    // Return newest-first (inverted FlatList)
    const items = all.slice(startIndex, endIndex).reverse();
    const nextCursor = startIndex > 0 ? all[startIndex].id : null;
    return { items, next_cursor: nextCursor, has_more: startIndex > 0 };
  }
}

export const roomStore = new RoomStore();
