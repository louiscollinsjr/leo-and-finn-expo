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
import { ActivityIndicator, Animated, Easing, Pressable, ScrollView, View } from 'react-native';
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
  const overlayOpacity = useRef(new Animated.Value(overlayVisible ? 1 : 0)).current;
  const bottomActionsOpacity = useRef(new Animated.Value(overlayVisible ? 1 : 0)).current;
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showOverlays = useCallback(() => {
    setShowOverlay(true);
    setOverlayVisible(true);
    Animated.timing(overlayOpacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    overlayTimer.current = setTimeout(() => {
      Animated.timing(overlayOpacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(({ finished }) => {
        if (finished) {
          setShowOverlay(false);
          setOverlayVisible(false);
        }
      });
    }, 3500);
  }, [overlayOpacity, setOverlayVisible]);

  const hideOverlays = useCallback(() => {
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(({ finished }) => {
      if (finished) {
        setShowOverlay(false);
        setOverlayVisible(false);
      }
    });
  }, [overlayOpacity, setOverlayVisible]);

  useEffect(() => {
    if (overlayVisible) {
      setShowOverlay(true);
      Animated.timing(overlayOpacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    } else {
      hideOverlays();
    }
  }, [overlayVisible, overlayOpacity, hideOverlays]);

  useEffect(() => {
    const target = !showOverlay ? 0 : menuVisible ? (menuPresented ? 0 : 1) : 1;
    Animated.timing(bottomActionsOpacity, { toValue: target, duration: 180, useNativeDriver: true }).start();
  }, [showOverlay, menuVisible, menuPresented, bottomActionsOpacity]);

  useEffect(() => {
    if (menuVisible || themePopoverVisible || settingsVisible) {
      showOverlays();
    }
  }, [menuVisible, themePopoverVisible, settingsVisible, showOverlays]);

  const scrollRef = useRef<ScrollView | null>(null);
  const isDraggingRef = useRef(false);
  const lastScrollAtRef = useRef(0);
  const [contentHeight, setContentHeight] = useState(1);
  const [viewportHeight, setViewportHeight] = useState(1);
  const [scrollY, setScrollY] = useState(0);

  const setScrollRef = useCallback((node: ScrollView | null) => {
    scrollRef.current = node;
  }, []);

  const progress = Math.max(0, Math.min(1, contentHeight <= viewportHeight ? 1 : scrollY / (contentHeight - viewportHeight)));
  const totalPages = Math.max(1, Math.ceil(contentHeight / Math.max(1, viewportHeight)));
  const currentPage = Math.max(1, Math.min(totalPages, Math.floor(progress * totalPages) + 1));
  const pagesLeft = Math.max(0, totalPages - currentPage);
  const centerLabel = `${pagesLeft} pages left`;

  const scrubTo = useCallback(
    (p: number) => {
      const node = scrollRef.current;
      if (!node) return;
      const target = (contentHeight - viewportHeight) * Math.max(0, Math.min(1, p));
      node.scrollTo({ y: target, animated: false });
    },
    [contentHeight, viewportHeight]
  );

  useEffect(() => () => {
    scrollRef.current = null;
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
  }, []);

  const effectiveTheme = prefs.theme === 'system' ? (systemScheme ?? 'light') : prefs.theme;
  const bgColor = effectiveTheme === 'dark' ? '#49494d' : effectiveTheme === 'sepia' ? '#f6ecd7' : '#ffffff';
  const statusStyle = effectiveTheme === 'dark' ? 'light' : 'dark';

  const targetDimOpacity = Math.max(0, 1 - (prefs.brightness ?? 1)) * 0.9;
  const dimOpacity = useRef(new Animated.Value(targetDimOpacity)).current;
  useEffect(() => {
    Animated.timing(dimOpacity, {
      toValue: targetDimOpacity,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [targetDimOpacity, dimOpacity]);

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

      <ScrollView
        ref={setScrollRef}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: Math.max(80, bottomOverlayHeight + 32) }}
        style={{ backgroundColor: bgColor }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}
        onContentSizeChange={(_w, h) => setContentHeight(h)}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        onScrollBeginDrag={() => {
          isDraggingRef.current = true;
        }}
        onScrollEndDrag={() => {
          isDraggingRef.current = false;
          lastScrollAtRef.current = Date.now();
        }}
        onMomentumScrollEnd={() => {
          isDraggingRef.current = false;
          lastScrollAtRef.current = Date.now();
        }}
      >
        <Pressable
          style={{ flex: 1, minHeight: '100%' }}
          onPress={() => {
            const now = Date.now();
            const recentlyScrolled = now - lastScrollAtRef.current < 150;
            if (isDraggingRef.current || recentlyScrolled) return;
            if (showOverlay) hideOverlays(); else showOverlays();
          }}
          delayLongPress={200}
        >
          {children}
        </Pressable>
      </ScrollView>

      <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'black', opacity: dimOpacity }} />

      {showOverlay && (
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, opacity: overlayOpacity }}>
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
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, opacity: bottomActionsOpacity, zIndex: 5 }}
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
        progress={progress}
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
