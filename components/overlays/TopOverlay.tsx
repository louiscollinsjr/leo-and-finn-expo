// TopOverlay: Redesigned with large readable title and liquid glass close button
// Matches modern reader aesthetics with minimal, elegant controls
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

type TopOverlayProps = {
  insets?: Partial<EdgeInsets>;
  title?: string;
  centerLabel?: string;
  onBack?: () => void;
};

const BLUR_INTENSITY = 30;

export default function TopOverlay({ insets, title, centerLabel, onBack }: TopOverlayProps) {
  const textColor = useThemeColor({}, 'text');
  const insetTop = insets?.top ?? 0;
  const insetLeft = insets?.left ?? 0;
  const insetRight = insets?.right ?? 0;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.root, { paddingTop: insetTop, paddingLeft: insetLeft, paddingRight: insetRight }]}
    >
      <View style={styles.inner}>
        <View style={styles.bar}>
          {/* Title in semi-transparent pill */}
          <View style={styles.titleContainer}>
            {title && (
              <View style={styles.titlePill}>
                <BlurView intensity={BLUR_INTENSITY} tint="default" style={styles.pillBlur} />
                <View style={styles.pillOverlay} />
                <ThemedText style={styles.titleText} numberOfLines={1}>
                  {title}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Liquid Glass Close Button */}
          {onBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close book"
              hitSlop={12}
              onPress={onBack}
              style={styles.closeButton}
            >
              {/* Blur background */}
              <BlurView intensity={BLUR_INTENSITY} tint="default" style={styles.blurFill} />

              {/* Gradient overlay for liquid glass effect */}
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0.7)',
                  'rgba(255,255,255,0.2)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.blurFill}
              />

              {/* Glass border */}
              <View style={[styles.blurFill, styles.glassBorder]} />

              {/* Inner glow highlight */}
              <View style={[styles.blurFill, styles.glassHighlight]} />

              {/* Close icon - using SF Symbol xmark */}
              <IconSymbol name="xmark" size={20} color={textColor} style={styles.closeIcon} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const CLOSE_BUTTON_SIZE = 52;

const styles = StyleSheet.create({
  root: {
    paddingBottom: 0,
  },
  inner: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  titleContainer: {
    flex: 1,
  },
  titlePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  pillBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  pillOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
  },
  titleText: {
    fontSize: 10,
    fontWeight: '400',
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  closeButton: {
    width: CLOSE_BUTTON_SIZE,
    height: CLOSE_BUTTON_SIZE,
    borderRadius: CLOSE_BUTTON_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    // Liquid glass shadow
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  glassBorder: {
    borderRadius: CLOSE_BUTTON_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  glassHighlight: {
    borderRadius: CLOSE_BUTTON_SIZE / 2,
    borderTopColor: 'rgba(255,255,255,0.8)',
    borderTopWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    borderBottomWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  closeIcon: {
    opacity: 0.7,
  },
  blurFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CLOSE_BUTTON_SIZE / 2,
  },
});
