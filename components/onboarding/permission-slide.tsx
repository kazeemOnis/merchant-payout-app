import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as TrackingTransparency from 'expo-tracking-transparency';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Highlight, ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Palette } from '@/constants/theme';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import { useOnboardingStore } from '@/store/onboarding-store';

export type PermissionSlideKind = 'att' | 'notifications';

const ICONS: Record<PermissionSlideKind, keyof typeof Ionicons.glyphMap> = {
  att: 'globe-outline',
  notifications: 'notifications-outline',
};

type PermissionSlideProps = {
  kind: PermissionSlideKind;
  onComplete: () => void;
};

/**
 * Shared layout for ATT (iOS tracking) and notification permission prompts.
 * Copy and actions differ by `kind`; structure (icon, title, bullets, note, allow / not now) is shared.
 */
export function PermissionSlide({ kind, onComplete }: PermissionSlideProps) {
  const { t } = useTranslation();
  const palette = useThemePalette();
  const { setAttStatus, setNotificationPermission } = useOnboardingStore();

  const prefix = `onboarding.${kind}` as const;
  const bulletKeys = [
    `${prefix}.bullet1`,
    `${prefix}.bullet2`,
    `${prefix}.bullet3`,
  ] as const;

  const handleAllow = async () => {
    if (kind === 'att') {
      if (Platform.OS === 'ios') {
        const { status } =
          await TrackingTransparency.requestTrackingPermissionsAsync();
        setAttStatus(status === 'granted' ? 'granted' : 'denied');
      } else {
        setAttStatus('granted');
      }
    } else {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationPermission(status === 'granted' ? 'granted' : 'denied');
    }
    onComplete();
  };

  const handleSkip = () => {
    if (kind === 'att') {
      setAttStatus('denied');
    } else {
      setNotificationPermission('denied');
    }
    onComplete();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.bgDark }]}
      edges={['top', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: Palette.brandBlue + '22' },
          ]}
        >
          <Ionicons name={ICONS[kind]} size={38} color={Palette.brandBlue} />
        </View>

        <ThemedText variant='h1' color={palette.white} style={styles.title}>
          {t(`${prefix}.titlePre`)}{' '}
          <Highlight variant='h1'>{t(`${prefix}.titleHighlight`)}</Highlight>
          {t(`${prefix}.titlePost`)}
        </ThemedText>

        <ThemedText
          variant='body'
          color={palette.textMuted}
          style={styles.subtitle}
        >
          {t(`${prefix}.subtitle`)}
        </ThemedText>

        <View style={styles.bullets}>
          {bulletKeys.map(key => (
            <View
              key={key}
              style={[styles.bulletItem, { backgroundColor: palette.surface }]}
            >
              <View
                style={[
                  styles.bulletDot,
                  { backgroundColor: Palette.brandBlue },
                ]}
              />
              <ThemedText
                variant='body'
                color={palette.white}
                style={styles.bulletText}
              >
                {t(key)}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={[styles.note, { backgroundColor: palette.surface }]}>
          <ThemedText
            variant='caption'
            color={palette.textMuted}
            style={styles.noteText}
          >
            {t(`${prefix}.note`)}
          </ThemedText>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button
          label={t(`${prefix}.allow`)}
          onPress={handleAllow}
          fullWidth
          size='lg'
          variant={kind === 'att' ? 'secondary' : 'primary'}
        />
        <Pressable onPress={handleSkip} hitSlop={12} style={styles.skipButton}>
          <ThemedText variant='body' color={palette.textMuted}>
            {t('onboarding.notNow')}
          </ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/** Convenience wrapper — same as `<PermissionSlide kind="att" />`. */
export function AttPermissionSlide({
  onComplete,
}: Pick<PermissionSlideProps, 'onComplete'>) {
  return <PermissionSlide kind='att' onComplete={onComplete} />;
}

/** Convenience wrapper — same as `<PermissionSlide kind="notifications" />`. */
export function NotificationPermissionSlide({
  onComplete,
}: Pick<PermissionSlideProps, 'onComplete'>) {
  return <PermissionSlide kind='notifications' onComplete={onComplete} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  bullets: {
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    lineHeight: 22,
  },
  note: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  noteText: {
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    paddingTop: 16,
    gap: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
});
