import { ThemedText } from '@/components/ThemedText';
import BookCard from '@/components/BookCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/lib/supabase';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Button, Pressable, RefreshControl, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Animatable BlurView for the header background
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type Story = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
};

export default function LibraryScreen() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Theme + header layout (match Home)
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'default';
  const background = Colors[theme].background;
  const navOverlayColor = theme === 'dark' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,1.00)';
  const NAV_BAR_HEIGHT = 44;
  const HEADER_HEIGHT = NAV_BAR_HEIGHT + insets.top;
  const scrollY = useRef(new Animated.Value(0)).current;
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  // Responsive grid settings
  const H_PADDING = 36; // keep in sync with contentContainerStyle
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
    console.log('[Library] Fetching stories…');
    const { data, error } = await withTimeout(
      supabase
        .from('stories')
        .select('id,title,author,description')
        .order('created_at', { ascending: false })
    );
    if (error) throw error;
    console.log(`[Library] Loaded ${data?.length ?? 0} stories`);
    return data ?? [];
  }, [withTimeout]);

  const load = useCallback(async () => {
    const myId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStories();
      if (!isMountedRef.current || myId !== requestIdRef.current) return;
      setStories(data);
    } catch (e: any) {
      console.error('[Library] Load error', e);
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
      setStories(data);
    } catch (e: any) {
      console.error('[Library] Refresh error', e);
      if (!isMountedRef.current || myId !== requestIdRef.current) return;
      setError(e?.message ?? 'Failed to refresh');
    } finally {
      if (!isMountedRef.current || myId !== requestIdRef.current) return;
      // If this refresh superseded an in-flight initial load, ensure we also
      // clear the global loading flag so we don't get stuck on the spinner.
      setRefreshing(false);
      setLoading(false);
    }
  }, [fetchStories]);

  useEffect(() => {
    load();
    return () => {
      isMountedRef.current = false;
    };
  }, [load]);

  const renderItem = ({ item }: { item: Story }) => {
    return (
      <BookCard
        style={{ width: itemWidth, paddingVertical: 12 }}
        book={{
          id: item.id,
          title: item.title,
          author: item.author ?? 'Unknown author',
          cover: '',
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
              <ThemedText type="subtitle">Unable to load library</ThemedText>
              <ThemedText style={{ marginTop: 8, textAlign: 'center', opacity: 0.8 }}>{error}</ThemedText>
              <View style={{ marginTop: 16 }}>
                <Button title="Retry" onPress={load} />
              </View>
            </View>
          </View>
        ) : stories.length === 0 ? (
          <View style={{ flex: 1, paddingTop: HEADER_HEIGHT, paddingHorizontal: 36 }}>
            <View className="flex-1 items-center justify-center px-6">
              <ThemedText type="subtitle">No books yet</ThemedText>
              <ThemedText style={{ marginTop: 8, textAlign: 'center', opacity: 0.8 }}>
                Your saved books will appear here.
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
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListHeaderComponent={
              <Animated.View className="mt-2 mb-6" style={{ opacity: largeTitleOpacity }}>
                <ThemedText type="title" style={{ fontSize: 34, lineHeight: 42, fontWeight: '800', color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                  Library
                </ThemedText>
                {/* <ThemedText style={{ opacity: 0.8, marginTop: 4 }}>Your books</ThemedText> */}
              </Animated.View>
            }
          />
        )}

        {/* Absolute navbar overlay (transparent -> blur) */}
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
          {/* Blur background */}
          <AnimatedBlurView
            tint={theme === 'dark' ? 'dark' : 'default'}
            intensity={100}
            style={{
              ...StyleSheet.absoluteFillObject,
              opacity: headerOpacity,
            }}
          />

          {/* White tint overlay */}
          <Animated.View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: navOverlayColor,
              opacity: whiteOverlayOpacity,
            }}
          />

          {/* Bottom border */}
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

          {/* Title */}
          <Animated.Text style={{ fontSize: 17, fontWeight: '600', color: theme === 'dark' ? '#ffffff' : '#111827', opacity: titleOpacity }}>
            Library
          </Animated.Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
