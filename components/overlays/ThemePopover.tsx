// ThemePopover: Quick-access popover for reading appearance. Fades in above the
// bottom bar to offer font size controls, brightness slider, and theme presets,
// with a button to open the full Customise sheet.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Slider from '@/components/ui/Slider';
import { useReaderPrefs, type ThemeMode, type PageMode } from '@/providers/ReaderProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 120, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 14, duration: 120, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [visible, opacity, translateY]);

  const { prefs, setPrefs } = useReaderPrefs();

  const setTheme = (theme: ThemeMode) => setPrefs({ theme });
  const adjustFont = (delta: number) => {
    const v = Math.max(0.7, Math.min(1.6, (prefs.fontScale ?? 1) + delta));
    setPrefs({ fontScale: v });
  };

  return (
    <View pointerEvents={visible ? 'auto' : 'none'} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
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
          paddingBottom: (insets.bottom || 0) + 12,
        }}
      >
        <View
          style={{
            marginHorizontal: 12,
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.08)',
            paddingHorizontal: 14,
            paddingTop: 10,
            paddingBottom: 12,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <ThemedText style={{ fontWeight: '700' }}>Theme</ThemedText>
            <Pressable onPress={onRequestClose} hitSlop={8} style={{ padding: 4 }}>
              <MaterialIcons name="close" size={18} color="#666" />
            </Pressable>
          </View>

          {/* Controls row: text size + page mode */}
          <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Text size segmented */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 6, flex: 1, marginRight: 10 }}>
              <Pressable onPress={() => adjustFont(-0.05)} style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
                <ThemedText style={{ fontSize: 14 }}>A</ThemedText>
              </Pressable>
              <View style={{ backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 6, marginHorizontal: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>A</ThemedText>
              </View>
              <Pressable onPress={() => adjustFont(+0.05)} style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
                <ThemedText style={{ fontSize: 18 }}>A</ThemedText>
              </Pressable>
            </View>

            {/* Page mode button */}
            <Pressable
              onPress={() => setModeMenuOpen((v) => !v)}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}
            >
              <ThemedText style={{ fontWeight: '600', marginRight: 6, textTransform: 'capitalize' }}>{prefs.pageMode ?? 'scroll'}</ThemedText>
              <MaterialIcons name="arrow-drop-up" size={18} color="#666" />
            </Pressable>
          </View>

          {/* Page mode inline menu */}
          {modeMenuOpen ? (
            <View style={{ position: 'absolute', left: 18, right: 18, bottom: (insets.bottom || 0) + 120, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10 }}>
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
          ) : null}

          {/* Brightness */}
          <View style={{ marginTop: 12 }}>
            <ThemedText style={{ fontWeight: '700' }}>Brightness</ThemedText>
            <View style={{ marginTop: 10 }}>
              <Slider
                value={prefs.brightness ?? 1}
                onChange={(v) => setPrefs({ brightness: v })}
                onChangeEnd={(v) => setPrefs({ brightness: v })}
                trackColor="rgba(0,0,0,0.15)"
                fillColor="#4f46e5"
              />
            </View>
          </View>

          {/* Prominent theme buttons (3) */}
          <View style={{ marginTop: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {[{ key: 'system', label: 'Original' }, { key: 'dark', label: 'Quiet' }, { key: 'light', label: 'Paper' }].map((t) => (
                <ThemeSwatch
                  key={t.key}
                  label={t.label}
                  active={prefs.theme === (t.key as ThemeMode)}
                  onPress={() => setTheme(t.key as ThemeMode)}
                />
              ))}
            </View>
          </View>

          {/* Customize */}
          <Pressable onPress={onOpenCustomize} style={{ marginTop: 16, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' }}>
            <ThemedText style={{ fontWeight: '700' }}>Customize</ThemedText>
          </Pressable>
        </View>
      </Animated.View>
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

function ThemeSwatch({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1, marginHorizontal: 4, paddingVertical: 16, borderRadius: 12, backgroundColor: active ? 'rgba(79,70,229,0.18)' : 'rgba(0,0,0,0.06)', alignItems: 'center' }}>
      <ThemedText style={{ fontWeight: '600', textTransform: 'capitalize' }}>{label}</ThemedText>
    </Pressable>
  );
}
