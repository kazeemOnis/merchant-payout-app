import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { Highlight, ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
import { typography } from '@/constants/typography';

jest.mock('@/hooks/use-color-scheme', () => ({ useColorScheme: () => 'dark' }));

describe('ThemedText', () => {
  it('renders children', () => {
    render(<ThemedText>Hello</ThemedText>);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('applies body typography by default', () => {
    render(<ThemedText testID='text'>Body</ThemedText>);
    expect(screen.getByTestId('text').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining(typography.body)]),
    );
  });

  it('applies the correct variant style', () => {
    render(
      <ThemedText variant='h1' testID='text'>
        Heading
      </ThemedText>,
    );
    expect(screen.getByTestId('text').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining(typography.h1)]),
    );
  });

  it('uses the explicit color prop over theme color', () => {
    render(
      <ThemedText color={Palette.accentOrange} testID='text'>
        Tinted
      </ThemedText>,
    );
    expect(screen.getByTestId('text').props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: Palette.accentOrange }),
      ]),
    );
  });

  it('passes additional style props', () => {
    render(
      <ThemedText style={{ marginTop: 8 }} testID='text'>
        Spaced
      </ThemedText>,
    );
    expect(screen.getByTestId('text').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ marginTop: 8 })]),
    );
  });
});

describe('Highlight', () => {
  it('renders children in brand blue', () => {
    render(<Highlight testID='highlight'>Modular</Highlight>);
    expect(screen.getByText('Modular')).toBeTruthy();
    expect(screen.getByTestId('highlight').props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: Palette.brandBlue }),
      ]),
    );
  });
});
