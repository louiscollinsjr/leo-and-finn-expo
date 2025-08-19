// ReaderMenuSheet: Bottom sheet overlay with two-column layout (no global dim or blur).
// Left column: two full-opacity buttons (Contents, Themes & Settings) and 4 mode buttons.
// Right column: vertical scrub gutter. No search, no horizontal progress slider.
import { ThemedText } from '@/components/ThemedText';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Mode = 'normal' | 'focused' | 'pronunciation' | 'translations';

export default function ReaderMenuSheet({
  visible,
  onClose,
  onOpenThemePopover,
  progress,
  onScrub,
  onSetMode,
  onPresented,
  bottomOffset,
}: {
  visible: boolean;
  onClose: () => void;
  onOpenThemePopover: () => void;
  progress: number; // 0..1
  onScrub: (v: number) => void;
  onSetMode?: (m: Mode) => void;
  onPresented?: () => void;
  bottomOffset?: number;
}) {
  const insets = useSafeAreaInsets();
  // Overall sheet opacity
  const sheetOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      sheetOpacity.setValue(0);
      Animated.timing(sheetOpacity, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => {
        onPresented && onPresented();
      });
    } else {
      Animated.timing(sheetOpacity, { toValue: 0, duration: 140, easing: Easing.in(Easing.quad), useNativeDriver: true }).start();
    }
  }, [visible, sheetOpacity, onPresented]);

  // Fast vertical scrub gutter
  const [gutterHeight, setGutterHeight] = useState(1);
  const onGutterEvent = (y: number) => {
    const v = Math.max(0, Math.min(1, y / Math.max(1, gutterHeight)));
    onScrub(v);
  };

  return (
    <View pointerEvents={visible ? 'auto' : 'none'} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
      {/* Tap outside to close (no dark overlay) */}
      <Pressable onPress={onClose} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />

      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: (bottomOffset ?? (insets.bottom || 0) + 64),
          zIndex: 20,
          opacity: sheetOpacity,
        }}
      >
        {/* Two-column layout: left content, right vertical gutter */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 28, paddingTop: 10, paddingBottom: (insets.bottom || 0) + 12 }}>
          {/* Left column */}
          <View style={{ flex: 1, paddingRight: 12 }}>
            {/* Contents button */}
            <View>
              <Pressable
                onPress={() => { /* TODO: open contents/metrics */ }}
                style={{ backgroundColor: 'rgba(217,217,217,1.0)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <ThemedText style={{ fontWeight: '700' }}>Contents · {Math.round((progress || 0) * 100)}%</ThemedText>
                <MaterialIcons name="list" size={20} color="#666" />
              </Pressable>
            </View>

            {/* Themes & Settings */}
            <View style={{ marginTop: 10 }}>
              <Pressable
                onPress={() => { onClose(); onOpenThemePopover(); }}
                style={{ backgroundColor: 'rgba(217,217,217,1.0)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <ThemedText style={{ fontWeight: '700' }}>Themes & Settings</ThemedText>
                <MaterialIcons name="text-fields" size={20} color="#666" />
              </Pressable>
            </View>

            {/* Mode buttons row */}
            <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ width: '22%', aspectRatio: 1 }}>
                <ModeButton label="" icon="menu-book" onPress={() => onSetMode && onSetMode('normal')} />
              </View>
              <View style={{ width: '22%', aspectRatio: 1 }}>
                <ModeButton label="" icon="center-focus-strong" onPress={() => onSetMode && onSetMode('focused')} />
              </View>
              <View style={{ width: '22%', aspectRatio: 1 }}>
                <ModeButton label="" icon="record-voice-over" onPress={() => onSetMode && onSetMode('pronunciation')} />
              </View>
              <View style={{ width: '22%', aspectRatio: 1 }}>
                <ModeButton label="" icon="translate" onPress={() => onSetMode && onSetMode('translations')} />
              </View>
            </View>
          </View>

          {/* Right column: vertical gutter (shares space, no overlap) */}
          <View
            onLayout={(e) => setGutterHeight(e.nativeEvent.layout.height)}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(e) => onGutterEvent(e.nativeEvent.locationY)}
            onResponderMove={(e) => onGutterEvent(e.nativeEvent.locationY)}
            style={{ width: 56, borderRadius: 12, backgroundColor: 'rgba(0,0,0,1.0)', alignItems: 'center' }}
          >
            <View style={{ width: 4, flex: 1, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 2, marginVertical: 12 }} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function ModeButton({ label, icon, onPress }: { label?: string; icon: any; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1, backgroundColor: 'rgba(217,217,217,1.0)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
    >
      <MaterialIcons name={icon} size={24} color="#666" />
      {label ? (
        <ThemedText style={{ marginTop: 4, fontSize: 12, fontWeight: '600' }}>{label}</ThemedText>
      ) : null}
    </Pressable>
  );
}
