import type { PronunciationRule } from './types';

/**
 * English → Mandarin Chinese Pronunciation Guide
 *
 * For Mandarin speakers learning to read English.
 * Phonemes are shown in Pinyin (with tone marks where helpful).
 *
 * Key principles from linguistic research:
 * 1. Mandarin syllables must end in vowels or nasals (n, ng)
 * 2. English final consonants need vowel appended (t→tè, p→pǔ)
 * 3. Some English sounds don't exist in Mandarin (th, v, z endings)
 *
 * Sources:
 * - Wang & Tong (2022) "Pronunciation Modeling of Foreign Words for Mandarin ASR"
 * - ASHA Mandarin Phoneme Charts
 * - Pinyin Cheatsheet for English Speakers
 *
 * Phoneme Format: Pinyin syllables that Mandarin speakers already know
 */

export const en_zh_rules: PronunciationRule[] = [
  // ==========================================================================
  // SOUNDS THAT DON'T EXIST IN MANDARIN (must approximate)
  // ==========================================================================

  // TH sounds - Mandarin has no /θ/ or /ð/
  { pattern: /\bth(?=e\b|is\b|at\b|ey\b|em\b|eir|ere|ose|an\b)/i, phoneme: 'zè', explanation: '软音 th 像 "the" - 用 zè 代替' },
  { pattern: 'th', phoneme: 'sī', explanation: '硬音 th 像 "think" - 用 sī 代替' },

  // V sound - Mandarin has no /v/, approximate with /w/
  { pattern: 'v', phoneme: 'wēi', explanation: "v 音 - 用 wēi 代替" },

  // Z at end of words - Mandarin can't end in /z/
  { pattern: /z\b/i, phoneme: 'zī', explanation: "词尾 z - 加元音 zī" },

  // ==========================================================================
  // CONSONANT DIGRAPHS
  // ==========================================================================

  { pattern: 'tch', phoneme: 'qī', explanation: '像 "catch" 的 ch' },
  { pattern: 'dge', phoneme: 'jí', explanation: '像 "bridge" 的 j' },
  { pattern: 'sh', phoneme: 'shī', explanation: "像 shī (师)" },
  { pattern: 'ch', phoneme: 'qī', explanation: "像 qī (七) 或 chī (吃)" },
  { pattern: 'wh', phoneme: 'wū', explanation: "像 wū (屋)" },
  { pattern: 'ph', phoneme: 'fū', explanation: "像 fū (夫)" },
  { pattern: 'ck', phoneme: 'kè', explanation: "像 kè (课)" },
  { pattern: 'ng', phoneme: 'ng', explanation: "像 -ng 韵尾" },
  { pattern: 'nk', phoneme: 'ng-kè', explanation: "ng 加 kè" },
  { pattern: 'qu', phoneme: 'kuī', explanation: "像 kuài (快)" },

  // ==========================================================================
  // SPECIAL WORDS/PATTERNS
  // ==========================================================================

  // Words with long O before TH (both, cloth, etc.)
  { pattern: /o(?=th\b)/i, phoneme: 'ōu', explanation: "长音 o 像 ōu (欧)" },

  // ==========================================================================
  // VOWEL COMBINATIONS
  // ==========================================================================

  // Long E sounds
  { pattern: 'ee', phoneme: 'yī', explanation: "像 yī (一)" },
  { pattern: 'ea', phoneme: 'yī', explanation: "像 yī (一)" },
  { pattern: 'ie', phoneme: 'yī', explanation: "像 yī (一)" },

  // Long A sounds
  { pattern: 'ai', phoneme: 'āi', explanation: "像 āi (哎)" },
  { pattern: 'ay', phoneme: 'āi', explanation: "像 āi (哎)" },
  { pattern: 'ey', phoneme: 'āi', explanation: "像 āi (哎)" },
  { pattern: 'ei', phoneme: 'āi', explanation: "像 āi (哎)" },

  // Long O sounds
  { pattern: 'oa', phoneme: 'ōu', explanation: "像 ōu (欧)" },
  { pattern: 'oe', phoneme: 'ōu', explanation: "像 ōu (欧)" },
  { pattern: /ow\b/i, phoneme: 'ōu', explanation: "词尾 ow 像 ōu (欧)" },
  { pattern: 'ow', phoneme: 'ào', explanation: "词中 ow 像 ào (奥)" },

  // OO sounds
  { pattern: 'oo', phoneme: 'wū', explanation: "像 wū (屋)" },
  { pattern: 'ue', phoneme: 'wū', explanation: "像 wū (屋)" },
  { pattern: 'ew', phoneme: 'yōu', explanation: "像 yōu (优)" },

  // OU/OW diphthong (house, cow)
  { pattern: 'ou', phoneme: 'ào', explanation: "像 ào (奥)" },

  // OY sounds
  { pattern: 'oy', phoneme: 'ōi', explanation: "像 o + i 连读" },
  { pattern: 'oi', phoneme: 'ōi', explanation: "像 o + i 连读" },

  // AW sounds
  { pattern: 'aw', phoneme: 'āo', explanation: "像 āo (熬)" },
  { pattern: 'au', phoneme: 'āo', explanation: "像 āo (熬)" },

  // IGH (night, high)
  { pattern: 'igh', phoneme: 'āi', explanation: "像 āi (哎)" },

  // ==========================================================================
  // R-CONTROLLED VOWELS
  // ==========================================================================

  { pattern: 'air', phoneme: 'ěr', explanation: "像 ěr (耳) 带气音" },
  { pattern: 'are', phoneme: 'ěr', explanation: "像 ěr (耳)" },
  { pattern: 'ear', phoneme: 'yīr', explanation: "像 yī + er" },
  { pattern: 'eer', phoneme: 'yīr', explanation: "像 yī + er" },
  { pattern: 'ere', phoneme: 'yīr', explanation: "像 yī + er" },
  { pattern: 'ire', phoneme: 'āir', explanation: "像 āi + er" },
  { pattern: 'ore', phoneme: 'ōr', explanation: "像 ō + er" },
  { pattern: 'oar', phoneme: 'ōr', explanation: "像 ō + er" },
  { pattern: 'our', phoneme: 'àor', explanation: "像 ào + er" },
  { pattern: 'ure', phoneme: 'yōur', explanation: "像 yōu + er" },

  { pattern: 'er', phoneme: 'ěr', explanation: "像 ěr (二)" },
  { pattern: 'ir', phoneme: 'ěr', explanation: "像 ěr (二)" },
  { pattern: 'ur', phoneme: 'ěr', explanation: "像 ěr (二)" },
  { pattern: 'ar', phoneme: 'àr', explanation: "像 à + r" },
  { pattern: 'or', phoneme: 'ōr', explanation: "像 ō + r" },

  // ==========================================================================
  // COMMON SUFFIXES
  // ==========================================================================

  { pattern: /tion\b/i, phoneme: 'shùn', explanation: "像 shùn (顺)" },
  { pattern: /sion\b/i, phoneme: 'zhùn', explanation: "像 zh + un" },
  { pattern: /ture\b/i, phoneme: 'chěr', explanation: "像 chě + r" },
  { pattern: /sure\b/i, phoneme: 'zhěr', explanation: "像 zhě + r" },
  { pattern: /ous\b/i, phoneme: 'ěs', explanation: "像 ě + s 轻读" },
  { pattern: /able\b/i, phoneme: 'ěbù', explanation: "像 ě + bù" },
  { pattern: /ible\b/i, phoneme: 'ěbù', explanation: "像 ě + bù" },
  { pattern: /ing\b/i, phoneme: 'yīng', explanation: "像 yīng (英)" },
  { pattern: /ly\b/i, phoneme: 'lì', explanation: "像 lì (力) 轻读" },
  { pattern: /ty\b/i, phoneme: 'tì', explanation: "像 tì 轻读" },
  { pattern: /ry\b/i, phoneme: 'rì', explanation: "像 rì (日) 轻读" },

  // Past tense -ed (Mandarin speakers often add vowel)
  { pattern: /ted\b/i, phoneme: 'tèd', explanation: "t + è + d" },
  { pattern: /ded\b/i, phoneme: 'dèd', explanation: "d + è + d" },
  { pattern: /ed\b/i, phoneme: 'd', explanation: "轻声 d" },

  // ==========================================================================
  // SILENT-E PATTERNS (Magic E)
  // ==========================================================================

  { pattern: /a(?=[bcdfgklmnprstvz]e\b)/i, phoneme: 'āi', explanation: "长音 a 像 āi (哎)" },
  { pattern: /i(?=[bcdfgklmnprstvz]e\b)/i, phoneme: 'āi', explanation: "长音 i 像 āi (哎)" },
  { pattern: /o(?=[bcdfgklmnprstvz]e\b)/i, phoneme: 'ōu', explanation: "长音 o 像 ōu (欧)" },
  { pattern: /u(?=[bcdfgklmnprstvz]e\b)/i, phoneme: 'yōu', explanation: "长音 u 像 yōu (优)" },
  { pattern: /e(?=[bcdfgklmnprstvz]e\b)/i, phoneme: 'yī', explanation: "长音 e 像 yī (一)" },

  // Final -le (apple, table)
  { pattern: /le\b/i, phoneme: 'ěr', explanation: "像 ěr 轻读" },

  // Final -y as vowel
  { pattern: /y\b/i, phoneme: 'yī', explanation: "像 yī (一) 轻读" },

  // Final silent e
  { pattern: /e\b/i, phoneme: '(静)', explanation: "不发音" },

  // ==========================================================================
  // CONSONANTS (with Mandarin approximations)
  // Word-final consonants need vowel in Mandarin
  // ==========================================================================

  // Consonants that match Mandarin initials
  { pattern: 'b', phoneme: 'bù', explanation: "像 bù (不)" },
  { pattern: 'p', phoneme: 'pǔ', explanation: "像 pǔ (普)" },
  { pattern: 'm', phoneme: 'mù', explanation: "像 mù (木)" },
  { pattern: 'f', phoneme: 'fū', explanation: "像 fū (夫)" },
  { pattern: 'd', phoneme: 'dè', explanation: "像 dè (的)" },
  { pattern: 't', phoneme: 'tè', explanation: "像 tè (特)" },
  { pattern: 'n', phoneme: 'nà', explanation: "像 nà (那)" },
  { pattern: 'l', phoneme: 'lè', explanation: "像 lè (乐)" },
  { pattern: 'g', phoneme: 'gè', explanation: "像 gè (个)" },
  { pattern: 'k', phoneme: 'kè', explanation: "像 kè (课)" },
  { pattern: 'h', phoneme: 'hē', explanation: "像 hē (喝)" },
  { pattern: 'j', phoneme: 'jí', explanation: "像 jí (吉)" },
  { pattern: 's', phoneme: 'sī', explanation: "像 sī (思)" },
  { pattern: 'z', phoneme: 'zī', explanation: "像 zī (资)" },
  { pattern: 'r', phoneme: 'rì', explanation: "像 rì (日)" },
  { pattern: 'w', phoneme: 'wū', explanation: "像 wū (屋)" },
  { pattern: 'y', phoneme: 'yī', explanation: "像 yī (一)" },
  { pattern: 'x', phoneme: 'kèsī', explanation: "k + s 连读" },
  // Soft C before e, i, y
  { pattern: /c(?=[eiy])/i, phoneme: 'sī', explanation: "软 c 像 sī (思)" },
  { pattern: 'c', phoneme: 'kè', explanation: "硬 c 像 kè (课)" },

  // ==========================================================================
  // SINGLE VOWELS (short sounds)
  // ==========================================================================

  { pattern: 'a', phoneme: 'à', explanation: "短音 a 像 à (啊)" },
  { pattern: 'e', phoneme: 'è', explanation: "短音 e 像 è (饿)" },
  { pattern: 'i', phoneme: 'yī', explanation: "短音 i 像 yī (一)" },
  { pattern: 'o', phoneme: 'ào', explanation: "短音 o 像 ào (奥)" },
  { pattern: 'u', phoneme: 'ǔ', explanation: "短音 u 像 ǔ (五)" },
];
