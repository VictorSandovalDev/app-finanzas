import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Icon } from '@/components/Icon';
import { useProgress } from '@/components/motion';
import { LEVELS } from '@/data/levels';
import { colors } from '@/theme/tokens';

/** Station positions, as fractions of the canvas: a trail switching back up a hillside. */
const POINTS = [
  [0.2, 0.86],
  [0.7, 0.74],
  [0.32, 0.58],
  [0.74, 0.44],
  [0.3, 0.29],
  [0.66, 0.14],
] as const;

/** Smooth curve through the points (Catmull-Rom → cubic Bézier). */
function curve(pts: { x: number; y: number }[]) {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Topographic contour lines, drawn once, very faint. */
function contours(w: number, h: number) {
  return Array.from({ length: 7 }, (_, i) => {
    const y = h * (0.12 + i * 0.13);
    const a = 18 + i * 3;
    return `M -20 ${y} C ${w * 0.25} ${y - a}, ${w * 0.45} ${y + a}, ${w * 0.7} ${y - a * 0.6} S ${w * 1.05} ${y + a * 0.4}, ${w + 20} ${y}`;
  });
}

/** The journey drawn as a single line across six stations. */
export function RouteIllustration({ height }: { height: number }) {
  const [width, setWidth] = useState(0);
  const draw = useProgress(2200, 300);
  const pts = POINTS.map(([x, y]) => ({ x: x * width, y: y * height }));
  const length = pts.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0) * 1.12;

  return (
    <View style={[styles.canvas, { height }]} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <>
          <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            {contours(width, height).map((d, i) => (
              <Path key={i} d={d} stroke="rgba(244,241,233,0.07)" strokeWidth={1} fill="none" />
            ))}
            <Path
              d={curve(pts)}
              stroke="rgba(244,241,233,0.55)"
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${length} ${length}`}
              strokeDashoffset={length * (1 - draw)}
            />
          </Svg>
          {pts.map((p, i) => {
            // Each marker appears as the line reaches it.
            const reveal = Math.max(0, Math.min(1, (draw - i / (pts.length - 1) + 0.08) / 0.12));
            return (
              <View key={i} style={[styles.marker, { left: p.x - 18, top: p.y - 18, opacity: reveal, transform: [{ scale: 0.85 + 0.15 * reveal }] }]}>
                <View style={[styles.dot, i === 0 && styles.dotFirst]}>
                  <Icon name={LEVELS[i].icon} size={17} color={i === 0 ? colors.forestDeep : colors.onDark} weight="light" />
                </View>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { backgroundColor: colors.forestDeep, overflow: 'hidden' },
  marker: { position: 'absolute' },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(244,241,233,0.35)',
    backgroundColor: colors.forestDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFirst: { backgroundColor: colors.brassSoft, borderColor: colors.brassSoft },
});
