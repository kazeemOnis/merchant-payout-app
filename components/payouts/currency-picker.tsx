import { useEffect, useState } from 'react';
import { BackHandler, Modal, Platform, Pressable, View } from 'react-native';

import { usePayoutStyles } from '@/components/payouts/styles';
import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import type { Currency } from '@/types/api';

const CURRENCIES: Currency[] = ['GBP', 'EUR'];

type Props = {
  value: Currency;
  onChange: (currency: Currency) => void;
  testID?: string;
};

export function CurrencyPicker({ value, onChange, testID }: Props) {
  const { t } = useTranslation();
  const palette = useThemePalette();
  const { currencyPickerStyles } = usePayoutStyles();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setOpen(false);
      return true;
    });
    return () => sub.remove();
  }, [open]);

  return (
    <>
      <Pressable
        style={currencyPickerStyles.trigger}
        onPress={() => setOpen(true)}
        accessibilityRole='button'
        accessibilityLabel={t('payouts.currencyPickerLabel', { value })}
        testID={testID}
      >
        <ThemedText variant='label' color={palette.white}>
          {value}
        </ThemedText>
        <ThemedText
          variant='caption'
          color={palette.textMuted}
          style={currencyPickerStyles.chevron}
        >
          ▾
        </ThemedText>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType='fade'
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <Pressable
          style={currencyPickerStyles.backdrop}
          onPress={() => setOpen(false)}
        >
          <View style={currencyPickerStyles.sheet}>
            <ThemedText
              variant='label'
              color={palette.textMuted}
              style={currencyPickerStyles.sheetTitle}
            >
              {t('payouts.selectCurrency')}
            </ThemedText>
            {CURRENCIES.map(c => (
              <Pressable
                key={c}
                style={currencyPickerStyles.option}
                onPress={() => {
                  onChange(c);
                  setOpen(false);
                }}
                testID={`currency-option-${c}`}
              >
                <ThemedText
                  variant='body'
                  color={c === value ? Palette.brandBlue : palette.white}
                >
                  {c}
                </ThemedText>
                {c === value && (
                  <ThemedText variant='label' color={Palette.brandBlue}>
                    ✓
                  </ThemedText>
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
