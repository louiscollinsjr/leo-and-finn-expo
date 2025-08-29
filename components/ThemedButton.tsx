import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function ThemedButton({ title, onPress, disabled = false, variant = 'primary', style, textStyle }: ThemedButtonProps) {
  const primaryBg = useThemeColor({}, 'tint');
  const primaryText = useThemeColor({}, 'primary');
  const secondaryBg = useThemeColor({}, 'secondary');
  const secondaryText = useThemeColor({}, 'text');

  const getBackgroundColor = () => {
    if (disabled) return '#555';
    switch (variant) {
      case 'primary':
        return primaryBg;
      case 'secondary':
        return secondaryBg;
      case 'danger':
        return '#d9534f';
      default:
        return primaryBg;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#aaa';
    switch (variant) {
      case 'primary':
        return primaryText;
      case 'secondary':
        return secondaryText;
      case 'danger':
        return 'white';
      default:
        return primaryText;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      <ThemedText style={[
        styles.text,
        { color: getTextColor() },
        textStyle
      ]}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
