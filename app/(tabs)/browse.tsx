import BookCard from '@/components/BookCard';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { DISCOVER_LAST_SEEN_EVENT } from '@/constants/events';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { BlurView } from 'expo-blur';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Button, DeviceEventEmitter, RefreshControl, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_COVER = require('@/assets/images/bookcovers/BookCover_Blank.png');
const COVER_ASSETS: Record<string, any> = {
  'BookCover_Blank.png': DEFAULT_COVER,
  'BookCover_TheApprenice.png': require('@/assets/images/bookcovers/BookCover_TheApprenice.png'),
  'BookCover_MidnightMusicBox.png': require('@/assets/images/bookcovers/BookCover_MidnightMusicBox.png'),
};

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type Story = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  coverFilename: string | null;
  coverUrl: string | null;
  updated_at: string | null;
};

export default function DiscoverScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const background = Colors[theme].background;
  const navOverlayColor = theme === 'dark' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,1.00)';
  const NAV_BAR_HEIGHT = 44;
  const HEADER_HEIGHT = NAV_BAR_HEIGHT + insets.top;
  const scrollY = useRef(new Animated.Value(0)).current;
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const cacheRef = useRef<Story[] | null>(null);

  const H_PADDING = 36;
  const GAP = 12;
  const MIN_CARD = 120;
  const MIN_COLUMNS = 2;
  const MAX_COLUMNS = 6;
  const { width: windowWidth } = useWindowDimensions();
  const { columns, itemWidth } = useMemo(() => {
    const available = Math.max(0, windowWidth - H_PADDING * 2);
    let cols = Math.floor((available + GAP) / (MIN_CARD + GAP));
    cols = Math.max(MIN_COLUMNS, Math.min(MAX_COLUMNS, cols));
    const w = cols > 0 ? (available - (cols - 1) * GAP) / cols : available;
    return { columns: cols, itemWidth: Math.floor(w) };
  }, [windowWidth]);

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const whiteOverlayOpacity = scrollY.interpolate({
    inputRange: [0, 24, HEADER_HEIGHT * 6],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [0, 20, 80],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const withTimeout = useCallback(async <T,>(promise: Promise<T>, ms = 10000): Promise<T> => {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms)),
    ]);
  }, []);

  const fetchStories = useCallback(async () => {
    console.log('[Discover] Fetching stories…');

    const storiesPromise = supabase
      .from('stories')
      .select(
        `
        id,
        title,
        author,
        description,
        updated_at,
        story_covers!left (
          file_name,
          cdn_url,
          is_primary
        )
      `
      )
      .order('updated_at', { ascending: false, nullsFirst: false });

    const storiesResult = await withTimeout(storiesPromise as unknown as Promise<any>);
    const { data: storiesData, error: storiesError } = storiesResult as { data: any[]; error: any };
    if (storiesError) throw storiesError;

    const transformedData: Story[] = (storiesData ?? [])
      .map((row: any) => {
        if (!row) return null;
        const coverEntries = Array.isArray(row.story_covers) ? row.story_covers : row.story_covers ? [row.story_covers] : [];
        const primaryCover = coverEntries.find((entry: any) => entry?.is_primary) ?? coverEntries[0] ?? null;
        return {
          id: row.id,
          title: row.title ?? 'Untitled story',
          author: row.author ?? null,
          description: row.description ?? null,
          coverFilename: primaryCover?.file_name ?? null,
          coverUrl: primaryCover?.cdn_url ?? null,
          updated_at: row.updated_at ?? null,
        };
      })
      .filter(Boolean) as Story[];

    console.log(`[Discover] Loaded ${transformedData.length} stories`);
    return transformedData;
  }, [withTimeout]);

  const load = useCallback(async (options: { force?: boolean } = {}) => {
    const myId = ++requestIdRef.current;
    setError(null);

    if (!options.force && cacheRef.current) {
      if (!isMountedRef.current || myId !== requestIdRef.current) return;
      setStories(cacheRef.current);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchStories();
      if (!isMountedRef.current || myId !== requestIdRef.current) return;
      cacheRef.current = data;
      setStories(data);
    } catch (e: any) {
      console.error('[Discover] Load error', e);
      if (!isMountedRef.current || myId !== requestIdRef.current) return;
      setError(e?.message ?? 'Failed to load');
      setStories([]);
    } finally {
      if (!isMountedRef.current || myId !== requestIdRef.current) return;
      setLoading(false);
    }
  }, [fetchStories]);

  const onRefresh = useCallback(async () => {
    const myId = ++requestIdRef.current;
    setRefreshing(true);
    setError(null);
    try {
      const data = await fetchStories();
      if (!isMountedRef.current || myId !== requestIdRef.current) return;
      cacheRef.current = data;
      setStories(data);
    } catch (e: any) {
      console.error('[Discover] Refresh error', e);
      if (!isMountedRef.current || myId !== requestIdRef.current) return;
      setError(e?.message ?? 'Failed to refresh');
    } finally {
      if (!isMountedRef.current || myId !== requestIdRef.current) return;
      setRefreshing(false);
      setLoading(false);
    }
  }, [fetchStories]);

  const markDiscoverSeen = useCallback(async () => {
    if (!user?.id) return;

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, last_seen_discover_at: now, updated_at: now }, { onConflict: 'user_id' });
      if (error) throw error;
      DeviceEventEmitter.emit(DISCOVER_LAST_SEEN_EVENT);
    } catch (err) {
      console.error('[Discover] Failed to mark seen', err);
    }
  }, [user?.id]);

  useEffect(() => {
    isMountedRef.current = true;
    load();
    return () => {
      isMountedRef.current = false;
    };
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load({ force: true });
      markDiscoverSeen();
    }, [load, markDiscoverSeen])
  );

  const renderItem = ({ item }: { item: Story }) => {
    const coverSource = item.coverUrl
      ? { uri: item.coverUrl }
      : item.coverFilename && COVER_ASSETS[item.coverFilename]
      ? COVER_ASSETS[item.coverFilename]
      : DEFAULT_COVER;

    return (
      <BookCard
        style={{ width: itemWidth, paddingVertical: 12 }}
        book={{
          id: item.id,
          title: item.title,
          author: item.author ?? 'Unknown author',
          cover: coverSource,
        }}
        onPress={() => router.push(`/reader/${item.id}`)}
      />
    );
  };

  return (
    <SafeAreaView edges={[]} style={{ flex: 1, backgroundColor: background }}>
      <View style={{ flex: 1, backgroundColor: background }}>
        {loading ? (
          <View style={{ flex: 1, paddingTop: HEADER_HEIGHT, paddingHorizontal: 36 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator />
              <ThemedText style={{ marginTop: 8, opacity: 0.7 }}>Loading…</ThemedText>
            </View>
          </View>
        ) : error ? (
          <View style={{ flex: 1, paddingTop: HEADER_HEIGHT, paddingHorizontal: 36 }}>
            <View className="flex-1 items-center justify-center px-6">
              <ThemedText type="subtitle">Unable to load stories</ThemedText>
              <ThemedText style={{ marginTop: 8, textAlign: 'center', opacity: 0.8 }}>{error}</ThemedText>
              <View style={{ marginTop: 16 }}>
                <Button title="Retry" onPress={() => load({ force: true })} />
              </View>
            </View>
          </View>
        ) : stories.length === 0 ? (
          <View style={{ flex: 1, paddingTop: HEADER_HEIGHT, paddingHorizontal: 36 }}>
            <View className="flex-1 items-center justify-center px-6">
              <ThemedText type="subtitle">No stories found</ThemedText>
              <ThemedText style={{ marginTop: 8, textAlign: 'center', opacity: 0.8 }}>
                Stories will appear here once they are published.
              </ThemedText>
            </View>
          </View>
        ) : (
          <Animated.FlatList
            data={stories}
            keyExtractor={(item) => item.id}
            numColumns={columns}
            key={`grid-${columns}`}
            renderItem={renderItem}
            onScroll={
              Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )
            }
            contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 28, paddingHorizontal: H_PADDING }}
            columnWrapperStyle={{ gap: GAP }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled />}
            ListHeaderComponent={
              <Animated.View className="mt-2 mb-6" style={{ opacity: largeTitleOpacity }}>
                <ThemedText type="title" style={{ fontSize: 34, lineHeight: 42, fontWeight: '800', color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                  Discover
                </ThemedText>
              </Animated.View>
            }
          />
        )}

        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: HEADER_HEIGHT,
            paddingTop: insets.top,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AnimatedBlurView
            tint={theme === 'dark' ? 'dark' : 'default'}
            intensity={100}
            style={{
              ...StyleSheet.absoluteFillObject,
              opacity: headerOpacity,
            }}
          />

          <Animated.View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: navOverlayColor,
              opacity: whiteOverlayOpacity,
            }}
          />

          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: StyleSheet.hairlineWidth,
              backgroundColor: 'rgba(0,0,0,0.15)',
              opacity: headerOpacity,
            }}
          />

          <Animated.Text style={{ fontSize: 17, fontWeight: '600', color: theme === 'dark' ? '#ffffff' : '#111827', opacity: titleOpacity }}>
            Discover
          </Animated.Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
