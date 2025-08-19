import React from 'react';
import { Pressable, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function BottomActions({
  insets,
  onOpenContents,
  onOpenSearch,
  onOpenSettings,
}: {
  insets: any;
  onOpenContents?: () => void;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: (insets?.bottom ?? 0) + 12,
        backgroundColor: 'rgba(0,0,0,0.25)'
      }}
      pointerEvents="box-none"
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Pressable onPress={onOpenContents} style={{ padding: 10 }}>
          <ThemedText>Contents</ThemedText>
        </Pressable>
        <Pressable onPress={onOpenSearch} style={{ padding: 10 }}>
          <ThemedText>Search</ThemedText>
        </Pressable>
        <Pressable onPress={onOpenSettings} style={{ padding: 10 }}>
          <ThemedText>Aa</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}
