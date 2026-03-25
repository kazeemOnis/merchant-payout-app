import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  // The app issues this mock token in dev (MOCK_TOKEN in store/auth-store.ts)
  appMockToken: process.env.APP_MOCK_TOKEN ?? 'mock-jwt-kzo-abc123',
  defaultRoomId: 'general',
} as const;
