/**
 * PronunciationWord - Renders a word with phoneme segments stacked below
 *
 * Each word is split into segments using pronunciation rules.
 * Each segment is rendered as a column with the letter(s) on top
 * and the phoneme below, maintaining vertical alignment.
 */
import { getFontFamily } from '@/lib/fonts';
import { findPronunciationMatches, getPronunciationRules } from '@/lib/pronunciation';
import type { PronunciationMatch } from '@/lib/pronunciation/types';
import * as PronConfig from '@/lib/pronunciationConfig';
import { useReaderPrefs } from '@/providers/ReaderProvider';
import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PronunciationWordProps {
  word: string;
  fontSize: number;
  textColor: string;
  phonemeColor?: string;
  isKnown?: boolean;
  knownWordColor?: string;
  bookLang?: string; // Language the book is written in
  readerLang?: string; // Reader's native language
}

interface Segment {
  text: string;
  phoneme: string | null;
}

/**
 * Build segments from pronunciation matches.
 * Fills gaps between matches with segments that have no phoneme.
 */
function buildSegments(word: string, matches: PronunciationMatch[]): Segment[] {
  const segments: Segment[] = [];
  let currentIndex = 0;

  for (const match of matches) {
    // Fill gap before this match (if any)
    if (match.startIndex > currentIndex) {
      const gapText = word.substring(currentIndex, match.startIndex);
      segments.push({ text: gapText, phoneme: null });
    }
    
    // Add the matched segment
    segments.push({
      text: match.text,
      phoneme: match.pronunciation.toUpperCase(),
    });
    
    currentIndex = match.endIndex + 1;
  }

  // Fill any remaining text after last match
  if (currentIndex < word.length) {
    segments.push({ text: word.substring(currentIndex), phoneme: null });
  }

  return segments;
}

const PronunciationWord = memo(({
  word,
  fontSize,
  textColor,
  phonemeColor = PronConfig.PHONEME_COLOR,
  isKnown = false,
  knownWordColor = PronConfig.KNOWN_WORD_COLOR,
  bookLang = 'en',
  readerLang = 'en',
}: PronunciationWordProps) => {
  // Use centralized config for sizing
  const phonemeFontSize = PronConfig.getPhonemeSize(fontSize);

  const segments = useMemo(() => {
    const rules = getPronunciationRules(bookLang, readerLang);
    const matches = findPronunciationMatches(word, rules);
    return buildSegments(word, matches);
  }, [word, bookLang, readerLang]);

  const { prefs } = useReaderPrefs();

  // Word font comes from user preference, phoneme font is always Patrick Hand SC
  const wordFont = getFontFamily(prefs.pronunciationFont);
  const phonemeFont = getFontFamily(PronConfig.PHONEME_FONT);

  return (
    <View style={styles.wordContainer}>
      {segments.map((segment, i) => {
        // Use config to determine segment color
        const segmentColor = PronConfig.getSegmentColor(!!segment.phoneme, isKnown);

        return (
          <View key={`${word}-seg-${i}`} style={styles.segmentColumn}>
            {/* Letter(s) on top - uses word font (user configurable) */}
            <Text
              allowFontScaling={PronConfig.ALLOW_FONT_SCALING}
              style={[
                styles.letterText,
                {
                  fontSize,
                  color: segmentColor,
                  fontFamily: wordFont,
                  letterSpacing: PronConfig.WORD_LETTER_SPACING,
                },
              ]}
            >
              {segment.text}
            </Text>
            {/* Phoneme below - always Patrick Hand SC */}
            <Text
              allowFontScaling={PronConfig.ALLOW_FONT_SCALING}
              style={[
                styles.phonemeText,
                {
                  fontSize: phonemeFontSize,
                  color: phonemeColor,
                  minHeight: phonemeFontSize + 2,
                  fontFamily: phonemeFont,
                  fontWeight: PronConfig.PHONEME_FONT_WEIGHT,
                },
              ]}
            >
              {segment.phoneme || ' '}
            </Text>
          </View>
        );
      })}
    </View>
  );
});

PronunciationWord.displayName = 'PronunciationWord';

const styles = StyleSheet.create({
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: PronConfig.WORD_BOTTOM_MARGIN,
  },
  segmentColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: PronConfig.SEGMENT_MIN_WIDTH,
    paddingHorizontal: PronConfig.SEGMENT_PADDING,
  },
  letterText: {
    textAlign: 'center',
    includeFontPadding: !PronConfig.REMOVE_FONT_PADDING,
  },
  phonemeText: {
    textAlign: 'center',
    includeFontPadding: !PronConfig.REMOVE_FONT_PADDING,
    marginTop: PronConfig.WORD_PHONEME_GAP,
  },
});

export default PronunciationWord;
