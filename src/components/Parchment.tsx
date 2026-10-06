import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { colors } from '@/theme/tokens';

/** Parchment document with the design's double frame (#D9C7A0 then #0B3D2E). */
export function Parchment({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={{ backgroundColor: colors.bosque, padding: 4, margin: 4 }}>
      <View style={{ backgroundColor: colors.parchmentEdge, padding: 4 }}>
        <View style={[{ backgroundColor: colors.parchment, padding: 20, gap: 16 }, style]}>{children}</View>
      </View>
    </View>
  );
}
