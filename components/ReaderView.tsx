import { ThemedText } from '@/components/ThemedText';
import BottomActions from '@/components/overlays/BottomActions';
import ReaderMenuSheet from '@/components/overlays/ReaderMenuSheet';
import SettingsSheet from '@/components/overlays/SettingsSheet';
import ThemePopover from '@/components/overlays/ThemePopover';
import TopOverlay from '@/components/overlays/TopOverlay';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useReaderOverlay, useReaderPrefs, useReaderUI } from '@/providers/ReaderProvider';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ReaderViewProps = {
  title?: string;
  loading?: boolean;
  error?: string | null;
  onBack?: () => void;
  onOpenContents?: () => void;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
  children: React.ReactNode;
  // Slot overrides
  renderTopOverlay?: (ctx: { insets: any; title?: string; onBack?: () => void }) => React.ReactNode;
  renderBottomOverlay?: (ctx: { insets: any; onOpenContents?: () => void; onOpenSearch?: () => void; onOpenSettings?: () => void }) => React.ReactNode;
};

function ReaderLoadingState() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
      <ThemedText style={{ marginTop: 8, opacity: 0.7 }}>Loading…</ThemedText>
    </View>
  );
}

function ReaderErrorState({ message }: { message: string | null }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
      <ThemedText type="subtitle">Unable to load story</ThemedText>
      <ThemedText style={{ marginTop: 8, textAlign: 'center', opacity: 0.8 }}>{message}</ThemedText>
    </View>
  );
}

export default function ReaderView(props: ReaderViewProps) {
  const { title, loading, error, onBack, onOpenContents, onOpenSearch, onOpenSettings, children, renderTopOverlay, renderBottomOverlay } = props;
  const insets = useSafeAreaInsets();
  const { prefs } = useReaderPrefs();
  const systemScheme = useColorScheme();
  const { overlayVisible, setOverlayVisible } = useReaderOverlay();
  const {
    menuVisible,
    setMenuVisible,
    themePopoverVisible,
    setThemePopoverVisible,
    settingsVisible,
    setSettingsVisible,
  } = useReaderUI();

  const [showOverlay, setShowOverlay] = useState(overlayVisible);
  const [menuPresented, setMenuPresented] = useState(false);
  const [bottomOverlayHeight, setBottomOverlayHeight] = useState(0);
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reanimated shared values for overlay animations
  const overlayOpacity = useSharedValue(overlayVisible ? 1 : 0);
  const bottomActionsOpacity = useSharedValue(overlayVisible ? 1 : 0);

  const showOverlays = useCallback(() => {
    setShowOverlay(true);
    setOverlayVisible(true);
    overlayOpacity.value = withTiming(1, { duration: 160 });
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    overlayTimer.current = setTimeout(() => {
      overlayOpacity.value = withTiming(0, { duration: 220 }, (finished) => {
        if (finished) {
          runOnJS(setShowOverlay)(false);
          runOnJS(setOverlayVisible)(false);
        }
      });
    }, 3500);
  }, [overlayOpacity, setOverlayVisible]);

  const hideOverlays = useCallback(() => {
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    overlayOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(setShowOverlay)(false);
        runOnJS(setOverlayVisible)(false);
      }
    });
  }, [overlayOpacity, setOverlayVisible]);

  useEffect(() => {
    if (overlayVisible) {
      setShowOverlay(true);
      overlayOpacity.value = withTiming(1, { duration: 160 });
    } else {
      hideOverlays();
    }
  }, [overlayVisible, overlayOpacity, hideOverlays]);

  useEffect(() => {
    const target = !showOverlay ? 0 : menuVisible ? (menuPresented ? 0 : 1) : 1;
    bottomActionsOpacity.value = withTiming(target, { duration: 180 });
  }, [showOverlay, menuVisible, menuPresented, bottomActionsOpacity]);

  useEffect(() => {
    if (menuVisible || themePopoverVisible || settingsVisible) {
      showOverlays();
    }
  }, [menuVisible, themePopoverVisible, settingsVisible, showOverlays]);

  // Reanimated shared values for scroll tracking (runs on UI thread)
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollY = useSharedValue(0);
  const contentHeight = useSharedValue(1);
  const viewportHeight = useSharedValue(1);
  
  // Use refs for scroll state to avoid reading shared values on JS thread
  const isDraggingRef = useRef(false);
  const lastScrollAtRef = useRef(0);
  const touchStartTimeRef = useRef(0);

  // For JS-side display (pages left label), we need a React state
  const [jsProgress, setJsProgress] = useState(0);
  const updateJsProgress = useCallback((p: number) => setJsProgress(p), []);

  // Callbacks for scroll state updates (called from worklets via runOnJS)
  const setDragging = useCallback((v: boolean) => { isDraggingRef.current = v; }, []);
  const setLastScrollAt = useCallback((t: number) => { lastScrollAtRef.current = t; }, []);

  // Animated scroll handler - runs entirely on UI thread
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      scrollY.value = event.contentOffset.y;
      // Throttled update to JS for label display
      const newProgress = contentHeight.value <= viewportHeight.value
        ? 1
        : Math.max(0, Math.min(1, event.contentOffset.y / (contentHeight.value - viewportHeight.value)));
      runOnJS(updateJsProgress)(newProgress);
    },
    onBeginDrag: () => {
      'worklet';
      runOnJS(setDragging)(true);
    },
    onEndDrag: () => {
      'worklet';
      runOnJS(setDragging)(false);
      runOnJS(setLastScrollAt)(Date.now());
    },
    onMomentumEnd: () => {
      'worklet';
      runOnJS(setDragging)(false);
      runOnJS(setLastScrollAt)(Date.now());
    },
  });

  const totalPages = Math.max(1, Math.ceil(1 / Math.max(0.01, 1 - jsProgress + 0.001)));
  const pagesLeft = Math.max(0, Math.round((1 - jsProgress) * totalPages));
  const centerLabel = `${pagesLeft} pages left`;

  const scrubTo = useCallback(
    (p: number) => {
      const node = scrollRef.current;
      if (!node) return;
      const maxScroll = contentHeight.value - viewportHeight.value;
      const target = maxScroll * Math.max(0, Math.min(1, p));
      (node as any).scrollTo({ y: target, animated: false });
    },
    [contentHeight, viewportHeight]
  );

  useEffect(() => () => {
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
  }, []);

  const effectiveTheme = prefs.theme === 'system' ? (systemScheme ?? 'light') : prefs.theme;
  const bgColor = effectiveTheme === 'dark' ? '#49494d' : effectiveTheme === 'sepia' ? '#f6ecd7' : '#ffffff';
  const statusStyle = effectiveTheme === 'dark' ? 'light' : 'dark';

  // Dim overlay opacity (Reanimated)
  const targetDimOpacity = Math.max(0, 1 - (prefs.brightness ?? 1)) * 0.9;
  const dimOpacity = useSharedValue(targetDimOpacity);
  useEffect(() => {
    dimOpacity.value = withTiming(targetDimOpacity, { duration: 160, easing: Easing.out(Easing.quad) });
  }, [targetDimOpacity, dimOpacity]);

  // Animated styles
  const overlayAnimatedStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const bottomActionsAnimatedStyle = useAnimatedStyle(() => ({ opacity: bottomActionsOpacity.value }));
  const dimAnimatedStyle = useAnimatedStyle(() => ({ opacity: dimOpacity.value }));

  if (loading) {
    return <ReaderLoadingState />;
  }

  if (error) {
    return <ReaderErrorState message={error} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar hidden={!showOverlay} animated style={statusStyle as any} backgroundColor={bgColor} />

      {showOverlay && (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: bgColor, zIndex: 5 }} />
      )}

      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: Math.max(80, bottomOverlayHeight + 32) }}
        style={{ backgroundColor: bgColor }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={(e) => { viewportHeight.value = e.nativeEvent.layout.height; }}
        onContentSizeChange={(_w, h) => { contentHeight.value = h; }}
        onScroll={scrollHandler}
        onTouchStart={() => {
          touchStartTimeRef.current = Date.now();
        }}
        onTouchEnd={() => {
          // Toggle overlay on tap (not during scroll or long-press)
          const now = Date.now();
          const touchDuration = now - touchStartTimeRef.current;
          const recentlyScrolled = now - lastScrollAtRef.current < 200;
          const wasLongPress = touchDuration > 280; // slightly less than long-press delay
          if (isDraggingRef.current || recentlyScrolled || wasLongPress) return;
          if (showOverlay) hideOverlays(); else showOverlays();
        }}
      >
        {children}
      </Animated.ScrollView>

      <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'black' }, dimAnimatedStyle]} />

      {showOverlay && (
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0 }, overlayAnimatedStyle]}>
          {renderTopOverlay ? (
            renderTopOverlay({ insets, title, onBack })
          ) : (
            <TopOverlay insets={insets} title={title ?? ''} centerLabel={centerLabel} onBack={onBack} />
          )}
        </Animated.View>
      )}

      {showOverlay && (
        <Animated.View
          pointerEvents={showOverlay && !menuVisible ? 'auto' : 'none'}
          style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 5 }, bottomActionsAnimatedStyle]}
          onLayout={(e) => setBottomOverlayHeight(e.nativeEvent.layout.height)}
        >
          {renderBottomOverlay ? (
            renderBottomOverlay({ insets, onOpenContents, onOpenSearch, onOpenSettings })
          ) : (
            <BottomActions
              insets={insets}
              onOpenMenu={() => {
                setMenuPresented(false);
                setMenuVisible(true);
              }}
              onSetMode={() => {
                showOverlays();
              }}
            />
          )}
        </Animated.View>
      )}

      <ReaderMenuSheet
        visible={menuVisible}
        onClose={() => {
          setMenuVisible(false);
          setMenuPresented(false);
        }}
        onOpenThemePopover={() => {
          setMenuVisible(false);
          setMenuPresented(false);
          setTimeout(() => {
            setThemePopoverVisible(true);
          }, 160);
        }}
        progress={jsProgress}
        onScrub={scrubTo}
        onSetMode={() => {
          setMenuVisible(false);
        }}
        onPresented={() => setMenuPresented(true)}
        bottomOffset={Math.max(0, bottomOverlayHeight) - 24}
      />

      <ThemePopover
        visible={themePopoverVisible}
        onRequestClose={() => setThemePopoverVisible(false)}
        onOpenCustomize={() => {
          setThemePopoverVisible(false);
          setSettingsVisible(true);
        }}
      />

      <SettingsSheet visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
    </View>
  );
}
