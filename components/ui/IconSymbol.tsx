// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  // Use a thinner look on Android/web by choosing outlined variant where possible
  'person.crop.circle': 'person-outline',
  'checkmark.circle.fill': 'check-circle',
  'checkmark': 'check',
  'star': 'star',
  'star.fill': 'star',
  'ellipsis': 'more-horiz',
  'books.vertical.fill' : 'book',
  'xmark': 'close',
  // Edit/compose synonyms
  'square.and.pencil': 'edit',
  'compose': 'edit',
  'plus': 'add',
  'slider.horizontal.3': 'tune',
  'gearshape': 'settings',
  'gearshape.fill': 'settings',
  'magnifyingglass.fill': 'search',
  'gamecontroller.fill': 'gamepad',
  // Genre Icons
  'book.closed.fill': 'menu-book',
  'magnifyingglass': 'search',
  'chart.bar.fill': 'bar-chart',
  'heart.fill': 'favorite',
  'brain.head.profile': 'psychology',
  'line.3.horizontal': 'menu',
  // Additional icons
  'lightbulb.fill': 'lightbulb',
  'leaf.fill': 'eco',
} as const;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  // Use MaterialIcons for all platforms to avoid expo-symbols issues
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
