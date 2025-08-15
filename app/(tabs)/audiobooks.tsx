import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';

export default function AudiobooksScreen() {
  return (
    <ThemedView className="flex-1 items-center justify-center bg-background">
      <ThemedText type="title">Audiobooks</ThemedText>
      <ThemedText className="mt-2 text-center">
        Welcome to the audiobooks screen.
      </ThemedText>
    </ThemedView>
  );
}