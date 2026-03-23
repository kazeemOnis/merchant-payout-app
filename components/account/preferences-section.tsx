import { useMemo } from 'react';

import { Row } from '@/components/account/row';
import { SectionCard } from '@/components/account/section-card';
import {
  SegmentedPicker,
  type SegmentedOption,
} from '@/components/account/segmented-picker';
import { useTranslation } from '@/hooks/use-translation';
import { useAccountStore } from '@/store/account-store';
import {
  type Locale,
  type Theme,
  useSettingsStore,
} from '@/store/settings-store';

const CURRENCY_OPTIONS: readonly SegmentedOption<'GBP' | 'EUR'>[] = [
  { value: 'GBP', label: '£ GBP' },
  { value: 'EUR', label: '€ EUR' },
];

const THEME_META: readonly { value: Theme; labelKey: string }[] = [
  { value: 'dark', labelKey: 'settings.dark' },
  { value: 'light', labelKey: 'settings.light' },
];

const LOCALE_META: readonly { value: Locale; labelKey: string }[] = [
  { value: 'en', labelKey: 'settings.languages.en' },
  { value: 'fr', labelKey: 'settings.languages.fr' },
];

export function PreferencesSection() {
  const { t } = useTranslation();
  const { defaultCurrency, setDefaultCurrency } = useAccountStore();
  const { theme, setTheme, locale, setLocale } = useSettingsStore();

  const themeOptions = useMemo(
    () =>
      THEME_META.map(({ value, labelKey }) => ({
        value,
        label: t(labelKey),
      })),
    [t],
  );

  const localeOptions = useMemo(
    () =>
      LOCALE_META.map(({ value, labelKey }) => ({
        value,
        label: t(labelKey),
      })),
    [t],
  );

  const rows = [
    {
      labelKey: 'account.preferences.defaultCurrency' as const,
      last: false,
      node: (
        <SegmentedPicker
          value={defaultCurrency}
          onChange={setDefaultCurrency}
          options={CURRENCY_OPTIONS}
        />
      ),
    },
    {
      labelKey: 'account.preferences.theme' as const,
      last: false,
      node: (
        <SegmentedPicker
          value={theme}
          onChange={setTheme}
          options={themeOptions}
          testIDPrefix='theme-option'
        />
      ),
    },
    {
      labelKey: 'account.preferences.language' as const,
      last: true,
      node: (
        <SegmentedPicker
          value={locale}
          onChange={setLocale}
          options={localeOptions}
          testIDPrefix='locale-option'
        />
      ),
    },
  ] as const;

  return (
    <SectionCard titleKey='account.preferences.title'>
      {rows.map(({ labelKey, last, node }) => (
        <Row key={labelKey} label={t(labelKey)} last={last}>
          {node}
        </Row>
      ))}
    </SectionCard>
  );
}
