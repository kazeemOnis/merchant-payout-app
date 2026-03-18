# Onboarding & Sign-in

## Flow

```
app launch
    │
    ▼
Onboarding (index.tsx)  ──── swipe / Next ────►  Sign-in (sign-in.tsx)
                                                       │
                                                       ▼ any valid email
                                                  Home (tabs)
```

The onboarding and sign-in screens share the same background colour (`palette.bgDark`) so they read as a single continuous pre-auth experience, whether the user is in dark or light mode.

## Onboarding (`app/index.tsx`)

### Slides

Slide content is defined in `constants/onboarding.ts` as a static array (`SLIDES`). Each slide has an `id`, `title`, `subtitle`, and a Lottie animation asset. Adding a new slide means adding an entry to that array — no screen changes needed.

### Navigation between slides

Slide index is held in local `useState`. Two navigation methods are supported simultaneously:

**Button** — the footer `Button` label switches between `t('common.next')` and `t('common.getStarted')` depending on whether the current slide is the last one. On the last slide it calls `router.replace('/sign-in')`.

**Swipe gesture** — `GestureDetector` wraps the slide area with a `Gesture.Pan()`. The gesture uses `activeOffsetX: [-10, 10]` to avoid conflicting with vertical scroll, and fires `runOnJS(goToNext/goToPrev)` when the translation exceeds `SWIPE_THRESHOLD` (50px). `runOnJS` is required because the pan handler runs on the UI thread.

### Pagination dots

`PaginationDots` renders one dot per slide. The active dot is `Palette.brandBlue` (always blue regardless of theme). Inactive dots use `palette.textMuted` — this is a semantic colour that adapts to the active theme, so it stays visible in both dark and light mode.

### Theming

All semantic colours are sourced from `useThemePalette()`. The container background uses `palette.bgDark` (dark grey in dark mode, off-white in light mode). Text colours on slides use `palette.white` for headings and `palette.textMuted` for body — both adapt correctly.

## Sign-in (`app/sign-in.tsx`)

### What it does

Email-only sign-in. It's a mock — any syntactically valid email address succeeds. There's no real auth, no token, no session. After an 800ms artificial delay, `router.replace('/(tabs)')` navigates to the home tab. `replace` is used (not `push`) so the user can't navigate back to sign-in.

### Form

Built with `react-hook-form` + `zod`:

```ts
const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});
```

The `Controller` wraps the `Input` component. Validation runs on submit, not on change, to avoid showing errors before the user has finished typing.

### Keyboard handling

`KeyboardAvoidingView` with `behavior='padding'` on iOS and `behavior='height'` on Android wraps the form. `keyboardVerticalOffset={16}` provides a small cushion so the CTA button isn't hidden behind the keyboard.

`returnKeyType='go'` on the email input and `onSubmitEditing={handleSubmit(onSubmit)}` allow submission directly from the keyboard without tapping the button.

### Theming

Same `useThemePalette()` + `makeStyles(palette)` pattern as onboarding. The container background is `palette.bgDark` — visually consistent with the onboarding slides so the transition is seamless.
