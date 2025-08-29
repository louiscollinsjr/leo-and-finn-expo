import StoryContent from '@/components/StoryContent';
import ReaderView from '@/components/ReaderView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import WordContextPopover from '@/components/overlays/WordContextPopover';
import { WordContextBottomSheet } from '@/components/overlays/WordContextBottomSheet';
import { supabase } from '@/lib/supabase';
import BottomSheet from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View, useWindowDimensions } from 'react-native';

export default function ReaderScreen() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [useBottomSheet, setUseBottomSheet] = useState(false); // A/B Test toggle
  const bottomSheetRef = useRef<BottomSheet>(null);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const hMargin = Math.max(24, Math.round(width * 0.10));

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
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
          <ThemedText style={{ marginTop: 8, opacity: 0.7 }}>Loading…</ThemedText>
        </View>
      ) : (
        <>
        <ReaderView
          title={title}
          loading={false}
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
              setSelectedWord(w);
              setSelectedTokenId(tokenId ?? null);
              if (useBottomSheet) {
                // Open to the taller middle snap point (75%) for better affordance
                bottomSheetRef.current?.snapToIndex(1);
              } else {
                setPopoverAnchor(anchor ?? null);
                setPopoverVisible(true);
              }
            }}
          />
        </ReaderView>

        {/* A/B Test between Popover and Bottom Sheet */}
        <WordContextPopover
          visible={!useBottomSheet && popoverVisible}
          anchor={popoverAnchor}
          word={selectedWord}
          tokenId={selectedTokenId}
          onClose={() => setPopoverVisible(false)}
        />
        <WordContextBottomSheet
          ref={bottomSheetRef}
          word={selectedWord}
          tokenId={selectedTokenId}
          onClose={() => {
            setSelectedWord(null);
            setSelectedTokenId(null);
          }}
        />

        {/* Temporary A/B test toggle */}
        <Pressable
          onPress={() => setUseBottomSheet(v => !v)}
          style={{
            position: 'absolute',
            bottom: 40,
            right: 20,
            backgroundColor: 'rgba(0,0,0,0.7)',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 20,
            zIndex: 100,
          }}
        >
          <ThemedText style={{ color: 'white' }}>
            {useBottomSheet ? 'Using Sheet' : 'Using Popover'}
          </ThemedText>
        </Pressable>
        </>
      )}
    </ThemedView>
  );
}
