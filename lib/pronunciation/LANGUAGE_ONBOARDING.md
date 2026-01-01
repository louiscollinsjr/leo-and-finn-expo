# Language Onboarding Guide

This document describes how to add pronunciation support for a new reader language.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Pronunciation System                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Book Language (bookLang)     Reader Language (readerLang)     │
│   ─────────────────────────    ────────────────────────────     │
│   What language is the         What language does the           │
│   book written in?             reader speak natively?           │
│                                                                 │
│   Examples:                    Examples:                        │
│   - 'en' (English)             - 'en' (English)                 │
│   - 'ro' (Romanian)            - 'zh' (Mandarin)                │
│   - 'rom' (Romani)             - 'fr' (French)                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

File naming: {bookLang}-{readerLang}.ts
Examples:
  - en-zh.ts  = English book → Mandarin reader
  - en-fr.ts  = English book → French reader
  - ro-en.ts  = Romanian book → English reader
```

## Step-by-Step: Adding a New Reader Language

### 1. Research Phase

Before writing code, gather:

1. **Phoneme inventory** of the reader's native language
   - What sounds exist in their language?
   - What sounds are MISSING that exist in the book language?

2. **Approximation strategies** for missing sounds
   - How do native speakers typically pronounce foreign sounds?
   - What's the closest native sound?

3. **Writing system** for phonemes
   - What script do they read? (Latin, Cyrillic, Hanzi, etc.)
   - Use their native script for phonemes when possible

### 2. Useful Resources

| Resource | URL | Best For |
|----------|-----|----------|
| CMU Pronouncing Dictionary | cmudict | English word → phoneme lookup |
| ipa-dict (GitHub) | open-dict-data/ipa-dict | IPA for many languages |
| MFA Dictionaries | montreal-forced-aligner | 20+ language dictionaries |
| ASHA Phoneme Charts | asha.org | Clinical phoneme comparisons |
| Wikipedia IPA Help | Help:IPA/{language} | IPA with audio examples |

### 3. Create the Rules File

Create `lib/pronunciation/{bookLang}-{readerLang}.ts`:

```typescript
import type { PronunciationRule } from './types';

/**
 * {Book Language} → {Reader Language} Pronunciation Guide
 *
 * For {reader language} speakers learning to read {book language}.
 *
 * Key challenges for {reader language} speakers:
 * 1. [List sounds that don't exist in reader's language]
 * 2. [List syllable structure differences]
 * 3. [List other challenges]
 *
 * Sources:
 * - [Academic paper or resource]
 * - [Phoneme chart reference]
 */

export const {bookLang}_{readerLang}_rules: PronunciationRule[] = [
  // ==========================================================================
  // SOUNDS MISSING IN READER'S LANGUAGE (must approximate)
  // ==========================================================================

  // Example: English 'th' doesn't exist in Mandarin
  { pattern: 'th', phoneme: 'sī', explanation: "用 sī 代替 th" },

  // ==========================================================================
  // CONSONANT COMBINATIONS
  // ==========================================================================

  // ... more rules

  // ==========================================================================
  // VOWEL COMBINATIONS
  // ==========================================================================

  // ... more rules

  // ==========================================================================
  // SINGLE LETTERS (fallbacks)
  // ==========================================================================

  // ... more rules
];
```

### 4. Register in index.ts

```typescript
// Add import
import { en_xx_rules } from './en-xx';

// Add to LANG_LABELS
const LANG_LABELS: Record<string, string> = {
  // ... existing
  xx: 'Language Name',
};

// Add to guidesByBookLang
const guidesByBookLang = {
  en: {
    en: en_en_rules,
    zh: en_zh_rules,
    xx: en_xx_rules,  // <-- Add here
  },
  // ...
};
```

### 5. Testing

Test with common words that contain:
- Sounds unique to the book language
- Common digraphs and combinations
- Word-final consonants (problematic for many Asian languages)
- Silent letters

## Phoneme Display Guidelines

### For Languages with Latin Script (French, Spanish, German)
- Use IPA or native spelling conventions
- Example (French): "th" → "s" (as in "zis" for "this")

### For Languages with Non-Latin Script (Chinese, Japanese, Korean, Arabic)
- Use the reader's native script
- Include romanization if helpful
- Example (Mandarin): "th" → "sī (思)"

### For Tonal Languages (Mandarin, Vietnamese, Thai)
- Include tone marks where they help
- Use standard romanization (Pinyin, Quốc ngữ)

## Common Challenges by Language Family

### Chinese (Mandarin/Cantonese)
- No word-final consonants except /n/, /ng/
- No consonant clusters
- No /v/, /θ/, /ð/ sounds
- Must map final consonants to CV syllables

### Japanese
- No /l/ vs /r/ distinction
- Limited consonant clusters
- Vowel insertion after consonants

### Korean
- No /f/, /v/, /θ/, /ð/ sounds
- Different aspiration patterns

### Arabic
- No /p/ (use /b/)
- No short vowels written
- Different vowel inventory

### Spanish/Portuguese
- No /θ/ in most dialects
- Different vowel system
- Syllable-timed rhythm

## Quality Checklist

Before submitting a new language file:

- [ ] All sounds unique to book language have approximations
- [ ] Explanations are in the reader's native language
- [ ] Phonemes use reader's native script/conventions
- [ ] Common suffixes are handled
- [ ] Silent letter patterns are marked
- [ ] Word-final consonants have appropriate treatment
- [ ] File is imported and registered in index.ts
- [ ] TypeScript compiles without errors

## Example: Adding Cantonese (yue)

1. Research Cantonese phonology
2. Note: Similar to Mandarin but different tones, some different finals
3. Create `en-yue.ts` with Jyutping romanization
4. Use Cantonese-specific approximations
5. Register in index.ts under `en: { yue: en_yue_rules }`
