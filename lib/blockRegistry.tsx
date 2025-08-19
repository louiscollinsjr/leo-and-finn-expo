import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import type { Block } from '@/types/reader';
import { defaultTypography } from '@/lib/typography';
import type { ThemeMode } from '@/providers/ReaderProvider';

export type BlockRenderer = (block: Block) => JSX.Element;
export type BlockRegistry = Record<Block['type'], BlockRenderer>;

export function createDefaultRegistry(opts: {
  sidePad: number;
  fontScale?: number;
  lineHeightScale?: number;
  typeface?: 'system' | 'serif' | 'sans';
  boldText?: boolean;
  charSpacing?: number;
  theme?: ThemeMode;
}): BlockRegistry {
  const { sidePad, fontScale = 1, lineHeightScale = 1, typeface, boldText = false, charSpacing = 0, theme } = opts;
  const fontFamily = typeface === 'serif' ? 'serif' : typeface === 'sans' ? 'sans-serif' : undefined;

  const baseFontSize = defaultTypography.fontSize;
  const baseLineHeight = defaultTypography.lineHeight;
  const paraFontSize = Math.round(baseFontSize * fontScale);
  const paraLineHeight = Math.round(baseLineHeight * lineHeightScale);
  const headingFontSize = Math.round(paraFontSize * 1.1);
  const bodyWeight = boldText ? '600' : '400';

  // Text color by reading theme
  let textColor = '#111827';
  switch (theme) {
    case 'dark':
      textColor = '#F4F4F5';
      break;
    case 'sepia':
      textColor = '#362F2D';
      break;
    case 'light':
    default:
      textColor = '#111827';
  }

  return {
    chapter: (b) => (
      <View key={b.key} style={{ marginTop: 0, marginBottom: 16, paddingHorizontal: sidePad }}>
        <ThemedText type="subtitle" style={{ fontFamily, color: textColor }}>{b.text}</ThemedText>
      </View>
    ),
    heading: (b) => (
      <View key={b.key} style={{ marginTop: 16, marginBottom: 8, paddingHorizontal: sidePad }}>
        <ThemedText style={{ fontWeight: '700', fontSize: headingFontSize, lineHeight: Math.round(headingFontSize * 1.3), fontFamily, color: textColor }}>{b.text}</ThemedText>
      </View>
    ),
    paragraph: (b) => (
      <View key={b.key} style={{ marginBottom: defaultTypography.paraBottomMargin, paddingHorizontal: sidePad }}>
        <ThemedText style={{ fontSize: paraFontSize, lineHeight: paraLineHeight, letterSpacing: charSpacing, fontWeight: bodyWeight as any, fontFamily, color: textColor }}>{b.text}</ThemedText>
      </View>
    ),
  };
}

export function renderWithRegistry(registry: BlockRegistry, block: Block) {
  return registry[block.type](block);
}
