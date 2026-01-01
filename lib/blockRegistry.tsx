import InteractiveParagraph from '@/components/InteractiveParagraph';
import { ThemedText } from '@/components/ThemedText';
import { QuickThemeSwatches } from '@/constants/Colors';
import { defaultTypography } from '@/lib/typography';
import * as PronConfig from '@/lib/pronunciationConfig';
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
  focusSentenceId?: string | null;
  // Language settings for pronunciation mode
  bookLang?: string; // Language the book is written in
  readerLang?: string; // Reader's native language
}): BlockRegistry {
  const { sidePad, fontScale = 1, lineHeightScale = 1, charSpacing = 0, theme, knownWords, onWordLongPress, onWordTap, readingMode = 'normal', focusSentenceId, bookLang = 'en', readerLang = 'en' } = opts;

  // Use pronunciation config's base font size when in pronunciation mode
  const baseFontSize = readingMode === 'pronunciation'
    ? PronConfig.DEFAULT_PRONUNCIATION_FONT_SIZE
    : defaultTypography.fontSize;

  const baseLineHeight = readingMode === 'pronunciation'
    ? baseFontSize * PronConfig.PRONUNCIATION_LINE_HEIGHT_SCALE
    : defaultTypography.lineHeight;

  const baseRatio = baseLineHeight / baseFontSize;
  const paraFontSize = Math.round(baseFontSize * fontScale);
  const paraLineHeight = Math.round(paraFontSize * baseRatio * lineHeightScale);
  const headingFontSize = Math.round(paraFontSize * 1.1);

  // Text color by reading theme
  // In pronunciation mode, use blue for main text to match web app
  let textColor = '#111827';
  let knownWordColor = '#4a4a4a'; // Dark gray for known words

  if (readingMode === 'pronunciation') {
    // Use blue text for pronunciation mode (matching web app exactly)
    textColor = '#367dc2'; // Web app blue
    knownWordColor = '#5a8fc7'; // Lighter blue for known words
  } else {
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
  }

  // Chapter/heading styles - use config values in pronunciation mode
  const chapterFontSize = readingMode === 'pronunciation'
    ? Math.round(paraFontSize * PronConfig.CHAPTER_FONT_SIZE_MULTIPLIER)
    : headingFontSize;
  const chapterColor = readingMode === 'pronunciation'
    ? PronConfig.CHAPTER_TEXT_COLOR
    : textColor;
  const chapterMarginTop = readingMode === 'pronunciation'
    ? PronConfig.CHAPTER_SPACING_BEFORE
    : 16;
  const chapterMarginBottom = readingMode === 'pronunciation'
    ? PronConfig.CHAPTER_SPACING_AFTER
    : 8;

  return {
    chapter: (b) => (
      <View key={b.key} style={{ marginTop: chapterMarginTop, marginBottom: chapterMarginBottom, paddingHorizontal: sidePad }}>
        <ThemedText
          type="subtitle"
          style={{
            color: chapterColor,
            fontSize: chapterFontSize,
            fontWeight: readingMode === 'pronunciation' ? PronConfig.CHAPTER_FONT_WEIGHT : undefined,
            lineHeight: Math.round(chapterFontSize * 1.3),
          }}
        >
          {b.text}
        </ThemedText>
      </View>
    ),
    heading: (b) => (
      <View key={b.key} style={{ marginTop: chapterMarginTop, marginBottom: chapterMarginBottom, paddingHorizontal: sidePad }}>
        <ThemedText
          type="title"
          style={{
            fontSize: chapterFontSize,
            lineHeight: Math.round(chapterFontSize * 1.3),
            color: chapterColor,
            fontWeight: readingMode === 'pronunciation' ? PronConfig.CHAPTER_FONT_WEIGHT : undefined,
          }}
        >
          {b.text}
        </ThemedText>
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
          focusSentenceId={focusSentenceId}
          bookLang={bookLang}
          readerLang={readerLang}
        />
      );
    },
  };
}

export function renderWithRegistry(registry: BlockRegistry, block: Block) {
  return registry[block.type](block);
}
