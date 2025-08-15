import React from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function StoreScreen() {
  return (
    <ThemedView className="flex-1 items-center justify-center bg-background">
      <ThemedText type="title">Book Store</ThemedText>
      <ThemedText className="mt-2 text-center">
        Browse and discover new books.
      </ThemedText>
    </ThemedView>
  );
}
