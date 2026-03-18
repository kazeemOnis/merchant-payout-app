import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { OnboardingSlide } from '@/components/onboarding/onboarding-slide';
import { type OnboardingSlide as OnboardingSlideType } from '@/constants/onboarding';

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('lottie-react-native', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: { testID?: string }) => (
      <View testID={props.testID ?? 'lottie'} />
    ),
  };
});

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

const slide: OnboardingSlideType = {
  id: 'performance',
  animation: {},
  titlePreKey: 'onboarding.slide1.titlePre',
  titleHighlightKey: 'onboarding.slide1.titleHighlight',
  titlePostKey: 'onboarding.slide1.titlePost',
  subtitleKey: 'onboarding.slide1.subtitle',
};

describe('OnboardingSlide', () => {
  it('renders the title pre-text', () => {
    render(<OnboardingSlide slide={slide} index={0} />);
    expect(screen.getByText(/onboarding\.slide1\.titlePre/)).toBeTruthy();
  });

  it('renders the highlighted word', () => {
    render(<OnboardingSlide slide={slide} index={0} />);
    expect(screen.getByText('onboarding.slide1.titleHighlight')).toBeTruthy();
  });

  it('renders the subtitle', () => {
    render(<OnboardingSlide slide={slide} index={0} />);
    expect(screen.getByText('onboarding.slide1.subtitle')).toBeTruthy();
  });

  it('renders the Lottie animation', () => {
    render(<OnboardingSlide slide={slide} index={0} />);
    expect(screen.getByTestId('lottie')).toBeTruthy();
  });
});
