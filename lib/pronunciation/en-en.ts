import type { PronunciationRule } from './types';

// English-to-English pronunciation guide. This is primarily for layout testing
// and for learners who want a quick phonetic reminder without switching
// languages. Keep the rules short and conversational to fit compact UI cards.
export const en_en_rules: PronunciationRule[] = [
  // Digraphs & blends
  { pattern: 'th', phoneme: 'th', explanation: "like 'th' in 'this'" },
  { pattern: 'sh', phoneme: 'sh', explanation: "like 'sh' in 'shoe'" },
  { pattern: 'ch', phoneme: 'ch', explanation: "like 'ch' in 'chair'" },
  { pattern: 'ph', phoneme: 'f', explanation: "like 'f' in 'phone'" },
  { pattern: 'gh', phoneme: 'g/f', explanation: "hard 'g' or silent as in 'laugh'" },

  // Vowel combos
  { pattern: 'oo', phoneme: 'oo', explanation: "like 'oo' in 'moon'" },
  { pattern: 'ou', phoneme: 'ow', explanation: "like 'ow' in 'house'" },
  { pattern: 'ea', phoneme: 'ee', explanation: "like 'ee' in 'eat'" },
  { pattern: 'ai', phoneme: 'ay', explanation: "like 'ay' in 'rain'" },
  { pattern: 'er', phoneme: 'er', explanation: "like 'er' in 'her'" },

  // Common suffix cues
  { pattern: 'ing', phoneme: "ing", explanation: "like 'ing' in 'sing'" },
  { pattern: 'tion', phoneme: 'shun', explanation: "like 'shun' in 'action'" },
  { pattern: 'sion', phoneme: 'zhun', explanation: "soft 'zh' as in 'vision'" },

  // Single-letter fallbacks
  { pattern: 'a', phoneme: 'ah/ay', explanation: "short 'a' (cat) or long 'a' (late)" },
  { pattern: 'e', phoneme: 'eh/ee', explanation: "like 'e' in 'bed' or 'ee' in 'me'" },
  { pattern: 'i', phoneme: 'ih/eye', explanation: "like 'i' in 'sit' or 'eye' in 'time'" },
  { pattern: 'o', phoneme: 'ah/oh', explanation: "like 'o' in 'hot' or 'oh' in 'go'" },
  { pattern: 'u', phoneme: 'uh/oo', explanation: "like 'u' in 'cup' or 'oo' in 'flute'" },
];
