import { useCallback, useRef, useState } from 'react';
import type {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

const DEFAULT_THRESHOLD = 300;
const DEFAULT_SCROLL_EVENT_THROTTLE = 200;

type Options = {
  /** Show the scroll-to-top control after scrolling past this offset (px). Default 300. */
  threshold?: number;
  /** Passed to FlatList `scrollEventThrottle`. Default 200. */
  scrollEventThrottle?: number;
};

/**
 * Tracks scroll position for a “scroll to top” affordance and exposes a ref + handlers for FlatList.
 * Use `mergeOnScroll` when FlatList already has an `onScroll` handler.
 */
export function useScrollToTop<TItem = unknown>(options?: Options) {
  const threshold = options?.threshold ?? DEFAULT_THRESHOLD;
  const scrollEventThrottle =
    options?.scrollEventThrottle ?? DEFAULT_SCROLL_EVENT_THROTTLE;

  const [showScrollTop, setShowScrollTop] = useState(false);
  const listRef = useRef<FlatList<TItem>>(null);

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const mergeOnScroll = useCallback(
    (extra?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void) => {
      return (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        setShowScrollTop(e.nativeEvent.contentOffset.y > threshold);
        extra?.(e);
      };
    },
    [threshold],
  );

  return {
    listRef,
    scrollToTop,
    showScrollTop,
    mergeOnScroll,
    scrollEventThrottle,
  };
}
