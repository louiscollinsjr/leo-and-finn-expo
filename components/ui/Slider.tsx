import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, View, Text, StyleSheet, ViewStyle, GestureResponderEvent } from 'react-native';

/**
 * Lightweight slider that doesn't require community packages.
 * value: 0..1
 */
export default function Slider({
  value,
  onChange,
  onChangeEnd,
  height = 28,
  trackColor = 'rgba(255,255,255,0.35)',
  fillColor = '#4f46e5',
  thumbColor = '#ffffff',
  style,
  showValue = false,
  leftLabel,
  rightLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  onChangeEnd?: (v: number) => void;
  height?: number;
  trackColor?: string;
  fillColor?: string;
  thumbColor?: string;
  style?: ViewStyle;
  showValue?: boolean;
  leftLabel?: React.ReactNode;
  rightLabel?: React.ReactNode;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const pct = useMemo(() => Math.max(0, Math.min(1, value || 0)), [value]);
  const pad = 12; // horizontal padding inside the interactive area

  const onLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width - pad * 2);

  const clamp = useCallback((n: number) => Math.max(0, Math.min(1, n)), []);

  const valueFromX = useCallback(
    (x: number) => clamp((x - pad) / Math.max(1, trackWidth)),
    [trackWidth, clamp]
  );

  const handleEvent = useCallback(
    (e: GestureResponderEvent, end?: boolean) => {
      const { locationX } = e.nativeEvent as any;
      const v = valueFromX(locationX);
      onChange(v);
      if (end && onChangeEnd) onChangeEnd(v);
    },
    [valueFromX, onChange, onChangeEnd]
  );

  return (
    <View style={[styles.row, { height }, style]}>
      {leftLabel ? <View style={styles.side}>{leftLabel}</View> : null}
      <View
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => handleEvent(e)}
        onResponderMove={(e) => handleEvent(e)}
        onResponderRelease={(e) => handleEvent(e, true)}
        style={[styles.trackContainer]}
      >
        <View style={[styles.track, { backgroundColor: trackColor }]} />
        <View
          style={[
            styles.fill,
            {
              backgroundColor: fillColor,
              width: trackWidth * pct,
            },
          ]}
        />
        <View
          style={[
            styles.thumb,
            {
              left: pad + trackWidth * pct - 9,
              backgroundColor: thumbColor,
            },
          ]}
        />
      </View>
      {rightLabel ? <View style={styles.side}>{rightLabel}</View> : null}
      {showValue ? (
        <Text style={styles.valueText}>{Math.round(pct * 100)}%</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackContainer: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  track: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 4,
    borderRadius: 2,
  },
  fill: {
    position: 'absolute',
    left: 12,
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.2)',
    top: 3,
  },
  side: {
    paddingHorizontal: 6,
  },
  valueText: {
    marginLeft: 8,
    opacity: 0.6,
  },
});
