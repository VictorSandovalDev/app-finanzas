import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Hud } from '@/components/Hud';
import { Sprite, SpriteName } from '@/components/Sprite';
import { Card, ChunkyButton, GameLabel, ProgressBar, Screen, T } from '@/components/ui';
import { LEVELS } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { getCurrentLevel, getDeliverables, getMissions, getStreak, getTotalXp } from '@/state/missions';
import { colors, fonts } from '@/theme/tokens';

export default function Passport() {
  const { state, reset } = useJourney();
  const current = getCurrentLevel(state);
  const since = state.joinedAt
    ? new Date(state.joinedAt).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
    : undefined;

  const stats: { sprite: SpriteName; value: number; label: string; w: number }[] = [
    { sprite: 'lantern', value: getStreak(state), label: 'días de racha', w: 24 },
    { sprite: 'gem', value: getTotalXp(state), label: 'XP total', w: 27 },
    { sprite: 'scroll', value: getDeliverables(state).filter((d) => d.ready).length, label: 'entregables', w: 28 },
  ];

  const restart = () => {
    reset();
    router.replace('/bienvenida');
  };

  return (
    <Screen header={<Hud />} edgeToEdge maxWidth={1000} contentStyle={{ gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={styles.avatar}>
          <Text style={styles.initial}>{(state.name || 'V').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <GameLabel size={11} color={colors.verde}>PASAPORTE FINANCIERO</GameLabel>
          <Text style={styles.name}>{state.name || 'Viajero'}</Text>
          {since && <T variant="small">En el viaje desde {since}</T>}
        </View>
      </View>

      <View style={styles.stats}>
        {stats.map((s) => (
          <Card key={s.label} radius={16} style={styles.stat}>
            <Sprite name={s.sprite} width={s.w} />
            <View>
              <Text style={styles.statValue}>{s.value}</Text>
              <T variant="small" style={{ fontSize: 12 }}>{s.label}</T>
            </View>
          </Card>
        ))}
      </View>

      <View style={styles.book}>
        <GameLabel color={colors.bosque}>SELLOS DE ESTACIÓN</GameLabel>
        <View style={styles.stamps}>
          {LEVELS.map((l) => {
            const earned = state.completed.includes(l.id);
            const active = l.id === current?.id;
            return (
              <View key={l.id} style={styles.stampCell}>
                {earned ? (
                  <View style={[styles.stamp, styles.stampEarned]}>
                    <View style={styles.stampFill} />
                    <Sprite name={l.sprite} width={48} />
                  </View>
                ) : (
                  <View style={[styles.stamp, styles.stampEmpty, active && { borderColor: colors.verde }]}>
                    <Sprite name={l.sprite} width={active ? 44 : 40} filter={active ? 'none' : 'silhouette'} opacity={active ? 0.5 : 0.15} />
                  </View>
                )}
                <GameLabel size={10} color={earned ? colors.bosque : active ? colors.verde : colors.muted}>{l.stage.toUpperCase()}</GameLabel>
              </View>
            );
          })}
        </View>
      </View>

      <GameLabel>LOGROS</GameLabel>
      <Card style={{ paddingVertical: 4 }}>
        {LEVELS.filter((l) => l.available).map((l, i) => {
          const missions = getMissions(state, l.id).filter((m) => !m.optional);
          const done = state.completed.includes(l.id) ? missions.length : missions.filter((m) => m.done).length;
          const full = done === missions.length && state.completed.includes(l.id);
          const started = state.unlocked.includes(l.id);
          return (
            <View key={l.id} style={[styles.achievement, i > 0 && { borderTopWidth: 2, borderTopColor: colors.divider }]}>
              <Sprite name={full ? 'seal' : l.sprite} width={48} filter={started ? 'none' : 'grayscale'} opacity={started ? 1 : 0.4} />
              <View style={{ flex: 1, gap: 6 }}>
                <T variant="bodyStrong" style={!started && { color: colors.muted }}>{l.achievement}</T>
                <ProgressBar
                  value={(done / missions.length) * 100}
                  color={full ? colors.oro : colors.verde}
                  shade={full ? colors.oroDark : colors.bosque}
                  height={12}
                />
              </View>
              <GameLabel size={11} color={full ? colors.oroDark : started ? colors.verde : colors.muted}>
                {done}/{missions.length}
              </GameLabel>
            </View>
          );
        })}
      </Card>

      <ChunkyButton label="Reiniciar viaje (demo)" variant="secondary" size="sm" onPress={restart} style={{ alignSelf: 'center', marginTop: 16 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: colors.bosque,
    borderBottomWidth: 5,
    borderBottomColor: colors.bosqueDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontFamily: fonts.game, fontSize: 34, color: colors.oro },
  name: { fontFamily: fonts.title, fontSize: 28, lineHeight: 31, color: colors.ink },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { flexGrow: 1, flexBasis: 150, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  statValue: { fontFamily: fonts.title, fontSize: 20, lineHeight: 22, color: colors.ink },
  book: {
    backgroundColor: colors.parchment,
    borderWidth: 4,
    borderColor: colors.parchmentEdge,
    outlineWidth: 4,
    outlineColor: colors.bosque,
    outlineStyle: 'solid',
    margin: 8,
    padding: 18,
    gap: 14,
  } as object,
  stamps: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  stampCell: { width: '33.33%', alignItems: 'center', gap: 6 },
  stamp: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  stampEarned: { backgroundColor: colors.oroDark, transform: [{ rotate: '-6deg' }] },
  stampFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 5, borderRadius: 38, backgroundColor: colors.oro },
  stampEmpty: { borderWidth: 3, borderStyle: 'dashed', borderColor: '#C9B48A' },
  achievement: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
});
