import type { PronunciationRule } from './types';

// Pronunciation rules for native French speakers learning Romanian.
export const ro_fr_rules: PronunciationRule[] = [
  // Special Romanian vowels
  { pattern: 'ă', phoneme: 'ə', explanation: "comme le 'e' dans 'le' (schwa)" },
  { pattern: 'â', phoneme: 'ɨ', explanation: "un son guttural, similaire au 'e' russe" },
  { pattern: 'î', phoneme: 'ɨ', explanation: "un son guttural, similaire au 'e' russe" },
  { pattern: 'i', phoneme: 'i', explanation: "comme 'i' dans 'lit'" },
  { pattern: 'u', phoneme: 'u', explanation: "comme 'ou' dans 'chou'" },
  // NOTE: You would add the rest of the rules here.
];
