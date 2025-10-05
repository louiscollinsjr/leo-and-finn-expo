import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type TranslationRecord = {
  token_id: string;
  translation: string;
  user_id: string;
};

export function useWordTranslations(defaultUserId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveUserId = useCallback(async (override?: string) => {
    if (override) return override;
    if (defaultUserId) return defaultUserId;
    // Best-effort fetch from auth
    try {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    } catch {
      return null;
    }
  }, [defaultUserId]);

  // Fetch translation for a specific token
  const getTranslation = useCallback(async (tokenId: string, userIdOverride?: string) => {
    setError(null);
    const userId = await resolveUserId(userIdOverride);
    if (!userId) return null;
    const { data, error } = await supabase
      .from('user_token_translations')
      .select('token_id, translation, user_id')
      .eq('token_id', tokenId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      setError(error.message);
      return null;
    }
    return (data as TranslationRecord | null) ?? null;
  }, [resolveUserId]);

  // Upsert a translation for a specific token
  const saveTranslation = useCallback(async (tokenId: string, translation: string, userIdOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const userId = await resolveUserId(userIdOverride);
      if (!userId) throw new Error('Not signed in');
      const { error } = await supabase
        .from('user_token_translations')
        .upsert({ token_id: tokenId, translation, user_id: userId }, { onConflict: 'user_id,token_id' });
      if (error) throw error;
      return { ok: true } as const;
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save translation');
      return { ok: false, error: e } as const;
    } finally {
      setLoading(false);
    }
  }, [resolveUserId]);

  // Mark a word as known in user_vocabulary without assuming translation implies knowledge
  const markKnown = useCallback(async (word: string, userIdOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const userId = await resolveUserId(userIdOverride);
      if (!userId) throw new Error('Not signed in');
      // Check if an entry already exists for this (user, word)
      const { data: existing, error: selErr } = await supabase
        .from('user_vocabulary')
        .select('id, known')
        .eq('user_id', userId)
        .eq('romanian_word', word)
        .limit(1)
        .maybeSingle();
      if (selErr && selErr.code !== 'PGRST116') throw selErr;

      if (existing?.id) {
        const { error: updErr } = await supabase
          .from('user_vocabulary')
          .update({ known: true })
          .eq('id', existing.id);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase
          .from('user_vocabulary')
          .insert({ user_id: userId, romanian_word: word, known: true });
        if (insErr) throw insErr;
      }
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
