import { BookCard } from "@/components/BookCard";
import FeaturedStory from "@/components/FeaturedStory";
import LevelsCard from "@/components/LevelsCard";
import RatingSheet from "@/components/RatingSheet";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import type { ContinueBook } from "@/constants/mockData";
import {
  americanClassics,
  continueReading,
  featuredStories,
  topPicks,
} from "@/constants/mockData";
import { useAuth } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Circle, Svg } from "react-native-svg";

import { Button, Host, Text as SwiftText } from "@expo/ui/swift-ui";
import { frame, glassEffect, padding } from "@expo/ui/swift-ui/modifiers";

// Animatable BlurView for the header background
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Book = {
  id: string;
  title: string;
  author: string;
  cover: string;
  progress?: number;
  accentColors?: string[];
};

type Story = {
  id: string;
  title: string;
  description?: string;
  cover: string;
};

// Mock data moved to constants/mockData.ts

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
  const theme = scheme ?? "light";
  const effectiveTrack =
    trackColor ??
    (theme === "dark" ? "rgba(98,211,256,0.3)" : "rgba(0,0,0,0.08)");
  const effectiveProgress =
    progressColor ?? (theme === "dark" ? "rgba(98,211,256,1.0)" : "#33ade6");
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, total > 0 ? value / total : 0));
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={effectiveTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
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
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: Math.max(10, Math.floor(size * 0.38)),
              fontWeight: "700",
              color: effectiveProgress,
            }}
          >
            {value}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = (colorScheme ?? "light") as "light" | "dark";
  const background = Colors[theme].background;
  const text = Colors[theme].text;
  const secondaryText = theme === "dark" ? "rgba(236,237,238,0.7)" : "#71717a";
  const navOverlayColor =
    theme === "dark" ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,1.00)";
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [sheetVisible, setSheetVisible] = useState(false);
  const [activeBook, setActiveBook] = useState<ContinueBook | null>(null);
  const NAV_BAR_HEIGHT = 44;
  const HEADER_HEIGHT = NAV_BAR_HEIGHT + insets.top;
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user } = useAuth();
  const router = useRouter();

  const fadeStart = 0;
  const fadeHold = 12;
  const fadeEnd = 48;

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, fadeEnd],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, fadeEnd],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [fadeStart, fadeHold, fadeEnd],
    outputRange: [1, 1, 0],
    extrapolate: "clamp",
  });

  const largeTitleScale = scrollY.interpolate({
    inputRange: [fadeStart, fadeEnd],
    outputRange: [1, 0.95],
    extrapolate: "clamp",
  });

  const profileOpacity = scrollY.interpolate({
    inputRange: [fadeStart, fadeHold, fadeEnd],
    outputRange: [1, 1, 0],
    extrapolate: "clamp",
  });

  const profileScale = scrollY.interpolate({
    inputRange: [fadeStart, fadeEnd],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  // Header slides up and fades out as content pushes it
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, fadeEnd],
    outputRange: [0, -30],
    extrapolate: "clamp",
  });

  // Order Continue list: Finished first
  const sortedContinue = [...continueReading].sort((a, b) => {
    const aFinished = a.status === "Finished" || (a.progress ?? 0) >= 1;
    const bFinished = b.status === "Finished" || (b.progress ?? 0) >= 1;
    return Number(bFinished) - Number(aFinished);
  });

  // Featured Stories moved to constants/mockData.ts

  return (
    <SafeAreaView edges={[]} style={{ flex: 1, backgroundColor: background }}>
      <View style={{ flex: 1, backgroundColor: background }}>
        <Animated.ScrollView
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          style={{ flex: 1, backgroundColor: background }}
          contentContainerStyle={{
            paddingTop: insets.top + 4,
            paddingBottom: 96,
            paddingHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header row: Title + Profile - scrolls with content */}
          <Animated.View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 12,
              paddingBottom: 16,
              opacity: largeTitleOpacity,
              transform: [{ translateY: headerTranslateY }],
            }}
          >
            <Animated.View
              style={{
                flex: 1,
                transform: [{ scale: largeTitleScale }],
              }}
            >
              <Text
                className="text-[34px] font-extrabold text-zinc-900"
                style={{
                  fontFamily: "",
                  color: theme === "dark" ? "#ffffff" : "#111827",
                  marginRight: 12,
                }}
                numberOfLines={1}
              >
                Home
              </Text>
            </Animated.View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {user ? (
                <Animated.View
                  style={{
                    transform: [{ scale: profileScale }],
                  }}
                >
                  <Link href="/account" asChild>
                    <Pressable hitSlop={8}>
                      <IconSymbol
                        size={36}
                        name="person.crop.circle"
                        color={colorScheme === "dark" ? "#fff" : "#111827"}
                      />
                    </Pressable>
                  </Link>
                </Animated.View>
              ) : (
                <Animated.View style={{ opacity: largeTitleOpacity }}>
                  <Host matchContents>
                    <Button
                      variant="glass"
                      onPress={() => router.push("/welcome")}
                      modifiers={[
                        padding({ all: 0 }),
                        frame({ width: 80 }),
                        glassEffect({
                          glass: { variant: "regular", tint: "#f8f3e9" },
                        }),
                      ]}
                    >
                      <SwiftText size={16}>Sign up</SwiftText>
                    </Button>
                  </Host>
                </Animated.View>
              )}
            </View>
          </Animated.View>

          {/* Featured Stories */}
          <View
            style={{
              marginTop: 12,
              marginBottom: 12,
              width: "100%",
            }}
          >
            {featuredStories.map((story) => (
              <View
                key={story.id}
                style={{ marginBottom: 12, alignItems: "center" }}
              >
                <FeaturedStory story={story} />
              </View>
            ))}
          </View>

          {/* Recently Added Stories
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <SectionTitle style={{ fontSize: 20, fontWeight: 'bold', color: theme === 'dark' ? '#ffffff' : '#111827', marginBottom: 0 }}>Recently Added</SectionTitle>
            <Pressable>
              <Text style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 14 }}>See more</Text>
            </Pressable>
          </View> */}

          {/* Popular Stories Section */}
          <SectionTitle
            style={{
              marginBottom: 12,
              fontSize: 20,
              fontWeight: "bold",
              color: theme === "dark" ? "#ffffff" : "#111827",
            }}
          >
            Popular Stories
          </SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}
            style={{ marginHorizontal: -20, marginBottom: 64 }}
          >
            {topPicks.map((b, index) => (
              <BookCard
                key={b.id}
                book={b}
                style={{ marginRight: index < topPicks.length - 1 ? 12 : 0 }}
              />
            ))}
          </ScrollView>

          {/* American Classics - Free Books Section */}
          <SectionTitle
            style={{
              marginBottom: 6,
              fontSize: 20,
              fontWeight: "bold",
              color: theme === "dark" ? "#ffffff" : "#111827",
            }}
          >
            Mastering Articles
          </SectionTitle>
          <Text
            style={{
              marginBottom: 20,
              fontSize: 12,
              color: theme === "dark" ? "#d1d5db" : "#6b7280",
            }}
          >
            Learn when to use "a", "an", and "the" through natural stories.
            Perfect for Chinese, Japanese, and Korean speakers.
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}
            style={{ marginHorizontal: -20, marginBottom: 64 }}
          >
            {americanClassics.map((b, index) => (
              <BookCard
                key={b.id}
                book={b}
                style={{
                  marginRight: index < americanClassics.length - 1 ? 12 : 0,
                }}
              />
            ))}
          </ScrollView>

          {/* Continue Reading Section */}
          {/* Continue Section - Only visible when authenticated */}
          {/* {user && (
            <>
              <SectionTitle
                style={{
                  marginBottom: 16,
                  fontSize: 20,
                  fontWeight: "bold",
                  color: theme === "dark" ? "#ffffff" : "#111827",
                }}
              >
                Continue Reading
              </SectionTitle>
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
          )} */}

          {/* Levels Section */}

          <View style={styles.levelsContainer}>
            <LevelsCard />
          </View>

          {/* Genres Section */}
          {/* <Genres theme={theme} /> */}

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

        {/* Gradient overlay - content fades off at top edge of screen */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: insets.top + 16,
          }}
        >
          <LinearGradient
            colors={
              theme === "dark"
                ? ["rgba(0,0,0,0.85)", "transparent"]
                : ["rgba(255,255,255,0.1)", "transparent"]
            }
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      </View>
      {/* Rating Sheet */}
      <RatingSheet
        visible={sheetVisible}
        title={activeBook?.title}
        initialRating={activeBook ? (ratings[activeBook.id] ?? 0) : 0}
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

function SectionTitle({
  children,
  style,
}: {
  children: React.ReactNode;
  style: any;
}) {
  return <Text style={style}>{children}</Text>;
}

// ContinueCard moved to components/ContinueCard.tsx

// BookCard component moved to components/BookCard.tsx

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  levelsContainer: {
    marginTop: 24,
  },
  testElement: {
    width: "100%",
    height: 40,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
  },
  testText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
