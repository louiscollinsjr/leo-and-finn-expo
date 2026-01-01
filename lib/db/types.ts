/**
 * Database-agnostic types and interfaces.
 * These abstractions allow swapping database providers without changing app code.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Core entity types (matching your Postgres schema)
// ─────────────────────────────────────────────────────────────────────────────

export type Story = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  updated_at: string | null;
  // Language the book is written in (e.g., 'en', 'ro', 'rom') - used for pronunciation mode
  language_code: string | null;
};

export type StoryCover = {
  id: string;
  story_id: string;
  file_name: string | null;
  storage_path: string | null;
  cdn_url: string | null;
  is_primary: boolean;
};

export type StoryWithCover = Story & {
  coverFilename: string | null;
  coverUrl: string | null;
};

export type UserSettings = {
  user_id: string;
  last_seen_discover_at: string | null;
  updated_at: string | null;
};

export type UserStoryProgress = {
  user_id: string;
  story_id: string;
  updated_at: string | null;
};

export type StoryRevision = {
  id: string;
  story_id: string;
  rev: number;
};

export type Chapter = {
  id: string;
  story_id: string;
  title: string | null;
  position: number;
};

export type Segment = {
  id: string;
  chapter_id: string;
  story_revision_id: string;
  seg_index: number | null;
  kind: string | null;
};

export type Token = {
  id: string;
  segment_id: string;
  tok_index: number;
  text: string;
  token_type: string;
};

export type UserTokenTranslation = {
  token_id: string;
  user_id: string;
  translation: string;
};

export type UserVocabulary = {
  id: string;
  user_id: string;
  romanian_word: string;
  known: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Database adapter interface
// ─────────────────────────────────────────────────────────────────────────────

export interface DatabaseAdapter {
  // Stories
  getStories(): Promise<StoryWithCover[]>;
  getStoryById(id: string): Promise<Story | null>;
  
  // User library (stories with progress)
  getUserLibrary(userId: string): Promise<StoryWithCover[]>;
  
  // User settings
  getUserSettings(userId: string): Promise<UserSettings | null>;
  upsertUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void>;
  
  // Story content (for reader)
  getStoryRevisions(storyId: string): Promise<StoryRevision[]>;
  getChapters(storyId: string): Promise<Chapter[]>;
  getSegmentsByRevisionIds(revisionIds: string[]): Promise<Segment[]>;
  getTokensBySegmentIds(segmentIds: string[]): Promise<Token[]>;
  
  // Discover badge
  countStoriesUpdatedSince(since: string): Promise<number>;
  
  // Translations
  getTranslation(tokenId: string, userId: string): Promise<UserTokenTranslation | null>;
  upsertTranslation(tokenId: string, userId: string, translation: string): Promise<void>;
  
  // Vocabulary
  getVocabularyEntry(userId: string, word: string): Promise<UserVocabulary | null>;
  upsertVocabularyEntry(userId: string, word: string, known: boolean): Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Query result wrapper (for error handling)
// ─────────────────────────────────────────────────────────────────────────────

export type QueryResult<T> = {
  data: T | null;
  error: Error | null;
};
