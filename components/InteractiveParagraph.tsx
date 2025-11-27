/**
 * InteractiveParagraph - Efficient word-level interactions for the reader
 * 
 * Uses a single Pressable per paragraph instead of per-word, with word hit-testing
 * based on onTextLayout measurements. This reduces component count by ~95%
 * while preserving word-level interactions needed for the Birkenbihl method.
 */
import { defaultTypography } from '@/lib/typography';
import type { ReadingMode } from '@/providers/ReaderProvider';
import type { Token } from '@/types/reader';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  TextLayoutEventData,
  TextStyle,
  View,
} from 'react-native';
import PronunciationWord from './PronunciationWord';

interface InteractiveParagraphProps {
  blockKey: string;
  tokens: Token[];
  text: string; // fallback if no tokens
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textColor: string;
  knownWordColor: string;
  sidePad: number;
  knownWords?: Set<string>; // words the user has marked as known
  onWordLongPress?: (word: string, tokenId?: string) => void;
  onWordTap?: (word: string, tokenId?: string) => void;
  readingMode?: ReadingMode;
  translationColor?: string;
}

interface TextLine {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const InteractiveParagraph = memo(({
  blockKey,
  tokens,
  text,
  fontSize,
  lineHeight,
  letterSpacing,
  textColor,
  knownWordColor,
  sidePad,
  knownWords,
  onWordLongPress,
  readingMode = 'normal',
  translationColor = '#666666',
}: InteractiveParagraphProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const textLinesRef = useRef<TextLine[]>([]);
  const longPressActiveRef = useRef(false);

  // Build token list from either tokens array or split text
  const tokenList = useMemo(() => {
    if (tokens && tokens.length > 0) {
      return tokens;
    }
    // Fallback: split text into pseudo-tokens
    return (text || '').split(/\s+/).filter(w => w.length > 0).map((word, i) => ({
      id: `fallback-${i}`,
      text: word,
    }));
  }, [tokens, text]);

  // Build the full text string with spaces
  const fullText = useMemo(() => {
    return tokenList.map(t => t.text).join(' ');
  }, [tokenList]);

  // Build character-to-token mapping
  const charToToken = useMemo(() => {
    const mapping: { tokenIndex: number; token: Token }[] = [];
    tokenList.forEach((token, tokenIndex) => {
      // Add characters for this token
      for (let i = 0; i < token.text.length; i++) {
        mapping.push({ tokenIndex, token });
      }
      // Add space after (except for last token)
      if (tokenIndex < tokenList.length - 1) {
        mapping.push({ tokenIndex, token }); // space belongs to preceding word
      }
    });
    return mapping;
  }, [tokenList]);

  // Store text layout info
  const handleTextLayout = useCallback((e: NativeSyntheticEvent<TextLayoutEventData>) => {
    textLinesRef.current = e.nativeEvent.lines.map(line => ({
      text: line.text,
      x: line.x,
      y: line.y,
      width: line.width,
      height: line.height,
    }));
  }, []);

  // Find which token was touched based on coordinates
  const findTokenAtPosition = useCallback((x: number, y: number): { token: Token; index: number } | null => {
    const lines = textLinesRef.current;
    if (!lines.length) return null;

    // Find which line was touched
    let touchedLine: TextLine | null = null;
    let lineStartChar = 0;
    
    for (const line of lines) {
      if (y >= line.y && y < line.y + line.height) {
        touchedLine = line;
        break;
      }
      lineStartChar += line.text.length;
    }

    if (!touchedLine) {
      // Touch is below all lines - use last line
      touchedLine = lines[lines.length - 1];
      lineStartChar = fullText.length - touchedLine.text.length;
    }

    // Calculate approximate character position in line
    const avgCharWidth = touchedLine.width / Math.max(1, touchedLine.text.length);
    const charInLine = Math.floor((x - touchedLine.x) / avgCharWidth);
    const clampedCharInLine = Math.max(0, Math.min(charInLine, touchedLine.text.length - 1));
    
    // Get absolute character position
    const absoluteCharPos = lineStartChar + clampedCharInLine;
    
    // Look up which token this character belongs to
    if (absoluteCharPos >= 0 && absoluteCharPos < charToToken.length) {
      const { tokenIndex, token } = charToToken[absoluteCharPos];
      return { token, index: tokenIndex };
    }

    // Fallback to last token
    if (tokenList.length > 0) {
      return { token: tokenList[tokenList.length - 1], index: tokenList.length - 1 };
    }

    return null;
  }, [fullText, charToToken, tokenList]);

  // Handle long press - find word and call callback
  const handleLongPress = useCallback((e: GestureResponderEvent) => {
    longPressActiveRef.current = true;
    const { locationX, locationY } = e.nativeEvent;
    const result = findTokenAtPosition(locationX, locationY);
    
    if (result && onWordLongPress) {
      setSelectedIndex(result.index);
      // Strip leading/trailing punctuation from the word for display
      const cleanWord = result.token.text.replace(/^[^\w]+|[^\w]+$/g, '');
      if (cleanWord) {
        console.log('[InteractiveParagraph] Long press on token:', cleanWord, 'id:', result.token.id);
        onWordLongPress(cleanWord, result.token.id);
      }
      
      // Keep highlight visible longer
      setTimeout(() => setSelectedIndex(null), 800);
    }
    
    // Reset long press flag after a short delay
    setTimeout(() => { longPressActiveRef.current = false; }, 100);
  }, [findTokenAtPosition, onWordLongPress]);

  // Render tokens with appropriate styling based on reading mode
  const renderContent = useMemo(() => {
    const baseStyle: TextStyle = {
      fontSize,
      lineHeight,
      letterSpacing,
    };

    // Pronunciation mode: render each word with phoneme segments
    if (readingMode === 'pronunciation') {
      return tokenList.map((token, i) => {
        const isKnown = knownWords?.has(token.text.toLowerCase());
        const cleanWord = token.text.replace(/^[^\w]+|[^\w]+$/g, '');
        const leadingPunct = token.text.match(/^[^\w]+/)?.[0] || '';
        const trailingPunct = token.text.match(/[^\w]+$/)?.[0] || '';
        
        // Skip pure punctuation tokens
        if (!cleanWord) {
          return (
            <Text key={`${blockKey}-${token.id}-${i}`} style={[baseStyle, { color: textColor }]}>
              {token.text}
            </Text>
          );
        }

        return (
          <View key={`${blockKey}-${token.id}-${i}`} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            {leadingPunct ? (
              <Text style={[baseStyle, { color: textColor }]}>{leadingPunct}</Text>
            ) : null}
            <PronunciationWord
              word={cleanWord}
              fontSize={fontSize}
              textColor={textColor}
              isKnown={isKnown}
              knownWordColor={knownWordColor}
            />
            {trailingPunct ? (
              <Text style={[baseStyle, { color: textColor, marginRight: 4 }]}>{trailingPunct}</Text>
            ) : null}
          </View>
        );
      });
    }

    // Translations mode: show translation below unknown words
    if (readingMode === 'translations') {
      return tokenList.map((token, i) => {
        const isKnown = knownWords?.has(token.text.toLowerCase());
        const isSelected = selectedIndex === i;
        // TODO: Get actual translation from user_translations or token data
        const translation = (token as any).translation;
        const showTranslation = !isKnown && translation;
        
        const tokenStyle: TextStyle = {
          ...baseStyle,
          color: isKnown ? knownWordColor : textColor,
          backgroundColor: isSelected ? 'rgba(100, 150, 255, 0.35)' : 'transparent',
        };

        if (showTranslation) {
          return (
            <View key={`${blockKey}-${token.id}-${i}`} style={{ alignItems: 'center', marginRight: 4 }}>
              <Text style={tokenStyle}>{token.text}</Text>
              <Text style={{ fontSize: fontSize * 0.55, color: translationColor }}>
                {translation}
              </Text>
            </View>
          );
        }

        return (
          <Text key={`${blockKey}-${token.id}-${i}`} style={tokenStyle}>
            {token.text}
            {i < tokenList.length - 1 ? ' ' : ''}
          </Text>
        );
      });
    }

    // Normal and Focused modes: standard inline text
    return tokenList.map((token, i) => {
      const isKnown = knownWords?.has(token.text.toLowerCase());
      const isSelected = selectedIndex === i;
      
      const tokenStyle: TextStyle = {
        ...baseStyle,
        color: isKnown ? knownWordColor : textColor,
        backgroundColor: isSelected ? 'rgba(100, 150, 255, 0.35)' : 'transparent',
        // Focused mode: slightly bolder text
        ...(readingMode === 'focused' && { fontWeight: '500' }),
      };

      return (
        <Text key={`${blockKey}-${token.id}-${i}`} style={tokenStyle}>
          {token.text}
          {i < tokenList.length - 1 ? ' ' : ''}
        </Text>
      );
    });
  }, [tokenList, fontSize, lineHeight, letterSpacing, textColor, knownWordColor, knownWords, selectedIndex, blockKey, readingMode, translationColor]);

  // Use flex wrap for pronunciation/translations modes
  const useFlexWrap = readingMode === 'pronunciation' || readingMode === 'translations';

  return (
    <View style={{ marginBottom: defaultTypography.paraBottomMargin, paddingHorizontal: sidePad }}>
      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={300}
      >
        {useFlexWrap ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {renderContent}
          </View>
        ) : (
          <Text 
            selectable={false}
            onTextLayout={handleTextLayout}
          >
            {renderContent}
          </Text>
        )}
      </Pressable>
    </View>
  );
}, (prev, next) => {
  // Custom comparison for memo - only re-render when these change
  return (
    prev.blockKey === next.blockKey &&
    prev.tokens === next.tokens &&
    prev.text === next.text &&
    prev.fontSize === next.fontSize &&
    prev.textColor === next.textColor &&
    prev.knownWordColor === next.knownWordColor &&
    prev.knownWords === next.knownWords &&
    prev.readingMode === next.readingMode
  );
});

InteractiveParagraph.displayName = 'InteractiveParagraph';

export default InteractiveParagraph;
