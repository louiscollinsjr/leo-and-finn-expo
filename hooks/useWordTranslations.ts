import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/db';
import { useCallback, useState } from 'react';

export type TranslationRecord = {
  token_id: string;
  translation: string;
  user_id: string;
};

export function useWordTranslations(defaultUserId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const resolveUserId = useCallback((override?: string) => {
    if (override) return override;
    if (defaultUserId) return defaultUserId;
    return user?.id ?? null;
  }, [defaultUserId, user?.id]);

  // Fetch translation for a specific token
  const getTranslation = useCallback(async (tokenId: string, userIdOverride?: string) => {
    setError(null);
    const userId = resolveUserId(userIdOverride);
    if (!userId) return null;
    try {
      const data = await db.getTranslation(tokenId, userId);
      return data;
    } catch (e: any) {
      setError(e?.message ?? 'Failed to get translation');
      return null;
    }
  }, [resolveUserId]);

  // Upsert a translation for a specific token
  const saveTranslation = useCallback(async (tokenId: string, translation: string, userIdOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const userId = resolveUserId(userIdOverride);
      if (!userId) throw new Error('Not signed in');
      await db.upsertTranslation(tokenId, userId, translation);
      return { ok: true } as const;
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save translation');
      return { ok: false, error: e } as const;
    } finally {
      setLoading(false);
    }
  }, [resolveUserId]);

  // Mark a word as known in user_vocabulary
  const markKnown = useCallback(async (word: string, userIdOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const userId = resolveUserId(userIdOverride);
      if (!userId) throw new Error('Not signed in');
      await db.upsertVocabularyEntry(userId, word, true);
      return { ok: true } as const;
    } catch (e: any) {
      setError(e?.message ?? 'Failed to mark word as known');
      return { ok: false, error: e } as const;
    } finally {
      setLoading(false);
    }
  }, [resolveUserId]);

  return { loading, error, getTranslation, saveTranslation, markKnown };
}
