import { ThemedText } from '@/components/ThemedText';
import BottomActions from '@/components/overlays/BottomActions';
import ContextMenu from '@/components/overlays/ContextMenu';
import ReaderMenuSheet from '@/components/overlays/ReaderMenuSheet';
import SettingsSheet from '@/components/overlays/SettingsSheet';
import ThemePopover from '@/components/overlays/ThemePopover';
import TopOverlay from '@/components/overlays/TopOverlay';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useReaderOverlay, useReaderPrefs } from '@/providers/ReaderProvider';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, View } from 'react-native';
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
  renderContextMenu?: (ctx: { onDismiss: () => void; insets: any }) => React.ReactNode;
};

export default function ReaderView(props: ReaderViewProps) {
  const { title, loading, error, onBack, onOpenContents, onOpenSearch, onOpenSettings, children, renderTopOverlay, renderBottomOverlay, renderContextMenu } = props;
  const insets = useSafeAreaInsets();
  const { setOverlayVisible } = useReaderOverlay();
  const { prefs } = useReaderPrefs();
  const systemScheme = useColorScheme();

  const [showOverlay, setShowOverlay] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // customise sheet
  const [showMenu, setShowMenu] = useState(false);
  const [showThemePopover, setShowThemePopover] = useState(false);
  const [menuPresented, setMenuPresented] = useState(false);
  const [bottomOverlayHeight, setBottomOverlayHeight] = useState(0);

  // Track scroll vs tap
  const isDraggingRef = useRef(false);
  const lastScrollAtRef = useRef(0);

  // Overlay fade animation and auto-dismiss
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  // Bottom actions opacity (fades out when menu sheet is open)
  const bottomActionsOpacity = useRef(new Animated.Value(0)).current;
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showOverlays = useMemo(
    () => () => {
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
    },
    [overlayOpacity, setOverlayVisible]
  );

  const hideOverlays = () => {
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    Animated.timing(overlayOpacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(({ finished }) => {
      if (finished) {
        setShowOverlay(false);
        setOverlayVisible(false);
      }
    });
  };

  // Drive bottom actions visibility so it feels "together" with ReaderMenuSheet:
  // - When menu opens, keep BottomActions visible until the sheet has fully presented, then fade it out.
  // - When menu closes and overlays are visible, fade BottomActions back in.
  useEffect(() => {
    const target = !showOverlay
      ? 0
      : showMenu
      ? (menuPresented ? 0 : 1)
      : 1;
    Animated.timing(bottomActionsOpacity, { toValue: target, duration: 180, useNativeDriver: true }).start();
  }, [showOverlay, showMenu, menuPresented, bottomActionsOpacity]);

  // Progress tracking for ScrollView content
  const scrollRef = useRef<ScrollView | null>(null);
  const [contentHeight, setContentHeight] = useState(1);
  const [viewportHeight, setViewportHeight] = useState(1);
  const [scrollY, setScrollY] = useState(0);

  const progress = Math.max(0, Math.min(1, contentHeight <= viewportHeight ? 1 : scrollY / (contentHeight - viewportHeight)));
  const totalPages = Math.max(1, Math.ceil(contentHeight / Math.max(1, viewportHeight)));
  const currentPage = Math.max(1, Math.min(totalPages, Math.floor(progress * totalPages) + 1));
  const pageLabel = `${currentPage} of ${totalPages}`;
  const pagesLeft = Math.max(0, totalPages - currentPage);
  const centerLabel = `${pagesLeft} pages left`;

  const scrubTo = (p: number) => {
    if (!scrollRef.current) return;
    const target = (contentHeight - viewportHeight) * Math.max(0, Math.min(1, p));
    scrollRef.current.scrollTo({ y: target, animated: false });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
        <ThemedText style={{ marginTop: 8, opacity: 0.7 }}>Loading…</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <ThemedText type="subtitle">Unable to load story</ThemedText>
        <ThemedText style={{ marginTop: 8, textAlign: 'center', opacity: 0.8 }}>{error}</ThemedText>
      </View>
    );
  }

  const effectiveTheme = prefs.theme === 'system' ? (systemScheme ?? 'light') : prefs.theme;
  const bgColor = effectiveTheme === 'dark' ? '#0f172a' : effectiveTheme === 'sepia' ? '#f6ecd7' : '#ffffff';
  const statusStyle = effectiveTheme === 'dark' ? 'light' : 'dark';

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      {/* Hide status bar during immersive reading; briefly show when overlays are visible */}
      <StatusBar hidden={!showOverlay} animated style={statusStyle as any} backgroundColor={bgColor} />
      {/* Brightness dimmer overlay (0..1 -> 0..0.7 opacity) */}
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'black', opacity: Math.max(0, 1 - (prefs.brightness ?? 1)) * 0.9 }} />
      {/* Status bar area background matching theme (only when visible), above dimmer */}
      {showOverlay && (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: bgColor, zIndex: 5 }}
        />
      )}

      <ScrollView
        ref={scrollRef as any}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 56 }}
        style={{ backgroundColor: bgColor }}
        showsVerticalScrollIndicator={false}
        onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}
        onContentSizeChange={(_w, h) => setContentHeight(h)}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
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
          style={{ flex: 1 }}
          onPress={() => {
            const now = Date.now();
            const recentlyScrolled = now - lastScrollAtRef.current < 120;
            if (isDraggingRef.current || recentlyScrolled) return;
            if (showOverlay) hideOverlays(); else showOverlays();
          }}
          onLongPress={() => setShowContext(true)}
          delayLongPress={350}
        >
          {children}
        </Pressable>
      </ScrollView>

      {/* Top overlay */}
      {showOverlay && (
        <Animated.View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, opacity: overlayOpacity }}>
          {renderTopOverlay ? (
            renderTopOverlay({ insets, title, onBack })
          ) : (
            <TopOverlay insets={insets} title={title ?? ''} centerLabel={centerLabel} onBack={onBack} />
          )}
        </Animated.View>
      )}

      {/* Bottom overlay */}
      {showOverlay && (
        <Animated.View
          pointerEvents={showOverlay && !showMenu ? 'box-none' : 'none'}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, opacity: bottomActionsOpacity, zIndex: 5 }}
          onLayout={(e) => setBottomOverlayHeight(e.nativeEvent.layout.height)}
        >
          {renderBottomOverlay ? (
            renderBottomOverlay({ insets, onOpenContents, onOpenSearch, onOpenSettings })
          ) : (
            <BottomActions
              insets={insets}
              onOpenContents={onOpenContents}
              onOpenSearch={onOpenSearch}
              onOpenMenu={() => {
                setMenuPresented(false);
                setShowMenu(true);
              }}
              progress={progress}
              onScrub={scrubTo}
              pageLabel={pageLabel}
              onSetMode={(mode) => {
                // TODO: Implement mode switching logic
                console.log('Mode selected:', mode);
              }}
            />
          )}
        </Animated.View>
      )}

      {/* Context menu overlay */}
      {showContext && (
        renderContextMenu ? (
          <>{renderContextMenu({ onDismiss: () => setShowContext(false), insets })}</>
        ) : (
          <ContextMenu
            visible={showContext}
            onDismiss={() => setShowContext(false)}
            onOpenSettings={() => {
              setShowContext(false);
              setShowSettings(true);
              setOverlayVisible(true);
            }}
          />
        )
      )}

      {/* Main menu sheet */}
      <ReaderMenuSheet
        visible={showMenu}
        onClose={() => {
          setShowMenu(false);
          setMenuPresented(false);
        }}
        onOpenThemePopover={() => setShowThemePopover(true)}
        progress={progress}
        onScrub={scrubTo}
        onPresented={() => setMenuPresented(true)}
        bottomOffset={Math.max(0, bottomOverlayHeight) - 24}
      />

      {/* Themes & Settings popover */}
      <ThemePopover
        visible={showThemePopover}
        onRequestClose={() => setShowThemePopover(false)}
        onOpenCustomize={() => {
          setShowThemePopover(false);
          setShowSettings(true);
        }}
      />

      {/* Customise sheet */}
      <SettingsSheet visible={showSettings} onClose={() => setShowSettings(false)} />
    </View>
  );
}
