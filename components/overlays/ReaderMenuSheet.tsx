// ReaderMenuSheet: Simplified settings sheet (mode buttons moved to ReaderModeBar)
// Contains Contents button and Themes & Settings access
import { ThemedText } from '@/components/ThemedText';
import BlurCapsule from '@/components/ui/BlurCapsule';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReaderMenuSheet({
  visible,
  onClose,
  onOpenThemePopover,
  progress,
  onPresented,
  bottomOffset,
}: {
  visible: boolean;
  onClose: () => void;
  onOpenThemePopover: () => void;
  progress: number; // 0..1
  onPresented?: () => void;
  bottomOffset?: number;
}) {
  const insets = useSafeAreaInsets();

  // Call onPresented when becoming visible
  React.useEffect(() => {
    if (visible) onPresented?.();
  }, [visible, onPresented]);

  // Fade/slide animation for presenting/dismissing the sheet
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
          easing: Easing.in(Easing.quad),
        }),
        Animated.timing(translateY, {
          toValue: 10,
          duration: 140,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, mounted, opacity, translateY]);

  if (!mounted) return null;

  return (
    <View pointerEvents={visible ? 'auto' : 'none'} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
      {/* Tap outside to close (no dark overlay) */}
      <Pressable onPress={onClose} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />

      <Animated.View
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: (bottomOffset ?? (insets.bottom || 0) + 80),
          zIndex: 20,
          opacity,
          transform: [{ translateY }],
        }}
      >
        <BlurCapsule borderRadius={16} style={{ padding: 12 }}>
          {/* Contents button */}
          <Pressable
            onPress={() => { /* TODO: open contents/metrics */ }}
            style={{
              backgroundColor: 'rgba(0,0,0,0.06)',
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <ThemedText style={{ fontWeight: '500', fontSize: 15 }}>
              Contents · {Math.round((progress || 0) * 100)}%
            </ThemedText>
            <MaterialIcons name="list" size={20} color="#666" />
          </Pressable>

          {/* Themes & Settings */}
          <Pressable
            onPress={() => {
              onClose();
              onOpenThemePopover();
            }}
            style={{
              marginTop: 8,
              backgroundColor: 'rgba(0,0,0,0.06)',
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <ThemedText style={{ fontWeight: '500', fontSize: 15 }}>Themes & Settings</ThemedText>
            <MaterialIcons name="text-fields" size={18} color="#666" />
          </Pressable>
        </BlurCapsule>
      </Animated.View>
    </View>
  );
}
