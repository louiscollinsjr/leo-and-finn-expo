// BottomActions: Single menu button matching close button style
// Opens bottom sheet with all reader options
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const BLUR_INTENSITY = 30;
const MENU_BUTTON_SIZE = 52;

export default function BottomActions({
  insets,
  onOpenMenu,
}: {
  insets: any;
  onOpenMenu?: () => void;
}) {
  const textColor = useThemeColor({}, 'text');

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { paddingBottom: (insets?.bottom ?? 0) + 16 }]}
    >
      <View style={styles.innerContainer}>
        {/* Single menu button - right aligned */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          hitSlop={12}
          onPress={onOpenMenu}
          style={styles.menuButton}
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

          {/* Menu icon - using SF Symbol command */}
          <IconSymbol name="command" size={20} color={textColor} style={styles.menuIcon} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  menuButton: {
    width: MENU_BUTTON_SIZE,
    height: MENU_BUTTON_SIZE,
    borderRadius: MENU_BUTTON_SIZE / 2,
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
    borderRadius: MENU_BUTTON_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  glassHighlight: {
    borderRadius: MENU_BUTTON_SIZE / 2,
    borderTopColor: 'rgba(255,255,255,0.8)',
    borderTopWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    borderBottomWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  menuIcon: {
    opacity: 0.7,
  },
  blurFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: MENU_BUTTON_SIZE / 2,
  },
});
