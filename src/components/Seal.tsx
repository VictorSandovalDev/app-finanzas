import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { Icon, IconName } from '@/components/Icon';
import { colors } from '@/theme/tokens';

/** Circular emblem used for achievements and passport stamps. */
export function Seal({ icon, size = 160, muted = false }: { icon: IconName; size?: number; muted?: boolean }) {
  const c = size / 2;
  const ink = muted ? colors.line : colors.champagne;
  const rays = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    const r1 = size * 0.44;
    const r2 = size * (i % 2 ? 0.47 : 0.495);
    return { x1: c + Math.cos(a) * r1, y1: c + Math.sin(a) * r1, x2: c + Math.cos(a) * r2, y2: c + Math.sin(a) * r2 };
  });
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {rays.map((r, i) => (
          <Line key={i} {...r} stroke={ink} strokeWidth={1.2} strokeLinecap="round" />
        ))}
        <Circle cx={c} cy={c} r={size * 0.4} fill={muted ? colors.paper : colors.forest} />
        <Circle cx={c} cy={c} r={size * 0.34} stroke={ink} strokeWidth={1} fill="none" strokeDasharray="1 4" />
      </Svg>
      <View style={{ zIndex: 1 }}>
        <Icon name={icon} size={size * 0.28} color={muted ? colors.warmGray : colors.champagneSoft} strokeWidth={1.4} />
      </View>
    </View>
  );
}
