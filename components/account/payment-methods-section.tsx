import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { SectionCard } from '@/components/account/section-card';
import { useAccountStyles } from '@/components/account/styles';
import { ThemedText } from '@/components/themed-text';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import { useSettingsStore } from '@/store/settings-store';

/** Mock on-file cards — replace with API when available. */
const MOCK_CARDS = [
  { id: '1', brand: 'visa' as const, last4: '4242' },
  { id: '2', brand: 'mastercard' as const, last4: '9910' },
  { id: '3', brand: 'amex' as const, last4: '1001' },
];

type CardBrand = (typeof MOCK_CARDS)[number]['brand'];

const FA_BRAND_ICON: Record<
  Exclude<CardBrand, 'mastercard'>,
  { name: ComponentProps<typeof FontAwesome5>['name']; color: string }
> = {
  visa: { name: 'cc-visa', color: '#1A1F71' },
  amex: { name: 'cc-amex', color: '#006FCF' },
};

const MC_BRAND_DIAMETER = 20;
const MC_BRAND_OVERLAP = MC_BRAND_DIAMETER * 0.42;

/**
 * Mastercard interlocking circles (brand mark) — clearer than FA5’s cc-mastercard glyph at small sizes.
 * Colours per Mastercard brand guidelines.
 */
function MastercardBrandMark() {
  return (
    <View style={mcStyles.wrap}>
      <View style={mcStyles.circleLeft} />
      <View style={mcStyles.circleRight} />
    </View>
  );
}

const mcStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLeft: {
    width: MC_BRAND_DIAMETER,
    height: MC_BRAND_DIAMETER,
    borderRadius: MC_BRAND_DIAMETER / 2,
    marginRight: -MC_BRAND_OVERLAP,
    backgroundColor: '#EB001B',
  },
  circleRight: {
    width: MC_BRAND_DIAMETER,
    height: MC_BRAND_DIAMETER,
    borderRadius: MC_BRAND_DIAMETER / 2,
    backgroundColor: '#FF5F00',
  },
});

const BRAND_LABEL_KEY: Record<CardBrand, string> = {
  visa: 'account.paymentMethods.brandVisa',
  mastercard: 'account.paymentMethods.brandMastercard',
  amex: 'account.paymentMethods.brandAmex',
};

/** Mock payment methods — one row per card with brand icon. */
export function PaymentMethodsSection() {
  const { t } = useTranslation();
  const palette = useThemePalette();
  const isDarkTheme = useSettingsStore(s => s.theme === 'dark');
  const { paymentMethodsSection: styles } = useAccountStyles();

  return (
    <SectionCard titleKey='account.paymentMethods.title'>
      <View style={styles.body}>
        {MOCK_CARDS.map((card, index) => {
          const isLast = index === MOCK_CARDS.length - 1;
          return (
            <View
              key={card.id}
              style={[styles.row, isLast && styles.rowLast]}
              accessibilityRole='text'
              accessibilityLabel={`${t(BRAND_LABEL_KEY[card.brand])}, ${t(
                'account.paymentMethods.maskedLast4',
                { last4: card.last4 },
              )}`}
            >
              <View style={styles.textBlock}>
                <ThemedText
                  variant='body'
                  color={palette.white}
                  numberOfLines={1}
                >
                  {t(BRAND_LABEL_KEY[card.brand])}
                </ThemedText>
                <ThemedText
                  variant='caption'
                  color={palette.textMuted}
                  numberOfLines={1}
                >
                  {t('account.paymentMethods.maskedLast4', {
                    last4: card.last4,
                  })}
                </ThemedText>
              </View>
              <View
                style={styles.iconWrap}
                accessible={false}
                importantForAccessibility='no'
              >
                {card.brand === 'mastercard' ? (
                  <MastercardBrandMark />
                ) : isDarkTheme ? (
                  <View style={styles.faBrandChip}>
                    <FontAwesome5
                      name={FA_BRAND_ICON[card.brand].name}
                      size={22}
                      color={FA_BRAND_ICON[card.brand].color}
                      brand
                    />
                  </View>
                ) : (
                  <FontAwesome5
                    name={FA_BRAND_ICON[card.brand].name}
                    size={24}
                    color={FA_BRAND_ICON[card.brand].color}
                    brand
                  />
                )}
              </View>
            </View>
          );
        })}
        <ThemedText
          variant='caption'
          color={palette.textMuted}
          style={styles.hint}
        >
          {t('account.paymentMethods.hint')}
        </ThemedText>
      </View>
    </SectionCard>
  );
}
