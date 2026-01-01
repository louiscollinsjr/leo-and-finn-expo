/**
 * Neon database adapter.
 * Uses @neondatabase/serverless for direct Postgres access.
 */

import { neon } from '@neondatabase/serverless';
import type {
    Chapter,
    DatabaseAdapter,
    Segment,
    Story,
    StoryRevision,
    StoryWithCover,
    Token,
    UserSettings,
    UserTokenTranslation,
    UserVocabulary,
} from './types';

const DATABASE_URL = process.env.EXPO_PUBLIC_DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('[NeonAdapter] EXPO_PUBLIC_DATABASE_URL not set. Database queries will fail.');
}

// Create the SQL query function
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

function ensureConnection() {
  if (!sql) {
    throw new Error('Database not configured. Set EXPO_PUBLIC_DATABASE_URL.');
  }
  return sql;
}

/**
 * Ensure a user exists in the local users table.
 * Stack Auth manages users externally, so we need to sync them to our DB
 * before any user-related operations (due to FK constraints).
 */
async function ensureUserExists(
  userId: string,
  userData?: { email?: string | null; displayName?: string | null; profileImageUrl?: string | null }
): Promise<void> {
  const db = ensureConnection();
  const now = new Date().toISOString();
  
  await db`
    INSERT INTO users (id, email, display_name, profile_image_url, created_at, updated_at)
    VALUES (
      ${userId}, 
      ${userData?.email ?? null}, 
      ${userData?.displayName ?? null}, 
      ${userData?.profileImageUrl ?? null}, 
      ${now}, 
      ${now}
    )
    ON CONFLICT (id) DO UPDATE SET
      email = COALESCE(EXCLUDED.email, users.email),
      display_name = COALESCE(EXCLUDED.display_name, users.display_name),
      profile_image_url = COALESCE(EXCLUDED.profile_image_url, users.profile_image_url),
      updated_at = ${now}
  `;
}

export class NeonAdapter implements DatabaseAdapter {
  async getStories(): Promise<StoryWithCover[]> {
    const db = ensureConnection();

    const rows = await db`
      SELECT
        s.id,
        s.title,
        s.author,
        s.description,
        s.updated_at,
        s.language_code,
        sc.file_name,
        sc.cdn_url
      FROM stories s
      LEFT JOIN story_covers sc ON sc.story_id = s.id AND sc.is_primary = true
      ORDER BY s.updated_at DESC NULLS LAST
    `;

    return rows.map((row: any) => ({
      id: row.id,
      title: row.title ?? 'Untitled story',
      author: row.author ?? null,
      description: row.description ?? null,
      updated_at: row.updated_at ?? null,
      language_code: row.language_code ?? null,
      coverFilename: row.file_name ?? null,
      coverUrl: row.cdn_url ?? null,
    }));
  }

  async getStoryById(id: string): Promise<Story | null> {
    const db = ensureConnection();

    const rows = await db`
      SELECT id, title, author, description, updated_at, language_code
      FROM stories
      WHERE id = ${id}
      LIMIT 1
    `;

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      title: row.title ?? '',
      author: row.author ?? null,
      description: row.description ?? null,
      updated_at: row.updated_at ?? null,
      language_code: row.language_code ?? null,
    };
  }

  async getUserLibrary(userId: string): Promise<StoryWithCover[]> {
    const db = ensureConnection();

    const rows = await db`
      SELECT
        s.id,
        s.title,
        s.author,
        s.description,
        s.updated_at as story_updated_at,
        s.language_code,
        usp.updated_at as progress_updated_at,
        sc.file_name,
        sc.cdn_url
      FROM user_story_progress usp
      JOIN stories s ON s.id = usp.story_id
      LEFT JOIN story_covers sc ON sc.story_id = s.id AND sc.is_primary = true
      WHERE usp.user_id = ${userId}
      ORDER BY usp.updated_at DESC NULLS LAST
    `;

    return rows.map((row: any) => ({
      id: row.id,
      title: row.title ?? 'Untitled story',
      author: row.author ?? null,
      description: row.description ?? null,
      updated_at: row.progress_updated_at ?? row.story_updated_at ?? null,
      language_code: row.language_code ?? null,
      coverFilename: row.file_name ?? null,
      coverUrl: row.cdn_url ?? null,
    }));
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const db = ensureConnection();
    
    const rows = await db`
      SELECT user_id, last_seen_discover_at, updated_at
      FROM user_settings
      WHERE user_id = ${userId}
      LIMIT 1
    `;
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      user_id: row.user_id,
      last_seen_discover_at: row.last_seen_discover_at ?? null,
      updated_at: row.updated_at ?? null,
    };
  }

  async upsertUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    const db = ensureConnection();
    const now = new Date().toISOString();
    
    // Ensure user exists in local DB before FK-constrained insert
    await ensureUserExists(userId);
    
    await db`
      INSERT INTO user_settings (user_id, last_seen_discover_at, updated_at)
      VALUES (${userId}, ${settings.last_seen_discover_at ?? null}, ${now})
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        last_seen_discover_at = COALESCE(${settings.last_seen_discover_at ?? null}, user_settings.last_seen_discover_at),
        updated_at = ${now}
    `;
  }

  async getStoryRevisions(storyId: string): Promise<StoryRevision[]> {
    const db = ensureConnection();
    
    const rows = await db`
      SELECT id, story_id, rev
      FROM story_revisions
      WHERE story_id = ${storyId}
      ORDER BY rev DESC
    `;
    
    return rows.map((row: any) => ({
      id: row.id,
      story_id: row.story_id,
      rev: row.rev ?? 0,
    }));
  }

  async getChapters(storyId: string): Promise<Chapter[]> {
    const db = ensureConnection();
    
    const rows = await db`
      SELECT id, story_id, title, position
      FROM chapters
      WHERE story_id = ${storyId}
      ORDER BY position ASC
    `;
    
    return rows.map((row: any) => ({
      id: row.id,
      story_id: row.story_id,
      title: row.title ?? null,
      position: row.position ?? 0,
    }));
  }

  async getSegmentsByRevisionIds(revisionIds: string[]): Promise<Segment[]> {
    if (revisionIds.length === 0) return [];
    
    const db = ensureConnection();
    
    const rows = await db`
      SELECT id, chapter_id, story_revision_id, seg_index, kind
      FROM segments
      WHERE story_revision_id = ANY(${revisionIds})
    `;
    
    return rows.map((row: any) => ({
      id: row.id,
      chapter_id: row.chapter_id,
      story_revision_id: row.story_revision_id,
      seg_index: row.seg_index ?? null,
      kind: row.kind ?? null,
    }));
  }

  async getTokensBySegmentIds(segmentIds: string[]): Promise<Token[]> {
    if (segmentIds.length === 0) return [];
    
    const db = ensureConnection();
    
    console.log('[NeonAdapter] getTokensBySegmentIds called with', segmentIds.length, 'segment IDs');
    console.log('[NeonAdapter] First 3 segment IDs:', segmentIds.slice(0, 3));
    
    const rows = await db`
      SELECT id, segment_id, tok_index, text, token_type
      FROM tokens
      WHERE segment_id = ANY(${segmentIds})
      ORDER BY segment_id ASC, tok_index ASC
    `;
    
    console.log('[NeonAdapter] getTokensBySegmentIds returned', rows.length, 'tokens');
    if (rows.length > 0) {
      console.log('[NeonAdapter] First token sample:', rows[0]);
      // Check if returned segment_id is in our list
      const firstTokenSegId = rows[0].segment_id;
      const isInList = segmentIds.includes(firstTokenSegId);
      console.log('[NeonAdapter] First token segment_id', firstTokenSegId, 'in query list:', isInList);
    }
    
    return rows.map((row: any) => ({
      id: row.id,
      segment_id: row.segment_id,
      tok_index: row.tok_index ?? 0,
      text: row.text ?? '',
      token_type: row.token_type ?? 'word',
    }));
  }

  async countStoriesUpdatedSince(since: string): Promise<number> {
    const db = ensureConnection();
    
    const rows = await db`
      SELECT COUNT(*) as count
      FROM stories
      WHERE updated_at > ${since}
    `;
    
    return parseInt(rows[0]?.count ?? '0', 10);
  }

  async getTranslation(tokenId: string, userId: string): Promise<UserTokenTranslation | null> {
    const db = ensureConnection();
    
    const rows = await db`
      SELECT token_id, user_id, translation
      FROM user_token_translations
      WHERE token_id = ${tokenId} AND user_id = ${userId}
      LIMIT 1
    `;
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      token_id: row.token_id,
      user_id: row.user_id,
      translation: row.translation,
    };
  }

  async upsertTranslation(tokenId: string, userId: string, translation: string): Promise<void> {
    const db = ensureConnection();
    
    // Ensure user exists in local DB before FK-constrained insert
    await ensureUserExists(userId);
    
    await db`
      INSERT INTO user_token_translations (token_id, user_id, translation)
      VALUES (${tokenId}, ${userId}, ${translation})
      ON CONFLICT (user_id, token_id) 
      DO UPDATE SET translation = ${translation}
    `;
  }

  async getVocabularyEntry(userId: string, word: string): Promise<UserVocabulary | null> {
    const db = ensureConnection();
    
    const rows = await db`
      SELECT id, user_id, romanian_word, known
      FROM user_vocabulary
      WHERE user_id = ${userId} AND romanian_word = ${word}
      LIMIT 1
    `;
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      id: row.id,
      user_id: row.user_id,
      romanian_word: row.romanian_word,
      known: row.known ?? false,
    };
  }

  async upsertVocabularyEntry(userId: string, word: string, known: boolean): Promise<void> {
    const db = ensureConnection();
    
    // Ensure user exists in local DB before FK-constrained insert
    await ensureUserExists(userId);
    
    await db`
      INSERT INTO user_vocabulary (user_id, romanian_word, known)
      VALUES (${userId}, ${word}, ${known})
      ON CONFLICT (user_id, romanian_word) 
      DO UPDATE SET known = ${known}
    `;
  }
}

// Export singleton instance
export const neonDb = new NeonAdapter();
