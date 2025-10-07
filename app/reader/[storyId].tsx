import ReaderView from '@/components/ReaderView';
import StoryContent from '@/components/StoryContent';
import { WordContextBottomSheet } from '@/components/overlays/WordContextBottomSheet';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/lib/supabase';
import { useReaderUI } from '@/providers/ReaderProvider';
import BottomSheet from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';

export default function ReaderScreen() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { wordContext, openWordContext, closeWordContext } = useReaderUI();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const hMargin = Math.max(24, Math.round(width * 0.10));

  // After the selected word is set and committed, open the sheet so the
  // first visible frame already includes the word, avoiding a perceived delay.
  useEffect(() => {
    if (wordContext.word) {
      requestAnimationFrame(() => bottomSheetRef.current?.snapToIndex(1));
    } else {
      bottomSheetRef.current?.close();
    }
  }, [wordContext.word]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!storyId) {
        setError('Story ID is missing');
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('stories')
        .select('title,author')
        .eq('id', storyId)
        .single();
      if (!isMounted) return;
      if (error) setError(error.message);
      else {
        setTitle(data?.title ?? '');
        setAuthor(data?.author ?? null);
      }
      setLoading(false);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [storyId]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ReaderView
          title={title}
          loading={loading}
          error={error}
          onBack={() => router.back()}
          onOpenContents={() => { /* TODO: open contents */ }}
          onOpenSearch={() => { /* TODO: open search */ }}
          onOpenSettings={() => { /* TODO: open settings */ }}
        >
          <StoryContent
            key={`${storyId}-scroll`}
            storyId={storyId as string}
            mode="scroll"
            hMargin={hMargin}
            onWordLongPress={(w, tokenId, anchor) => {
              openWordContext({ word: w, tokenId, anchor });
            }}
          />
        </ReaderView>

      {/* WordContextBottomSheet at root level to avoid z-index/clipping issues */}
      <WordContextBottomSheet
        ref={bottomSheetRef}
        word={wordContext.word}
        tokenId={wordContext.tokenId}
        onClose={closeWordContext}
      />
    </ThemedView>
  );
}
