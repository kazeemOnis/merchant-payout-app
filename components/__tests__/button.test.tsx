import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Palette } from '@/constants/theme';

describe('Button', () => {
  it('renders the label', () => {
    render(<Button label='Sign in' onPress={() => {}} />);
    expect(screen.getByText('Sign in')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<Button label='Sign in' onPress={onPress} testID='btn' />);
    fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(<Button label='Sign in' onPress={onPress} disabled testID='btn' />);
    fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    render(<Button label='Sign in' onPress={onPress} loading testID='btn' />);
    fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('applies primary background colour by default', () => {
    render(<Button label='Sign in' onPress={() => {}} testID='btn' />);
    expect(screen.getByTestId('btn').props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: Palette.brandBlue }),
      ]),
    );
  });

  it('applies transparent background for secondary variant', () => {
    render(
      <Button
        label='Sign in'
        variant='secondary'
        onPress={() => {}}
        testID='btn'
      />,
    );
    expect(screen.getByTestId('btn').props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: 'transparent' }),
      ]),
    );
  });

  it('applies reduced opacity when disabled', () => {
    render(<Button label='Sign in' onPress={() => {}} disabled testID='btn' />);
    expect(screen.getByTestId('btn').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ opacity: 0.5 })]),
    );
  });

  it('sets accessibilityState disabled=true when disabled', () => {
    render(<Button label='Sign in' onPress={() => {}} disabled testID='btn' />);
    expect(screen.getByTestId('btn').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it('renders full width when fullWidth is true', () => {
    render(
      <Button label='Sign in' onPress={() => {}} fullWidth testID='btn' />,
    );
    expect(screen.getByTestId('btn').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: '100%' })]),
    );
  });

  it('shows ActivityIndicator and hides label when loading', () => {
    render(<Button label='Sign in' onPress={() => {}} loading />);
    expect(screen.queryByText('Sign in')).toBeNull();
    expect(screen.getByTestId('button-activity-indicator')).toBeTruthy();
  });
});
