import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, fonts } from '@/theme/tokens';

export function ProgressRing({ value, size = 76, onDark = false }: { value: number; size?: number; onDark?: boolean }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={onDark ? 'rgba(246,241,231,0.18)' : colors.line} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.champagne}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - Math.min(100, value) / 100)}
        />
      </Svg>
      <Text style={{ zIndex: 1, fontFamily: fonts.serif, fontSize: size * 0.3, color: onDark ? colors.ivory : colors.ink }}>
        {value}
        <Text style={{ fontSize: size * 0.16 }}>%</Text>
      </Text>
    </View>
  );
}
