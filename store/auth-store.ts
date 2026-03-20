import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

export type Merchant = {
  name: string;
  email: string;
  accountId: string;
};

type AuthState = {
  token: string | null;
  merchant: Merchant | null;
  isAuthenticated: boolean;
  setAuth: (token: string, merchant: Merchant) => void;
  clearAuth: () => void;
};

export const MOCK_MERCHANT: Merchant = {
  name: 'Checkout Merchant',
  email: 'merchant@checkout.com',
  accountId: 'MCH-00123',
};

export const MOCK_TOKEN = 'mock-jwt-kzo-abc123';
export const TOKEN_KEY = 'auth_token';

export const useAuthStore = create<AuthState>(set => ({
  token: null,
  merchant: null,
  isAuthenticated: false,
  setAuth: (token, merchant) => {
    SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ token, merchant, isAuthenticated: true });
  },
  clearAuth: () => {
    SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null, merchant: null, isAuthenticated: false });
  },
}));
