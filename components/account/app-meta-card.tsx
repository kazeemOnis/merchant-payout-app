import { StyleSheet, View } from 'react-native';

import { useAccountStyles } from '@/components/account/styles';
import { ThemedText } from '@/components/themed-text';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';

type Props = {
  appVersion: string;
  lastUpdatedLabel: string;
};

/** App version, last updated, and mock API status — hub footer. */
export function AppMetaCard({ appVersion, lastUpdatedLabel }: Props) {
  const palette = useThemePalette();
  const { t } = useTranslation();
  const { appMetaCard: styles } = useAccountStyles();

  return (
    <View style={[styles.card, { backgroundColor: palette.surface }]}>
      <MetaRow label={t('account.appMeta.version')} value={appVersion} />
      <MetaRow
        label={t('account.appMeta.lastUpdated')}
        value={lastUpdatedLabel}
        last={false}
      />
      <View style={styles.row}>
        <ThemedText variant='body' color={palette.white}>
          {t('account.appMeta.apiStatus')}
        </ThemedText>
        <View style={styles.apiValue}>
          <View style={styles.statusDot} />
          <ThemedText variant='body' color={palette.textMuted}>
            {t('account.appMeta.apiOperational')}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

function MetaRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  const palette = useThemePalette();
  const { appMetaCard: styles } = useAccountStyles();

  return (
    <View
      style={[
        styles.row,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: palette.surfaceElevated,
        },
      ]}
    >
      <ThemedText variant='body' color={palette.white}>
        {label}
      </ThemedText>
      <ThemedText variant='body' color={palette.textMuted}>
        {value}
      </ThemedText>
    </View>
  );
}
