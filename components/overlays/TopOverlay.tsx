import React from 'react';
import { Pressable, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function TopOverlay({ insets, title, onBack }: { insets: any; title: string; onBack?: () => void }) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: (insets?.top ?? 0) + 8,
        paddingBottom: 8,
        backgroundColor: 'rgba(0,0,0,0.25)'
      }}
      pointerEvents="box-none"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={onBack} hitSlop={8} style={{ padding: 6 }}>
          <ThemedText style={{ fontWeight: '600' }}>{'Back'}</ThemedText>
        </Pressable>
        <ThemedText style={{ fontWeight: '600' }} numberOfLines={1}>
          {title}
        </ThemedText>
        <View style={{ width: 48 }} />
      </View>
    </View>
  );
}
