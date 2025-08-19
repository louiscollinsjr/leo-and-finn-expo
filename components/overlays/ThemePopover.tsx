// ThemePopover: Quick-access popover for reading appearance. Fades in above the
// bottom bar to offer font size controls, brightness slider, and theme presets,
// with a button to open the full Customise sheet.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { ThemedText } from '@/components/ThemedText';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Slider from '@/components/ui/Slider';
import { useReaderPrefs, type ThemeMode } from '@/providers/ReaderProvider';

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
      <Pressable onPress={onRequestClose} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
        <Animated.View style={{ flex: 1, backgroundColor: 'black', opacity: opacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.2] }) }} />
      </Pressable>

      <Animated.View style={{ position: 'absolute', left: 16, right: 16, bottom: 100, opacity, transform: [{ translateY }] }}>
        <BlurView intensity={28} tint="default" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
            {/* Font size row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <ThemedText style={{ fontWeight: '700' }}>Text Size</ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconButton icon="remove" onPress={() => adjustFont(-0.05)} />
                <ThemedText style={{ width: 56, textAlign: 'center' }}>{prefs.fontScale.toFixed(2)}×</ThemedText>
                <IconButton icon="add" onPress={() => adjustFont(+0.05)} />
              </View>
            </View>

            {/* Brightness */}
            <View style={{ marginTop: 10 }}>
              <ThemedText style={{ fontWeight: '700' }}>Brightness</ThemedText>
              <View style={{ marginTop: 6 }}>
                <Slider
                  value={prefs.brightness ?? 1}
                  onChange={(v) => setPrefs({ brightness: v })}
                  onChangeEnd={(v) => setPrefs({ brightness: v })}
                  trackColor="rgba(0,0,0,0.15)"
                  fillColor="#4f46e5"
                />
              </View>
            </View>

            {/* Theme grid */}
            <View style={{ marginTop: 10 }}>
              <ThemedText style={{ fontWeight: '700' }}>Theme</ThemedText>
              <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                {(['system', 'light', 'dark', 'sepia'] as ThemeMode[]).map((t) => (
                  <ThemeSwatch key={t} label={t} active={prefs.theme === t} onPress={() => setTheme(t)} />
                ))}
              </View>
            </View>

            {/* Customise button */}
            <Pressable onPress={onOpenCustomize} style={{ marginTop: 12, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' }}>
              <ThemedText style={{ fontWeight: '700' }}>Customise…</ThemedText>
            </Pressable>
          </View>
        </BlurView>
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
