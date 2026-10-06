import { Animated, StyleSheet, View } from 'react-native';

import { stepped, useLoop } from '@/components/motion';
import { colors } from '@/theme/tokens';

type P = { left: `${number}%`; top: `${number}%`; size: number; duration: number; delay: number; color: string };

const DEFAULT: P[] = [
  { left: '14%', top: '62%', size: 8, duration: 2800, delay: 900, color: colors.oro },
  { left: '26%', top: '70%', size: 6, duration: 3200, delay: 1300, color: colors.oroLight },
  { left: '40%', top: '64%', size: 8, duration: 3000, delay: 1800, color: colors.oro },
  { left: '58%', top: '68%', size: 6, duration: 2600, delay: 1100, color: colors.oroLight },
  { left: '72%', top: '60%', size: 8, duration: 3400, delay: 700, color: colors.oro },
  { left: '86%', top: '70%', size: 6, duration: 2900, delay: 1600, color: colors.oroLight },
];

/** vfRise: square golden particles floating up in 8 steps. */
export function Particles({ items = DEFAULT }: { items?: P[] }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map((p, i) => (
        <Particle key={i} {...p} />
      ))}
    </View>
  );
}

function Particle({ left, top, size, duration, delay, color }: P) {
  const v = useLoop(duration, delay);
  const rise = Array.from({ length: 8 }, (_, i) => (-220 * i) / 7);
  const fade = [0, 1, 0.85, 0.7, 0.55, 0.4, 0.2, 0];
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        backgroundColor: color,
        opacity: stepped(v, fade),
        transform: [{ translateY: stepped(v, rise) }],
      }}
    />
  );
}
