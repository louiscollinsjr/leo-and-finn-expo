import React from 'react';
import Svg, { Circle, G, Rect } from 'react-native-svg';

export default function SettingsGear({ size = 24, color = '#333' }: { size?: number; color?: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const toothW = Math.max(1.5, size * 0.14);
  const toothH = Math.max(3, size * 0.22);
  const outerR = size * 0.38;
  const innerR = size * 0.18;
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G stroke={color} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {/* Teeth */}
        {angles.map((a) => (
          <Rect
            key={a}
            x={cx - toothW / 2}
            y={cy - outerR - toothH * 0.45}
            width={toothW}
            height={toothH}
            rx={toothW * 0.25}
            ry={toothW * 0.25}
            transform={`rotate(${a} ${cx} ${cy})`}
          />
        ))}
        {/* Gear ring */}
        <Circle cx={cx} cy={cy} r={outerR} />
        {/* Hub */}
        <Circle cx={cx} cy={cy} r={innerR} />
      </G>
    </Svg>
  );
}
