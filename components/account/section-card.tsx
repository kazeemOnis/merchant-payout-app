import { View } from 'react-native';

import { useAccountStyles } from '@/components/account/styles';
import { ThemedText } from '@/components/themed-text';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';

interface Props {
  titleKey: string;
  children: React.ReactNode;
}

export function SectionCard({ titleKey, children }: Props) {
  const palette = useThemePalette();
  const { t } = useTranslation();
  const { sectionCard: styles } = useAccountStyles();

  return (
    <View style={styles.wrapper}>
      <ThemedText
        variant='caption'
        color={palette.textMuted}
        style={styles.title}
      >
        {t(titleKey).toUpperCase()}
      </ThemedText>
      <View style={[styles.card, { backgroundColor: palette.surface }]}>
        {children}
      </View>
    </View>
  );
}
