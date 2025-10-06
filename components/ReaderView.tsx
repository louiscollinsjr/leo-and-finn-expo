import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ReaderViewProps = {
  title?: string;
  loading?: boolean;
  error?: string | null;
  onBack?: () => void;
  onOpenContents?: () => void;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
  children: React.ReactNode;
  // Slot overrides
  renderTopOverlay?: (ctx: { insets: any; title?: string; onBack?: () => void }) => React.ReactNode;
  renderBottomOverlay?: (ctx: { insets: any; onOpenContents?: () => void; onOpenSearch?: () => void; onOpenSettings?: () => void }) => React.ReactNode;
};

function ReaderLoadingState() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
      <ThemedText style={{ marginTop: 8, opacity: 0.7 }}>Loading…</ThemedText>
    </View>
  );
}

function ReaderErrorState({ message }: { message: string | null }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
      <ThemedText type="subtitle">Unable to load story</ThemedText>
      <ThemedText style={{ marginTop: 8, textAlign: 'center', opacity: 0.8 }}>{message}</ThemedText>
    </View>
  );
}

export default function ReaderView(props: ReaderViewProps) {
  const { loading, error, children } = props;
  const insets = useSafeAreaInsets();

  if (loading) {
    return <ReaderLoadingState />;
  }

  if (error) {
    return <ReaderErrorState message={error} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}
