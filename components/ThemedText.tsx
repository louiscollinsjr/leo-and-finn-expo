import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { useReaderPrefs } from '@/providers/ReaderProvider';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'defaultSemiBold' | 'title' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const { prefs } = useReaderPrefs();

  // Map logical typeface to concrete font families.
  const familyFor = (face: string | undefined, weight: 'regular' | 'medium' | 'bold'): string | undefined => {
    switch (face) {
      case 'inter':
        return weight === 'bold' ? 'Inter-Bold' : weight === 'medium' ? 'Inter-Medium' : 'Inter-Regular';
      case 'tisa':
        return weight === 'bold' ? 'TisaSansPro-Bold' : weight === 'medium' ? 'TisaSansPro-Medium' : 'TisaSansPro-Regular';
      case 'serif':
        return 'serif';
      case 'sans':
        return 'sans-serif';
      case 'system':
      default:
        return undefined;
    }
  };

  // Determine theme-profile-specific body weight
  const isFocus = prefs.theme === 'light' && prefs.typeface === 'inter' && !prefs.boldText;
  let bodyWeight: 'regular' | 'medium' | 'bold' = 'regular';
  if (prefs.typeface === 'inter') {
    bodyWeight = prefs.boldText ? 'bold' : isFocus ? 'medium' : 'regular';
  } else if (prefs.typeface === 'tisa') {
    bodyWeight = 'regular';
  }

  const bodyFamily = familyFor(prefs.typeface, bodyWeight);
  const strongFamily = familyFor(prefs.typeface, 'bold');

  return (
    <Text
      style={[
        { color, fontFamily: type === 'default' || type === 'link' || type === 'defaultSemiBold' ? bodyFamily : strongFamily },
        type === 'default' ? styles.default : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    color: '#0a7ea4',
  },
});
