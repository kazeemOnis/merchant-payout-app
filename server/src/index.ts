import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { config } from './config';
import { chatRouter } from './chat/routes';
import { createWsHandler } from './chat/ws-handler';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', port: config.port }));

// REST routes
app.use('/api/chat', chatRouter);

// HTTP + WS server (shared port)
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
createWsHandler(wss);

httpServer.listen(config.port, () => {
  console.log(`[Chat Server] HTTP + WS listening on http://localhost:${config.port}`);
  console.log(`[Chat Server] WebSocket endpoint: ws://localhost:${config.port}/ws`);
});
