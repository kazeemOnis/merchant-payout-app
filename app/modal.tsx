import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette } from '@/constants/theme';
import { useScrollToTop } from '@/hooks/use-scroll-to-top';
import { type ThemePalette, useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import { getActivity } from '@/services/api';
import type { ActivityItem, ActivityType, Currency } from '@/types/api';
import { formatAmountSigned } from '@/utils/currency';
import { formatDate } from '@/utils/date';

const TYPE_LABEL: Record<ActivityType, string> = {
  deposit: 'Deposit',
  payout: 'Payout',
  refund: 'Refund',
  fee: 'Fee',
};

function getTypeColor(type: ActivityType, palette: ThemePalette): string {
  const map: Record<ActivityType, string> = {
    deposit: Palette.accentOrange,
    payout: Palette.ctaBlue,
    refund: Palette.accentPink,
    fee: palette.textMuted,
  };
  return map[type];
}

function TypeBadge({ type }: { type: ActivityType }) {
  const palette = useThemePalette();
  const color = getTypeColor(type, palette);

  return (
    <View style={[badgeStyle, { borderColor: color }]}>
      <ThemedText variant='caption' color={color}>
        {TYPE_LABEL[type]}
      </ThemedText>
    </View>
  );
}

const badgeStyle = {
  borderWidth: 1,
  borderRadius: 4,
  paddingHorizontal: 5,
  paddingVertical: 1,
};

function ActivityRow({
  item,
  currency,
}: {
  item: ActivityItem;
  currency: Currency;
}) {
  const palette = useThemePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const isPositive = item.amount >= 0;

  return (
    <View style={styles.row} testID={`modal-row-${item.id}`}>
      <View style={styles.rowLeft}>
        <ThemedText
          variant='bodySmall'
          color={palette.white}
          numberOfLines={1}
          testID={`modal-description-${item.id}`}
        >
          {item.description}
        </ThemedText>
        <View style={styles.rowMeta}>
          <TypeBadge type={item.type} />
          <ThemedText variant='caption' color={palette.textMuted}>
            {formatDate(item.date)}
          </ThemedText>
        </View>
      </View>

      <ThemedText
        variant='amountSmall'
        color={isPositive ? Palette.accentGreen : Palette.accentRed}
        testID={`modal-amount-${item.id}`}
      >
        {formatAmountSigned(item.amount, currency)}
      </ThemedText>
    </View>
  );
}

function RowSkeleton() {
  const palette = useThemePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Skeleton width='65%' height={14} borderRadius={4} />
        <View style={styles.rowMeta}>
          <Skeleton width={48} height={18} borderRadius={4} />
          <Skeleton width={72} height={12} borderRadius={4} />
        </View>
      </View>
      <Skeleton width={72} height={14} borderRadius={4} />
    </View>
  );
}

const PAGE_SIZE = 15;

export default function ActivityModal() {
  const router = useRouter();
  const { t } = useTranslation();
  const palette = useThemePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  const hasScrolledRef = useRef(false);
  const {
    listRef,
    scrollToTop,
    showScrollTop,
    mergeOnScroll,
    scrollEventThrottle,
  } = useScrollToTop<ActivityItem>();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isRefetching,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ['activity-modal'],
    queryFn: ({ pageParam }) =>
      getActivity({ limit: PAGE_SIZE, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: page => (page.has_more ? page.next_cursor : null),
  });

  const items = data?.pages.flatMap(p => p.items) ?? [];
  const currency: Currency = items[0]?.currency ?? 'GBP';

  const loadMore = () => {
    if (!hasNextPage || isFetchingNextPage || !hasScrolledRef.current) return;
    fetchNextPage();
  };

  const onRefresh = () => {
    hasScrolledRef.current = false;
    refetch();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <ThemedText variant='h4' color={palette.white}>
          {t('activity.title')}
        </ThemedText>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          testID='modal-close'
        >
          <ThemedText variant='label' color={Palette.ctaBlue}>
            {t('common.close')}
          </ThemedText>
        </Pressable>
      </View>

      {isLoading && (
        <View style={styles.skeletonList}>
          {Array.from({ length: 12 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </View>
      )}

      {!isLoading && error && (
        <View style={styles.errorContainer}>
          <ThemedText
            variant='body'
            color={palette.textMuted}
            style={styles.errorText}
          >
            {t('activity.errorLoad')}
          </ThemedText>
          <Pressable onPress={() => void refetch()} hitSlop={8}>
            <ThemedText variant='label' color={Palette.ctaBlue}>
              {t('common.retry')}
            </ThemedText>
          </Pressable>
        </View>
      )}

      {!isLoading && !error && (
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ActivityRow item={item} currency={currency} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => {
            hasScrolledRef.current = true;
          }}
          onScroll={mergeOnScroll()}
          scrollEventThrottle={scrollEventThrottle}
          onEndReached={loadMore}
          onEndReachedThreshold={0.2}
          initialNumToRender={PAGE_SIZE}
          maxToRenderPerBatch={PAGE_SIZE}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              tintColor={Palette.brandBlue}
              colors={[Palette.brandBlue]}
            />
          }
          ListEmptyComponent={
            <ThemedText
              variant='body'
              color={palette.textMuted}
              style={styles.empty}
            >
              {t('activity.empty')}
            </ThemedText>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footer}>
                <ActivityIndicator color={Palette.brandBlue} />
              </View>
            ) : null
          }
        />
      )}

      <ScrollToTop visible={showScrollTop} onPress={scrollToTop} />
    </SafeAreaView>
  );
}

function makeStyles(p: ThemePalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: p.bgDark },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: p.surface,
    },
    skeletonList: { paddingHorizontal: 20, paddingTop: 8, gap: 4 },
    listContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: p.surfaceElevated,
      gap: 12,
    },
    rowLeft: { flex: 1, gap: 6 },
    rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      padding: 24,
    },
    errorText: { textAlign: 'center' },
    empty: { textAlign: 'center', marginTop: 48 },
    footer: { paddingVertical: 24, alignItems: 'center' },
  });
}
