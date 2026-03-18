import { useCallback } from 'react';

import { useSettings } from '@/contexts/settings-context';
import en from '@/translations/en.json';
import fr from '@/translations/fr.json';

type TranslationRecord = Record<string, unknown>;

const TRANSLATIONS = { en, fr } as const;

function resolveKey(obj: TranslationRecord, key: string): string {
  const value = key.split('.').reduce<unknown>((acc, segment) => {
    if (acc !== null && typeof acc === 'object') {
      return (acc as TranslationRecord)[segment];
    }
    return undefined;
  }, obj);

  return typeof value === 'string' ? value : key;
}

export function useTranslation() {
  const { locale } = useSettings();
  const translations = TRANSLATIONS[locale] as TranslationRecord;

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let result = resolveKey(translations, key);

      if (params) {
        Object.entries(params).forEach(([param, val]) => {
          result = result.replace(`{${param}}`, String(val));
        });
      }

      return result;
    },
    [translations],
  );

  return { t };
}
