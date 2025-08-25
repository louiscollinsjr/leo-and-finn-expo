import React, { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { LongPressGestureHandler, FlingGestureHandler, Directions } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/ThemedText';
import type { Block } from '@/types/reader';
import { defaultTypography } from '@/lib/typography';
import type { ThemeMode, Typeface } from '@/providers/ReaderProvider';
import { QuickThemeSwatches } from '@/constants/Colors';

export type BlockRenderer = (block: Block) => JSX.Element;
export type BlockRegistry = Record<Block['type'], BlockRenderer>;

export function createDefaultRegistry(opts: {
  sidePad: number;
  fontScale?: number;
  lineHeightScale?: number;
  typeface?: Typeface;
  boldText?: boolean;
  charSpacing?: number;
  theme?: ThemeMode;
  onWordLongPress?: (word: string, tokenId?: string, anchor?: { x: number; y: number; width: number; height: number }) => void;
  onWordSwipeUp?: (word: string, tokenId?: string) => void;
  onWordTap?: (word: string, tokenId?: string) => void;
}): BlockRegistry {
  const { sidePad, fontScale = 1, lineHeightScale = 1, /* typeface, boldText = false, */ charSpacing = 0, theme, onWordLongPress, onWordSwipeUp, onWordTap } = opts;

  const baseFontSize = defaultTypography.fontSize;
  const baseLineHeight = defaultTypography.lineHeight;
  const baseRatio = baseLineHeight / baseFontSize; // keep consistent LH/FS ratio across scales
  const paraFontSize = Math.round(baseFontSize * fontScale);
  const paraLineHeight = Math.round(paraFontSize * baseRatio * lineHeightScale);
  const headingFontSize = Math.round(paraFontSize * 1.1);

  // Text color by reading theme (align dark with Quiet swatch fg)
  let textColor = '#111827';
  switch (theme) {
    case 'dark':
      textColor = QuickThemeSwatches.quiet.fg; // #abadb5
      break;
    case 'sepia':
      textColor = '#362F2D';
      break;
    case 'light':
    default:
      textColor = '#111827';
  }

  const WordToken = ({
    text,
    tokenId,
    showSpace,
  }: {
    text: string;
    tokenId?: string;
    showSpace: boolean;
  }) => {
    const [highlight, setHighlight] = useState(false);
    const containerRef = useRef<View>(null);
    const onTap = () => {
      setHighlight((v) => !v);
      if (onWordTap && text) onWordTap(text, tokenId);
    };
    return (
      <FlingGestureHandler
        direction={Directions.UP}
        onActivated={() => {
          if (onWordSwipeUp && text) onWordSwipeUp(text, tokenId);
        }}
      >
        <LongPressGestureHandler
          minDurationMs={350}
          onActivated={() => {
            if (text && onWordLongPress) {
              const node = containerRef.current;
              if (node && 'measureInWindow' in node) {
                // @ts-ignore measureInWindow exists on native components
                node.measureInWindow((x: number, y: number, width: number, height: number) => {
                  onWordLongPress(text, tokenId, { x, y, width, height });
                });
              } else {
                onWordLongPress(text, tokenId);
              }
            }
          }}
        >
          <View ref={containerRef} style={{ flexDirection: 'row' }}>
            <Pressable onPress={onTap} hitSlop={4}>
              <ThemedText
                style={{
                  fontSize: paraFontSize,
                  lineHeight: paraLineHeight,
                  letterSpacing: charSpacing,
                  color: textColor,
                  backgroundColor: highlight ? 'rgba(180, 200, 255, 0.35)' : 'transparent',
                  borderRadius: highlight ? 4 : 0,
                }}
              >
                {text}
              </ThemedText>
            </Pressable>
            {showSpace ? (
              <ThemedText style={{ fontSize: paraFontSize, lineHeight: paraLineHeight, letterSpacing: charSpacing, color: textColor }}> </ThemedText>
            ) : null}
          </View>
        </LongPressGestureHandler>
      </FlingGestureHandler>
    );
  };

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
      // Prefer renderer with token metadata (includes token ids for precise actions)
      const hasTokens = (b as any).tokens && Array.isArray((b as any).tokens) && (b as any).tokens.length > 0;
      if (hasTokens) {
        const tokens = (b as any).tokens as { id: string; text: string }[];
        return (
          <View key={b.key} style={{ marginBottom: defaultTypography.paraBottomMargin, paddingHorizontal: sidePad }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {tokens.map((t, i) => (
                <WordToken key={`${b.key}-t-${t.id}-${i}`} text={t.text} tokenId={t.id} showSpace={i < tokens.length - 1} />
              ))}
            </View>
          </View>
        );
      }

      // Fallback: split text by spaces (no token id information)
      const tokens = (b.text || '').split(/\s+/);
      const clean = (w: string) => w.replace(/^[^A-Za-zÀ-ÿ0-9']+|[^A-Za-zÀ-ÿ0-9']+$/g, '');
      return (
        <View key={b.key} style={{ marginBottom: defaultTypography.paraBottomMargin, paddingHorizontal: sidePad }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {tokens.map((w, i) => (
              <WordToken key={`${b.key}-w-${i}`} text={clean(w)} tokenId={undefined} showSpace={i < tokens.length - 1} />
            ))}
          </View>
        </View>
      );
    },
  };
}

export function renderWithRegistry(registry: BlockRegistry, block: Block) {
  return registry[block.type](block);
}
