import { View } from 'react-native';

import { SectionCard } from '@/components/account/section-card';
import { useAccountStyles } from '@/components/account/styles';
import { ThemedText } from '@/components/themed-text';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';

/** Placeholder until API keys are managed in-app. */
export function ApiKeysSection() {
  const { t } = useTranslation();
  const palette = useThemePalette();
  const { apiKeysSection: styles } = useAccountStyles();

  return (
    <SectionCard titleKey='account.apiKeys.title'>
      <View style={styles.body}>
        <ThemedText
          variant='body'
          color={palette.textMuted}
          style={styles.bodyText}
        >
          {t('account.apiKeys.description')}
        </ThemedText>
      </View>
    </SectionCard>
  );
}
