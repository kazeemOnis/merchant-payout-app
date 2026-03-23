# Setup

## Overview

This is a Checkout.com coding challenge built with **Expo SDK 54** and **React Native 0.81**. It uses the New Architecture (`newArchEnabled: true`) and React Compiler experiments. The app simulates a merchant payout dashboard — balance display, paginated transaction history, and a secure payout flow.

## Prerequisites

| Tool | Version |
|---|---|
| Node | **20+** (required for Expo prebuild — Node 16 will fail) |
| nvm | recommended for switching versions |
| Xcode | 15+ (for iOS builds) |
| CocoaPods | 1.13+ |

> If you're on Node 16, run `nvm use 20` before any native build commands.

## Installation

```bash
npm install
```

## Running the app

### JavaScript-only (no native build needed)

```bash
npm start       # Metro bundler — scan QR with Expo Go
```

> MSW (Mock Service Worker) is only initialised in `__DEV__` mode. The app blocks rendering until MSW is ready, so you'll see a blank screen briefly on first launch — that's expected.

### iOS (native build required for Steps 4–6)

```bash
npx expo run:ios         # builds and launches in the simulator
```

Or if you need a clean slate:

```bash
npx expo prebuild --clean
npx expo run:ios
```

### Android

```bash
npx expo run:android
```

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Expo SDK 54, React Native 0.81 |
| Routing | Expo Router (file-based) |
| Forms | react-hook-form + zod |
| Animations | react-native-reanimated 4.x |
| Gestures | react-native-gesture-handler |
| Persistence | react-native-mmkv |
| Mocked API | MSW v2 |
| Testing | Jest + @testing-library/react-native |

## Project structure

```
app/                    # Expo Router screens
  _layout.tsx           # Root layout — fonts, MSW gate, QueryClientProvider
  index.tsx             # Onboarding
  sign-in.tsx           # Sign-in
  (tabs)/
    index.tsx           # Home screen
    payouts.tsx         # Payout flow
  modal.tsx             # Transaction history modal
screen-security/        # Local native module (Steps 4–6)
components/             # Shared UI components
constants/              # Theme palette, typography, translations
store/                  # Zustand stores (settings, auth, analytics, …)
hooks/                  # Custom hooks
mocks/                  # MSW handlers and mock data generators
types/                  # API types
utils/                  # Pure utility functions (currency, date formatting)
```

## Mock API

All API calls are intercepted by MSW at the network level. Requests **do not appear in the Network tab** — check the Metro/browser console for `[MSW]` prefixed logs.

Base URL: `http://localhost:3000` (configured in `constants/index.ts`)

| Endpoint | Description |
|---|---|
| `GET /api/merchant` | Balance + 3 most recent activity items |
| `GET /api/merchant/activity` | Paginated activity (cursor-based) |
| `POST /api/payouts` | Submit a payout |

### Error triggers (for testing)

| Amount | Behaviour |
|---|---|
| `999.99` (99999 pence) | 503 Service Unavailable |
| `888.88` (88888 pence) | 400 Insufficient Funds |

## Theming

The app uses a custom theme system built on Checkout.com brand tokens.

- `constants/theme.ts` — exports `Palette` (raw tokens, always the same) and `Colors` (light/dark semantic variants)
- `hooks/use-theme-palette.ts` — returns the active palette based on the current theme
- `store/settings-store.ts` — Zustand store; persists `theme` and `locale` via MMKV (`utils/storage.ts`)

**Pattern used in every themed component:**

```tsx
const palette = useThemePalette();
const styles = useMemo(() => makeStyles(palette), [palette]);
```

Static brand colours (`Palette.brandBlue`, `Palette.accentOrange`, etc.) are referenced directly from `Palette` — they never change. Semantic colours (`bgDark`, `surface`, `white`, `textMuted`) always come from `palette` (the hook result) so they respond to theme changes.

## Typography

- `constants/typography.ts` — defines the full type scale
- **Inter** — UI copy (body, labels, captions)
- **IBMPlexMono** — financial data (amounts, IBANs). `h1` and `h2` variants use mono bold + `textTransform: 'uppercase'`
- Fonts are loaded in `app/_layout.tsx` via `expo-font` and must be present before the splash screen hides

## Settings modal

A floating settings button (gear icon, `zIndex: 100`) sits in the root layout and is visible on every screen. It opens a modal that lets the user switch:

- **Theme** — `dark` / `light`
- **Language** — English / French

Both preferences are persisted to MMKV and applied instantly across the whole app via `useSettingsStore`.

## Running tests

```bash
npm test                    # run all tests
npm run test:watch          # watch mode
npx jest path/to/file.test.ts  # single file
```

All component tests live in `components/__tests__/`. MSW uses a separate server instance for tests (`mocks/server.test.ts`).
