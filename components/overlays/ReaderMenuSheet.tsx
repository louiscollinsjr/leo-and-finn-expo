// ReaderMenuSheet: Bottom sheet main menu overlay. Shows dimmed backdrop and a
// blurred panel with: Contents shortcut, Search field, Themes & Settings button,
// quick action icons, and a progress slider. Includes a right-side fast-scroll gutter
// to scrub vertically through the book.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, TextInput, View, useWindowDimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Slider from '@/components/ui/Slider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ReaderMenuSheet({
  visible,
  onClose,
  onOpenThemePopover,
  progress,
  onScrub,
}: {
  visible: boolean;
  onClose: () => void;
  onOpenThemePopover: () => void;
  progress: number; // 0..1
  onScrub: (v: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const sheetHeight = Math.round(height * 0.6);
  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 0, duration: 150, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: sheetHeight, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [visible, sheetHeight, backdrop, translateY]);

  // Fast vertical scrub gutter
  const [gutterHeight, setGutterHeight] = useState(1);
  const onGutterEvent = (y: number) => {
    const v = Math.max(0, Math.min(1, y / Math.max(1, gutterHeight)));
    onScrub(v);
  };

  return (
    <View pointerEvents={visible ? 'auto' : 'none'} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
      <Pressable onPress={onClose} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
        <Animated.View style={{ flex: 1, backgroundColor: 'black', opacity: backdrop.interpolate({ inputRange: [0, 1], outputRange: [0, 0.25] }) }} />
      </Pressable>

      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateY }],
        }}
      >
        <BlurView intensity={30} tint="default" style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' }}>
          <View style={{ paddingTop: 10, paddingBottom: 6, paddingHorizontal: 12 }}>
            <Pressable onPress={() => {}} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
              <ThemedText style={{ fontWeight: '600' }}>Contents · {Math.round((progress || 0) * 100)}%</ThemedText>
              <MaterialIcons name="list" size={20} color="#666" />
            </Pressable>

            <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 12, paddingHorizontal: 12, height: 40 }}>
              <MaterialIcons name="search" size={18} color="#666" />
              <TextInput placeholder="Search Book" placeholderTextColor="#666" style={{ marginLeft: 8, flex: 1 }} />
            </View>

            <Pressable onPress={onOpenThemePopover} style={{ marginTop: 10, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,0.08)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <ThemedText style={{ fontWeight: '700' }}>Themes & Settings</ThemedText>
              <MaterialIcons name="text-fields" size={20} color="#666" />
            </Pressable>
          </View>

          {/* Actions row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12, paddingVertical: 8 }}>
            <IconButton name="share" label="Share" />
            <IconButton name="screen-lock-rotation" label="Lock" />
            <IconButton name="view-agenda" label="View" />
            <IconButton name="bookmark-border" label="Bookmark" />
          </View>

          {/* Progress section with label */}
          <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
            <Slider value={progress} onChange={onScrub} onChangeEnd={onScrub} trackColor="rgba(0,0,0,0.15)" fillColor="#4f46e5" />
          </View>

          {/* Bottom spacer */}
          <View style={{ height: (insets.bottom || 0) + 12 }} />
        </BlurView>

        {/* Fast-scroll vertical gutter */}
        <View
          onLayout={(e) => setGutterHeight(e.nativeEvent.layout.height)}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(e) => onGutterEvent(e.nativeEvent.locationY)}
          onResponderMove={(e) => onGutterEvent(e.nativeEvent.locationY)}
          style={{ position: 'absolute', right: 8, bottom: (insets.bottom || 0) + 16, top: 16, width: 28, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center' }}
        >
          <View style={{ width: 4, flex: 1, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 2, marginVertical: 12 }} />
        </View>
      </Animated.View>
    </View>
  );
}

function IconButton({ name, label }: { name: any; label: string }) {
  return (
    <Pressable style={{ alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10 }}>
      <MaterialIcons name={name} size={22} color="#666" />
      <ThemedText style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>{label}</ThemedText>
    </Pressable>
  );
}
