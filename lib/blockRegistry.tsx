import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import type { Block } from '@/types/reader';
import { defaultTypography } from '@/lib/typography';

export type BlockRenderer = (block: Block) => JSX.Element;
export type BlockRegistry = Record<Block['type'], BlockRenderer>;

export function createDefaultRegistry(opts: {
  sidePad: number;
  fontScale?: number;
  lineHeightScale?: number;
  typeface?: 'system' | 'serif' | 'sans';
}): BlockRegistry {
  const { sidePad, fontScale = 1, lineHeightScale = 1, typeface } = opts;
  const fontFamily = typeface === 'serif' ? 'serif' : typeface === 'sans' ? 'sans-serif' : undefined;

  const baseFontSize = defaultTypography.fontSize;
  const baseLineHeight = defaultTypography.lineHeight;
  const paraFontSize = Math.round(baseFontSize * fontScale);
  const paraLineHeight = Math.round(baseLineHeight * lineHeightScale);
  const headingFontSize = Math.round(paraFontSize * 1.1);

  return {
    chapter: (b) => (
      <View key={b.key} style={{ marginTop: 0, marginBottom: 16, paddingHorizontal: sidePad }}>
        <ThemedText type="subtitle" style={{ fontFamily }}>{b.text}</ThemedText>
      </View>
    ),
    heading: (b) => (
      <View key={b.key} style={{ marginTop: 16, marginBottom: 8, paddingHorizontal: sidePad }}>
        <ThemedText style={{ fontWeight: '700', fontSize: headingFontSize, lineHeight: Math.round(headingFontSize * 1.3), fontFamily }}>{b.text}</ThemedText>
      </View>
    ),
    paragraph: (b) => (
      <View key={b.key} style={{ marginBottom: defaultTypography.paraBottomMargin, paddingHorizontal: sidePad }}>
        <ThemedText style={{ fontSize: paraFontSize, lineHeight: paraLineHeight, fontFamily }}>{b.text}</ThemedText>
      </View>
    ),
  };
}

export function renderWithRegistry(registry: BlockRegistry, block: Block) {
  return registry[block.type](block);
}
