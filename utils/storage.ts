import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV({ id: 'app-storage' });

/**
 * MMKV storage adapter compatible with Zustand's `createJSONStorage`.
 */
export const mmkvStorage = {
  setItem: (key: string, value: string) => mmkv.set(key, value),
  getItem: (key: string) => mmkv.getString(key) ?? null,
  removeItem: (key: string) => mmkv.delete(key),
};
