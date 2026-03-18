import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Skeleton } from '@/components/ui/skeleton';
import { API_BASE_URL } from '@/constants';
import { Palette } from '@/constants/theme';
import { type ThemePalette, useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import type {
  ActivityItem,
  ActivityType,
  Currency,
  PaginatedActivityResponse,
} from '@/types/api';
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
const SCROLL_TOP_THRESHOLD = 300;

export default function ActivityModal() {
  const router = useRouter();
  const { t } = useTranslation();
  const palette = useThemePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<ActivityItem[]>([]);
  const [currency, setCurrency] = useState<Currency>('GBP');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const isFetchingRef = useRef(false);
  const hasScrolledRef = useRef(false);
  const listRef = useRef<FlatList>(null);

  const scrollTopAnimStyle = useAnimatedStyle(() => ({
    opacity: withTiming(showScrollTop ? 1 : 0, { duration: 200 }),
  }));

  const fetchPage = useCallback(
    async (nextCursor: string | null, replace: boolean): Promise<void> => {
      try {
        const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
        if (nextCursor) params.set('cursor', nextCursor);

        const res = await fetch(
          `${API_BASE_URL}/api/merchant/activity?${params}`,
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);

        const json: PaginatedActivityResponse = await res.json();

        if (json.items[0]) setCurrency(json.items[0].currency);
        setItems(prev => (replace ? json.items : [...prev, ...json.items]));
        setCursor(json.next_cursor);
        setHasMore(json.has_more);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : t('activity.errorLoad'));
      }
    },
    [t],
  );

  useEffect(() => {
    isFetchingRef.current = true;
    fetchPage(null, true).finally(() => {
      isFetchingRef.current = false;
      setInitialLoading(false);
    });
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || !cursor || isFetchingRef.current || !hasScrolledRef.current)
      return;
    isFetchingRef.current = true;
    setLoadingMore(true);
    fetchPage(cursor, false).finally(() => {
      isFetchingRef.current = false;
      setLoadingMore(false);
    });
  }, [hasMore, cursor, fetchPage]);

  const onRefresh = useCallback(() => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    hasScrolledRef.current = false;
    setRefreshing(true);
    fetchPage(null, true).finally(() => {
      isFetchingRef.current = false;
      setRefreshing(false);
    });
  }, [fetchPage]);

  const retry = useCallback(() => {
    setError(null);
    setInitialLoading(true);
    fetchPage(null, true).finally(() => setInitialLoading(false));
  }, [fetchPage]);

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

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

      {initialLoading && (
        <View style={styles.skeletonList}>
          {Array.from({ length: 12 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </View>
      )}

      {!initialLoading && error && (
        <View style={styles.errorContainer}>
          <ThemedText
            variant='body'
            color={palette.textMuted}
            style={styles.errorText}
          >
            {t('activity.errorLoad')}
          </ThemedText>
          <Pressable onPress={retry} hitSlop={8}>
            <ThemedText variant='label' color={Palette.ctaBlue}>
              {t('common.retry')}
            </ThemedText>
          </Pressable>
        </View>
      )}

      {!initialLoading && !error && (
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
          onScroll={e => {
            setShowScrollTop(
              e.nativeEvent.contentOffset.y > SCROLL_TOP_THRESHOLD,
            );
          }}
          scrollEventThrottle={200}
          onEndReached={loadMore}
          onEndReachedThreshold={0.2}
          initialNumToRender={PAGE_SIZE}
          maxToRenderPerBatch={PAGE_SIZE}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
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
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator color={Palette.brandBlue} />
              </View>
            ) : null
          }
        />
      )}

      <Animated.View
        style={[
          styles.scrollTopButton,
          { bottom: insets.bottom + 16 },
          scrollTopAnimStyle,
        ]}
        pointerEvents={showScrollTop ? 'auto' : 'none'}
      >
        <Pressable onPress={scrollToTop} hitSlop={8} testID='scroll-to-top'>
          <Ionicons name='chevron-up' size={20} color={palette.white} />
        </Pressable>
      </Animated.View>
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
    scrollTopButton: {
      position: 'absolute',
      right: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: p.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
  });
}
