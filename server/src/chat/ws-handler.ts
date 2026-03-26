import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import { validateToken, extractIdentity } from '../auth/middleware';
import { roomStore } from './room-store';
import { config } from '../config';

interface AuthenticatedClient extends WebSocket {
  userId: string;
  displayName: string;
  email: string;
  roomId: string;
  isAlive: boolean;
}

type ServerEvent = object;

function send(client: WebSocket, event: ServerEvent) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(event));
  }
}

/**
 * Broadcasts event to all clients in the given room, optionally excluding one.
 * Returns the count of clients that received the message.
 */
function broadcastToRoom(
  wss: WebSocketServer,
  roomId: string,
  event: ServerEvent,
  exclude?: WebSocket,
): number {
  let count = 0;
  wss.clients.forEach(ws => {
    const c = ws as AuthenticatedClient;
    if (c !== exclude && c.roomId === roomId && c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify(event));
      count++;
    }
  });
  return count;
}

export function createWsHandler(wss: WebSocketServer) {
  // Heartbeat: ping every 30s, terminate dead connections
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach(ws => {
      const c = ws as AuthenticatedClient;
      if (!c.isAlive) {
        c.terminate();
        return;
      }
      c.isAlive = false;
      c.ping();
    });
  }, 30_000);

  wss.on('close', () => clearInterval(heartbeatInterval));

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const client = ws as AuthenticatedClient;
    const { query } = parse(req.url ?? '', true);

    // Auth
    const token = Array.isArray(query.token) ? query.token[0] : query.token;
    if (!validateToken(token)) {
      client.close(4001, 'UNAUTHORISED');
      return;
    }

    const identity = extractIdentity(query as Record<string, string | string[] | undefined>);
    if (!identity) {
      client.close(4002, 'MISSING_IDENTITY');
      return;
    }

    client.userId = identity.userId;
    client.displayName = identity.displayName;
    client.email = identity.email;
    client.roomId = typeof query.roomId === 'string' ? query.roomId : config.defaultRoomId;
    client.isAlive = true;

    console.log(`[WS] ${client.displayName} (${client.userId}) joined ${client.roomId}`);

    // Pong resets heartbeat
    client.on('pong', () => {
      client.isAlive = true;
    });

    // Notify room of new user
    broadcastToRoom(
      wss,
      client.roomId,
      {
        type: 'user_joined',
        payload: {
          user: { id: client.userId, displayName: client.displayName, email: client.email },
          roomId: client.roomId,
        },
      },
      client,
    );

    client.on('message', rawData => {
      let event: { type: string; payload?: unknown };
      try {
        event = JSON.parse(String(rawData));
      } catch {
        return;
      }

      switch (event.type) {
        case 'ping': {
          send(client, { type: 'pong' });
          break;
        }

        case 'typing': {
          const p = event.payload as { roomId: string; isTyping: boolean };
          broadcastToRoom(
            wss,
            client.roomId,
            {
              type: 'typing',
              payload: {
                userId: client.userId,
                displayName: client.displayName,
                roomId: client.roomId,
                isTyping: p.isTyping,
              },
            },
            client,
          );
          break;
        }

        case 'message': {
          const p = event.payload as { tempId: string; roomId: string; content: string };
          if (!p.content?.trim()) break;

          const saved = roomStore.addMessage({
            tempId: p.tempId,
            roomId: client.roomId,
            authorId: client.userId,
            authorName: client.displayName,
            content: p.content.trim(),
          });

          // Ack the sender immediately
          send(client, { type: 'message_ack', payload: { tempId: p.tempId, message: saved } });

          // Broadcast to others in the room
          const deliveredCount = broadcastToRoom(
            wss,
            client.roomId,
            { type: 'message', payload: saved },
            client,
          );

          // If at least one other client received it, mark as delivered
          if (deliveredCount > 0) {
            const deliveredAt = roomStore.setDelivered(saved.id, client.roomId);
            if (deliveredAt) {
              send(client, {
                type: 'message_delivered',
                payload: { messageId: saved.id, deliveredAt },
              });
            }
          }
          break;
        }

        case 'read': {
          const p = event.payload as { messageIds: string[]; roomId: string };
          p.messageIds.forEach(messageId => {
            const readAt = roomStore.setRead(messageId, client.roomId);
            if (readAt) {
              // Broadcast to the whole room so the author updates their UI
              broadcastToRoom(wss, client.roomId, {
                type: 'message_read',
                payload: { messageId, readAt, readerId: client.userId },
              });
            }
          });
          break;
        }
      }
    });

    client.on('close', () => {
      console.log(`[WS] ${client.displayName} left ${client.roomId}`);
      broadcastToRoom(wss, client.roomId, {
        type: 'user_left',
        payload: { userId: client.userId, roomId: client.roomId },
      });
    });

    client.on('error', err => {
      console.error(`[WS] Error for ${client.userId}:`, err.message);
    });
  });
}
