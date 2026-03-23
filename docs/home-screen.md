# Home Screen & Transaction History

## Home screen (`app/(tabs)/index.tsx`)

### Data fetching

The `useMerchant` hook (`hooks/use-merchant.ts`) fetches `GET /api/merchant`. It returns `{ data, loading, error, refetch }`. The response contains `available_balance`, `pending_balance`, `currency`, and `activity` (the 3 most recent items). All monetary values are in the lowest denomination (pence for GBP, cents for EUR).

The home screen renders two distinct states:

- **Error** — full-screen centred message with a retry `Button` that calls `refetch`
- **Normal** — `ScrollView` containing the balance cards and recent activity section

### Balance cards

`BalanceCards` renders two side-by-side cards:

| Card | Background | Text colour |
|---|---|---|
| Available | `Palette.brandBlue` (always blue) | `Palette.white` (static — the blue background is the same in both themes) |
| Pending | `palette.surface` (theme-adaptive) | `palette.white` (theme-adaptive — white in dark, dark text in light) |

The pending card uses theme-adaptive text because its background colour changes with the theme. The available card always has a blue background so its text is always static white.

Loading state uses `Skeleton` placeholder components that match the card dimensions.

### Recent activity section

`ActivitySection` renders up to 3 items inline (description + signed amount). A "View all" / "Show more" button calls `router.push('/modal')` to open the transaction history modal.

## Transaction history modal (`app/modal.tsx`)

The modal is a full-screen `SafeAreaView` presented modally via Expo Router (`presentation: 'modal'`).

### FlatList configuration

The list is built on `FlatList` with the following performance tuning:

```tsx
initialNumToRender={15}    // render one full page immediately
maxToRenderPerBatch={15}   // match page size for consistent chunks
windowSize={5}             // keep 2.5 screens above and below in memory
scrollEventThrottle={200}  // fire scroll events at most every 200ms
showsVerticalScrollIndicator={false}
```

`scrollEventThrottle={200}` is the key setting for the scroll-to-top button — it limits state updates from the scroll handler to 5 per second, preventing unnecessary re-renders while still feeling responsive.

### Infinite scroll (cursor-based pagination)

```
initial load → fetchPage(null, replace=true)
                        │
              ┌─────────▼──────────┐
              │  GET /api/merchant │  ← limit=15
              │  /activity         │
              └─────────┬──────────┘
                        │ { items, next_cursor, has_more }
                        ▼
              append items, store cursor
                        │
              user scrolls near bottom
                        │
              onEndReached (threshold=0.2)
                        │
              fetchPage(cursor, replace=false)
```

**Double-fetch prevention:** A `isFetchingRef` (not state, to avoid re-renders) guards all fetch calls. `onEndReached` fires multiple times as the user scrolls — the ref check ensures only one request is in-flight at a time.

**Scroll-to-load guard:** `hasScrolledRef` is set to `true` on `onScrollBeginDrag`. `loadMore` checks this ref before fetching — this prevents `onEndReached` firing immediately on mount (when the initial page is shorter than the viewport) from triggering a second fetch before the user has scrolled at all.

### Pull-to-refresh

`RefreshControl` with `Palette.brandBlue` tint resets the cursor and replaces all items. It also resets `hasScrolledRef` so the scroll guard works correctly after a refresh.

### Scroll-to-top button

A floating `Animated.View` button appears in the bottom-right corner once the user has scrolled more than 300px (`SCROLL_TOP_THRESHOLD`). It fades in/out using Reanimated `withTiming(200ms)`. `pointerEvents` is toggled between `'auto'` and `'none'` to prevent invisible taps when the button is hidden.

```tsx
listRef.current?.scrollToOffset({ offset: 0, animated: true });
```

### Skeleton loading

The initial load shows 12 `RowSkeleton` placeholders (matching the list row layout) while the first page is in-flight. This avoids a blank flash and sets the correct layout expectation before data arrives.

## Settings modal

The `SettingsModal` is mounted in `app/_layout.tsx` — above the navigator — so it's accessible from every screen including the modal. The floating gear button has `zIndex: 100`. The `ScreenshotToast` on the payout screen uses `zIndex: 999` so it renders above the settings button when both are visible simultaneously.

### Theme selector

Renders two tappable tiles (`dark` / `light`). The active tile gets a `Palette.brandBlue` border. Selecting a tile calls `setTheme(value)` from `useSettingsStore()`, which persists via MMKV. The `ThemeProvider` in `AppShell` receives the new value and React Navigation propagates the theme change immediately across all screens.

### Language selector

Same tile pattern for `en` (English) and `fr` (French). Selecting a locale calls `setLocale(value)`, which updates MMKV and re-renders any component using `useTranslation()`. All translation strings live in `constants/translations.ts`.
