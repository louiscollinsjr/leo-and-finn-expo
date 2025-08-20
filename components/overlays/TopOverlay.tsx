// TopOverlay: Minimal top bar overlay with optional centered pill label and a close
// (X) button on the right. No global blur background; pill backgrounds are blurred
// while keeping text crisp. Appears when reader overlays are shown (tap) and
// auto-dismisses via ReaderView's overlay timer.
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Pressable, View } from 'react-native';

export default function TopOverlay({ insets, title, centerLabel, onBack }: { insets: any; title?: string; centerLabel?: string; onBack?: () => void }) {
  const textColor = useThemeColor({}, 'text');
  return (
    <View pointerEvents="box-none" style={{ paddingTop: (insets?.top ?? 0) }}>
      <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ width: 56 }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            {centerLabel ? (
              <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, overflow: 'hidden' }}>
                <BlurView intensity={25} tint="default" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 2 }} />
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(217,217,217,0.80)' }} />
                <ThemedText style={{ fontWeight: '400', opacity: 0.65, fontSize: 10 }} numberOfLines={1}>{centerLabel}</ThemedText>
              </View>
            ) : title ? (
              <ThemedText style={{ fontWeight: '400' }} numberOfLines={1}>{title}</ThemedText>
            ) : <View />}
          </View>
          <Pressable
            onPress={onBack}
            hitSlop={8}
            style={{ marginRight: 20, width: 32, height: 32, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}
          >
            <BlurView intensity={25} tint="default" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 }} />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(217,217,217,0.75)' }} />
            <IconSymbol name="xmark" size={16} color={textColor} style={{ opacity: 0.45 }} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
