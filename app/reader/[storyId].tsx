import { WordContextBottomSheet } from '@/components/overlays/WordContextBottomSheet';
import ReaderView from '@/components/ReaderView';
import StoryContent from '@/components/StoryContent';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/lib/db';
import { useReaderUI } from '@/providers/ReaderProvider';
import BottomSheet from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';

export default function ReaderScreen() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { wordContext, openWordContext, closeWordContext } = useReaderUI();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const hMargin = Math.max(24, Math.round(width * 0.10));

  // TODO: Load known words from user's vocabulary
  const knownWords = useMemo(() => new Set<string>(), []);

  // Open/close bottom sheet based on word context
  useEffect(() => {
    if (wordContext.word) {
      // Snap to index 1 (75%) for a better initial view
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
      try {
        const story = await db.getStoryById(storyId);
        if (!isMounted) return;
        if (!story) {
          setError('Story not found');
        } else {
          setTitle(story.title ?? '');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message ?? 'Failed to load story');
      }
      setLoading(false);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [storyId]);

  // Handle word long-press from InteractiveParagraph
  const handleWordLongPress = useCallback((word: string, tokenId?: string) => {
    openWordContext({ word, tokenId });
  }, [openWordContext]);

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
          knownWords={knownWords}
          onWordLongPress={handleWordLongPress}
        />
      </ReaderView>

      {/* Word context bottom sheet */}
      <WordContextBottomSheet
        ref={bottomSheetRef}
        word={wordContext.word}
        tokenId={wordContext.tokenId}
        onClose={closeWordContext}
      />
    </ThemedView>
  );
}
