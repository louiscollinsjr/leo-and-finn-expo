import ContinueCard, { ContinueBook } from '@/components/ContinueCard';
import RatingSheet from '@/components/RatingSheet';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Circle, Svg } from 'react-native-svg';

// Animatable BlurView for the header background
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type Book = {
  id: string;
  title: string;
  author: string;
  cover: string;
  status?: 'Finished' | 'In Progress';
};

const continueReading: ContinueBook[] = [
  {
    id: '1',
    title: 'The Secret Life of Walter Mitty',
    author: 'James Thurber',
    cover:'',
    status: 'Finished',
    progress: 1,
    accentColors: ['rgba(227, 170, 45, 0.85)', 'rgba(227, 170, 45, 0.55)'],
  },
  {
    id: '2',
    title: 'Moon Over Manifest',
    author: 'Clare Vanderpool',
    cover:
      'https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=800&auto=format&fit=crop',
    status: 'In Progress',
    progress: 0.35,
    accentColors: ['rgba(72,74,89,0.65)', 'rgba(72,74,89,0.35)'],
  },
  // Added per request
  {
    id: '6',
    title: 'The Adventures of Tom Sawyer',
    author: 'Mark Twain',
    cover:'',
    status: 'In Progress',
    progress: 0.12,
  },
  {
    id: '7',
    title: 'Anne of Green Gables',
    author: 'L. M. Montgomery',
    cover:'',
    status: 'In Progress',
    progress: 0.28,
  },
  {
    id: '8',
    title: 'The Secret Garden',
    author: 'Frances Hodgson Burnett',
    cover:'',
    status: 'In Progress',
    progress: 0.41,
  },
  {
    id: '9',
    title: 'A Christmas Carol',
    author: 'Charles Dickens',
    cover:'',
    status: 'Finished',
    progress: 1,
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

function ProgressRing({ size = 28, strokeWidth = 4, value = 11, total = 30, trackColor, progressColor, showValue = true }) {
  const scheme = useColorScheme();
  const theme = scheme ?? 'light';
  const effectiveTrack = trackColor ?? (theme === 'dark' ? 'rgba(98,211,256,0.3)' : 'rgba(0,0,0,0.08)');
  const effectiveProgress = progressColor ?? (theme === 'dark' ? 'rgba(98,211,256,1.0)' : '#33ade6');
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, total > 0 ? value / total : 0));
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={effectiveTrack} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={effectiveProgress}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-270 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {showValue ? (
        <View style={{ ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: Math.max(10, Math.floor(size * 0.38)), fontWeight: '700', color: effectiveProgress }}>{value}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'default';
  const background = Colors[theme].background;
  const text = Colors[theme].text;
  const secondaryText = theme === 'dark' ? 'rgba(236,237,238,0.7)' : '#71717a';
  const navOverlayColor = theme === 'dark' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,1.00)';
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [sheetVisible, setSheetVisible] = useState(false);
  const [activeBook, setActiveBook] = useState<ContinueBook | null>(null);
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

  // Order Continue list: Finished first
  const sortedContinue = [...continueReading].sort((a, b) => {
    const aFinished = a.status === 'Finished' || (a.progress ?? 0) >= 1;
    const bFinished = b.status === 'Finished' || (b.progress ?? 0) >= 1;
    return Number(bFinished) - Number(aFinished);
  });

  return (
    <SafeAreaView edges={[]} style={{ flex: 1, backgroundColor: background }}>
      <View style={{ flex: 1, backgroundColor: background }}>
        <Animated.ScrollView
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          style={{ backgroundColor: background }}
          contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 28, paddingHorizontal: 36 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Content header row: Title + Progress + Account */}
          <Animated.View
            className="mt-2 mb-6 flex-row items-center justify-between"
            style={{ opacity: largeTitleOpacity }}
          >
            <Text className="text-[34px] font-extrabold text-zinc-900" style={{ fontFamily: '', color: theme === 'dark' ? '#ffffff' : '#111827' }}>Home</Text>
            <View className="flex-row items-center gap-4">
              <View className="pt-1"><ProgressRing size={30} value={11} total={30} /></View>
              <Link href="/account" asChild>
                <Pressable hitSlop={8}>
                  <IconSymbol size={36} name="person.crop.circle" weight="thin" color={colorScheme === 'dark' ? '#fff' : '#111827'} />
                </Pressable>
              </Link>
            </View>
          </Animated.View>

          {/* Continue Section */}
          <SectionTitle style={{ marginBottom: 16, fontSize: 20, fontWeight: 'bold', color: theme === 'dark' ? '#ffffff' : '#111827' }}>Continue</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 30, paddingRight: 0 }}
            style={{ marginHorizontal: -36, marginBottom: 24 }}
          >
            {sortedContinue.map((b, i) => (
              <ContinueCard
                key={b.id}
                book={b}
                rating={ratings[b.id] ?? 0}
                first={i === 0}
                onRatePress={(book) => {
                  setActiveBook(book);
                  setSheetVisible(true);
                }}
              />
            ))}
          </ScrollView>

          {/* Top Picks Section */}
          <SectionTitle style={{ marginBottom: 12, fontSize: 20, fontWeight: 'bold', color: theme === 'dark' ? '#ffffff' : '#111827' }}>Top Picks</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 0, paddingRight: 0 }}
            style={{ marginHorizontal: -36, marginBottom: 16 }}
          >
            {topPicks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </ScrollView>

          {/* Extra content to ensure page is long enough for scroll testing */}
          <SectionTitle style={{ marginTop: 24, marginBottom: 12, fontSize: 20, fontWeight: 'bold', color: text }}>More For You</SectionTitle>
          {Array.from({ length: 20 }).map((_, i) => (
            <View
              key={`filler-${i}`}
              style={{
                marginBottom: 12,
                borderRadius: 16,
                backgroundColor: background,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: text }}>Item {i + 1}</Text>
              <Text style={{ fontSize: 12, color: secondaryText }}>Scroll test content</Text>
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
            tint={theme === 'dark' ? 'dark' : 'default'}
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
              backgroundColor: navOverlayColor, 
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
          <Animated.Text style={{ fontSize: 17, fontWeight: '600', color: theme === 'dark' ? '#ffffff' : '#111827', opacity: titleOpacity }}>
            Home
          </Animated.Text>
        </Animated.View>
      </View>
      {/* Rating Sheet */}
      <RatingSheet
        visible={sheetVisible}
        title={activeBook?.title}
        initialRating={activeBook ? ratings[activeBook.id] ?? 0 : 0}
        onClose={() => setSheetVisible(false)}
        onSave={(value) => {
          if (activeBook) {
            setRatings((prev) => ({ ...prev, [activeBook.id]: value }));
          }
        }}
      />
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

// ContinueCard moved to components/ContinueCard.tsx

function BookCard({ book }: { book: Book }) {
  const theme = useColorScheme() ?? 'light';
  const background = Colors[theme].background;
  const text = Colors[theme].text;
  const secondaryText = theme === 'dark' ? 'rgba(236,237,238,0.7)' : '#71717a';
  return (
    <Pressable style={{ marginHorizontal: 4, width: 176, borderRadius: 16, backgroundColor: background, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
      <Image
        source={{ uri: book.cover }}
        contentFit="cover"
        style={{ height: 224, width: '100%', borderRadius: 8 }}
      />
      <Text numberOfLines={1} style={{ marginTop: 12, fontSize: 14, fontWeight: '600', color: text }}>
        {book.title}
      </Text>
      <Text numberOfLines={2} style={{ fontSize: 12, color: secondaryText }}>
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
