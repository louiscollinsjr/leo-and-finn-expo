/**
* Defines the structure for a single pronunciation rule.
* - pattern: The Romanian letter(s) to match.
* - phoneme: A simple phonetic representation (e.g., 'uh', 'sh').
* - explanation: A user-friendly explanation tailored to the native language.
 */
export interface PronunciationRule {
  // Can be a plain string (matched with startsWith) or a RegExp.
  // If RegExp is used, it is tested against the current position (substring)
  // and must match from the beginning of that substring (e.g., use ^ to anchor).
  pattern: string | RegExp;
  phoneme: string;
  explanation: string;
}

/**
* Defines the structure for a match found within a word.
* This will be stored in the lesson data.
 */
export interface PronunciationMatch {
  text: string;          // The matched text from the word (e.g., "ă")
  pronunciation: string; // The corresponding phoneme (e.g., "uh")
  explanation: string;   // The detailed explanation (e.g., "like 'a' in 'about'")
  startIndex: number;
  endIndex: number;
}
