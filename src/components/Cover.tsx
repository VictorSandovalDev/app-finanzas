import { useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Icon } from '@/components/Icon';
import { Level } from '@/data/levels';
import { fonts } from '@/theme/tokens';

/** Station cover: a flat colour field, two concentric arcs and the station icon. */
export function Cover({ level, height = 96, label, radius = 10, style }: { level: Level; height?: number; label?: string; radius?: number; style?: StyleProp<ViewStyle> }) {
  const [width, setWidth] = useState(0);
  const [base, arc] = level.cover;
  return (
    <View style={[{ height, borderRadius: radius, backgroundColor: base, overflow: 'hidden', justifyContent: 'flex-end', padding: 10 }, style]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Circle cx={width - 50} cy={height * 0.18} r={height * 0.78} stroke={arc} strokeWidth={height * 0.13} fill="none" opacity={0.55} />
          <Circle cx={width - 50} cy={height * 0.18} r={height * 0.45} stroke={arc} strokeWidth={height * 0.085} fill="none" opacity={0.75} />
        </Svg>
      )}
      <View style={{ position: 'absolute', right: 12, top: 12 }}>
        <Icon name={level.icon} size={Math.round(height * 0.4)} color="#FFFFFF" weight="regular" />
      </View>
      {label ? (
        <View style={styles.label}>
          <Text style={styles.labelText} numberOfLines={1}>
            {label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.28)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, maxWidth: '75%' },
  labelText: { fontFamily: fonts.display, fontSize: 10.5, letterSpacing: 0.8, textTransform: 'uppercase', color: '#FFFFFF' },
});
