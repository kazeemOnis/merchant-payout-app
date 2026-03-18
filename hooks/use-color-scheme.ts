import { useSettings } from '@/contexts/settings-context';

export function useColorScheme() {
  const { theme } = useSettings();
  return theme;
}
