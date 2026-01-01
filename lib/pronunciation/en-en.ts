import type { PronunciationRule } from './types';

// English-to-English pronunciation guide. This is primarily for layout testing
// and for learners who want a quick phonetic reminder without switching
// languages. Keep the rules short and conversational to fit compact UI cards.
export const en_en_rules: PronunciationRule[] = [
  // Digraphs & blends
  { pattern: 'tch', phoneme: 'ch', explanation: "like 'ch' in 'catch'" },
  { pattern: 'th', phoneme: 'th', explanation: "like 'th' in 'this'" },
  { pattern: 'sh', phoneme: 'sh', explanation: "like 'sh' in 'shoe'" },
  { pattern: 'ch', phoneme: 'ch', explanation: "like 'ch' in 'chair'" },
  { pattern: 'ck', phoneme: 'k', explanation: "like 'k' in 'back'" },
  { pattern: 'ph', phoneme: 'f', explanation: "like 'f' in 'phone'" },
  { pattern: 'gh', phoneme: 'g/f', explanation: "hard 'g' or silent as in 'laugh'" },
  { pattern: 'wh', phoneme: 'w/hw', explanation: "soft 'w' in 'when'; sometimes 'hw' in careful speech" },
  { pattern: 'qu', phoneme: 'kw', explanation: "like 'kw' in 'quick'" },
  // Soft c / g before e, i, y
  { pattern: /c(?=[eiy])/i, phoneme: 's', explanation: "soft 's' sound before e, i, y" },
  { pattern: /g(?=[eiy])/i, phoneme: 'j', explanation: "soft 'j' sound before e, i, y" },

  // Vowel combos
  { pattern: 'igh', phoneme: 'eye', explanation: "like 'eye' in 'high'" },
  { pattern: 'oo', phoneme: 'oo', explanation: "like 'oo' in 'moon'" },
  { pattern: 'ou', phoneme: 'ow', explanation: "like 'ow' in 'house'" },
  { pattern: 'ow', phoneme: 'oh/ow', explanation: "oh in 'snow' or ow in 'cow'" },
  { pattern: 'oa', phoneme: 'oh', explanation: "like 'oh' in 'boat'" },
  { pattern: 'ea', phoneme: 'ee', explanation: "like 'ee' in 'eat'" },
  { pattern: 'ee', phoneme: 'ee', explanation: "like 'ee' in 'see'" },
  { pattern: 'ie', phoneme: 'ee/eye', explanation: "ee in 'field' or eye in 'pie'" },
  { pattern: 'ei', phoneme: 'ay/ee', explanation: "ay in 'vein' or ee in 'ceiling'" },
  { pattern: 'ai', phoneme: 'ay', explanation: "like 'ay' in 'rain'" },
  { pattern: 'ay', phoneme: 'ay', explanation: "like 'ay' in 'day'" },
  { pattern: 'ey', phoneme: 'ay', explanation: "like 'ay' in 'they'" },
  { pattern: 'oy', phoneme: 'oy', explanation: "like 'oy' in 'boy'" },
  { pattern: 'aw', phoneme: 'aw', explanation: "like 'aw' in 'saw'" },
  { pattern: 'er', phoneme: 'er', explanation: "like 'er' in 'her'" },
  { pattern: 'ir', phoneme: 'er', explanation: "like 'er' in 'bird'" },
  { pattern: 'ur', phoneme: 'er', explanation: "like 'er' in 'fur'" },
  { pattern: 'ar', phoneme: 'ar', explanation: "like 'ar' in 'car'" },
  { pattern: 'or', phoneme: 'or', explanation: "like 'or' in 'fork'" },

  // Common suffix cues
  { pattern: 'ing', phoneme: "ing", explanation: "like 'ing' in 'sing'" },
  { pattern: 'tion', phoneme: 'shun', explanation: "like 'shun' in 'action'" },
  { pattern: 'sion', phoneme: 'zhun', explanation: "soft 'zh' as in 'vision'" },
  { pattern: 'ed', phoneme: 'd/ed', explanation: "often 'd' (played), sometimes 'ed' (wanted)" },
  { pattern: 'ly', phoneme: 'lee', explanation: "like 'lee' in 'quickly'" },

  // Silent-e patterns (vowel + consonant + e)
  { pattern: /a(?=[^aeiou]e)/i, phoneme: 'ay', explanation: "long 'a' as in 'cake'" },
  { pattern: /e(?=[^aeiou]e)/i, phoneme: 'ee', explanation: "long 'e' as in 'these'" },
  { pattern: /i(?=[^aeiou]e)/i, phoneme: 'eye', explanation: "long 'i' as in 'time'" },
  { pattern: /o(?=[^aeiou]e)/i, phoneme: 'oh', explanation: "long 'o' as in 'home'" },
  { pattern: /u(?=[^aeiou]e)/i, phoneme: 'yoo/oo', explanation: "long 'u' as in 'cube' or 'oo' as in 'flute'" },
  // Ending y
  { pattern: /y\b/i, phoneme: 'ee/eye', explanation: "ee in 'happy', eye in 'my'" },

  // Single-letter fallbacks
  // { pattern: 'a', phoneme: 'ah/ay', explanation: "short 'a' (cat) or long 'a' (late)" },
  // { pattern: 'e', phoneme: 'eh/ee', explanation: "like 'e' in 'bed' or 'ee' in 'me'" },
  // { pattern: 'i', phoneme: 'ih/eye', explanation: "like 'i' in 'sit' or 'eye' in 'time'" },
  // { pattern: 'o', phoneme: 'ah/oh', explanation: "like 'o' in 'hot' or 'oh' in 'go'" },
  // { pattern: 'u', phoneme: 'uh/oo', explanation: "like 'u' in 'cup' or 'oo' in 'flute'" },
];

