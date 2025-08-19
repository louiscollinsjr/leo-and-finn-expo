import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/ThemedText';
import TopOverlay from '@/components/overlays/TopOverlay';
import BottomActions from '@/components/overlays/BottomActions';
import ContextMenu from '@/components/overlays/ContextMenu';
import SettingsSheet from '@/components/overlays/SettingsSheet';
import { useReaderOverlay } from '@/providers/ReaderProvider';

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

  const [showOverlay, setShowOverlay] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Track scroll vs tap
  const isDraggingRef = useRef(false);
  const lastScrollAtRef = useRef(0);

  // Overlay fade animation and auto-dismiss
  const overlayOpacity = useRef(new Animated.Value(0)).current;
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
      }, 2500);
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

  return (
    <View style={{ flex: 1 }}>
      {/* Hide status bar during immersive reading; briefly show when overlays are visible */}
      <StatusBar hidden={!showOverlay} animated />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 56 }}
        showsVerticalScrollIndicator={false}
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
            <TopOverlay insets={insets} title={title ?? ''} onBack={onBack} />
          )}
        </Animated.View>
      )}

      {/* Bottom overlay */}
      {showOverlay && (
        <Animated.View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, opacity: overlayOpacity }}>
          {renderBottomOverlay ? (
            renderBottomOverlay({ insets, onOpenContents, onOpenSearch, onOpenSettings })
          ) : (
            <BottomActions
              insets={insets}
              onOpenContents={onOpenContents}
              onOpenSearch={onOpenSearch}
              onOpenSettings={() => {
                setShowSettings(true);
                setOverlayVisible(true);
                onOpenSettings && onOpenSettings();
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

      {/* Settings bottom sheet */}
      <SettingsSheet visible={showSettings} onClose={() => setShowSettings(false)} />
    </View>
  );
}
