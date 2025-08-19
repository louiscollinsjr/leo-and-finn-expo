// BottomActions: Blurred bottom bar overlay with progress slider, current page label,
// a Contents button (book icon), and a Menu button (hamburger). Supports scrubbing
// through reading progress and opening main menu/actions. Shown when overlays are visible.
import React from 'react';
import { Pressable, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { BlurView } from 'expo-blur';
import Slider from '@/components/ui/Slider';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function BottomActions({
  insets,
  onOpenContents,
  onOpenSearch,
  onOpenMenu,
  progress,
  onScrub,
  pageLabel,
}: {
  insets: any;
  onOpenContents?: () => void;
  onOpenSearch?: () => void;
  onOpenMenu?: () => void;
  progress: number; // 0..1
  onScrub?: (p: number) => void;
  pageLabel: string;
}) {
  return (
    <View pointerEvents="box-none" style={{ paddingBottom: (insets?.bottom ?? 0) }}>
      <BlurView intensity={28} tint="default" style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={onOpenContents} style={{ padding: 8 }} hitSlop={8}>
            <IconSymbol name="book" size={22} color="#888" />
          </Pressable>
          <View style={{ flex: 1, paddingHorizontal: 8 }}>
            <Slider
              value={progress}
              onChange={(v) => onScrub && onScrub(v)}
              onChangeEnd={(v) => onScrub && onScrub(v)}
              trackColor="rgba(0,0,0,0.2)"
              fillColor="#4f46e5"
              thumbColor="#fff"
            />
            <ThemedText style={{ textAlign: 'center', marginTop: 4, opacity: 0.8 }}>{pageLabel}</ThemedText>
          </View>
          <Pressable onPress={onOpenMenu} style={{ padding: 8 }} hitSlop={8}>
            <ThemedText style={{ fontSize: 22 }}>≡</ThemedText>
          </Pressable>
        </View>
      </BlurView>
    </View>
  );
}
