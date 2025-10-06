import { IconSymbol } from '@/components/ui/IconSymbol';
import { ContinueBook } from '@/constants/mockData';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

// ContinueBook type is now imported from constants/mockData.ts

function withOpacity(color: string, alpha: number) {
  // supports hex like #rrggbb or already rgba strings
  if (!color) return `rgba(0,0,0,${alpha})`;
  if (color.startsWith('rgba') || color.startsWith('rgb')) return color;
  const hex = color.replace('#', '');
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2).toString(), 16);
    const g = parseInt(hex.slice(2, 4).toString(), 16);
    const b = parseInt(hex.slice(4, 6).toString(), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(0,0,0,${alpha})`;
}

export default function ContinueCard({ book, onPress, onRatePress, rating, first }: { book: ContinueBook; onPress?: (book: ContinueBook) => void; onRatePress?: (book: ContinueBook) => void; rating?: number; first?: boolean }) {
  const pct = Math.max(0, Math.min(1, book.progress ?? 0));
  const isFinished = book.status === 'Finished' || pct >= 1;

  const [derived, setDerived] = useState<[string, string] | null>(null);
  const [coverError, setCoverError] = useState(false);

  const [c1, c2] = useMemo(() => {
    if (derived) return derived;
    if (book.accentColors) return book.accentColors;
    return ['rgba(0,0,0,0.65)', 'rgba(0,0,0,0.25)'];
  }, [derived, book.accentColors]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Skip on iOS for now to avoid VisionKit errors, and in Expo Go where the native module is unavailable
        if (Platform.OS === 'ios') return;
        if (Constants.appOwnership === 'expo') return;
        // Lazy-load native module to avoid crashing when unavailable (e.g., Expo Go)
        const mod = await import('react-native-image-colors').catch(() => null as any);
        if (!mod || !mod.default || !mod.default.getColors) return;
        const res = await mod.default.getColors(book.cover, {
          cache: true,
          key: book.id,
        });
        if (!isMounted) return;
        // Normalize cross-platform response
        let start: string | undefined;
        let end: string | undefined;
        if (res.platform === 'android') {
          start = res.vibrant || res.dominant || res.average || res.muted || res.darkVibrant;
          end = res.darkVibrant || res.muted || res.dominant || res.average || res.vibrant;
        } else if (res.platform === 'ios') {
          start = (res.primary as string) || (res.background as string) || (res.detail as string);
          end = (res.secondary as string) || (res.detail as string) || (res.background as string);
        } else {
          // web
          start = res.lightVibrant || res.vibrant || res.dominant || res.average || '#000000';
          end = res.darkVibrant || res.muted || res.darkMuted || '#000000';
        }

        const a = withOpacity(start || '#000000', 0.75);
        const b = withOpacity(end || '#000000', 0.4);
        setDerived([a, b]);
      } catch (e) {
        // ignore and keep fallback
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [book.cover, book.id]);

  const imageSource = useMemo(() => {
    if (coverError) return null;
    if (book.posterImage) return book.posterImage;
    if (book.cover) return { uri: book.cover };
    return null;
  }, [book.posterImage, book.cover, coverError]);

  return (
    <Pressable
      onPress={() => onPress?.(book)}
      style={[
        styles.card,
        { paddingHorizontal: 12, paddingVertical: 12, width: 288, height: isFinished ? 130 : 110 },
        { marginLeft: first ? 0 : 10, marginRight: 10 },
      ]}
    >
      {/* Background mask keeps rounded corners without clipping foreground shadows */}
      <View style={[StyleSheet.absoluteFill, { borderRadius: 16, overflow: 'hidden' }]} pointerEvents="none">
        {/* Blurred, zoomed background using the cover */}
        {imageSource ? (
          <Image
            source={imageSource}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={isFinished ? 60 : 38}
            // slight zoom for the background
            transition={100}
            onError={() => setCoverError(true)}
          />
        ) : null}
        {/* darken/brand gradient overlay */}
        <LinearGradient colors={[c1, c1]} style={StyleSheet.absoluteFill} />
      </View>

      {/* Column layout: top content row + bottom rating row */}
      <View style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {/* Top row: cover + text */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Cover with isolated shadow */}
          <View
            style={{
              width: 64,
              height: 78,
              borderRadius: 0,
              // iOS shadow - stronger and biased to bottom-right
              shadowColor: '#000',
              shadowOffset: { width: 3, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              // Android shadow - stronger
              elevation: 12,
              backgroundColor: 'transparent',
            }}
          >
            <View style={{ flex: 1, borderRadius: 0, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.0)' }}>
              {/* Shadow container  oslid black @ 1.0 to see the shadow */}
              {imageSource ? (
                <Image
                  source={imageSource}
                  contentFit="cover"
                  transition={100}
                  style={{ flex: 1 }}
                  onError={() => setCoverError(true)}
                />
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol size={24} name="books.vertical.fill" color="#ffffff" />
                </View>
              )}
            </View>
          </View>

          {/* Text column (truncates) + menu column */}
          <View style={{ flex: 1, minWidth: 0, maxWidth: 130, paddingRight: 4, justifyContent: 'center' }}>
            <Text numberOfLines={2} ellipsizeMode="tail" style={styles.title}>{book.title}</Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.subtitle}>{book.author}</Text>
            <View style={{ marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {isFinished ? (
                <IconSymbol size={14} name="checkmark.circle.fill" color="#ffffff" />
              ) : null}
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.metaText}>
                {isFinished ? 'Finished' : `Book • ${Math.round(pct * 100)}%`}
              </Text>
            </View>
          </View>

          {/* context menu column */}
          <Pressable
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="More options"
            style={{ padding: 4, alignSelf: 'center', marginLeft: 'auto' }}
            onPress={() => {}}
          >
            <IconSymbol size={16} name="ellipsis" color="rgba(255,255,255,0.9)" />
          </Pressable>
        </View>

        {/* Bottom row: rating (full width) */}
        {isFinished ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => onRatePress?.(book)}
            style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}
            className=""
          >
            <Text style={styles.rateLabel}>Tap to Rate</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginLeft: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => {
                const idx = i + 1;
                const current = rating ?? 0;
                const active = current >= idx;
                const cue = current === 0 && idx === 1; // highlight first star as a hint
                const showActive = active || cue;
                return (
                  <IconSymbol key={idx} size={22} name="star.fill" color={showActive ? 'rgba(255,255,255,1.0)' : 'rgba(255,255,255,0.4)'} />
                );
              })}
            </View>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 288,
    borderRadius: 16,
    overflow: 'visible',
    padding: 12,

    // subtle card elevation while preserving bg effects
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  metaText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.70)',
    fontWeight: '500',
  },
  rateLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,1.0)',
    fontWeight: '700',
  },
});
