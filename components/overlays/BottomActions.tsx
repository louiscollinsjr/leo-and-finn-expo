// BottomActions: Blurred bottom bar overlay with progress slider, current page label,
// a Contents button (book icon), and a Menu button (hamburger). Supports scrubbing
// through reading progress and opening main menu/actions. Shown when overlays are visible.
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Pressable, View } from 'react-native';

type Mode = 'normal' | 'focused' | 'pronunciation' | 'translations';

export default function BottomActions({
  insets,
  onOpenContents,
  onOpenSearch,
  onOpenMenu,
  progress,
  onScrub,
  pageLabel,
  onSetMode,
}: {
  insets: any;
  onOpenContents?: () => void;
  onOpenSearch?: () => void;
  onOpenMenu?: () => void;
  progress: number; // 0..1
  onScrub?: (p: number) => void;
  pageLabel: string;
  onSetMode?: (m: Mode) => void;
}) {
  const textColor = useThemeColor({}, 'text');
  return (
    <View pointerEvents="box-none" style={{ paddingBottom: (insets?.bottom ?? 0) }}>
     
        <View style={{ position: 'relative', height: 40, alignItems: 'center', justifyContent: 'center' }}>
          {/* Centered mode buttons */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <ModeButton icon="menu-book" onPress={() => onSetMode && onSetMode('normal')} textColor={textColor} />
            <ModeButton icon="center-focus-strong" onPress={() => onSetMode && onSetMode('focused')} textColor={textColor} />
            <ModeButton icon="record-voice-over" onPress={() => onSetMode && onSetMode('pronunciation')} textColor={textColor} />
            <ModeButton icon="translate" onPress={() => onSetMode && onSetMode('translations')} textColor={textColor} />
          </View>

          {/* Menu button pinned right */}
          <Pressable
            onPress={onOpenMenu}
            hitSlop={8}
            style={{ position: 'absolute', right: (insets?.right ?? 0) + 32, top: 0, width: 40, height: 40, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}
          >
            <BlurView intensity={25} tint="default" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 }} />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(217,217,217,0.65)' }} />
            <IconSymbol name="slider.horizontal.3" size={24} color={textColor} weight="regular" style={{ opacity: 0.5 }} />
          </Pressable>
        </View>
     
    </View>
  );
}

function ModeButton({ icon, onPress, textColor }: { icon: any; onPress: () => void; textColor: string }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{ 
        marginRight: 8, 
        width: 40, 
        height: 40, 
        borderRadius: 10, 
        overflow: 'hidden', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
    >
      <BlurView intensity={25} tint="default" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 }} />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(217,217,217,0.45)' }} />
      <MaterialIcons name={icon} size={16} color={textColor} style={{ opacity: 0.4 }} />
    </Pressable>
  );
}
