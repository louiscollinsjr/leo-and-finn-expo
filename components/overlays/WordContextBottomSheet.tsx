import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { useWordTranslations } from "@/hooks/useWordTranslations";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface WordContextBottomSheetProps {
  word: string | null;
  tokenId: string | null;
  onClose: () => void;
}

// Capitalize only the first letter, leave the rest as-is
const capitalizeFirst = (input?: string | null): string => {
  if (!input) return "";
  const s = input.trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const WordContextBottomSheet = forwardRef<
  BottomSheet,
  WordContextBottomSheetProps
>(({ word, tokenId, onClose }, ref) => {
  const snapPoints = useMemo(() => ["35%", "75%", "95%"], []);
  const [translation, setTranslation] = useState("");
  const insets = useSafeAreaInsets();

  const {
    addTranslation,
    markAsKnown,
    loading: mutationLoading,
    error: mutationError,
  } = useWordTranslations(word, tokenId);

  const handleSaveTranslation = async () => {
    if (translation.trim() === "") return;
    await addTranslation(translation);
    setTranslation("");
    // Optionally close the sheet after saving
    // @ts-ignore
    ref.current?.close();
  };

  const handleMarkAsKnown = async () => {
    await markAsKnown();
    // Optionally close the sheet after marking as known
    // @ts-ignore
    ref.current?.close();
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1} // Start closed
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      style={{ width: "100%", alignContent: "center" }}
      backgroundStyle={{ backgroundColor: "transparent", borderRadius: 40 }}
      topInset={Math.max(12, insets.top)}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      )}
      handleIndicatorStyle={{
        opacity: 0,
        height: 0,
        width: 0,
      }}
    >
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: Math.max(24, insets.bottom + 24), paddingTop: 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >

        {/* Close button (top-right) */}
        
        <View style={styles.innerContainer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => {
              (ref as any)?.current?.close();
              onClose?.();
            }}
            style={styles.closeButton}
            hitSlop={8}
          >
            <ThemedText style={{ fontSize: 20, lineHeight: 20 }}>✕</ThemedText>
          </Pressable>
          <ThemedText style={styles.wordTitle}>
            Your story, your words...
          </ThemedText>
          <View style={{ alignSelf: "stretch", marginBottom: 0 }}>
            <ThemedText style={styles.helperText}>
              Add words you recognize. If you know it by heart, tap ‘I know this
              word!'
            </ThemedText>
          </View>
          {word && (
            <ThemedText style={styles.word}>{capitalizeFirst(word)}</ThemedText>
          )}

          <TextInput
            style={styles.input}
            placeholder="Enter translation..."
            placeholderTextColor="#888"
            value={translation}
            onChangeText={setTranslation}
          />

          <ThemedButton
            title="Update Translation"
            onPress={handleSaveTranslation}
            disabled={mutationLoading}
            style={{
              marginBottom: 8,
              backgroundColor: "#1c1e31",
              paddingVertical: 14,
              borderRadius: 18,
            }}
            textStyle={{ color: "#fff", fontSize: 20, letterSpacing: 0.25 }}
          />

          {mutationLoading && <ActivityIndicator style={{ marginTop: 15 }} />}
          {mutationError && (
            <ThemedText style={styles.errorText}>{mutationError}</ThemedText>
          )}

          <ThemedButton
            title="I know this word!"
            onPress={handleMarkAsKnown}
            disabled={mutationLoading}
            variant="secondary"
            style={{
              marginVertical: 6,
              backgroundColor: "#f5f5f5",
              paddingVertical: 14,
              borderRadius: 12,
            }}
            textStyle={{ color: "#999", fontSize: 20, letterSpacing: 0.25 }}
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 20, // Provides space for the shadow
    paddingTop: 32, // Extra space for handle area to avoid clipping
    alignItems: "center",
    width: "100%",
  },
  innerContainer: {
    backgroundColor: "white",
    padding: 24,
    paddingTop: 48,
    borderRadius: 32,
    minHeight: 420,
    width: "100%",

    elevation: 5,
  },
  wordTitle: {
    fontSize: 40,
    fontWeight: "bold",
    marginVertical: 16,
    textAlign: "left",
    // Ensure lineHeight is >= fontSize to avoid glyph clipping
    lineHeight: 44,
  },
  word: {
    fontSize: 56,
    fontWeight: "bold",
    marginVertical: 32,
    textAlign: "center",
    // Ensure lineHeight is >= fontSize to avoid glyph clipping
    lineHeight: 56,
    color: "#1c1e31",
  },
  closeButton: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  helperText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "normal",
    color: "#000",
    textAlign: "left",
    paddingHorizontal: 0,
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f3f3f3",
    color: "#000",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 24,
    fontSize: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});
