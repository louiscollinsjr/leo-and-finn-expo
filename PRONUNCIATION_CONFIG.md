# Pronunciation Mode Configuration Guide

## Quick Access File

**File**: `lib/pronunciationConfig.ts`

This is your ONE-STOP file for adjusting ALL pronunciation mode display settings. No need to hunt through multiple files - everything is here!

## What You Can Change

### 🎨 Fonts

```typescript
// Main word font (user can change in settings)
DEFAULT_WORD_FONT: 'PatrickHandSC-Regular'

// Phoneme font (always Patrick Hand SC - not user changeable)
PHONEME_FONT: 'PatrickHandSC-Regular'
```

**Available fonts:**
- `'LibreBaskerville-Regular'` - Classic serif
- `'Lora-Regular'` - Modern serif
- `'Mansalva-Regular'` - Handwritten playful
- `'PatrickHand-Regular'` - Casual handwriting
- `'PatrickHandSC-Regular'` - Small caps (web app style) ⭐
- `'TisaSansPro-Regular'` - Clean sans-serif
- `'Inter-Regular'` - System font

### 🎨 Colors

```typescript
MATCHED_SEGMENT_COLOR = '#FF0000'        // Red - segments with pronunciation
UNMATCHED_SEGMENT_COLOR = '#367dc2'      // Blue - segments without pronunciation
PHONEME_COLOR = '#367dc2'                // Blue - phoneme guide text
KNOWN_WORD_COLOR = '#5a8fc7'             // Light Blue - known words
```

### 📐 Sizing

```typescript
PRONUNCIATION_FONT_SCALE = 1.0           // 1.0 = normal, 1.2 = 20% larger
PHONEME_SIZE_RATIO = 0.50                // Phonemes are 50% of word size
PRONUNCIATION_LINE_HEIGHT_SCALE = 1.0    // 1.0 = normal line height
```

### 📏 Spacing

```typescript
WORD_SPACING = 10                        // Horizontal space between words (px)
PUNCTUATION_SPACING = 4                  // Horizontal space after punctuation (px)
SENTENCE_SPACING = 40                    // Vertical space between sentences (px)
SEGMENT_MIN_WIDTH = 6                    // Min width per character segment (px)
SEGMENT_PADDING = 0.5                    // Horizontal padding per segment (px)
WORD_PHONEME_GAP = 2                     // Gap between word and phoneme (px)
WORD_BOTTOM_MARGIN = 0                   // Extra vertical space per word (px)
```

**Note on Spacing**: Word spacing is applied between words, while punctuation spacing is applied after punctuation marks. This allows punctuation to sit close to words while maintaining readable spacing between actual words.

### ✍️ Typography

```typescript
PHONEME_FONT_WEIGHT: '600'               // '400', '500', '600', or '700'
WORD_LETTER_SPACING = 0                  // Letter spacing for words (px)
REMOVE_FONT_PADDING = true               // Remove Android font padding
```

### 📖 Chapter/Heading Styling

```typescript
CHAPTER_SPACING_BEFORE = 60              // Space before chapter titles (px)
CHAPTER_SPACING_AFTER = 30               // Space after chapter titles (px)
CHAPTER_FONT_SIZE_MULTIPLIER = 1.5       // Title size relative to body (1.5 = 50% larger)
CHAPTER_TEXT_COLOR = '#367dc2'           // Title color (blue like body text)
CHAPTER_FONT_WEIGHT: '700'               // Title font weight (bold)
```

## How to Test Changes

1. **Open**: `lib/pronunciationConfig.ts`
2. **Change**: Any value you want
3. **Save**: The file
4. **Reload**: The app
5. **See**: Instant changes in pronunciation mode!

## Common Adjustments

### Make Phonemes Larger
```typescript
PHONEME_SIZE_RATIO = 0.60  // Was 0.50
```

### Increase Sentence Spacing
```typescript
SENTENCE_SPACING = 60  // Was 40
```

### Make Words Tighter
```typescript
WORD_SPACING = 6       // Was 8
SEGMENT_MIN_WIDTH = 4  // Was 6
```

### Change Colors
```typescript
MATCHED_SEGMENT_COLOR = '#E74C3C'      // Different red
PHONEME_COLOR = '#3498DB'               // Different blue
```

### Bolder Phonemes
```typescript
PHONEME_FONT_WEIGHT: '700'  // Was '600'
```

## Font Separation

**Important**: The pronunciation mode now has TWO separate fonts:

1. **Word Font** - User can change in settings
   - Controlled by `DEFAULT_WORD_FONT`
   - User selection saved in preferences
   - Applied to main word text

2. **Phoneme Font** - Always Patrick Hand SC
   - Controlled by `PHONEME_FONT`
   - CANNOT be changed by user
   - Always applied to pronunciation guides
   - Keeps consistent web app style

This means users can test different fonts for the main text while phonemes stay consistently styled!

## Testing Workflow

### Quick Visual Test
1. Change `SENTENCE_SPACING` from `40` to `60`
2. Save file
3. Reload app
4. See more space between sentences ✨

### Font Test
1. Change `DEFAULT_WORD_FONT` to `'LibreBaskerville-Regular'`
2. Save file
3. Reload app
4. Main words now use Libre Baskerville
5. Phonemes still use Patrick Hand SC ✨

### Color Test
1. Change `MATCHED_SEGMENT_COLOR` to `'#E91E63'` (pink)
2. Save file
3. Reload app
4. Matched segments now pink ✨

## Related Files

- **Configuration**: `lib/pronunciationConfig.ts` ⭐ (THIS FILE)
- **Component**: `components/PronunciationWord.tsx` (uses config)
- **Paragraph**: `components/InteractiveParagraph.tsx` (uses config)
- **Provider**: `providers/ReaderProvider.tsx` (stores font preference)

## No More Hunting!

Before: "Where do I change the phoneme size? Is it in PronunciationWord? InteractiveParagraph? A constant somewhere?"

After: "Everything is in `lib/pronunciationConfig.ts`!" 🎉
