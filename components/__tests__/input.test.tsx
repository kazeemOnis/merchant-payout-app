import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { Input } from '@/components/ui/input';
import { Palette } from '@/constants/theme';

describe('Input', () => {
  it('renders without label or error', () => {
    render(<Input placeholder='you@example.com' testID='input' />);
    expect(screen.getByTestId('input')).toBeTruthy();
  });

  it('renders the label when provided', () => {
    render(<Input label='Email address' testID='input' />);
    expect(screen.getByText('Email address')).toBeTruthy();
  });

  it('does not render a label element when label is omitted', () => {
    render(<Input testID='input' />);
    expect(screen.queryByText('Email address')).toBeNull();
  });

  it('renders the error message when provided', () => {
    render(<Input error='Enter a valid email address' testID='input' />);
    expect(screen.getByText('Enter a valid email address')).toBeTruthy();
  });

  it('does not render error text when error is omitted', () => {
    render(<Input testID='input' />);
    expect(screen.queryByText('Enter a valid email address')).toBeNull();
  });

  it('applies error border colour when error is set', () => {
    render(<Input error='Required' testID='input' />);
    expect(screen.getByTestId('input').props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderColor: Palette.accentPink }),
      ]),
    );
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    render(<Input onChangeText={onChangeText} testID='input' />);
    fireEvent.changeText(screen.getByTestId('input'), 'hello@checkout.com');
    expect(onChangeText).toHaveBeenCalledWith('hello@checkout.com');
  });

  it('applies focused border colour on focus', () => {
    render(<Input testID='input' />);
    fireEvent(screen.getByTestId('input'), 'focus');
    expect(screen.getByTestId('input').props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderColor: Palette.brandBlue }),
      ]),
    );
  });

  it('removes focused border colour on blur', () => {
    render(<Input testID='input' />);
    const input = screen.getByTestId('input');
    fireEvent(input, 'focus');
    fireEvent(input, 'blur');
    expect(input.props.style).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderColor: Palette.brandBlue }),
      ]),
    );
  });

  describe('inputType presets', () => {
    it('sets email-address keyboard for inputType=email', () => {
      render(<Input inputType='email' testID='input' />);
      expect(screen.getByTestId('input').props.keyboardType).toBe(
        'email-address',
      );
    });

    it('sets secureTextEntry for inputType=password', () => {
      render(<Input inputType='password' testID='input' />);
      expect(screen.getByTestId('input').props.secureTextEntry).toBe(true);
    });

    it('sets secureTextEntry for inputType=newPassword', () => {
      render(<Input inputType='newPassword' testID='input' />);
      expect(screen.getByTestId('input').props.secureTextEntry).toBe(true);
    });

    it('sets number-pad keyboard for inputType=number', () => {
      render(<Input inputType='number' testID='input' />);
      expect(screen.getByTestId('input').props.keyboardType).toBe('number-pad');
    });

    it('sets decimal-pad keyboard for inputType=decimal', () => {
      render(<Input inputType='decimal' testID='input' />);
      expect(screen.getByTestId('input').props.keyboardType).toBe(
        'decimal-pad',
      );
    });

    it('sets phone-pad keyboard for inputType=phone', () => {
      render(<Input inputType='phone' testID='input' />);
      expect(screen.getByTestId('input').props.keyboardType).toBe('phone-pad');
    });

    it('sets autoCapitalize=words for inputType=firstName', () => {
      render(<Input inputType='firstName' testID='input' />);
      expect(screen.getByTestId('input').props.autoCapitalize).toBe('words');
    });

    it('allows explicit props to override presets', () => {
      render(
        <Input inputType='email' autoCapitalize='characters' testID='input' />,
      );
      expect(screen.getByTestId('input').props.autoCapitalize).toBe(
        'characters',
      );
    });
  });
});
