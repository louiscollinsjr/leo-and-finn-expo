# Font Testing Guide

## Quick Font Swap

To change the pronunciation mode font, edit `lib/fonts.ts` and change this line:

```typescript
export const PRONUNCIATION_FONT: FontFamily = 'PatrickHandSC-Regular';
```

## Available Fonts

### 1. **Patrick Hand SC** (Small Caps) - Web App Style
```typescript
export const PRONUNCIATION_FONT: FontFamily = 'PatrickHandSC-Regular';
```
- Handwritten, small caps style
- Matches your web app design
- Best for pronunciation guides
- Playful, educational feel

### 2. **Patrick Hand** (Regular)
```typescript
export const PRONUNCIATION_FONT: FontFamily = 'PatrickHand-Regular';
```
- Casual handwriting
- Similar to Patrick Hand SC but not small caps
- Good for informal reading

### 3. **Libre Baskerville** (Classic Serif)
```typescript
export const PRONUNCIATION_FONT: FontFamily = 'LibreBaskerville-Regular';
```
- Classic serif font
- Excellent readability
- Professional appearance
- Has bold and italic variants

### 4. **Lora** (Modern Serif)
```typescript
export const PRONUNCIATION_FONT: FontFamily = 'Lora-Regular';
```
- Contemporary serif
- Well-balanced, readable
- Great for body text
- Has bold and italic variants

### 5. **Mansalva** (Handwritten)
```typescript
export const PRONUNCIATION_FONT: FontFamily = 'Mansalva-Regular';
```
- Playful handwriting style
- Informal, friendly
- Good for children's content

### 6. **Tisa Sans Pro** (Default)
```typescript
export const PRONUNCIATION_FONT: FontFamily = 'TisaSansPro-Regular';
```
- Clean sans-serif
- Current default for reading mode
- Professional, modern

### 7. **Inter** (System Font)
```typescript
export const PRONUNCIATION_FONT: FontFamily = 'Inter-Regular';
```
- Modern system font
- Excellent screen readability
- Neutral, versatile

## Font Variants

Some fonts have additional weights:

```typescript
// Get specific font weights
getFontFamily('pronunciation', 'regular')  // Regular weight
getFontFamily('pronunciation', 'bold')     // Bold weight
getFontFamily('pronunciation', 'italic')   // Italic variant
getFontFamily('pronunciation', 'medium')   // Medium weight (if available)
```

## Reading vs Pronunciation Fonts

You can set different fonts for different modes:

```typescript
// In lib/fonts.ts

// For pronunciation mode (with phoneme guides)
export const PRONUNCIATION_FONT: FontFamily = 'PatrickHandSC-Regular';

// For normal reading mode
export const READING_FONT: FontFamily = 'TisaSansPro-Regular';
```

## Testing Tips

1. **For Web App Matching**: Use `PatrickHandSC-Regular`
2. **For Readability**: Use `LibreBaskerville-Regular` or `Lora-Regular`
3. **For Playful Learning**: Use `Mansalva-Regular` or `PatrickHand-Regular`
4. **For Professional Look**: Use `TisaSansPro-Regular` or `Inter-Regular`

## File Locations

- **Font Configuration**: `lib/fonts.ts` - Change active fonts here
- **Font Loading**: `app/_layout.tsx` - All fonts are loaded at app startup
- **Pronunciation Component**: `components/PronunciationWord.tsx` - Uses pronunciation font
- **Reader Text**: Uses reading font (configurable per mode)

## Examples

### Match Web App (Patrick Hand SC)
```typescript
export const PRONUNCIATION_FONT: FontFamily = 'PatrickHandSC-Regular';
```

### Classic Book Look (Libre Baskerville)
```typescript
export const PRONUNCIATION_FONT: FontFamily = 'LibreBaskerville-Regular';
```

### Modern Digital (Lora)
```typescript
export const PRONUNCIATION_FONT: FontFamily = 'Lora-Regular';
```

Just change the constant, reload the app, and the new font will be applied to all pronunciation mode text!
