import { Router, Request, Response } from 'express';
import { roomStore } from './room-store';
import { validateToken } from '../auth/middleware';

export const chatRouter = Router();

// GET /api/chat/messages?roomId=general&cursor=<msgId>&limit=30
chatRouter.get('/messages', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!validateToken(token)) {
    res.status(401).json({ error: 'UNAUTHORISED' });
    return;
  }

  const roomId = typeof req.query.roomId === 'string' ? req.query.roomId : 'general';
  const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : null;
  const limit = Math.min(parseInt(String(req.query.limit ?? '30'), 10), 100);

  res.json(roomStore.getPaginated(roomId, cursor, limit));
});
