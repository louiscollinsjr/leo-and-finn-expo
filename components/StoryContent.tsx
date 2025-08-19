import { ThemedText } from '@/components/ThemedText';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, View, useWindowDimensions } from 'react-native';
import { Block } from '@/types/reader';
import { paginateBlocks } from '@/lib/pagination';
import { createDefaultRegistry, renderWithRegistry } from '@/lib/blockRegistry';
import type { ContentSource } from '@/types/reader';
import { SupabaseContentSource } from '@/adapters/supabase';
import { useReaderPrefs } from '@/providers/ReaderProvider';

type Props = {
  storyId: string;
  mode?: 'scroll' | 'swipe' | 'paged';
  hMargin?: number;
  blocks?: Block[]; // optional pre-provided content (skips fetching)
  contentSource?: ContentSource; // optional adapter, defaults to Supabase
};

export default function StoryContent({ storyId, mode = 'scroll', hMargin, blocks: providedBlocks, contentSource }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localBlocks, setLocalBlocks] = useState<Block[]>([]);
  const isMountedRef = useRef(true);
  const [listWidth, setListWidth] = useState<number | null>(null);
  const [listHeight, setListHeight] = useState<number | null>(null);
  const [pages, setPages] = useState<Block[][]>([]);
  const { width: screenWidth } = useWindowDimensions();
  const { prefs } = useReaderPrefs();
  const baseMargin = hMargin ?? Math.round(screenWidth * 0.08);
  const sidePad = Math.max(20, Math.round(baseMargin * (prefs.marginScale || 1)));
  const registry = createDefaultRegistry({
    sidePad,
    fontScale: prefs.fontScale,
    lineHeightScale: prefs.lineHeightScale,
    typeface: prefs.typeface,
  });
  const dataBlocks = providedBlocks ?? localBlocks;

  useEffect(() => {
    isMountedRef.current = true;
    const load = async () => {
      try {
        setError(null);
        if (!storyId) {
          setLocalBlocks([]);
          setLoading(false);
          return;
        }
        // If blocks are provided, use them directly
        if (providedBlocks) {
          setLocalBlocks(providedBlocks);
          setLoading(false);
          return;
        }
        setLoading(true);
        const source: ContentSource = contentSource ?? new SupabaseContentSource();
        const out = await source.loadStoryBlocks(storyId);
        if (!isMountedRef.current) return;
        setLocalBlocks(out);
      } catch (e: any) {
        console.error('[Reader] Content load error', e);
        if (!isMountedRef.current) return;
        setError(e?.message ?? 'Failed to load content');
      } finally {
        if (!isMountedRef.current) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      isMountedRef.current = false;
    };
  }, [storyId, providedBlocks, contentSource]);

  // Build pages when inputs change (Swipe mode only)
  useEffect(() => {
    if (mode !== 'swipe') return;
    if (!dataBlocks.length) {
      setPages([]);
      return;
    }
    const width = listWidth ?? screenWidth;
    const height = listHeight ?? 0;
    if (width && height) {
      setPages(paginateBlocks(dataBlocks, width, height, sidePad));
    }
  }, [dataBlocks, listWidth, listHeight, screenWidth, mode, sidePad]);

  if (loading) {
    return (
      <View style={{ paddingVertical: 16 }}>
        <ActivityIndicator />
        <ThemedText style={{ marginTop: 8, opacity: 0.7 }}>Loading content…</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ paddingVertical: 16 }}>
        <ThemedText type="subtitle">Unable to load story content</ThemedText>
        <ThemedText style={{ marginTop: 8, opacity: 0.8 }}>{error}</ThemedText>
      </View>
    );
  }

  const renderBlock = (b: Block) => renderWithRegistry(registry, b);

  if (mode === 'scroll') {
    return <View>{dataBlocks.map(renderBlock)}</View>;
  }

  // Swipe and Paged modes using FlatList paging
  const horizontal = mode === 'swipe';
  const pageWidth = horizontal ? (listWidth ?? screenWidth) : undefined;
  if (horizontal) {
    // Swipe: render paginated pages horizontally
    return (
      <FlatList
        style={{ flex: 1 }}
        data={pages}
        keyExtractor={(_item, index) => `page-${index}`}
        key={String(pageWidth)}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onLayout={(e) => {
          setListWidth(e.nativeEvent.layout.width);
          setListHeight(e.nativeEvent.layout.height);
        }}
        renderItem={({ item: pageBlocks }) => (
          <View style={{ width: pageWidth, height: listHeight ?? undefined, paddingVertical: 8 }}>
            {pageBlocks.map(renderBlock)}
          </View>
        )}
      />
    );
  }

  // Paged (vertical) remains one block per page for now
  return (
    <FlatList
      style={{ flex: 1 }}
      data={dataBlocks}
      keyExtractor={(item) => item.key}
      horizontal={false}
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      onLayout={(e) => setListWidth(e.nativeEvent.layout.width)}
      renderItem={({ item }) => (
        <View style={{ width: '100%', paddingVertical: 8 }}>
          {renderBlock(item)}
        </View>
      )}
    />
  );
}
