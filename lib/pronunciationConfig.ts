/**
 * Pronunciation Mode Display Configuration
 *
 * Quick access to all pronunciation display settings for easy testing.
 * Change any value here and it will instantly update the pronunciation mode display.
 */

import type { FontFamily } from './fonts';

// ============================================================================
// FONTS
// ============================================================================

/**
 * Font for the main word text (the word being pronounced)
 * User can change this in settings, but this is the default.
 * // Web app style (current)
export const PRONUNCIATION_FONT: FontFamily = 'PatrickHandSC-Regular';

// Try classic serif
export const PRONUNCIATION_FONT: FontFamily = 'LibreBaskerville-Regular';

// Try modern serif
export const PRONUNCIATION_FONT: FontFamily = 'Lora-Regular';

// Try playful handwriting
export const PRONUNCIATION_FONT: FontFamily = 'Mansalva-Regular';

 */
export const DEFAULT_WORD_FONT: FontFamily = 'LibreBaskerville-Regular';

/**
 * Font for phoneme guides (the pronunciation helpers below each word)
 * This is ALWAYS Patrick Hand SC for consistency with web app.
 */
export const PHONEME_FONT: FontFamily = 'PatrickHandSC-Regular';

// ============================================================================
// COLORS
// ============================================================================

/**
 * Color for matched word segments (segments with pronunciation rules)
 * Web app uses bright red for matched segments
 */
export const MATCHED_SEGMENT_COLOR = '#FF0000'; // Red

/**
 * Color for unmatched word segments (no pronunciation rule)
 * Web app uses blue for unmatched text
 */
export const UNMATCHED_SEGMENT_COLOR = '#367dc2'; // Blue

/**
 * Color for phoneme guide text (pronunciation helpers)
 * Web app uses blue for phoneme guides
 */
export const PHONEME_COLOR = '#367dc2'; // Blue

/**
 * Color for known words (words user has marked as known)
 * Lighter blue to distinguish from unknown words
 */
export const KNOWN_WORD_COLOR = '#5a8fc7'; // Light Blue

// ============================================================================
// SIZING
// ============================================================================

/**
 * Default base font size for pronunciation mode (in points)
 * This overrides the app's default typography base size.
 *
 * Examples:
 * - 19.2 = app default
 * - 24 = larger, easier to read
 * - 16 = smaller, more compact
 *
 * NOTE: Bottom sheet font adjustments will scale from this base.
 */
export const DEFAULT_PRONUNCIATION_FONT_SIZE = 30;

/**
 * Base font scale multiplier for pronunciation mode
 * Applied on top of DEFAULT_PRONUNCIATION_FONT_SIZE
 * User adjustments in bottom sheet modify this.
 *
 * Examples:
 * - 1.0 = use DEFAULT_PRONUNCIATION_FONT_SIZE as-is
 * - 1.2 = 20% larger than DEFAULT_PRONUNCIATION_FONT_SIZE
 * - 0.9 = 10% smaller than DEFAULT_PRONUNCIATION_FONT_SIZE
 */
export const DEFAULT_PRONUNCIATION_FONT_SCALE = 1.0;

/**
 * Phoneme font size as percentage of word font size
 *
 * Examples:
 * - 0.50 = phonemes are 50% of word size
 * - 0.45 = phonemes are 45% of word size
 * - 0.60 = phonemes are 60% of word size
 */
export const PHONEME_SIZE_RATIO = 0.45;

/**
 * Line height multiplier for pronunciation mode
 *
 * Examples:
 * - 1.0 = normal line height
 * - 1.2 = 20% more space between lines
 * - 0.9 = 10% tighter
 */
export const PRONUNCIATION_LINE_HEIGHT_SCALE = 1.4;

// ============================================================================
// SPACING
// ============================================================================

/**
 * Horizontal space between words (in pixels)
 */
export const WORD_SPACING = 10;

/**
 * Horizontal space after punctuation (in pixels)
 * Should be tighter than word spacing
 */
export const PUNCTUATION_SPACING = 2;

/**
 * Vertical space between sentences (in pixels)
 * Web app uses generous spacing for easy scrolling
 */
export const SENTENCE_SPACING = 40;

/**
 * Vertical space before chapter/heading titles (in pixels)
 */
export const CHAPTER_SPACING_BEFORE = 60;

/**
 * Vertical space after chapter/heading titles (in pixels)
 */
export const CHAPTER_SPACING_AFTER = 30;

/**
 * Minimum width for each character segment (in pixels)
 * Smaller = tighter kerning, Larger = more spread out
 */
export const SEGMENT_MIN_WIDTH = 6;

/**
 * Horizontal padding for each character segment (in pixels)
 */
export const SEGMENT_PADDING = 0.5;

/**
 * Vertical gap between word and phoneme (in pixels)
 * Positive = more space, Negative = tighter
 */
export const WORD_PHONEME_GAP = 10;

/**
 * Extra vertical space for word containers (in pixels)
 */
export const WORD_BOTTOM_MARGIN = 6;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

/**
 * Font weight for phoneme guides
 * '400' = normal, '500' = medium, '600' = semibold, '700' = bold
 */
export const PHONEME_FONT_WEIGHT: '400' | '500' | '600' | '700' = '600';

/**
 * Letter spacing for word text (in pixels)
 * Positive = more spread out, Negative = tighter, 0 = normal
 */
export const WORD_LETTER_SPACING = 1;

/**
 * Remove extra font padding on Android
 * true = tighter text, false = default padding
 */
export const REMOVE_FONT_PADDING = true;

/**
 * Text rendering settings for crisp, clear fonts
 * These settings improve text clarity on both iOS and Android
 */
export const TEXT_ALIGN_VERTICAL = 'center' as const;
export const ALLOW_FONT_SCALING = false; // Prevents system font scaling from affecting layout

// ============================================================================
// CHAPTER/HEADING STYLING
// ============================================================================

/**
 * Font size multiplier for chapter/heading titles
 * Applied to base font size
 *
 * Examples:
 * - 1.5 = 50% larger than body text
 * - 2.0 = double the body text size
 * - 1.2 = 20% larger than body text
 */
export const CHAPTER_FONT_SIZE_MULTIPLIER = 1.2;

/**
 * Color for chapter/heading titles in pronunciation mode
 * Uses same color scheme as body text by default
 */
export const CHAPTER_TEXT_COLOR = '#000000'; // Same blue as pronunciation text

/**
 * Font weight for chapter/heading titles
 */
export const CHAPTER_FONT_WEIGHT: '400' | '500' | '600' | '700' | '800' = '700';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate phoneme font size based on word font size
 */
export function getPhonemeSize(wordFontSize: number): number {
  return Math.round(wordFontSize * PHONEME_SIZE_RATIO);
}

/**
 * Get word segment color based on whether it has a pronunciation
 */
export function getSegmentColor(hasPronunciation: boolean, isKnown: boolean): string {
  if (hasPronunciation) {
    return MATCHED_SEGMENT_COLOR;
  }
  return isKnown ? KNOWN_WORD_COLOR : UNMATCHED_SEGMENT_COLOR;
}
