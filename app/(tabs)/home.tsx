import { IconSymbol } from '@/components/ui/IconSymbol';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React, { useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Animatable BlurView for the header background
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type Book = {
  id: string;
  title: string;
  author: string;
  cover: string;
  status?: 'Finished' | 'In Progress';
};

const continueReading: Book[] = [
  {
    id: '1',
    title: 'The Secret Life of Walter Mitty',
    author: 'James Thurber',
    cover:
      'https://images.unsplash.com/photo-1544937950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
    status: 'Finished',
  },
  {
    id: '2',
    title: 'Moon Over Manifest',
    author: 'Clare Vanderpool',
    cover:
      'https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=800&auto=format&fit=crop',
    status: 'In Progress',
  },
];

const topPicks: Book[] = [
  {
    id: '3',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    cover:
      'https://images.unsplash.com/photo-1529651737248-dad5e287768e?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: '4',
    title: 'Of Mice and Men',
    author: 'John Steinbeck',
    cover:
      'https://images.unsplash.com/photo-1474366521946-c3d4b507abf2?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: '5',
    title: 'Peace Is Every Step',
    author: 'Thich Nhat Hanh',
    cover:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=900&auto=format&fit=crop',
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const NAV_BAR_HEIGHT = 44;
  const HEADER_HEIGHT = NAV_BAR_HEIGHT + insets.top;
  const scrollY = useRef(new Animated.Value(0)).current;

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

  // The solid white overlay starts fully opaque and fades out by half the header height
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

  return (
    <SafeAreaView edges={[]} style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <Animated.ScrollView
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          style={{ backgroundColor: '#ffffff' }}
          contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 28, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Large title (scrolling content area) */}
          <Animated.Text
            style={{ marginTop: 8, marginBottom: 16, fontSize: 34, fontWeight: '800', color: '#18181b', opacity: largeTitleOpacity }}
          >
            Home
          </Animated.Text>

          {/* Continue Section */}
          <SectionTitle style={{ marginBottom: 12, fontSize: 20, fontWeight: 'bold', color: '#18181b' }}>Continue</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 12 }}
            style={{ marginHorizontal: -4, marginBottom: 24 }}
          >
            {continueReading.map((b) => (
              <ContinueCard key={b.id} book={b} />
            ))}
          </ScrollView>

          {/* Top Picks Section */}
          <SectionTitle style={{ fontSize: 20, fontWeight: 'bold', color: '#18181b' }}>Top Picks</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 12 }}
            style={{ marginHorizontal: -4 }}
          >
            {topPicks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </ScrollView>

          {/* Extra content to ensure page is long enough for scroll testing */}
          <SectionTitle style={{ marginTop: 24, marginBottom: 12, fontSize: 20, fontWeight: 'bold', color: '#18181b' }}>More For You</SectionTitle>
          {Array.from({ length: 20 }).map((_, i) => (
            <View
              key={`filler-${i}`}
              style={{
                marginBottom: 12,
                borderRadius: 16,
                backgroundColor: '#ffffff',
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#18181b' }}>Item {i + 1}</Text>
              <Text style={{ fontSize: 12, color: '#71717a' }}>Scroll test content</Text>
            </View>
          ))}
        </Animated.ScrollView>

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
          {/* The new blur background */}
          <AnimatedBlurView
            tint="default"
            intensity={100}
            style={{
              ...StyleSheet.absoluteFillObject,
              opacity: headerOpacity,
            }}
          />

           {/* The custom white tint overlay */}
          <Animated.View
            style={{
              ...StyleSheet.absoluteFillObject,
              // Apple's systemGray6 with 85% opacity
              backgroundColor: 'rgba(255,255,255, 1.00)', 
              opacity: whiteOverlayOpacity, // Start solid, fade to clear by HEADER_HEIGHT/2
    }}
  />

          {/* Fading bottom border */}
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

          {/* The title text */}
          <Animated.Text style={{ fontSize: 17, fontWeight: '600', color: '#111827', opacity: titleOpacity }}>
            Home
          </Animated.Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function SectionTitle({ children, style }: { children: React.ReactNode; style: any }) {
  return (
    <Text style={style}>
      {children}
    </Text>
  );
}

function ContinueCard({ book }: { book: Book }) {
  return (
    <Pressable style={{ marginHorizontal: 4, width: 288, borderRadius: 16, backgroundColor: '#ffffff', padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Image
          source={{ uri: book.cover }}
          contentFit="cover"
          style={{ height: 80, width: 64, borderRadius: 6 }}
        />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '600', color: '#18181b' }}>
            {book.title}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 12, color: '#71717a' }}>
            {book.author}
          </Text>
          <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <IconSymbol size={14} name="checkmark.circle.fill" color="#22c55e" />
            <Text style={{ fontSize: 12, color: '#71717a' }}>{book.status}</Text>
          </View>
          <View style={{ marginTop: 8, height: 1, width: '100%', backgroundColor: '#f4f4f5' }} />
          <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, color: '#71717a' }}>Tap to Rate</Text>
            <View style={{ flexDirection: 'row', gap: 4, opacity: 0.7 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <IconSymbol key={i} size={14} name="star" color="#eab308" />
              ))}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function BookCard({ book }: { book: Book }) {
  return (
    <Pressable style={{ marginHorizontal: 4, width: 176, borderRadius: 16, backgroundColor: '#ffffff', padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
      <Image
        source={{ uri: book.cover }}
        contentFit="cover"
        style={{ height: 224, width: '100%', borderRadius: 8 }}
      />
      <Text numberOfLines={1} style={{ marginTop: 12, fontSize: 14, fontWeight: '600', color: '#18181b' }}>
        {book.title}
      </Text>
      <Text numberOfLines={2} style={{ fontSize: 12, color: '#71717a' }}>
        {book.author}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  testElement: {
    width: '100%',
    height: 40,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
