/**
 * PronunciationWord - Renders a word with phoneme segments stacked below
 * 
 * Each word is split into segments using pronunciation rules.
 * Each segment is rendered as a column with the letter(s) on top
 * and the phoneme below, maintaining vertical alignment.
 */
import { findPronunciationMatches, getPronunciationRules } from '@/lib/pronunciation';
import type { PronunciationMatch } from '@/lib/pronunciation/types';
import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PronunciationWordProps {
  word: string;
  fontSize: number;
  textColor: string;
  phonemeColor?: string;
  isKnown?: boolean;
  knownWordColor?: string;
  targetLang?: string;
  nativeLang?: string;
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
  phonemeColor = '#c41e3a', // Red for phonemes
  isKnown = false,
  knownWordColor = '#4a4a4a',
  targetLang = 'ro',
  nativeLang = 'en',
}: PronunciationWordProps) => {
  const phonemeFontSize = Math.round(fontSize * 0.5);
  
  const segments = useMemo(() => {
    const rules = getPronunciationRules(targetLang, nativeLang);
    const matches = findPronunciationMatches(word, rules);
    return buildSegments(word, matches);
  }, [word, targetLang, nativeLang]);

  const effectiveTextColor = isKnown ? knownWordColor : textColor;

  return (
    <View style={styles.wordContainer}>
      {segments.map((segment, i) => (
        <View key={`${word}-seg-${i}`} style={styles.segmentColumn}>
          {/* Letter(s) on top */}
          <Text
            style={[
              styles.letterText,
              {
                fontSize,
                color: effectiveTextColor,
              },
            ]}
          >
            {segment.text}
          </Text>
          {/* Phoneme below (or empty spacer) */}
          <Text
            style={[
              styles.phonemeText,
              {
                fontSize: phonemeFontSize,
                color: phonemeColor,
                minHeight: phonemeFontSize + 2,
              },
            ]}
          >
            {segment.phoneme || ' '}
          </Text>
        </View>
      ))}
    </View>
  );
});

PronunciationWord.displayName = 'PronunciationWord';

const styles = StyleSheet.create({
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 8, // Space between words
    marginBottom: 4, // Extra vertical space for wrapped lines
  },
  segmentColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 12, // Ensure minimum width for alignment
  },
  letterText: {
    textAlign: 'center',
  },
  phonemeText: {
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default PronunciationWord;
