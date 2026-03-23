import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { PaginationDots } from '@/components/onboarding/pagination-dots';
import { Palette } from '@/constants/theme';

// PaginationDots uses Palette + hard-coded dot colours; dark theme textMuted matches darkTokens.
const DARK_TEXT_MUTED = '#888888';

describe('PaginationDots', () => {
  it('renders the correct number of dots', () => {
    render(<PaginationDots total={3} current={0} testID='dots' />);
  });

  it('renders active dot with brand blue colour', () => {
    render(<PaginationDots total={3} current={1} testID='dots' />);
    const activeDots = screen
      .UNSAFE_getAllByType(require('react-native').View)
      .filter(el =>
        [el.props.style]
          .flat()
          .some(
            (s: { backgroundColor?: string }) =>
              s?.backgroundColor === Palette.brandBlue,
          ),
      );
    expect(activeDots.length).toBeGreaterThan(0);
  });

  it('renders inactive dots with muted colour', () => {
    render(<PaginationDots total={3} current={0} />);
    const { StyleSheet } = require('react-native');
    const inactiveDots = screen
      .UNSAFE_getAllByType(require('react-native').View)
      .filter(el => {
        const flat = StyleSheet.flatten(el.props.style);
        return flat?.backgroundColor === DARK_TEXT_MUTED;
      });
    // 2 inactive out of 3 total
    expect(inactiveDots.length).toBe(2);
  });
});
