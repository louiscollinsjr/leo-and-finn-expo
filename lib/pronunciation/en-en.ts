import type { PronunciationRule } from './types';

/**
 * English-to-English Pronunciation Guide
 *
 * Comprehensive rules for helping readers decode English words.
 * Rules are ordered by specificity - longer/more specific patterns first.
 *
 * Phoneme key (friendly, not ARPAbet):
 *   Vowels:
 *     ah  = "o" in "hot", "a" in "father"
 *     ay  = "a" in "cake", "ai" in "rain"
 *     ee  = "ea" in "eat", "ee" in "see"
 *     eh  = "e" in "bed", "ea" in "head"
 *     eye = "i" in "time", "igh" in "high"
 *     ih  = "i" in "sit", "y" in "gym"
 *     oh  = "o" in "home", "oa" in "boat"
 *     oo  = "oo" in "moon", "u" in "flute"
 *     uh  = "u" in "cup", "o" in "love"
 *     aw  = "aw" in "saw", "au" in "cause"
 *     ow  = "ou" in "house", "ow" in "cow"
 *     oy  = "oy" in "boy", "oi" in "coin"
 *     er  = "er" in "her", "ir" in "bird"
 *     air = "air" in "fair", "are" in "care"
 *     ar  = "ar" in "car", "a" in "father"
 *     or  = "or" in "for", "ore" in "more"
 *     yoo = "u" in "cube", "ue" in "cue"
 */

export const en_en_rules: PronunciationRule[] = [
  // ==========================================================================
  // SILENT LETTERS & SPECIAL COMBINATIONS (highest priority)
  // ==========================================================================

  // Silent letter combinations
  { pattern: 'ght', phoneme: 't', explanation: "gh is silent, just 't'" },
  { pattern: 'gn', phoneme: 'n', explanation: "g is silent before n" },
  { pattern: 'kn', phoneme: 'n', explanation: "k is silent before n" },
  { pattern: 'wr', phoneme: 'r', explanation: "w is silent before r" },
  { pattern: 'mb', phoneme: 'm', explanation: "b is often silent after m" },
  { pattern: 'bt', phoneme: 't', explanation: "b is silent before t (doubt)" },
  { pattern: 'mn', phoneme: 'n', explanation: "m is silent before n (autumn)" },
  { pattern: 'ps', phoneme: 's', explanation: "p is silent before s (psychology)" },

  // ==========================================================================
  // CONSONANT DIGRAPHS & TRIGRAPHS
  // ==========================================================================

  { pattern: 'tch', phoneme: 'ch', explanation: "like 'ch' in 'catch'" },
  { pattern: 'dge', phoneme: 'j', explanation: "like 'j' in 'bridge'" },
  { pattern: 'sch', phoneme: 'sk', explanation: "like 'sk' in 'school'" },

  // TH sounds
  { pattern: /\bth(?=e\b|is\b|at\b|ey\b|em\b|eir|ere|ose|an\b)/i, phoneme: 'th(soft)', explanation: "voiced 'th' as in 'the'" },
  { pattern: 'th', phoneme: 'th', explanation: "like 'th' in 'think'" },

  { pattern: 'sh', phoneme: 'sh', explanation: "like 'sh' in 'ship'" },
  { pattern: 'ch', phoneme: 'ch', explanation: "like 'ch' in 'chair'" },
  { pattern: 'wh', phoneme: 'w', explanation: "like 'w' in 'when'" },
  { pattern: 'ph', phoneme: 'f', explanation: "like 'f' in 'phone'" },
  { pattern: 'ck', phoneme: 'k', explanation: "like 'k' in 'back'" },
  { pattern: 'ng', phoneme: 'ng', explanation: "like 'ng' in 'sing'" },
  { pattern: 'nk', phoneme: 'ngk', explanation: "like 'nk' in 'think'" },
  { pattern: 'qu', phoneme: 'kw', explanation: "like 'kw' in 'quick'" },

  // Double consonants (simplified)
  { pattern: 'bb', phoneme: 'b', explanation: "single 'b' sound" },
  { pattern: 'cc', phoneme: 'k', explanation: "like 'k'" },
  { pattern: 'dd', phoneme: 'd', explanation: "single 'd' sound" },
  { pattern: 'ff', phoneme: 'f', explanation: "single 'f' sound" },
  { pattern: 'gg', phoneme: 'g', explanation: "single 'g' sound" },
  { pattern: 'kk', phoneme: 'k', explanation: "single 'k' sound" },
  { pattern: 'll', phoneme: 'l', explanation: "single 'l' sound" },
  { pattern: 'mm', phoneme: 'm', explanation: "single 'm' sound" },
  { pattern: 'nn', phoneme: 'n', explanation: "single 'n' sound" },
  { pattern: 'pp', phoneme: 'p', explanation: "single 'p' sound" },
  { pattern: 'rr', phoneme: 'r', explanation: "single 'r' sound" },
  { pattern: 'ss', phoneme: 's', explanation: "single 's' sound" },
  { pattern: 'tt', phoneme: 't', explanation: "single 't' sound" },
  { pattern: 'zz', phoneme: 'z', explanation: "single 'z' sound" },

  // ==========================================================================
  // COMMON SUFFIXES (catch before vowel rules)
  // ==========================================================================

  { pattern: /tion\b/i, phoneme: 'shun', explanation: "like 'shun' in 'action'" },
  { pattern: /sion\b/i, phoneme: 'zhun', explanation: "like 'zhun' in 'vision'" },
  { pattern: /cian\b/i, phoneme: 'shun', explanation: "like 'shun' in 'musician'" },
  { pattern: /tious\b/i, phoneme: 'shus', explanation: "like 'shus' in 'cautious'" },
  { pattern: /cious\b/i, phoneme: 'shus', explanation: "like 'shus' in 'precious'" },
  { pattern: /ture\b/i, phoneme: 'cher', explanation: "like 'cher' in 'nature'" },
  { pattern: /sure\b/i, phoneme: 'zher', explanation: "like 'zher' in 'measure'" },
  { pattern: /ous\b/i, phoneme: 'us', explanation: "like 'us' in 'famous'" },
  { pattern: /ious\b/i, phoneme: 'ee-us', explanation: "like 'ee-us' in 'curious'" },
  { pattern: /eous\b/i, phoneme: 'ee-us', explanation: "like 'ee-us' in 'gorgeous'" },
  { pattern: /able\b/i, phoneme: 'uh-bul', explanation: "like 'uh-bul' in 'table'" },
  { pattern: /ible\b/i, phoneme: 'ih-bul', explanation: "like 'ih-bul' in 'possible'" },
  { pattern: /ment\b/i, phoneme: 'ment', explanation: "like 'ment' in 'moment'" },
  { pattern: /ness\b/i, phoneme: 'nis', explanation: "like 'nis' in 'kindness'" },
  { pattern: /less\b/i, phoneme: 'lis', explanation: "like 'lis' in 'careless'" },
  { pattern: /ful\b/i, phoneme: 'ful', explanation: "like 'ful' in 'beautiful'" },
  { pattern: /ing\b/i, phoneme: 'ing', explanation: "like 'ing' in 'running'" },
  { pattern: /ling\b/i, phoneme: 'ling', explanation: "like 'ling' in 'darling'" },
  { pattern: /ly\b/i, phoneme: 'lee', explanation: "like 'lee' in 'quickly'" },
  { pattern: /ty\b/i, phoneme: 'tee', explanation: "like 'tee' in 'city'" },
  { pattern: /ry\b/i, phoneme: 'ree', explanation: "like 'ree' in 'story'" },

  // Past tense -ed
  { pattern: /ted\b/i, phoneme: 'tid', explanation: "like 'tid' in 'wanted'" },
  { pattern: /ded\b/i, phoneme: 'did', explanation: "like 'did' in 'needed'" },
  { pattern: /ed\b/i, phoneme: 'd/t', explanation: "'d' after voiced, 't' after unvoiced" },

  // Plurals -es
  { pattern: /ses\b/i, phoneme: 'siz', explanation: "like 'siz' in 'buses'" },
  { pattern: /zes\b/i, phoneme: 'ziz', explanation: "like 'ziz' in 'buzzes'" },
  { pattern: /ches\b/i, phoneme: 'chiz', explanation: "like 'chiz' in 'matches'" },
  { pattern: /shes\b/i, phoneme: 'shiz', explanation: "like 'shiz' in 'dishes'" },

  // ==========================================================================
  // VOWEL TRIGRAPHS & SPECIAL COMBINATIONS
  // ==========================================================================

  { pattern: 'igh', phoneme: 'eye', explanation: "like 'eye' in 'night'" },
  { pattern: 'eigh', phoneme: 'ay', explanation: "like 'ay' in 'eight'" },
  { pattern: 'augh', phoneme: 'aw', explanation: "like 'aw' in 'caught'" },
  { pattern: 'ough', phoneme: 'oh/oo/aw', explanation: "varies: 'oh' (though), 'oo' (through), 'aw' (thought)" },
  { pattern: 'iew', phoneme: 'yoo', explanation: "like 'yoo' in 'view'" },

  // ==========================================================================
  // VOWEL DIGRAPHS (two vowels together)
  // ==========================================================================

  // EE sounds (long E)
  { pattern: 'ee', phoneme: 'ee', explanation: "like 'ee' in 'see'" },
  { pattern: 'ea', phoneme: 'ee', explanation: "like 'ee' in 'eat'" },
  { pattern: 'ie', phoneme: 'ee', explanation: "like 'ee' in 'field'" },

  // AY sounds (long A)
  { pattern: 'ai', phoneme: 'ay', explanation: "like 'ay' in 'rain'" },
  { pattern: 'ay', phoneme: 'ay', explanation: "like 'ay' in 'day'" },
  { pattern: 'ey', phoneme: 'ay', explanation: "like 'ay' in 'they'" },
  { pattern: 'ei', phoneme: 'ay', explanation: "like 'ay' in 'vein'" },

  // OH sounds (long O)
  { pattern: 'oa', phoneme: 'oh', explanation: "like 'oh' in 'boat'" },
  { pattern: 'oe', phoneme: 'oh', explanation: "like 'oh' in 'toe'" },

  // OO sounds
  { pattern: 'oo', phoneme: 'oo', explanation: "like 'oo' in 'moon'" },
  { pattern: 'ue', phoneme: 'oo', explanation: "like 'oo' in 'blue'" },
  { pattern: 'ui', phoneme: 'oo', explanation: "like 'oo' in 'fruit'" },
  { pattern: 'ew', phoneme: 'oo', explanation: "like 'oo' in 'new'" },

  // OW/OU sounds - tricky, can be "oh" (snow) or "ow" (cow)
  // Common words with "oh" sound: know, show, grow, flow, snow, blow, low, own, bowl
  // Common words with "ow" sound: cow, now, how, down, town, brown, crowd
  { pattern: /ow\b/i, phoneme: 'oh', explanation: "like 'oh' at end of words (snow)" },
  { pattern: 'ow', phoneme: 'ow', explanation: "like 'ow' in 'cow'" },
  { pattern: 'ou', phoneme: 'ow', explanation: "like 'ow' in 'house'" },

  // OY sounds
  { pattern: 'oy', phoneme: 'oy', explanation: "like 'oy' in 'boy'" },
  { pattern: 'oi', phoneme: 'oy', explanation: "like 'oy' in 'coin'" },

  // AW sounds
  { pattern: 'aw', phoneme: 'aw', explanation: "like 'aw' in 'saw'" },
  { pattern: 'au', phoneme: 'aw', explanation: "like 'aw' in 'cause'" },

  // ==========================================================================
  // R-CONTROLLED VOWELS
  // ==========================================================================

  { pattern: 'air', phoneme: 'air', explanation: "like 'air' in 'fair'" },
  { pattern: 'are', phoneme: 'air', explanation: "like 'air' in 'care'" },
  { pattern: 'ear', phoneme: 'eer', explanation: "like 'eer' in 'hear'" },
  { pattern: 'eer', phoneme: 'eer', explanation: "like 'eer' in 'deer'" },
  { pattern: 'ere', phoneme: 'eer', explanation: "like 'eer' in 'here'" },
  { pattern: 'ire', phoneme: 'eye-er', explanation: "like 'eye-er' in 'fire'" },
  { pattern: 'ore', phoneme: 'or', explanation: "like 'or' in 'more'" },
  { pattern: 'oar', phoneme: 'or', explanation: "like 'or' in 'roar'" },
  { pattern: 'our', phoneme: 'ow-er', explanation: "like 'ow-er' in 'hour'" },
  { pattern: 'oor', phoneme: 'or', explanation: "like 'or' in 'door'" },
  { pattern: 'ure', phoneme: 'yoor', explanation: "like 'yoor' in 'pure'" },

  { pattern: 'er', phoneme: 'er', explanation: "like 'er' in 'her'" },
  { pattern: 'ir', phoneme: 'er', explanation: "like 'er' in 'bird'" },
  { pattern: 'ur', phoneme: 'er', explanation: "like 'er' in 'fur'" },
  { pattern: 'ar', phoneme: 'ar', explanation: "like 'ar' in 'car'" },
  { pattern: 'or', phoneme: 'or', explanation: "like 'or' in 'for'" },

  // ==========================================================================
  // SOFT C AND G (before e, i, y)
  // ==========================================================================

  { pattern: /c(?=[eiy])/i, phoneme: 's', explanation: "soft 'c' sounds like 's'" },
  { pattern: /g(?=[eiy])/i, phoneme: 'j', explanation: "soft 'g' sounds like 'j'" },

  // ==========================================================================
  // SILENT-E PATTERNS (Magic E / VCe pattern)
  // These patterns detect when a vowel is followed by consonant + silent e
  // ==========================================================================

  // a_e pattern (cake, make, late)
  { pattern: /a[bcdfgklmnprstvz]e\b/i, phoneme: 'ay_e', explanation: "long 'ay' with silent e" },
  { pattern: /a(?=[bcdfgklmnprstvz]e\b)/i, phoneme: 'ay', explanation: "long 'ay' as in 'cake'" },

  // i_e pattern (time, like, ride)
  { pattern: /i[bcdfgklmnprstvz]e\b/i, phoneme: 'eye_e', explanation: "long 'eye' with silent e" },
  { pattern: /i(?=[bcdfgklmnprstvz]e\b)/i, phoneme: 'eye', explanation: "long 'eye' as in 'time'" },

  // o_e pattern (home, bone, note)
  { pattern: /o[bcdfgklmnprstvz]e\b/i, phoneme: 'oh_e', explanation: "long 'oh' with silent e" },
  { pattern: /o(?=[bcdfgklmnprstvz]e\b)/i, phoneme: 'oh', explanation: "long 'oh' as in 'home'" },

  // u_e pattern (cube, tube, use)
  { pattern: /u[bcdfgklmnprstvz]e\b/i, phoneme: 'yoo_e', explanation: "long 'yoo' with silent e" },
  { pattern: /u(?=[bcdfgklmnprstvz]e\b)/i, phoneme: 'yoo', explanation: "long 'yoo' as in 'cube'" },

  // e_e pattern (these, eve)
  { pattern: /e[bcdfgklmnprstvz]e\b/i, phoneme: 'ee_e', explanation: "long 'ee' with silent e" },
  { pattern: /e(?=[bcdfgklmnprstvz]e\b)/i, phoneme: 'ee', explanation: "long 'ee' as in 'these'" },

  // ==========================================================================
  // WORD-ENDING PATTERNS
  // ==========================================================================

  // Final -le (apple, table, little)
  { pattern: /le\b/i, phoneme: 'ul', explanation: "like 'ul' in 'apple'" },

  // Final -y as vowel
  { pattern: /y\b/i, phoneme: 'ee', explanation: "like 'ee' in 'happy'" },

  // Final silent e (handled above in VCe, but catch remaining)
  { pattern: /e\b/i, phoneme: '(silent)', explanation: "often silent at end of words" },

  // ==========================================================================
  // SINGLE CONSONANTS
  // ==========================================================================

  { pattern: 'b', phoneme: 'b', explanation: "like 'b' in 'boy'" },
  { pattern: 'c', phoneme: 'k', explanation: "hard 'c' like 'k' in 'cat'" },
  { pattern: 'd', phoneme: 'd', explanation: "like 'd' in 'dog'" },
  { pattern: 'f', phoneme: 'f', explanation: "like 'f' in 'fun'" },
  { pattern: 'g', phoneme: 'g', explanation: "hard 'g' like 'g' in 'go'" },
  { pattern: 'h', phoneme: 'h', explanation: "like 'h' in 'hat'" },
  { pattern: 'j', phoneme: 'j', explanation: "like 'j' in 'jump'" },
  { pattern: 'k', phoneme: 'k', explanation: "like 'k' in 'kite'" },
  { pattern: 'l', phoneme: 'l', explanation: "like 'l' in 'love'" },
  { pattern: 'm', phoneme: 'm', explanation: "like 'm' in 'mom'" },
  { pattern: 'n', phoneme: 'n', explanation: "like 'n' in 'nose'" },
  { pattern: 'p', phoneme: 'p', explanation: "like 'p' in 'pen'" },
  { pattern: 'r', phoneme: 'r', explanation: "like 'r' in 'run'" },
  { pattern: 's', phoneme: 's', explanation: "like 's' in 'sun'" },
  { pattern: 't', phoneme: 't', explanation: "like 't' in 'top'" },
  { pattern: 'v', phoneme: 'v', explanation: "like 'v' in 'van'" },
  { pattern: 'w', phoneme: 'w', explanation: "like 'w' in 'win'" },
  { pattern: 'x', phoneme: 'ks', explanation: "like 'ks' in 'box'" },
  { pattern: 'z', phoneme: 'z', explanation: "like 'z' in 'zoo'" },

  // ==========================================================================
  // SINGLE VOWELS (fallbacks - used when no other pattern matches)
  // These are positional - try to give best guess based on context
  // ==========================================================================

  // Short vowels (default for single vowels in closed syllables)
  { pattern: 'a', phoneme: 'ah', explanation: "short 'a' as in 'cat'" },
  { pattern: 'e', phoneme: 'eh', explanation: "short 'e' as in 'bed'" },
  { pattern: 'i', phoneme: 'ih', explanation: "short 'i' as in 'sit'" },
  { pattern: 'o', phoneme: 'ah', explanation: "short 'o' as in 'hot'" },
  { pattern: 'u', phoneme: 'uh', explanation: "short 'u' as in 'cup'" },
  { pattern: 'y', phoneme: 'ih', explanation: "'y' as vowel, like 'i' in 'gym'" },
];
