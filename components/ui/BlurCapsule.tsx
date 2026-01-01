// BlurCapsule: Reusable blur container with glassmorphic styling
// Matches iOS liquid glass aesthetic used in TopOverlay and BottomActions
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

type BlurCapsuleProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  borderRadius?: number;
  intensity?: number;
};

const DEFAULT_BLUR_INTENSITY = 30;

export default function BlurCapsule({
  children,
  style,
  borderRadius = 22,
  intensity = DEFAULT_BLUR_INTENSITY,
}: BlurCapsuleProps) {
  return (
    <View style={[styles.container, { borderRadius }, style]}>
      {/* Blur background */}
      <BlurView
        intensity={intensity}
        tint="default"
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />

      {/* Gradient overlay for liquid glass effect */}
      <LinearGradient
        colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.2)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />

      {/* Glass border */}
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.glassBorder,
          { borderRadius },
        ]}
      />

      {/* Inner glow highlight */}
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.glassHighlight,
          { borderRadius },
        ]}
      />

      {/* Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    // Liquid glass shadow
    shadowColor: 'rgba(0, 0, 0, 0.95)',
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  glassBorder: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  glassHighlight: {
    borderTopColor: 'rgba(255,255,255,0.8)',
    borderTopWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    borderBottomWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
