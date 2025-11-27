// BottomActions: Blurred bottom bar overlay with mode selection buttons (normal, focused,
// pronunciation, translations) and a Menu button. Shown when overlays are visible.
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { ReadingMode } from '@/providers/ReaderProvider';
import { useReaderUI } from '@/providers/ReaderProvider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Pressable, View } from 'react-native';

export type Mode = ReadingMode;

export default function BottomActions({
  insets,
  onOpenMenu,
}: {
  insets: any;
  onOpenMenu?: () => void;
}) {
  const textColor = useThemeColor({}, 'text');
  const { readingMode, setReadingMode } = useReaderUI();
  
  return (
    <View pointerEvents="box-none" style={{ paddingBottom: (insets?.bottom ?? 0) }}>
     
        <View style={{ position: 'relative', height: 40, alignItems: 'center', justifyContent: 'center' }}>
          {/* Centered mode buttons */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <ModeButton icon="menu-book" mode="normal" activeMode={readingMode} onPress={() => setReadingMode('normal')} textColor={textColor} />
            <ModeButton icon="center-focus-strong" mode="focused" activeMode={readingMode} onPress={() => setReadingMode('focused')} textColor={textColor} />
            <ModeButton icon="record-voice-over" mode="pronunciation" activeMode={readingMode} onPress={() => setReadingMode('pronunciation')} textColor={textColor} />
            <ModeButton icon="translate" mode="translations" activeMode={readingMode} onPress={() => setReadingMode('translations')} textColor={textColor} />
          </View>

          {/* Menu button pinned right */}
          <Pressable
            onPress={onOpenMenu}
            hitSlop={8}
            style={{ position: 'absolute', right: (insets?.right ?? 0) + 32, top: 0, width: 40, height: 40, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}
          >
            <BlurView intensity={25} tint="default" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 }} />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(217,217,217,0.65)' }} />
            <IconSymbol name="slider.horizontal.3" size={24} color={textColor} style={{ opacity: 0.5 }} />
          </Pressable>
        </View>
     
    </View>
  );
}

function ModeButton({ 
  icon, 
  mode, 
  activeMode, 
  onPress, 
  textColor 
}: { 
  icon: any; 
  mode: Mode;
  activeMode: Mode;
  onPress: () => void; 
  textColor: string;
}) {
  const isActive = mode === activeMode;
  
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
      <View 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: isActive ? 'rgba(100, 150, 255, 0.5)' : 'rgba(217,217,217,0.45)' 
        }} 
      />
      <MaterialIcons name={icon} size={16} color={textColor} style={{ opacity: isActive ? 1 : 0.4 }} />
    </Pressable>
  );
}
