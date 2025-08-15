import React from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function LibraryScreen() {
  return (
    <ThemedView className="flex-1 items-center justify-center bg-background">
      <ThemedText type="title">Library</ThemedText>
      <ThemedText className="mt-2 text-center">
        Your saved books will appear here.
      </ThemedText>
    </ThemedView>
  );
}
