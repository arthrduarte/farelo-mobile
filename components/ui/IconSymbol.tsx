// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/build/FontAwesome5';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': { component: MaterialIcons, name: 'home' },
  'paperplane.fill': { component: MaterialIcons, name: 'send' },
  'chevron.left.forwardslash.chevron.right': { component: MaterialIcons, name: 'code' },
  'chevron.right': { component: MaterialIcons, name: 'chevron-right' },
  'cookie': { component: FontAwesome6, name: 'cookie-bite' }, // 🍪 ✅ NEW ICON
  'person.fill': { component: MaterialIcons, name: 'person' },
  'checkbox-active': { component: MaterialIcons, name: 'check-box' },
  'checkbox-inactive': { component: MaterialIcons, name: 'check-box-outline-blank' },
  'pepper': { component: FontAwesome6, name: 'pepper-hot' },
  'book': { component: FontAwesome5, name: 'book' },
} as const;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  const { component: IconComponent, name: iconName } = MAPPING[name];
  return (
    <IconComponent
      name={iconName}
      size={size}
      color={color}
      style={style}
    />
  );
}
