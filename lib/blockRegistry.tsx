import InteractiveParagraph from '@/components/InteractiveParagraph';
import { ThemedText } from '@/components/ThemedText';
import { QuickThemeSwatches } from '@/constants/Colors';
import { defaultTypography } from '@/lib/typography';
import type { ReadingMode, ThemeMode, Typeface } from '@/providers/ReaderProvider';
import type { Block, Token } from '@/types/reader';
import React from 'react';
import { View } from 'react-native';

export type BlockRenderer = (block: Block) => React.ReactNode;
export type BlockRegistry = Record<Block['type'], BlockRenderer>;

export function createDefaultRegistry(opts: {
  sidePad: number;
  fontScale?: number;
  lineHeightScale?: number;
  typeface?: Typeface;
  boldText?: boolean;
  charSpacing?: number;
  theme?: ThemeMode;
  knownWords?: Set<string>;
  onWordLongPress?: (word: string, tokenId?: string) => void;
  onWordTap?: (word: string, tokenId?: string) => void;
  readingMode?: ReadingMode;
}): BlockRegistry {
  const { sidePad, fontScale = 1, lineHeightScale = 1, charSpacing = 0, theme, knownWords, onWordLongPress, onWordTap, readingMode = 'normal' } = opts;

  const baseFontSize = defaultTypography.fontSize;
  const baseLineHeight = defaultTypography.lineHeight;
  const baseRatio = baseLineHeight / baseFontSize;
  const paraFontSize = Math.round(baseFontSize * fontScale);
  const paraLineHeight = Math.round(paraFontSize * baseRatio * lineHeightScale);
  const headingFontSize = Math.round(paraFontSize * 1.1);

  // Text color by reading theme
  let textColor = '#111827';
  let knownWordColor = '#4a4a4a'; // Dark gray for known words
  switch (theme) {
    case 'dark':
      textColor = QuickThemeSwatches.quiet.fg;
      knownWordColor = '#6a6a6a'; // Lighter gray for dark mode
      break;
    case 'sepia':
      textColor = '#362F2D';
      knownWordColor = '#5a5550'; // Sepia-tinted gray
      break;
    case 'light':
    default:
      textColor = '#111827';
      knownWordColor = '#4a4a4a';
  }

  return {
    chapter: (b) => (
      <View key={b.key} style={{ marginTop: 0, marginBottom: 16, paddingHorizontal: sidePad }}>
        <ThemedText type="subtitle" style={{ color: textColor }}>{b.text}</ThemedText>
      </View>
    ),
    heading: (b) => (
      <View key={b.key} style={{ marginTop: 16, marginBottom: 8, paddingHorizontal: sidePad }}>
        <ThemedText type="title" style={{ fontSize: headingFontSize, lineHeight: Math.round(headingFontSize * 1.3), color: textColor }}>{b.text}</ThemedText>
      </View>
    ),
    paragraph: (b) => {
      const tokens = (b as any).tokens as Token[] | undefined;
      return (
        <InteractiveParagraph
          key={b.key}
          blockKey={b.key}
          tokens={tokens || []}
          text={b.text || ''}
          fontSize={paraFontSize}
          lineHeight={paraLineHeight}
          letterSpacing={charSpacing}
          textColor={textColor}
          knownWordColor={knownWordColor}
          sidePad={sidePad}
          knownWords={knownWords}
          onWordLongPress={onWordLongPress}
          onWordTap={onWordTap}
          readingMode={readingMode}
        />
      );
    },
  };
}

export function renderWithRegistry(registry: BlockRegistry, block: Block) {
  return registry[block.type](block);
}
