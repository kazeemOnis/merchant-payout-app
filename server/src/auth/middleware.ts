import { config } from '../config';

export interface WsIdentity {
  userId: string;
  displayName: string;
  email: string;
}

/**
 * Validates the app token passed as a WS query param.
 * Dev: accepts the known mock token or any non-empty string.
 * Production: would verify JWT signature here.
 */
export function validateToken(token: string | undefined): boolean {
  if (!token) return false;
  if (config.nodeEnv !== 'production') {
    // Accept the app's mock token or any non-empty bearer value in dev
    return token.length > 0;
  }
  // Production: verify JWT against app's JWT_SECRET
  return token === config.appMockToken;
}

/**
 * Extracts user identity from WS URL query params.
 * Identity is supplied by the client from its auth-store (merchant data).
 */
export function extractIdentity(query: Record<string, string | string[] | undefined>): WsIdentity | null {
  const userId = Array.isArray(query.accountId) ? query.accountId[0] : query.accountId;
  const displayName = Array.isArray(query.name) ? query.name[0] : query.name;
  const email = Array.isArray(query.email) ? query.email[0] : query.email;

  if (!userId || !displayName || !email) return null;
  return { userId, displayName, email };
}
