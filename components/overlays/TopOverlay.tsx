// TopOverlay: Minimal top bar overlay with optional centered pill label and a close
// (X) button on the right. No global blur background; pill backgrounds are blurred
// while keeping text crisp. Appears when reader overlays are shown (tap) and
// auto-dismisses via ReaderView's overlay timer.
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

type TopOverlayProps = {
  insets?: Partial<EdgeInsets>;
  title?: string;
  centerLabel?: string;
  onBack?: () => void;
};

const BLUR_INTENSITY = 25;
const PILL_OVERLAY = 'rgba(217,217,217,0.80)';
const BUTTON_OVERLAY = 'rgba(217,217,217,0.75)';
const CLOSE_ACCESSIBILITY_LABEL = 'Close reader overlay';
const CLOSE_ACCESSIBILITY_HINT = 'Dismisses the reader controls';

export default function TopOverlay({ insets, title, centerLabel, onBack }: TopOverlayProps) {
  const textColor = useThemeColor({}, 'text');
  const insetTop = insets?.top ?? 0;
  const insetLeft = insets?.left ?? 0;
  const insetRight = insets?.right ?? 0;

  return (
    <View pointerEvents="box-none" style={[styles.root, { paddingTop: insetTop, paddingLeft: insetLeft, paddingRight: insetRight }]}> 
      <View style={styles.inner}>
        <View style={styles.bar}>
          <View style={styles.sideSlot} />
          <View style={styles.centerSlot}>
            {centerLabel ? (
              <View style={styles.pillContainer}>
                <BlurView intensity={BLUR_INTENSITY} tint="default" style={styles.blurFill} />
                <View style={[styles.blurFill, styles.pillOverlay]} />
                <ThemedText style={styles.pillText} numberOfLines={1}>{centerLabel}</ThemedText>
              </View>
            ) : title ? (
              <ThemedText style={styles.title} numberOfLines={1}>{title}</ThemedText>
            ) : (
              <View />
            )}
          </View>
          {onBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={CLOSE_ACCESSIBILITY_LABEL}
              accessibilityHint={CLOSE_ACCESSIBILITY_HINT}
              android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: false }}
              hitSlop={8}
              onPress={onBack}
              style={styles.closeButton}
            >
              <BlurView intensity={BLUR_INTENSITY} tint="default" style={styles.blurFill} />
              <View style={[styles.blurFill, styles.closeOverlay]} />
              <IconSymbol name="xmark" size={16} color={textColor} style={styles.closeIcon} />
            </Pressable>
          ) : (
            <View style={styles.sideSlot} />
          )}
        </View>
      </View>
    </View>
  );
}

const CLOSE_BUTTON_SIZE = 36;
const SIDE_SLOT_WIDTH = CLOSE_BUTTON_SIZE + 8;

const styles = StyleSheet.create({
  root: {
    paddingBottom: 0,
  },
  inner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideSlot: {
    width: SIDE_SLOT_WIDTH,
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  pillOverlay: {
    backgroundColor: PILL_OVERLAY,
  },
  pillText: {
    fontWeight: '400',
    opacity: 0.65,
    fontSize: 10,
  },
  title: {
    fontWeight: '400',
  },
  closeButton: {
    width: CLOSE_BUTTON_SIZE,
    height: CLOSE_BUTTON_SIZE,
    borderRadius: CLOSE_BUTTON_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeOverlay: {
    backgroundColor: BUTTON_OVERLAY,
  },
  closeIcon: {
    opacity: 0.45,
  },
  blurFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CLOSE_BUTTON_SIZE / 2,
  },
});
