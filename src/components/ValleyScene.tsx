import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Bob } from '@/components/motion';
import { Sprite, SpriteName } from '@/components/Sprite';
import { colors } from '@/theme/tokens';

const PLACES: { name: SpriteName; left: string; bottom: string; width: number; bob?: boolean }[] = [
  { name: 'compass', left: '8%', bottom: '12%', width: 56, bob: true },
  { name: 'sprout', left: '24%', bottom: '30%', width: 48 },
  { name: 'door', left: '42%', bottom: '16%', width: 56 },
  { name: 'map', left: '56%', bottom: '40%', width: 48 },
  { name: 'flag', left: '70%', bottom: '22%', width: 56 },
  { name: 'house', left: '84%', bottom: '44%', width: 56 },
];

/** Sprite placeholder for the final valley panorama (480×270 ×3). */
export function ValleyScene({ height }: { height?: number }) {
  return (
    <View style={[{ overflow: 'hidden' }, height ? { height } : { flex: 1 }]}>
      <LinearGradient colors={['#FDDC8A', '#FCE9C0', '#E6EFD9']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.sunHalo2} />
      <View style={styles.sunHalo1} />
      <View style={styles.sun} />
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
        {HILLS.map((h) => (
          <Path key={h.color} d={hillPath(h)} fill={h.color} />
        ))}
      </Svg>
      {PLACES.map((p) => (
        <View key={p.name} style={{ position: 'absolute', left: p.left as `${number}%`, bottom: p.bottom as `${number}%` }}>
          {p.bob ? (
            <Bob>
              <Sprite name={p.name} width={p.width} />
            </Bob>
          ) : (
            <Sprite name={p.name} width={p.width} />
          )}
        </View>
      ))}
    </View>
  );
}

/** CSS boxes with `border-radius: 50% 50% 0 0`, in % of the scene. */
const HILLS = [
  { x0: -20, x1: 120, top: 40, h: 42, color: colors.verdeLight },
  { x0: -30, x1: 90, top: 66, h: 40, color: colors.verdeMid },
  { x0: 20, x1: 130, top: 80, h: 34, color: colors.verde },
];

function hillPath({ x0, x1, top, h }: (typeof HILLS)[number]) {
  const rx = (x1 - x0) / 2;
  const ry = h / 2;
  return `M ${x0} ${top + ry} A ${rx} ${ry} 0 0 1 ${x1} ${top + ry} L ${x1} 100 L ${x0} 100 Z`;
}

const SUN = 84;
const styles = StyleSheet.create({
  sun: { position: 'absolute', top: '12%', right: '18%', width: SUN, height: SUN, borderRadius: SUN / 2, backgroundColor: colors.oro },
  sunHalo1: {
    position: 'absolute',
    top: '12%',
    right: '18%',
    width: SUN + 28,
    height: SUN + 28,
    marginTop: -14,
    marginRight: -14,
    borderRadius: SUN,
    backgroundColor: 'rgba(248,178,41,0.25)',
  },
  sunHalo2: {
    position: 'absolute',
    top: '12%',
    right: '18%',
    width: SUN + 60,
    height: SUN + 60,
    marginTop: -30,
    marginRight: -30,
    borderRadius: SUN,
    backgroundColor: 'rgba(248,178,41,0.12)',
  },
});
