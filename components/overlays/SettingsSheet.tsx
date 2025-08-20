// SettingsSheet: Detailed "Customise" bottom sheet with typography and layout controls.
// Provides steppers for text size, line spacing, margins, and quick theme presets.
// Appears after choosing Customise from ThemePopover or via ContextMenu.
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Animated, Easing, Pressable, View, useWindowDimensions, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { useReaderPrefs } from '@/providers/ReaderProvider';
import { useColorScheme } from '@/hooks/useColorScheme';
import { QuickThemeSwatches } from '@/constants/Colors';

export default function SettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { prefs, setPrefs } = useReaderPrefs();
  const colorScheme = useColorScheme();
  const { height } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(0)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  const effectiveTheme = useMemo(() => (prefs.theme === 'system' ? (colorScheme ?? 'light') : prefs.theme), [prefs.theme, colorScheme]);
  const sheetBg = useMemo(() => {
    switch (effectiveTheme) {
      case 'dark':
        return '#1f2937'; // slate-800
      case 'sepia':
        return '#f6ecd7';
      case 'light':
      default:
        return '#ffffff';
    }
  }, [effectiveTheme]);
  const textColor = useMemo(() => {
    switch (effectiveTheme) {
      case 'dark':
        return '#F4F4F5';
      case 'sepia':
        return '#1f2937';
      case 'light':
      default:
        return '#111827';
    }
  }, [effectiveTheme]);

  useEffect(() => {
    const hiddenY = Math.max(300, height);
    if (visible) {
      setMounted(true);
      translateY.setValue(hiddenY);
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 0, duration: 150, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: hiddenY, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, mounted, backdrop, translateY, height]);

  const step = (key: 'fontScale' | 'lineHeightScale' | 'marginScale', delta: number, min = 0.6, max = 1.8, precision = 2) => {
    const next = Math.min(max, Math.max(min, +(prefs[key] + delta).toFixed(precision)));
    setPrefs({ [key]: next } as any);
  };

  const ThemeBtn = ({ label, value, bg, fg, previewFamily }: { label: string; value: any; bg: string; fg: string; previewFamily: string }) => (
    <Pressable
      onPress={() => {
        if (label === 'Original') setPrefs({ theme: 'system', typeface: 'inter', boldText: false });
        else if (label === 'Quiet') setPrefs({ theme: 'dark', typeface: 'tisa', boldText: false });
        else if (label === 'Paper') setPrefs({ theme: 'light', typeface: 'tisa', boldText: false });
        else if (label === 'Calm') setPrefs({ theme: 'sepia', typeface: 'tisa', boldText: false });
        else setPrefs({ theme: value });
      }}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginRight: 12,
        backgroundColor: bg,
        borderWidth: prefs.theme === value ? 2 : 1,
        borderColor: prefs.theme === value ? '#4f46e5' : 'rgba(0,0,0,0.15)',
        width: 100,
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: fg, fontSize: 24, fontFamily: previewFamily }}>Aa</Text>
        <Text style={{ color: fg, marginTop: 4, fontSize: 12, fontFamily: 'Inter-Regular' }}>{label}</Text>
      </View>
    </Pressable>
  );

  if (!mounted) return null;

  return (
    <View pointerEvents={visible ? 'auto' : 'none'} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
      {/* Backdrop */}
      <Pressable onPress={onClose} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
        <Animated.View style={{ flex: 1, backgroundColor: 'black', opacity: backdrop.interpolate({ inputRange: [0, 1], outputRange: [0, 0.2] }) }} />
      </Pressable>

      {/* Full-screen Sheet */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          paddingBottom: (insets.bottom || 0) + 16,
          transform: [{ translateY }],
          backgroundColor: sheetBg,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderTopWidth: 0,
          borderColor: 'transparent'
        }}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ThemedText style={{ fontWeight: '700', color: textColor }}>Themes & Settings</ThemedText>
          <Pressable onPress={onClose} hitSlop={8} style={{ padding: 8 }}>
            <ThemedText style={{ color: textColor }}>✕</ThemedText>
          </Pressable>
        </View>

        {/* Font size controls */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <ThemedText style={{ opacity: 0.8, color: textColor }}>Text Size</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable onPress={() => step('fontScale', -0.05)} style={{ padding: 8, marginRight: 6 }}><ThemedText style={{ fontSize: 18, color: textColor }}>A</ThemedText></Pressable>
              <Pressable onPress={() => step('fontScale', +0.05)} style={{ padding: 8 }}><ThemedText style={{ fontSize: 26, color: textColor }}>A</ThemedText></Pressable>
            </View>
          </View>
        </View>

        {/* Line height & Margin steppers */}
        <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <ThemedText style={{ opacity: 0.8, color: textColor }}>Line Spacing</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable onPress={() => step('lineHeightScale', -0.05, 0.8, 2)} style={{ padding: 8, marginRight: 6 }}><ThemedText style={{ color: textColor }}>-</ThemedText></Pressable>
              <Pressable onPress={() => step('lineHeightScale', +0.05, 0.8, 2)} style={{ padding: 8 }}><ThemedText style={{ color: textColor }}>+</ThemedText></Pressable>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <ThemedText style={{ opacity: 0.8, color: textColor }}>Margins</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable onPress={() => step('marginScale', -0.05, 0.6, 1.8)} style={{ padding: 8, marginRight: 6 }}><ThemedText style={{ color: textColor }}>-</ThemedText></Pressable>
              <Pressable onPress={() => step('marginScale', +0.05, 0.6, 1.8)} style={{ padding: 8 }}><ThemedText style={{ color: textColor }}>+</ThemedText></Pressable>
            </View>
          </View>
        </View>

        {/* Themes row */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ThemedText style={{ marginBottom: 8, opacity: 0.8, color: textColor }}>Quick Themes</ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ThemeBtn label="Original" value="system" bg={QuickThemeSwatches.original.bg} fg={QuickThemeSwatches.original.fg} previewFamily="Inter-Regular" />
            <ThemeBtn label="Quiet" value="dark" bg={QuickThemeSwatches.quiet.bg} fg={QuickThemeSwatches.quiet.fg} previewFamily="TisaSansPro-Regular" />
            <ThemeBtn label="Paper" value="light" bg={QuickThemeSwatches.paper.bg} fg={QuickThemeSwatches.paper.fg} previewFamily="TisaSansPro-Regular" />
            <ThemeBtn label="Calm" value="sepia" bg={QuickThemeSwatches.calm.bg} fg={QuickThemeSwatches.calm.fg} previewFamily="TisaSansPro-Regular" />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
