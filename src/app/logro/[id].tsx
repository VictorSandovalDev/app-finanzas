import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pop, stepped, useOnce } from '@/components/motion';
import { Particles } from '@/components/Particles';
import { Sprite, SpriteName } from '@/components/Sprite';
import { ChunkyButton, GameLabel } from '@/components/ui';
import { formatCOP, getLevel } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { getStreak, STATION_XP } from '@/state/missions';
import { colors, fonts } from '@/theme/tokens';

export default function AchievementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useJourney();
  const insets = useSafeAreaInsets();
  const level = getLevel(Number(id));
  const stamp = useOnce(600, 300);
  if (!level) return <Redirect href="/viaje" />;
  const next = getLevel(level.id + 1);

  const loot: { label: string; value: number; sprite: SpriteName; w: number; color: string; fg: string }[] = [
    { label: 'XP', value: STATION_XP, sprite: 'gem', w: 18, color: colors.oro, fg: colors.bosque },
    { label: 'RACHA', value: getStreak(state), sprite: 'lantern', w: 15, color: colors.brasa, fg: colors.bg },
    { label: 'BOTÍN', value: 1, sprite: 'scroll', w: 20, color: colors.verdeLight, fg: colors.bosque },
  ];

  return (
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <LinearGradient colors={[colors.verde, colors.bosque]} start={{ x: 0.5, y: 0.1 }} end={{ x: 0.5, y: 0.9 }} style={StyleSheet.absoluteFill} />
      <Particles />
      <View style={styles.center}>
        <Pop duration={400}>
          <GameLabel size={14} color={colors.oro}>MISIÓN COMPLETADA</GameLabel>
        </Pop>
        <Animated.View
          style={{
            opacity: stepped(stamp, [0, 0.6, 1, 1, 1]),
            transform: [
              { scale: stepped(stamp, [2.2, 1.6, 0.9, 0.95, 1]) },
              { rotate: stepped(stamp, [-18, -14, -6, -7, -8]).interpolate({ inputRange: [-18, 0], outputRange: ['-18deg', '0deg'] }) },
            ],
          }}
        >
          <Sprite name="seal" width={144} />
        </Animated.View>
        <Pop delay={900}>
          <Text style={styles.title}>{level.achievement.toUpperCase()}</Text>
        </Pop>
        <Pop delay={1200} style={styles.loot}>
          {loot.map((l) => (
            <View key={l.label} style={[styles.lootBox, { borderColor: l.color }]}>
              <View style={{ backgroundColor: l.color, paddingVertical: 4 }}>
                <GameLabel size={10} color={l.fg} style={{ textAlign: 'center' }}>{l.label}</GameLabel>
              </View>
              <View style={styles.lootValue}>
                <Sprite name={l.sprite} width={l.w} />
                <Text style={styles.lootNumber}>{l.value}</Text>
              </View>
            </View>
          ))}
        </Pop>
        <Pop delay={1400}>
          <Text style={styles.received}>Recibiste: {level.deliverable}</Text>
        </Pop>
        <Pop delay={1600} style={{ width: '100%', maxWidth: 360, gap: 10 }}>
          {next?.available ? (
            <ChunkyButton
              label={state.unlocked.includes(next.id) ? `Ir a la estación ${next.id}` : `Desbloquear estación ${next.id} · ${formatCOP(next.price)}`}
              variant="oro"
              onPress={() => router.replace(`/nivel/${next.id}`)}
            />
          ) : (
            <ChunkyButton label="Continuar" variant="oro" onPress={() => router.replace('/perfil')} />
          )}
          <Pressable onPress={() => router.replace('/viaje')} style={({ pressed }) => [styles.back, pressed && { opacity: 0.8 }]}>
            <Text style={styles.backText}>VOLVER AL VIAJE</Text>
          </Pressable>
        </Pop>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22, paddingHorizontal: 24 },
  title: { fontFamily: fonts.title, fontSize: 30, lineHeight: 34, letterSpacing: 0.6, color: colors.bg, textAlign: 'center', maxWidth: 460 },
  loot: { flexDirection: 'row', gap: 10, width: '100%', maxWidth: 420 },
  lootBox: { flex: 1, borderWidth: 2, borderRadius: 14, overflow: 'hidden' },
  lootValue: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  lootNumber: { fontFamily: fonts.title, fontSize: 18, color: colors.bg },
  received: { fontFamily: fonts.bold, fontSize: 14, color: colors.verdeTint, textAlign: 'center' },
  back: {
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: 'rgba(251,248,242,0.3)',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  backText: { fontFamily: fonts.title, fontSize: 14, letterSpacing: 0.8, color: colors.bg },
});
