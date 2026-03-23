import { useSettingsStore } from '@/store/settings-store';

export function useColorScheme() {
  return useSettingsStore(s => s.theme);
}
