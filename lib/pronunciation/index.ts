import { ro_en_rules } from './ro-en';
import { ro_fr_rules } from './ro-fr';
import { rm_en_rules } from './rom-en';
import type { PronunciationRule, PronunciationMatch } from './types';

// Language labels (minimal set for UI)
const LANG_LABELS: Record<string, string> = {
  en: 'English',
  fr: 'French',
  ro: 'Romanian',
  rom: 'Romani'
};

// Guides organized by target language -> native (learner) language
const guidesByTarget: Record<string, Record<string, PronunciationRule[]>> = {
  ro: {
    en: ro_en_rules,
    fr: ro_fr_rules
  },
  rom: {
    en: rm_en_rules
  }
};

export function getPronunciationRules(targetLang: string = 'ro', nativeLang: string = 'en'): PronunciationRule[] {
  const target = guidesByTarget[targetLang];
  if (!target) return guidesByTarget['ro']?.['en'] || [];
  return target[nativeLang] || target['en'] || [];
}

export function listGuidesForTarget(targetLang: string): { native: string; label: string }[] {
  const target = guidesByTarget[targetLang] || {};
  return Object.keys(target).map((native) => ({ native, label: LANG_LABELS[native] || native.toUpperCase() }));
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
