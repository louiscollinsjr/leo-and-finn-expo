import ContinueCard, { ContinueBook } from '@/components/ContinueCard';
import FeaturedStory from '@/components/FeaturedStory';
import RatingSheet from '@/components/RatingSheet';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Circle, Svg } from 'react-native-svg';

// Animatable BlurView for the header background
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Book = {
  id: string;
  title: string;
  author: string;
  cover: string;
  progress?: number;
};

type Story = {
  id: string;
  title: string;
  description?: string;
  cover: string;
};

const continueReading = [
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

type ProgressRingProps = {
  size?: number;
  strokeWidth?: number;
  value?: number;
  total?: number;
  trackColor?: string;
  progressColor?: string;
  showValue?: boolean;
};

function ProgressRing({
  size = 28,
  strokeWidth = 4,
  value = 11,
  total = 30,
  trackColor,
  progressColor,
  showValue = true,
}: ProgressRingProps) {
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
  const theme = (colorScheme ?? 'light') as 'light' | 'dark';
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
  const { user } = useAuth();
  const router = useRouter();

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
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 24 }}>
            {/* Title */}
            <Animated.View
              style={[
                { opacity: largeTitleOpacity as any },
                { flex: 1 },
              ]}
            >
              <Text
                className="text-[34px] font-extrabold text-zinc-900"
                style={{ fontFamily: '', color: theme === 'dark' ? '#ffffff' : '#111827', marginRight: 12 }}
                numberOfLines={1}
              >
                Home
              </Text>
            </Animated.View>
            
            {/* Right side elements */}
            <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>
              {user && <View style={{ paddingTop: 1, marginRight: 12 }}><ProgressRing size={30} value={11} total={30} /></View>}
              {user ? (
                <Link href="/account" asChild>
                  <Pressable hitSlop={8}>
                    <IconSymbol size={36} name="person.crop.circle" weight="thin" color={colorScheme === 'dark' ? '#fff' : '#111827'} />
                  </Pressable>
                </Link>
              ) : (
                <Pressable
                  onPress={() => router.push('/welcome')}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.9 : 1,
                    backgroundColor: 'transparent',
                  })}
                >
                  <View style={{
                    backgroundColor: theme === 'dark' ? '#ffffff' : '#000000',
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 9999, // Fully rounded pill shape
                    minHeight: 36, // Smaller button height
                    minWidth: 80, // Smaller minimum width
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: theme === 'dark' ? '#ffffff' : '#000000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 1,
                  }}>
                    <Text style={{ 
                      color: theme === 'dark' ? '#000000' : '#ffffff', 
                      fontWeight: '600', // SF Pro Text Semibold
                      fontSize: 13, // Smaller font size
                      textAlign: 'center', 
                      letterSpacing: 0.25 
                    }}>Sign up</Text>
                  </View>
                </Pressable>
              )}
            </View>
          </View>

          {/* Continue Section - Only visible when authenticated */}
          {user && (
            <>
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
            </>
          )}

          {/* Featured Story - Apple Music-style promo banner */}
          <View style={{ 
            marginTop: 12, 
            marginBottom: 12,
            width: '100%',
            alignItems: 'center'
          }}>
            <FeaturedStory 
              story={{
                id: 'featured1',
                title: "Get 3 months for $10.99.",
                description: "3 months for $10.99, then $10.99/month",
                cover: '',
                accentColors: ['#ef4444', '#d10000']
              }}
            />
          </View>
          
          {/* Recently Added Stories */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <SectionTitle style={{ fontSize: 20, fontWeight: 'bold', color: theme === 'dark' ? '#ffffff' : '#111827', marginBottom: 0 }}>Recently Added</SectionTitle>
            <Pressable>
              <Text style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 14 }}>See more</Text>
            </Pressable>
          </View>
          
          {/* 2x2 Grid of Stories - Sized to fill screen width with placeholders */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: 32 }}>
            {[
              { id: 'leo1', title: "Leo's First Day at School", cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop' },
              { id: 'leo2', title: 'Finn and the Magic Map', cover: 'https://images.unsplash.com/photo-1577415124269-fc1140a69e91?q=80&w=600&auto=format&fit=crop' },
              { id: 'leo3', title: 'The Secret Treehouse', cover: 'https://images.unsplash.com/photo-1596997000103-e597b3ca50df?q=80&w=600&auto=format&fit=crop' },
              { id: 'leo4', title: 'Leo and Finn at the Beach', cover: 'https://images.unsplash.com/photo-1520942702018-0862200e6873?q=80&w=600&auto=format&fit=crop' }
            ].map((story, index) => (
              <Pressable 
                key={story.id}
                style={({ pressed }) => ([
                  {
                    // 36px horizontal padding on the ScrollView container, plus 12px gap between columns
                    width: Math.floor((SCREEN_WIDTH - 72 - 12) / 2),
                    height: Math.floor((SCREEN_WIDTH - 72 - 12) / 2),
                    marginBottom: 12,
                    marginRight: index % 2 === 0 ? 12 : 0, // Column gap
                    borderRadius: 12,
                    overflow: 'hidden',
                    opacity: pressed ? 0.9 : 1,
                    backgroundColor: '#e5e7eb' // Light gray placeholder
                  }
                ])}
              >
                {/* Bottom label over placeholder */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 12,
                    justifyContent: 'flex-end',
                  }}
                >
                  <Text style={{ color: '#111827', fontSize: 14, fontWeight: '600' }} numberOfLines={2}>
                    {story.title}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Top Picks Section */}
          <SectionTitle style={{ marginBottom: 12, fontSize: 20, fontWeight: 'bold', color: theme === 'dark' ? '#ffffff' : '#111827' }}>Top Picks</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 0, paddingRight: 0 }}
            style={{ marginHorizontal: -36, marginBottom: 24 }}
          >
            {topPicks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </ScrollView>

          {/* American Classics - Free Books Section */}
          <SectionTitle style={{ marginBottom: 12, fontSize: 20, fontWeight: 'bold', color: theme === 'dark' ? '#ffffff' : '#111827' }}>American Classics</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 0, paddingRight: 0 }}
            style={{ marginHorizontal: -36, marginBottom: 24 }}
          >
            {[
              { id: 'free1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=900&auto=format&fit=crop' },
              { id: 'free2', title: 'Moby Dick', author: 'Herman Melville', cover: 'https://images.unsplash.com/photo-1545290614-5ceedf356882?q=80&w=900&auto=format&fit=crop' },
              { id: 'free3', title: 'The Adventures of Huckleberry Finn', author: 'Mark Twain', cover: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=900&auto=format&fit=crop' },
              { id: 'free4', title: 'Little Women', author: 'Louisa May Alcott', cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=900&auto=format&fit=crop' },
              { id: 'free5', title: 'The Call of the Wild', author: 'Jack London', cover: 'https://images.unsplash.com/photo-1610301111451-4bcfb0a2c3a8?q=80&w=900&auto=format&fit=crop' }
            ].map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </ScrollView>
          
          {/* Categories Section */}
          <SectionTitle style={{ marginBottom: 12, fontSize: 20, fontWeight: 'bold', color: theme === 'dark' ? '#ffffff' : '#111827' }}>Categories</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 }}>
            {[
              { id: 'cat1', name: 'Fiction', icon: 'book' },
              { id: 'cat2', name: 'Non-Fiction', icon: 'book-open' },
              { id: 'cat3', name: 'Children', icon: 'smile' },
              { id: 'cat4', name: 'Fantasy', icon: 'star' },
              { id: 'cat5', name: 'Mystery', icon: 'search' },
              { id: 'cat6', name: 'Science', icon: 'flask' }
            ].map((category) => (
              <Pressable 
                key={category.id}
                style={({ pressed }) => ([
                  {
                    width: '48%',
                    backgroundColor: theme === 'dark' ? '#1c1c1e' : '#f5f5f7',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    opacity: pressed ? 0.8 : 1
                  }
                ])}
              >
                <View style={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: 18, 
                  backgroundColor: theme === 'dark' ? '#2c2c2e' : '#e5e5ea',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 16 }}>📚</Text>
                </View>
                <Text style={{ 
                  fontSize: 15, 
                  fontWeight: '600',
                  color: theme === 'dark' ? '#ffffff' : '#111827'
                }}>{category.name}</Text>
              </Pressable>
            ))}
          </View>

          {/* Extra content to ensure page is long enough for scroll testing */}
          {/* <SectionTitle style={{ marginTop: 24, marginBottom: 12, fontSize: 20, fontWeight: 'bold', color: text }}>More For You</SectionTitle>
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
          ))} */}
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
