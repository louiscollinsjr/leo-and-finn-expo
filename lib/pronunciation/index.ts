import { en_en_rules } from './en-en';
import { en_zh_rules } from './en-zh';
import { ro_en_rules } from './ro-en';
import { ro_fr_rules } from './ro-fr';
import { rm_en_rules } from './rom-en';
import type { PronunciationMatch, PronunciationRule } from './types';

// Language labels (minimal set for UI)
export const LANG_LABELS: Record<string, string> = {
  en: 'English',
  fr: 'French',
  ro: 'Romanian',
  rom: 'Romani',
  zh: '中文 (Mandarin)',
  yue: '粵語 (Cantonese)',
};

// Guides organized by book language -> reader's native language
// Example: guidesByBookLang['ro']['en'] = rules for Romanian book read by English speaker
const guidesByBookLang: Record<string, Record<string, PronunciationRule[]>> = {
  ro: {
    en: ro_en_rules,
    fr: ro_fr_rules
  },
  en: {
    en: en_en_rules,
    zh: en_zh_rules, // English book for Mandarin speaker
  },
  rom: {
    en: rm_en_rules
  }
};

/**
 * Get pronunciation rules for a given book language and reader's native language.
 * @param bookLang - The language the book is written in (e.g., 'ro', 'en', 'rom')
 * @param readerLang - The reader's native language (e.g., 'en', 'fr')
 */
export function getPronunciationRules(bookLang: string = 'en', readerLang: string = 'en'): PronunciationRule[] {
  const book = guidesByBookLang[bookLang];
  if (!book) return guidesByBookLang['en']?.['en'] || [];
  return book[readerLang] || book['en'] || [];
}

export function listGuidesForBookLang(bookLang: string): { readerLang: string; label: string }[] {
  const book = guidesByBookLang[bookLang] || {};
  return Object.keys(book).map((lang) => ({ readerLang: lang, label: LANG_LABELS[lang] || lang.toUpperCase() }));
}

export function getLanguageLabel(code: string): string {
  return LANG_LABELS[code] || code.toUpperCase();
}

export function findPronunciationMatches(word: string, rules: PronunciationRule[]): PronunciationMatch[] {
  const matches: PronunciationMatch[] = [];
  const lowerWord = word.toLowerCase();

  // Prefer longer literal sequences first (e.g., 'eu', 'ei') over regex (e.g., /^e/)
  const weight = (rule: PronunciationRule): number => {
    if (typeof rule.pattern === 'string') {
      // Multi-letter literals highest, then single-letter literals
      return rule.pattern.length >= 2 ? 3000 + rule.pattern.length : 1000 + rule.pattern.length;
    }
    const src = rule.pattern.source || '';
    const anchored = src.startsWith('^');
    // Anchored regex (e.g., ^e) should beat single-letter literals, but lose to multi-letter literals
    return anchored ? 2000 + src.length : 500 + src.length;
  };
  const sortedRules = [...rules].sort((a, b) => weight(b) - weight(a));

  let i = 0;
  while (i < lowerWord.length) {
    let matched = false;
    for (const rule of sortedRules) {
      if (typeof rule.pattern === 'string') {
        const patt = rule.pattern.toLowerCase();
        if (lowerWord.startsWith(patt, i)) {
          matches.push({
            text: word.substring(i, i + patt.length),
            pronunciation: rule.phoneme,
            explanation: rule.explanation,
            startIndex: i,
            endIndex: i + patt.length - 1
          });
          i += patt.length;
          matched = true;
          break;
        }
      } else {
        const substr = lowerWord.slice(i);
        // Ensure regex is tested from beginning of substring
        const re = rule.pattern;
        const src = re.source || '';
        // If the rule is anchored with ^, only allow it at the beginning of the word
        if (src.startsWith('^') && i !== 0) {
          continue;
        }
        if (re.global) re.lastIndex = 0; // reset if global
        const m = substr.match(re);
        if (m && m.index === 0) {
          const len = m[0].length;
          matches.push({
            text: word.substring(i, i + len),
            pronunciation: rule.phoneme,
            explanation: rule.explanation,
            startIndex: i,
            endIndex: i + len - 1
          });
          i += len;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      i++;
    }
  }

  return matches;
}

export * from './types';
