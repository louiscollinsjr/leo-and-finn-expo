/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    chip: '#9ca3af',
    primary: '#0a7ea4',
    secondary: '#687076',
  },
  dark: {
    text: '#ECEDEE',
    // background: '#151718',
    background: '#000000',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    chip: '#2b2c2e',
    primary: '#fff',
    secondary: '#9BA1A6',
  },
};

// Centralized swatch colors for quick theme preview buttons
export const QuickThemeSwatches = {
  original: { bg: '#ffffff', fg: '#111111' },
  quiet: { bg: '#49494d', fg: '#abadb5' },
  paper: { bg: '#ecedec', fg: '#111111' },
  calm: { bg: '#ede0c5', fg: '#111111' },
  focus: { bg: '#faf8f0', fg: '#111111' },
  bold: { bg: '#ffffff', fg: '#111111' },
} as const;
