import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { Palette } from '@/constants/theme';
import { type ThemePalette, useThemePalette } from '@/hooks/use-theme-palette';

function makeProfileCardStyles() {
  return StyleSheet.create({
    card: {
      backgroundColor: Palette.brandBlue,
      borderRadius: 16,
      padding: 20,
    },
    avatarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: {
      flex: 1,
      gap: 2,
    },
    label: {
      letterSpacing: 0.3,
    },
    accountId: {
      marginTop: 2,
    },
  });
}

function makeSectionCardStyles() {
  return StyleSheet.create({
    wrapper: {
      gap: 8,
    },
    title: {
      paddingHorizontal: 4,
      letterSpacing: 0.6,
    },
    card: {
      borderRadius: 12,
      overflow: 'hidden',
    },
  });
}

function makeRowStyles() {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 12,
    },
    label: {
      flex: 1,
    },
  });
}

function makeMenuNavRowStyles() {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 12,
    },
    textBlock: {
      flex: 1,
      gap: 2,
    },
    subtitle: {
      marginTop: 2,
    },
  });
}

function makeAccountHeaderStyles() {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingBottom: 12,
    },
    backHit: {
      padding: 4,
    },
    title: {
      flex: 1,
      paddingRight: 8,
    },
  });
}

function makeSegmentedPickerStyles() {
  return StyleSheet.create({
    segmented: {
      flexDirection: 'row',
      borderRadius: 8,
      overflow: 'hidden',
      gap: 4,
    },
    segment: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
    },
  });
}

function makeSecuritySectionStyles() {
  return StyleSheet.create({
    thresholdRow: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
  });
}

function makeNotificationsSectionStyles() {
  return StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 16,
    },
    bannerText: {
      flex: 1,
      lineHeight: 18,
    },
  });
}

function makePaymentMethodsSectionStyles(palette: ThemePalette) {
  return StyleSheet.create({
    body: {
      paddingBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.surfaceElevated,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    textBlock: {
      flex: 1,
      minWidth: 0,
      gap: 3,
      paddingRight: 4,
    },
    iconWrap: {
      flexShrink: 0,
      width: 44,
      minHeight: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    /** Light backdrop so FA brand glyphs (Visa / Amex) stay legible on dark surfaces */
    faBrandChip: {
      backgroundColor: '#FFFFFF',
      borderRadius: 6,
      paddingHorizontal: 5,
      paddingVertical: 3,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hint: {
      lineHeight: 17,
      paddingHorizontal: 14,
      paddingTop: 2,
      paddingBottom: 12,
    },
  });
}

function makeApiKeysSectionStyles() {
  return StyleSheet.create({
    body: {
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    bodyText: {
      lineHeight: 22,
    },
  });
}

function makeAppMetaCardStyles() {
  return StyleSheet.create({
    card: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 12,
    },
    apiValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: Palette.accentGreen,
    },
  });
}

function makeExternalLinkRowStyles() {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 12,
    },
    label: {
      flex: 1,
    },
    trailing: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
}

export function useAccountStyles() {
  const palette = useThemePalette();
  return useMemo(
    () => ({
      profileCard: makeProfileCardStyles(),
      sectionCard: makeSectionCardStyles(),
      row: makeRowStyles(),
      menuNavRow: makeMenuNavRowStyles(),
      accountHeader: makeAccountHeaderStyles(),
      segmentedPicker: makeSegmentedPickerStyles(),
      securitySection: makeSecuritySectionStyles(),
      notificationsSection: makeNotificationsSectionStyles(),
      paymentMethodsSection: makePaymentMethodsSectionStyles(palette),
      apiKeysSection: makeApiKeysSectionStyles(),
      appMetaCard: makeAppMetaCardStyles(),
      externalLinkRow: makeExternalLinkRowStyles(),
    }),
    [palette],
  );
}
