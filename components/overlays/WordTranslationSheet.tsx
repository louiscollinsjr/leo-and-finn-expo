// WordTranslationSheet: Simplified vocabulary sheet for word translation entry
// Uses TrueSheet for better keyboard handling and auto-sizing
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { useWordTranslations } from "@/hooks/useWordTranslations";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  TextInput,
  View
} from "react-native";

interface WordTranslationSheetProps {
  word: string | null;
  tokenId: string | null;
  onClose: () => void;
}

const capitalizeFirst = (input?: string | null): string => {
  if (!input) return "";
  const s = input.trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const WordTranslationSheet = forwardRef<
  TrueSheet,
  WordTranslationSheetProps
>(({ word, tokenId, onClose }, ref) => {
  const [translation, setTranslation] = useState("");
  const inputRef = useRef<TextInput>(null);

  const {
    saveTranslation,
    markKnown,
    loading: mutationLoading,
    error: mutationError,
  } = useWordTranslations();

  // Clear translation when word changes
  useEffect(() => {
    if (word) {
      setTranslation("");
      // Focus input after sheet opens
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [word]);

  const handleSaveTranslation = useCallback(async () => {
    if (!word || !translation.trim()) return;

    const success = await saveTranslation(word, translation.trim());
    if (success) {
      Keyboard.dismiss();
      onClose();
    }
  }, [word, translation, saveTranslation, onClose]);

  const handleMarkKnown = useCallback(async () => {
    if (!word) return;

    const success = await markKnown(word);
    if (success) {
      onClose();
    }
  }, [word, markKnown, onClose]);

  return (
    <TrueSheet
      ref={ref}
      sizes={['auto', 'large']}
      cornerRadius={24}
      onDismiss={onClose}
    >
      <View style={styles.container}>
        {/* Word Header */}
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.word}>
            {capitalizeFirst(word)}
          </ThemedText>
          <ThemedText style={styles.language}>
            Romanian → English
          </ThemedText>
        </View>

        {/* Translation Input */}
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Translation</ThemedText>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={translation}
            onChangeText={setTranslation}
            placeholder="Enter English translation..."
            placeholderTextColor="rgba(60,60,67,0.3)"
            returnKeyType="done"
            onSubmitEditing={handleSaveTranslation}
            autoCapitalize="none"
            autoCorrect={false}
            multiline={false}
          />
        </View>

        {/* Error Message */}
        {mutationError && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{mutationError}</ThemedText>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <ThemedButton
            onPress={handleMarkKnown}
            disabled={mutationLoading || !word}
            style={styles.secondaryButton}
          >
            {mutationLoading ? (
              <ActivityIndicator size="small" />
            ) : (
              <ThemedText style={styles.secondaryButtonText}>
                Mark as Known
              </ThemedText>
            )}
          </ThemedButton>

          <ThemedButton
            onPress={handleSaveTranslation}
            disabled={mutationLoading || !word || !translation.trim()}
            style={styles.primaryButton}
          >
            {mutationLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={styles.primaryButtonText}>
                Save Translation
              </ThemedText>
            )}
          </ThemedButton>
        </View>
      </View>
    </TrueSheet>
  );
});

WordTranslationSheet.displayName = 'WordTranslationSheet';

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  word: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  language: {
    fontSize: 14,
    opacity: 0.6,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.18)',
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    minHeight: 52,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderRadius: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(60,60,67,0.08)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
