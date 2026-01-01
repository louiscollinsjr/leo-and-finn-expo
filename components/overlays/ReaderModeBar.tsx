// ReaderModeBar: iOS-style liquid glass tab bar for reader modes
// Uses @callstack/liquid-glass for authentic iOS 26 liquid glass effect
// Uses LiquidGlassContainerView to enable merging between mode bar and settings button
import { IconSymbol } from '@/components/ui/IconSymbol';
import type { ReadingMode } from '@/providers/ReaderProvider';
import {
  isLiquidGlassSupported,
  LiquidGlassContainerView,
  LiquidGlassView,
} from '@callstack/liquid-glass';
import React from 'react';
import { PlatformColor, Pressable, StyleSheet, View } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

type ReaderModeBarProps = {
  insets: EdgeInsets;
  currentMode: ReadingMode;
  onModeChange: (mode: ReadingMode) => void;
  onOpenSettings: () => void;
};

// iOS Liquid Glass standard dimensions
const BAR_HEIGHT = 68;
const ICON_FRAME_SIZE = 50;
const ICON_SIZE = 24;
const HORIZONTAL_MARGIN = 24;
const SETTINGS_BUTTON_SIZE = 68;
const GLASS_SPACING = 16; // Distance at which glass elements merge

type ModeConfig = {
  mode: ReadingMode;
  icon: string;
};

const MODES: ModeConfig[] = [
  { mode: 'normal', icon: 'book' },
  { mode: 'focused', icon: 'eye' },
  { mode: 'pronunciation', icon: 'speaker.wave.2' },
];

export default function ReaderModeBar({
  insets,
  currentMode,
  onModeChange,
  onOpenSettings,
}: ReaderModeBarProps) {
  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { paddingBottom: insets?.bottom ?? 0 }]}
    >
      {/* LiquidGlassContainerView enables merging between mode bar and settings button */}
      <LiquidGlassContainerView
        spacing={GLASS_SPACING}
        style={styles.glassContainer}
      >
        {/* Main mode bar - takes remaining width */}
        <LiquidGlassView
          style={[
            styles.modeBar,
            !isLiquidGlassSupported && styles.fallbackBackground,
          ]}
          interactive
          effect="regular"
          tintColor="white"
          colorScheme="system"
        >
          <View style={styles.modeButtonsRow}>
            {MODES.map((config) => (
              <ModeButton
                key={config.mode}
                icon={config.icon}
                isActive={currentMode === config.mode}
                onPress={() => onModeChange(config.mode)}
              />
            ))}
          </View>
        </LiquidGlassView>

        {/* Separate settings button */}
        <LiquidGlassView
          style={[
            styles.settingsButton,
            !isLiquidGlassSupported && styles.fallbackBackground,
          ]}
          interactive
          effect="regular"
          tintColor="white"
          colorScheme="system"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            onPress={onOpenSettings}
            style={styles.settingsButtonInner}
          >
            <IconSymbol
              name="gearshape"
              size={ICON_SIZE}
              color={isLiquidGlassSupported ? (PlatformColor('labelColor') as string) : '#000'}
              style={{ opacity: 0.6 }}
            />
          </Pressable>
        </LiquidGlassView>
      </LiquidGlassContainerView>
    </View>
  );
}

function ModeButton({
  icon,
  isActive,
  onPress,
}: {
  icon: string;
  isActive: boolean;
  onPress: () => void;
}) {
  // Use PlatformColor for automatic text color adaptation on iOS
  const iconColor = isLiquidGlassSupported
    ? PlatformColor('labelColor')
    : '#000';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.modeButtonWrapper}
    >
      <View style={[styles.modeButton, isActive && styles.modeButtonActive]}>
        <IconSymbol
          name={icon as any}
          size={ICON_SIZE}
          color={iconColor as string}
          style={{ opacity: isActive ? 1 : 0.5 }}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HORIZONTAL_MARGIN,
  },
  glassContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GLASS_SPACING,
  },
  modeBar: {
    flex: 1,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButton: {
    width: SETTINGS_BUTTON_SIZE,
    height: SETTINGS_BUTTON_SIZE,
    borderRadius: SETTINGS_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Fallback styles for devices that don't support liquid glass
  fallbackBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  modeButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flex: 1,
    paddingHorizontal: 8,
  },
  modeButtonWrapper: {
    // No extra padding - icon frame provides the touch target
  },
  modeButton: {
    width: ICON_FRAME_SIZE,
    height: ICON_FRAME_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ICON_FRAME_SIZE / 2,
  },
  modeButtonActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
});
