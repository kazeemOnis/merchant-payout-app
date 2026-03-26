import { CHAT_WS_URL } from '@/constants';
import type { ClientEvent, ServerEvent } from '@/types/chat';

type EventPayloadMap = {
  [K in ServerEvent['type']]: Extract<ServerEvent, { type: K }> extends { payload: infer P }
    ? P
    : never;
};

type EventHandler<K extends ServerEvent['type']> = (
  payload: EventPayloadMap[K],
) => void;

type ListenerMap = {
  [K in ServerEvent['type']]?: Array<EventHandler<K>>;
};

export type WsStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export class ChatWsClient {
  private ws: WebSocket | null = null;
  private token = '';
  private roomId = 'general';
  private name = '';
  private accountId = '';
  private email = '';
  private listeners: ListenerMap = {};
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private shouldReconnect = false;
  public status: WsStatus = 'idle';
  onStatusChange?: (status: WsStatus) => void;

  connect(params: {
    token: string;
    roomId: string;
    name: string;
    accountId: string;
    email: string;
  }) {
    this.token = params.token;
    this.roomId = params.roomId;
    this.name = params.name;
    this.accountId = params.accountId;
    this.email = params.email;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this.openConnection();
  }

  disconnect() {
    this.shouldReconnect = false;
    this.clearTimers();
    if (this.ws) {
      this.ws.onclose = null; // suppress reconnect on manual close
      this.ws.close(1000, 'CLIENT_DISCONNECT');
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  send(event: ClientEvent): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
      return true;
    }
    return false;
  }

  on<K extends ServerEvent['type']>(type: K, handler: EventHandler<K>): () => void {
    if (!this.listeners[type]) {
      (this.listeners as Record<string, unknown[]>)[type] = [];
    }
    (this.listeners[type] as Array<EventHandler<K>>).push(handler);
    return () => this.off(type, handler);
  }

  off<K extends ServerEvent['type']>(type: K, handler: EventHandler<K>) {
    const arr = this.listeners[type] as Array<EventHandler<K>> | undefined;
    if (arr) {
      (this.listeners as Record<string, unknown[]>)[type] = arr.filter(h => h !== handler);
    }
  }

  private openConnection() {
    this.setStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting');

    const params = new URLSearchParams({
      token: this.token,
      roomId: this.roomId,
      name: this.name,
      accountId: this.accountId,
      email: this.email,
    });

    this.ws = new WebSocket(`${CHAT_WS_URL}?${params}`);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.setStatus('connected');
      this.startPing();
    };

    this.ws.onmessage = e => {
      try {
        const event = JSON.parse(String(e.data)) as ServerEvent;
        this.emit(event);
      } catch {
        // ignore malformed frames
      }
    };

    this.ws.onerror = () => {
      // onerror always precedes onclose in React Native — nothing to do here
    };

    this.ws.onclose = e => {
      this.clearTimers();
      if (!this.shouldReconnect || e.code === 4001 || e.code === 4002) {
        this.setStatus('disconnected');
        return;
      }
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus('disconnected');
      return;
    }
    // Exponential backoff: 1s, 2s, 4s … capped at 30s
    const delay = Math.min(1_000 * Math.pow(2, this.reconnectAttempts), 30_000);
    this.reconnectAttempts++;
    this.setStatus('reconnecting');
    this.reconnectTimer = setTimeout(() => this.openConnection(), delay);
  }

  private startPing() {
    this.pingTimer = setInterval(() => {
      this.send({ type: 'ping' });
    }, 25_000);
  }

  private clearTimers() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.reconnectTimer = null;
    this.pingTimer = null;
  }

  private setStatus(status: WsStatus) {
    this.status = status;
    this.onStatusChange?.(status);
  }

  private emit(event: ServerEvent) {
    const handlers = this.listeners[event.type];
    if (!handlers) return;
    if ('payload' in event) {
      (handlers as Array<(p: unknown) => void>).forEach(h => h(event.payload));
    } else {
      (handlers as Array<() => void>).forEach(h => h());
    }
  }
}

// Singleton — one WS connection per app session
export const chatWsClient = new ChatWsClient();
