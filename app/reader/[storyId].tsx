import { ReaderSettingsSheet } from '@/components/overlays/ReaderSettingsSheet';
import { WordTranslationSheet } from '@/components/overlays/WordTranslationSheet';
import ReaderView from '@/components/ReaderView';
import StoryContent from '@/components/StoryContent';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/lib/db';
import { useReaderUI } from '@/providers/ReaderProvider';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';

export default function ReaderScreen() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { wordContext, openWordContext, closeWordContext, setPronunciationLang } = useReaderUI();
  const wordSheetRef = useRef<TrueSheet>(null);
  const settingsSheetRef = useRef<TrueSheet>(null);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const hMargin = Math.max(24, Math.round(width * 0.10));

  // TODO: Calculate actual page count and current page from scroll position
  const pageCount = 42;
  const currentPage = 12;

  // TODO: Load known words from user's vocabulary
  const knownWords = useMemo(() => new Set<string>(), []);

  // Open word sheet when a word is selected (dismiss handled manually)
  useEffect(() => {
    if (wordContext.word) {
      wordSheetRef.current?.present();
    }
  }, [wordContext.word]);

  const openSettings = useCallback(() => {
    settingsSheetRef.current?.present();
  }, []);

  const closeSettings = useCallback(() => {
    settingsSheetRef.current?.dismiss();
  }, []);

  const closeWordSheet = useCallback(() => {
    wordSheetRef.current?.dismiss();
    closeWordContext();
  }, [closeWordContext]);

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
          // Set book language for pronunciation mode (default to English if not specified)
          // readerLang comes from user preferences (not stored per-book)
          setPronunciationLang({
            bookLang: story.language_code ?? 'en',
          });
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
    <>
      {/* Hide header for immersive reading */}
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ThemedView style={{ flex: 1 }}>
        <ReaderView
          title={title}
          loading={loading}
          error={error}
          onBack={() => router.back()}
          onOpenSettings={openSettings}
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

        {/* Word translation sheet */}
        <WordTranslationSheet
          ref={wordSheetRef}
          word={wordContext.word}
          tokenId={wordContext.tokenId}
          onClose={closeWordSheet}
        />

        {/* Reader settings sheet */}
        <ReaderSettingsSheet
          ref={settingsSheetRef}
          onClose={closeSettings}
        />
      </ThemedView>
    </>
  );
}
