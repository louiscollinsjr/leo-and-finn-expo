import type { PronunciationRule } from './types';

// --- Romani to English Pronunciation Guide (Vlax Dialect) ---
//
// This file provides pronunciation rules for native English speakers learning Romani.
// It is based on the common Vlax Romani orthography, which is largely phonetic.
// Unlike English, letters in Romani almost always represent a single, consistent sound.
//
// NOTE: The order of these rules is important. Longer patterns (like 'čh') must
// come before shorter ones (like 'č' or 'h') to be matched correctly.

export const rm_en_rules: PronunciationRule[] = [
  // --- Aspirated Consonants (Digraphs) ---
  // These are crucial and distinct from their non-aspirated counterparts.
  { pattern: 'čh', phoneme: 'ch-h', explanation: "like 'ch' in 'church', but with a strong puff of air (aspirated)" },
  { pattern: 'kh', phoneme: 'k-h', explanation: "like 'k' in 'king' with a puff of air; contrast with unaspirated 'k' in 'skin'" },
  { pattern: 'ph', phoneme: 'p-h', explanation: "like 'p' in 'pot' with a puff of air; contrast with unaspirated 'p' in 'spin'" },
  { pattern: 'th', phoneme: 't-h', explanation: "like 't' in 'top' with a puff of air; NOT like English 'th'" },

  // --- Other Consonant Combinations (Digraphs) ---
  { pattern: 'dž', phoneme: 'j', explanation: "like 'j' in 'judge' or 'g' in 'gem'" },

  // --- Special Single Consonants ---
  { pattern: 'č', phoneme: 'ch', explanation: "like 'ch' in 'church' (unaspirated, no puff of air)" },
  { pattern: 'š', phoneme: 'sh', explanation: "like 'sh' in 'shoe'" },
  { pattern: 'ž', phoneme: 'zh', explanation: "like the 's' in 'treasure' or the 'g' in 'beige'" },
  { pattern: 'j', phoneme: 'y', explanation: "like 'y' in 'yes'; NEVER like 'j' in 'jam'" },
  { pattern: 'r', phoneme: 'rr', explanation: "a rolled or tapped 'r', as in Spanish 'pero' or Scottish English" },
  { pattern: 'x', phoneme: 'kh', explanation: "a guttural 'kh' sound, like 'ch' in Scottish 'loch'; NOT like aspirated 'k-h'" },
  { pattern: 'ň', phoneme: 'ny', explanation: "like 'ny' in 'canyon' or Spanish 'niño'" },
  { pattern: 'ď', phoneme: 'dy', explanation: "like 'd' in 'duke' (British), or 'dj' in 'Adja'" },

  // --- Vowels (Simple and Consistent) ---
  // Romani vowels are pure and do not glide like many English vowels.
  { pattern: 'a', phoneme: 'ah', explanation: "like 'a' in 'father' or 'spa'" },
  { pattern: 'e', phoneme: 'eh', explanation: "like 'e' in 'bet' or 'met'" },
  { pattern: 'i', phoneme: 'ee', explanation: "like 'ee' in 'see' or 'machine'" },
  { pattern: 'o', phoneme: 'oh', explanation: "like 'o' in 'go' or 'note' (pure, no glide)" },
  { pattern: 'u', phoneme: 'oo', explanation: "like 'oo' in 'moon' or 'flute'" },
  // --- Diphthongs (Gliding Vowel Pairs) ---
// These are pronounced as a single sound that glides from one vowel to another.
{ pattern: 'ai', phoneme: 'eye', explanation: "like 'i' in 'my' or 'eye'; a glide from 'a' to 'i'" },
{ pattern: 'au', phoneme: 'ow', explanation: "like 'ou' in 'house' or 'now'; a glide from 'a' to 'u'" },
{ pattern: 'ei', phoneme: 'ay', explanation: "like 'ay' in 'say' or 'day'; a glide from 'e' to 'i'" },
{ pattern: 'oi', phoneme: 'oy', explanation: "like 'oy' in 'boy' or 'toy'" },
{ pattern: 'ia', phoneme: 'ya', explanation: "like 'ya' in 'yacht'; occurs in some borrowed words" },
{ pattern: 'ii', phoneme: 'ee', explanation: "like 'ee' in 'see'; occurs in some borrowed words" },

  // --- Standard Consonants (mostly as in English) ---
  // Included for completeness.
  // { pattern: 'b', phoneme: 'b', explanation: "like 'b' in 'bed'" },
  // { pattern: 'd', phoneme: 'd', explanation: "like 'd' in 'dog'" },
  // { pattern: 'f', phoneme: 'f', explanation: "like 'f' in 'fish'" },
  // { pattern: 'g', phoneme: 'g', explanation: "like 'g' in 'go' (always hard, never like in 'gem')" },
  // { pattern: 'h', phoneme: 'h', explanation: "like 'h' in 'hat'" },
  // { pattern: 'k', phoneme: 'k', explanation: "like 'k' in 'king' (unaspirated, no puff of air)" },
  // { pattern: 'l', phoneme: 'l', explanation: "like 'l' in 'love'" },
  // { pattern: 'm', phoneme: 'm', explanation: "like 'm' in 'man'" },
  // { pattern: 'n', phoneme: 'n', explanation: "like 'n' in 'no'" },
  // { pattern: 'p', phoneme: 'p', explanation: "like 'p' in 'spot' (unaspirated, no puff of air)" },
  // { pattern: 's', phoneme: 's', explanation: "like 's' in 'see' (never like 'z')" },
  // { pattern: 't', phoneme: 't', explanation: "like 't' in 'stop' (unaspirated, no puff of air)" },
  // { pattern: 'v', phoneme: 'v', explanation: "like 'v' in 'vest'" },
  // { pattern: 'z', phoneme: 'z', explanation: "like 'z' in 'zoo'" }

  // Note: 'c' intentionally omitted as it is not part of the standard Vlax Romani orthography
];