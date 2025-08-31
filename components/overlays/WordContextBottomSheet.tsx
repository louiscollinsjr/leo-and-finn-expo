import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { useWordTranslations } from "@/hooks/useWordTranslations";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardEvent,
    LayoutAnimation,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Platform-specific components to avoid web Skia errors

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

// Define a type for the BottomSheet methods we need to access
type BottomSheetMethods = {
  snapToIndex: (index: number) => void;
  close: () => void;
  expand: () => void;
};

export const WordContextBottomSheet = forwardRef<
  React.ElementRef<typeof BottomSheet>,
  WordContextBottomSheetProps
>(({ word, tokenId, onClose }, ref) => {
  // Create a properly typed ref that we can safely use
  const sheetRef = useRef<BottomSheetMethods | null>(null);
  
  // We'll handle ref synchronization directly in the BottomSheet component's ref prop
  // Use fixed snap points
  // Snap points are optimized for different interaction contexts:
  // - 35%: A quick glance at the word and its primary definition.
  // - 75%: Comfortable reading of definitions and examples.
  // - 95%: Full-screen for focused editing or viewing extensive content.
  const snapPoints = useMemo(() => ["35%", "75%", "95%"], []);
  const [translation, setTranslation] = useState("");
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [sheetIndex, setSheetIndex] = useState(-1);
  const sheetIndexRef = useRef(sheetIndex);

  const {
    addTranslation,
    markAsKnown,
    loading: mutationLoading,
    error: mutationError,
  } = useWordTranslations(word, tokenId);
  
  // iOS safe focus timeout reference
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // iOS-specific input props to avoid RemoteTextInput session errors
  const iosTextInputProps = useMemo(() => {
    if (Platform.OS !== 'ios') return {};
    
    return {
      blurOnSubmit: true,
      keyboardAppearance: "light",
      enablesReturnKeyAutomatically: true,
      autoCapitalize: "none",
      autoCorrect: false,
      spellCheck: false,
      multiline: false,
    };
  }, []);
  
  // Safely handle focus by scheduling it properly
  useEffect(() => {
    // Cleanup any pending focus timeouts when component unmounts
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);
  
  // Define handleSaveTranslation before it's used in renderTextInput
  const handleSaveTranslation = async () => {
    if (translation.trim() === "") return;
    await addTranslation(translation);
    setTranslation("");
    // Optionally close the sheet after saving
    if (sheetRef.current) {
      sheetRef.current.close();
    }
  };

  // Function to render TextInput with proper iOS support
  const renderTextInput = useCallback(() => {
    const commonProps = {
      ref: inputRef,
      style: styles.input,
      placeholder: "Enter translation...",
      placeholderTextColor: "#888",
      value: translation,
      onChangeText: setTranslation,
      returnKeyType: "done",
      blurOnSubmit: Platform.OS === 'ios', // true for iOS, false for other platforms
      onSubmitEditing: () => {
        if (translation.trim()) {
          handleSaveTranslation();
        }
      },
      // Use passive focus handling on iOS to avoid RemoteTextInput session errors
      onFocus: () => {
        // When input is focused on non-iOS platforms, ensure sheet is at high enough position
        if (Platform.OS !== 'ios' && sheetIndex < 1) {
          if (sheetRef.current) {
            sheetRef.current.snapToIndex(1);
          }
        } else if (Platform.OS === 'ios' && sheetIndex < 1) {
          // On iOS, avoid focus/keyboard interactions during animation
          // Let the sheet animation complete first
          Keyboard.dismiss();
          if (sheetRef.current) {
            sheetRef.current.snapToIndex(1);
          }
          return;
        }
      },
      ...iosTextInputProps,
    };
    
    return <TextInput {...commonProps} />;
  }, [translation, sheetIndex, iosTextInputProps]);
  
  // Keyboard event handlers
  const handleKeyboardShow = useCallback((event: KeyboardEvent) => {
    const keyboardHeight = event.endCoordinates.height;
    setKeyboardHeight(keyboardHeight);
    setIsKeyboardVisible(true);
    
    // When keyboard shows, ensure the sheet is at at least the middle snap point
    if (sheetIndex < 1 && sheetRef.current) {
      sheetRef.current.snapToIndex(1);
    }
    
    // Animate transitions
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [sheetIndex]);

  const handleKeyboardHide = useCallback(() => {
    setKeyboardHeight(0);
    setIsKeyboardVisible(false);
    
    // Animate transitions
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);
  
  // Set up keyboard listeners with proper event names for cross-platform compatibility
  useEffect(() => {
    // Use different events based on platform
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    
    const showSubscription = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [handleKeyboardShow, handleKeyboardHide]);
  
  // Safe focusing for iOS - completely avoids RemoteTextInput session error
  const safelyFocusInput = useCallback(() => {
    if (Platform.OS === 'ios') {
      // Clear any existing focus timeouts to avoid multiple calls
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }
      
      // First ensure keyboard is dismissed to reset any existing text input sessions
      Keyboard.dismiss();
      
      // Wait for a complete frame refresh cycle
      requestAnimationFrame(() => {
        // Then set a relatively long timeout to ensure all animations have fully settled
        focusTimeoutRef.current = setTimeout(() => {
          // Double-check that component is still mounted
          if (!inputRef.current) return;
          
          // On iOS, wrap focus in try-catch to handle potential RemoteTextInput session errors
          try {
            // Use a proper input method
            if (inputRef.current.focus) {
              inputRef.current.focus();
            }
          } catch (e) {
            console.log('Handled iOS focus error safely, retrying...');
            
            // If the first attempt failed, try once more with an even longer delay
            setTimeout(() => {
              try {
                inputRef.current?.focus();
              } catch (innerError) {
                // At this point, we've tried our best - silent fail
                console.log('Final focus attempt failed');
              }
            }, 500);
          }
        }, 700); // Use a longer delay for iOS to be extra safe
      });
    } else {
      // For other platforms, focus normally with a shorter delay
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, []);

  // Handle sheet changes with iOS-specific optimizations
  const handleSheetChange = useCallback((index: number) => {
    setSheetIndex(index);
    sheetIndexRef.current = index;

    // Clear any existing timeout to avoid multiple focus attempts
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }

    // When the sheet is opened to a snap point where the input is visible,
    // safely focus the input after a short delay to avoid keyboard animation conflicts.
    if (index >= 1) {
      if (Platform.OS === 'ios') {
        // A delay is necessary on iOS to avoid issues with the keyboard appearing
        // while the bottom sheet is still animating.
        const focusDelay = sheetIndexRef.current === -1 ? 350 : 150; // Longer delay if opening from closed state

        focusTimeoutRef.current = setTimeout(() => {
          // Use the ref to get the latest sheetIndex value, avoiding stale closures.
          if (sheetIndexRef.current >= 1) {
            safelyFocusInput();
          }
        }, focusDelay);
      }
    } else if (index === -1) {
      // Always dismiss keyboard when sheet is closing
      Keyboard.dismiss();
    }
  }, [safelyFocusInput]);

  // Container styles for different platforms
  const containerStyle = Platform.OS === 'web' 
    ? [styles.innerContainer, { 
        // Add some subtle shadow styling for web instead of glow
        shadowColor: '#5A67D8',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      }]
    : styles.innerContainer;

  const handleMarkAsKnown = async () => {
    await markAsKnown();
    // Optionally close the sheet after marking as known
    if (sheetRef.current) {
      sheetRef.current.close();
    }
  };

  return (
    <BottomSheet
      ref={(bottomSheetRef) => {
        // Connect our local typed ref to the actual BottomSheet instance
        sheetRef.current = bottomSheetRef;
        
        // Also update the forwarded ref if provided
        if (ref) {
          if (typeof ref === 'function') {
            ref(bottomSheetRef);
          } else {
            ref.current = bottomSheetRef;
          }
        }
      }}
      index={-1} // Start closed
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      onChange={handleSheetChange}
      style={{ width: "100%", alignContent: "center" }}
      backgroundStyle={{ backgroundColor: "transparent", borderRadius: 40 }}
      topInset={Math.max(12, insets.top)}
      // Completely avoid interactive keyboard behavior on iOS to prevent RemoteTextInput errors
      keyboardBehavior="interactive"
      keyboardBlurBehavior="none"
      android_keyboardInputMode="adjustResize"
      // Keep panning gestures enabled but disable handle to prevent conflicts with keyboard
      enableHandlePanningGesture={Platform.OS !== 'ios'}
      enableContentPanningGesture
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
          { 
            paddingBottom: isKeyboardVisible ? Math.max(24, keyboardHeight * 0.1) : Math.max(24, insets.bottom + 24),
            paddingTop: 40 
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Close button (top-right) */}
        
        {Platform.OS === 'web' ? (
          // Web version - just a regular View with shadow styles
          <View style={containerStyle}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={() => {
                if (sheetRef.current) sheetRef.current.close();
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
                Add words you recognize. If you know it by heart, tap 'I know this
                word!'
              </ThemedText>
            </View>
            <ThemedText
              style={[styles.word, !word && { opacity: 0 }]}
              accessibilityElementsHidden={!word}
              importantForAccessibility={word ? 'auto' : 'no-hide-descendants'}
            >
              {capitalizeFirst(word) || '\u00A0'}
            </ThemedText>

            {renderTextInput()}

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
        ) : (
          // Native version - use a regular View for now
          // We'll add the glow in a separate PR after fixing Skia issues
          <View style={containerStyle}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={() => {
                if (sheetRef.current) sheetRef.current.close();
                onClose?.();
              }}
              style={styles.closeButton}
              hitSlop={8}
            >
              <ThemedText style={{ fontSize: 20, lineHeight: 20 }}>✕</ThemedText>
            </Pressable>
            {/* <ThemedText style={styles.wordTitle}>
              Your story, your words...
            </ThemedText> */}
            <View style={{ alignSelf: "stretch", marginBottom: 0 }}>
              <ThemedText style={styles.helperText}>
                Add words you recognize. If you know it by heart, tap 'I know this
                word!'
              </ThemedText>
            </View>
            <ThemedText
              style={[styles.word, !word && { opacity: 0 }]}
              accessibilityElementsHidden={!word}
              importantForAccessibility={word ? 'auto' : 'no-hide-descendants'}
            >
              {capitalizeFirst(word) || '\u00A0'}
            </ThemedText>

            {renderTextInput()}

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
        )}
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
    paddingTop:72,
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
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "normal",
    color: "#000",
    textAlign: "center",
    paddingHorizontal: 0,
    letterSpacing: 0.2,
    marginBottom: 8,
    width: "80%",
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
