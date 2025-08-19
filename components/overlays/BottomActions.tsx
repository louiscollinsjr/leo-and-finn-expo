// BottomActions: Blurred bottom bar overlay with progress slider, current page label,
// a Contents button (book icon), and a Menu button (hamburger). Supports scrubbing
// through reading progress and opening main menu/actions. Shown when overlays are visible.
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Pressable, View } from 'react-native';

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
  const textColor = useThemeColor({}, 'text');
  return (
    <View pointerEvents="box-none" style={{ paddingBottom: (insets?.bottom ?? 0) }}>
     
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Pressable
            onPress={onOpenMenu}
            hitSlop={8}
            style={{ marginRight: 40, width: 40, height: 40, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}
          >
            <BlurView intensity={25} tint="default" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 }} />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(217,217,217,0.55)' }} />
            <IconSymbol name="slider.horizontal.3" size={24} color={textColor} weight="semibold" />
          </Pressable>
        </View>
     
    </View>
  );
}
