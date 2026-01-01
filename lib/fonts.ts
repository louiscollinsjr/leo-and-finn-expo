/**
 * Font Configuration
 *
 * Easy font switching for testing different typography.
 * Change the active font by updating the export at the bottom.
 */

export type FontFamily =
  | 'LibreBaskerville-Regular'
  | 'Lora-Regular'
  | 'Mansalva-Regular'
  | 'PatrickHand-Regular'
  | 'PatrickHandSC-Regular'
  | 'TisaSansPro-Regular'
  | 'Inter-Regular';

interface FontConfig {
  name: string;
  displayName: string;
  regular: string;
  italic?: string;
  bold?: string;
  medium?: string;
}

export const AVAILABLE_FONTS: Record<FontFamily, FontConfig> = {
  'LibreBaskerville-Regular': {
    name: 'LibreBaskerville-Regular',
    displayName: 'Libre Baskerville',
    regular: 'LibreBaskerville-Regular',
    italic: 'LibreBaskerville-Italic',
    bold: 'LibreBaskerville-Bold',
  },
  'Lora-Regular': {
    name: 'Lora-Regular',
    displayName: 'Lora',
    regular: 'Lora-Regular',
    italic: 'Lora-Italic',
    bold: 'Lora-Bold',
  },
  'Mansalva-Regular': {
    name: 'Mansalva-Regular',
    displayName: 'Mansalva',
    regular: 'Mansalva-Regular',
  },
  'PatrickHand-Regular': {
    name: 'PatrickHand-Regular',
    displayName: 'Patrick Hand',
    regular: 'PatrickHand-Regular',
  },
  'PatrickHandSC-Regular': {
    name: 'PatrickHandSC-Regular',
    displayName: 'Patrick Hand SC',
    regular: 'PatrickHandSC-Regular',
  },
  'TisaSansPro-Regular': {
    name: 'TisaSansPro-Regular',
    displayName: 'Tisa Sans Pro',
    regular: 'TisaSansPro-Regular',
    medium: 'TisaSansPro-Medium',
    bold: 'TisaSansPro-Bold',
  },
  'Inter-Regular': {
    name: 'Inter-Regular',
    displayName: 'Inter',
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    bold: 'Inter-Bold',
  },
};

/**
 * Default font for pronunciation mode
 * (Can be overridden via ReaderProvider preferences)
 */
export const DEFAULT_PRONUNCIATION_FONT: FontFamily = 'PatrickHandSC-Regular';

/**
 * Default font for normal reading mode
 */
export const DEFAULT_READING_FONT: FontFamily = 'TisaSansPro-Regular';

/**
 * Get font family string for React Native Text component
 *
 * @param fontKey - The font family key to use
 * @param weight - Font weight variant (regular, bold, italic, medium)
 */
export function getFontFamily(fontKey: FontFamily, weight: 'regular' | 'medium' | 'bold' | 'italic' = 'regular'): string {
  const font = AVAILABLE_FONTS[fontKey];

  switch (weight) {
    case 'bold':
      return font.bold || font.regular;
    case 'medium':
      return font.medium || font.regular;
    case 'italic':
      return font.italic || font.regular;
    default:
      return font.regular;
  }
}
