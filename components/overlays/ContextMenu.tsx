import React from 'react';
import { Pressable, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function ContextMenu({ visible, onDismiss, onOpenSettings }: { visible: boolean; onDismiss: () => void; onOpenSettings?: () => void }) {
  if (!visible) return null;
  return (
    <Pressable onPress={onDismiss} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'transparent' }}>
      <View style={{ position: 'absolute', right: 16, bottom: 80, borderRadius: 12, paddingVertical: 8, backgroundColor: 'rgba(0,0,0,0.35)' }}>
        <Pressable
          style={{ paddingHorizontal: 16, paddingVertical: 10 }}
          onPress={() => {
            onDismiss();
            onOpenSettings && onOpenSettings();
          }}
        >
          <ThemedText>Themes & Settings</ThemedText>
        </Pressable>
        <Pressable style={{ paddingHorizontal: 16, paddingVertical: 10 }} onPress={() => { /* TODO: view options */ }}>
          <ThemedText>View Options</ThemedText>
        </Pressable>
      </View>
    </Pressable>
  );
}
