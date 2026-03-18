// Lottie animation sources
const desktopAnimation = require('@/assets/animations/lottie.json');
const mobileAnimation = require('@/assets/animations/lottie.json');
const lottieAnimation = require('@/assets/animations/lottie.json');

export type OnboardingSlide = {
  id: string;
  animation: unknown;
  titlePreKey: string;
  titleHighlightKey: string;
  titlePostKey: string;
  subtitleKey: string;
};

export const SLIDES: OnboardingSlide[] = [
  {
    id: 'performance',
    animation: desktopAnimation,
    titlePreKey: 'onboarding.slide1.titlePre',
    titleHighlightKey: 'onboarding.slide1.titleHighlight',
    titlePostKey: 'onboarding.slide1.titlePost',
    subtitleKey: 'onboarding.slide1.subtitle',
  },
  {
    id: 'payments',
    animation: mobileAnimation,
    titlePreKey: 'onboarding.slide2.titlePre',
    titleHighlightKey: 'onboarding.slide2.titleHighlight',
    titlePostKey: 'onboarding.slide2.titlePost',
    subtitleKey: 'onboarding.slide2.subtitle',
  },
  {
    id: 'payouts',
    animation: lottieAnimation,
    titlePreKey: 'onboarding.slide3.titlePre',
    titleHighlightKey: 'onboarding.slide3.titleHighlight',
    titlePostKey: 'onboarding.slide3.titlePost',
    subtitleKey: 'onboarding.slide3.subtitle',
  },
];
