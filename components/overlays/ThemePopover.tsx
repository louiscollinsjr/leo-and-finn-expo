// ThemePopover: Quick-access popover for reading appearance. Fades in above the
// bottom bar to offer font size controls, brightness slider, and theme presets,
// with a button to open the full Customise sheet.
import { ThemedText } from '@/components/ThemedText';
import Slider from '@/components/ui/Slider';
import { useReaderPrefs, type PageMode, type ThemeMode } from '@/providers/ReaderProvider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QuickThemeSwatches } from '@/constants/Colors';

export default function ThemePopover({
  visible,
  onRequestClose,
  onOpenCustomize,
}: {
  visible: boolean;
  onRequestClose: () => void;
  onOpenCustomize: () => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  const insets = useSafeAreaInsets();
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [leftSegmentWidth, setLeftSegmentWidth] = useState(0);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 120, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 14, duration: 120, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, mounted, opacity, translateY]);

  const { prefs, setPrefs } = useReaderPrefs();

  const setTheme = (theme: ThemeMode) => setPrefs({ theme });
  const adjustFont = (delta: number) => {
    const nextFont = Math.max(0.7, Math.min(1.6, (prefs.fontScale ?? 1) + delta));
    setPrefs({ fontScale: nextFont });
  };

  const modeIcon = (() => {
    switch (prefs.pageMode) {
      case 'slide':
        return 'view-carousel';
      case 'curl':
        return 'gesture';
      case 'fast-fade':
        return 'bolt';
      case 'scroll':
      default:
        return 'swap-vert';
    }
  })();

  const toggleDark = () => {
    const next: ThemeMode = prefs.theme === 'dark' ? 'light' : 'dark';
    setPrefs({ theme: next });
  };

  // Font size indicator settings
  const FONT_MIN = 0.7;
  const FONT_MAX = 1.6;
  const FONT_STEPS = 10;
  const currentFontStep = Math.max(
    0,
    Math.min(
      FONT_STEPS - 1,
      Math.round((((prefs.fontScale ?? 1) - FONT_MIN) / (FONT_MAX - FONT_MIN)) * (FONT_STEPS - 1))
    )
  );

  if (!mounted) return null;

  return (
    <View pointerEvents={visible ? 'auto' : 'none'} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 50 }}>
      {/* Backdrop */}
      <Pressable onPress={() => { setModeMenuOpen(false); onRequestClose(); }} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
        <Animated.View style={{ flex: 1, backgroundColor: 'black', opacity: opacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.2] }) }} />
      </Pressable>

      {/* Bottom sheet */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          opacity,
          transform: [{ translateY }],
          paddingBottom: 0,
        }}
      >
        <View
          style={{
            marginHorizontal: 0,
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderWidth: 0,
            borderColor: 'rgba(0,0,0,0.08)',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: (insets.bottom || 0) + 1,
          }}
          onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <ThemedText style={{ fontWeight: '600', fontSize: 24 }}>Themes & Settings</ThemedText>
            <Pressable onPress={onRequestClose} hitSlop={8} style={{ padding: 6, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 999 }}>
              <MaterialIcons name="close" size={24} color="#666" />
            </Pressable>
          </View>

          

          {/* Controls row: text size + page mode */}
          <View style={{ marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Text size segmented + centered indicator below */}
            <View style={{ flex: 1, marginRight: 10 }}>
              <View onLayout={(e) => setLeftSegmentWidth(e.nativeEvent.layout.width)} style={{ minWidth: 120, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, paddingHorizontal: 4, paddingVertical: 4, height: 36 }}>
                <Pressable onPress={() => adjustFont(-0.05)} style={{ flex: 1, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                  <ThemedText style={{ fontSize: 14, lineHeight: 14, textAlign: 'center' }}>A</ThemedText>
                </Pressable>
                <View style={{ width: 1, height: 18, backgroundColor: 'rgba(0,0,0,0.12)' }} />
                {/* <View style={{ backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 6, marginHorizontal: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>A</ThemedText>
                </View> */}
                <Pressable onPress={() => adjustFont(+0.05)} style={{ flex: 1, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                  <ThemedText style={{ fontSize: 18, lineHeight: 18, textAlign: 'center' }}>A</ThemedText>
                </Pressable>
              </View>
            </View>

            {/* Compact mode + page mode toggle + dark toggle */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable
                onPress={() => setModeMenuOpen((v) => !v)}
                style={{ width: 36, height: 36, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}
              >
                <MaterialIcons name={modeIcon as any} size={18} color="#666" />
              </Pressable>
              <Pressable
                onPress={toggleDark}
                style={{ width: 36, height: 36, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
              >
                <MaterialIcons name={prefs.theme === 'dark' ? 'dark-mode' : 'light-mode'} size={18} color="#666" />
              </Pressable>
            </View>
          </View>

          {/* Font-size step indicator: centered, full-width under controls */}
          <View style={{ marginTop: 6, alignItems: 'center', width: Math.max(0, leftSegmentWidth - 8), marginLeft: 4, alignSelf: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              {Array.from({ length: FONT_STEPS }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    marginHorizontal: 6,
                    backgroundColor: i === currentFontStep ? '#111' : 'rgba(0,0,0,0.22)',
                  }}
                />
              ))}
            </View>
          </View>

          {/* Brightness */}
          <View style={{ marginVertical: 6 }}>
            {/* <ThemedText style={{ fontWeight: '500' }}>Brightness</ThemedText> */}
            <View style={{ marginTop: 10 }}>
              <Slider
                value={prefs.brightness ?? 1}
                onChange={(v) => setPrefs({ brightness: v })}
                onChangeEnd={(v) => setPrefs({ brightness: v })}
                height={32}
                trackColor="#e5e7eb"
                fillColor="#6b7280"
                thumbColor="#ffffff"
                leftLabel={<MaterialIcons name="wb-sunny" size={16} color="#9ca3af" />}
                rightLabel={<MaterialIcons name="wb-sunny" size={16} color="#9ca3af" />}
              />
            </View>
          </View>

          {/* add horizontal seperator */}
          <View style={{ marginVertical: 6 }} />
          <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.1)' }} />
          <View style={{ marginVertical: 12 }} />

          {/* Quick Themes (match SettingsSheet buttons) */}
          <View style={{ marginTop: 14 }}>
            <View style={{ alignSelf: 'center', width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}>
                <ThemeQuickBtn label="Original" value="system" bg={QuickThemeSwatches.original.bg} fg={QuickThemeSwatches.original.fg} previewFamily="Inter-Regular" active={prefs.theme === 'system'} onPress={() => setPrefs({ theme: 'system', typeface: 'inter', boldText: false })} />
                <ThemeQuickBtn label="Quiet" value="dark" bg={QuickThemeSwatches.quiet.bg} fg={QuickThemeSwatches.quiet.fg} previewFamily="TisaSansPro-Regular" active={prefs.theme === 'dark'} onPress={() => setPrefs({ theme: 'dark', typeface: 'tisa', boldText: false })} />
                <ThemeQuickBtn label="Paper" value="light" bg={QuickThemeSwatches.paper.bg} fg={QuickThemeSwatches.paper.fg} previewFamily="TisaSansPro-Regular" active={prefs.theme === 'light' && prefs.typeface === 'tisa'} onPress={() => setPrefs({ theme: 'light', typeface: 'tisa', boldText: false })} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingHorizontal: 8 }}>
                <ThemeQuickBtn label="Bold" value="light" bg={QuickThemeSwatches.bold.bg} fg={QuickThemeSwatches.bold.fg} previewFamily="Inter-Bold" active={prefs.theme === 'light' && prefs.typeface === 'inter' && !!prefs.boldText} onPress={() => setPrefs({ theme: 'light', typeface: 'inter', boldText: true })} />
                <ThemeQuickBtn label="Calm" value="sepia" bg={QuickThemeSwatches.calm.bg} fg={QuickThemeSwatches.calm.fg} previewFamily="TisaSansPro-Regular" active={prefs.theme === 'sepia' && prefs.typeface === 'tisa'} onPress={() => setPrefs({ theme: 'sepia', typeface: 'tisa', boldText: false })} />
                <ThemeQuickBtn label="Focus" value="light" bg={QuickThemeSwatches.focus.bg} fg={QuickThemeSwatches.focus.fg} previewFamily="Inter-Medium" active={prefs.theme === 'light' && prefs.typeface === 'inter' && !prefs.boldText} onPress={() => setPrefs({ theme: 'light', typeface: 'inter', boldText: false })} />
              </View>
            </View>
          </View>

          {/* Customize */}
          <Pressable onPress={onOpenCustomize} style={{ marginTop: 32, marginBottom: 16, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' }}>
            <ThemedText style={{ fontWeight: '400' }}>Customize</ThemedText>
          </Pressable>
        </View>
      </Animated.View>
      {/* Floating page mode menu above the sheet */}
      {modeMenuOpen ? (
        <>
          {/* backdrop to dismiss */}
          <Pressable
            onPress={() => setModeMenuOpen(false)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent', zIndex: 59 }}
          />
          <View
            style={{ position: 'absolute', left: 18, right: 18, bottom: (insets.bottom || 0) + sheetHeight + 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, paddingVertical: 4, zIndex: 60 }}
          >
            {([
              { key: 'slide', label: 'Slide', icon: 'view-carousel' },
              { key: 'curl', label: 'Curl', icon: 'gesture' },
              { key: 'fast-fade', label: 'Fast Fade', icon: 'bolt' },
              { key: 'scroll', label: 'Scroll', icon: 'swap-vert' },
            ] as { key: PageMode; label: string; icon: any }[]).map((m, idx) => (
              <Pressable
                key={m.key}
                onPress={() => { setPrefs({ pageMode: m.key }); setModeMenuOpen(false); }}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: idx === 0 ? 0 : 1, borderColor: 'rgba(0,0,0,0.06)' }}
              >
                <ThemedText>{m.label}</ThemedText>
                <MaterialIcons name={m.icon} size={18} color="#666" />
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

function IconButton({ icon, onPress }: { icon: any; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
      <MaterialIcons name={icon} size={20} color="#666" />
    </Pressable>
  );
}

function ThemeQuickBtn({ label, value, bg, fg, active, onPress, previewFamily }: { label: string; value: ThemeMode; bg: string; fg: string; active: boolean; onPress: () => void; previewFamily: string }) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 6, tension: 160 }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 160 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        hitSlop={6}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 24,
          paddingHorizontal: 12,
          borderRadius: 10,
          flex: 1,
          flexBasis: 0,
          marginHorizontal: 6,
          backgroundColor: bg,
          borderWidth: active ? 2 : 1,
          borderColor: active ? '#4f46e5' : 'rgba(0,0,0,0.15)',
          minWidth: 96,
          minHeight: 96,
          aspectRatio: 1.1,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: fg, fontSize: 26, fontFamily: previewFamily }}>Aa</Text>
          <Text style={{ color: fg, marginTop: 2, fontSize: 12, fontFamily: 'Inter-Regular' }}>{label}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
