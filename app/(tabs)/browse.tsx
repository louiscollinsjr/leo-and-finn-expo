import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';

export default function BrowseScreen() {
  return (
    <ThemedView className="flex-1 items-center justify-center bg-background">
      <ThemedText type="title">Browse Stories</ThemedText>
      <ThemedText className="mt-2 text-center">
        Browse and discover new stories.
      </ThemedText>
    </ThemedView>
  );
}
