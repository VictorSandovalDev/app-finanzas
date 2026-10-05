import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ProgressRing } from '@/components/ProgressRing';
import { Seal } from '@/components/Seal';
import { Button, Card, Divider, Screen, T } from '@/components/ui';
import { LEVELS } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { getDeliverables, getJourneyProgress, getMissions } from '@/state/missions';
import { colors, fonts, radius, space } from '@/theme/tokens';

export default function Profile() {
  const { state, reset } = useJourney();
  const progress = getJourneyProgress(state);
  const missionsDone = LEVELS.flatMap((l) => getMissions(state, l.id)).filter((m) => m.done).length;
  const deliverables = getDeliverables(state).filter((d) => d.ready).length;

  const restart = () => {
    reset();
    router.replace('/bienvenida');
  };

  return (
    <Screen>
      <View style={{ paddingTop: space.xl, paddingBottom: space.lg }}>
        <T variant="label">Perfil</T>
        <T variant="display">Pasaporte financiero</T>
      </View>

      <View style={styles.passport}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          <View style={styles.avatar}>
            <T style={{ fontFamily: fonts.serif, fontSize: 28, color: colors.forestDeep }}>
              {(state.name || 'V').charAt(0).toUpperCase()}
            </T>
          </View>
          <View style={{ flex: 1 }}>
            <T variant="label" style={{ color: colors.champagne }}>Titular</T>
            <T variant="heading" style={{ color: colors.ivory }}>{state.name || 'Viajero'}</T>
            <T variant="small" style={{ color: 'rgba(246,241,231,0.6)' }}>
              {state.completed.length} de {LEVELS.length} estaciones completadas
            </T>
          </View>
          <ProgressRing value={progress} size={64} onDark />
        </View>

        <View style={styles.stamps}>
          {LEVELS.map((l) => {
            const earned = state.completed.includes(l.id);
            return (
              <View key={l.id} style={styles.stamp}>
                <Seal icon={l.symbol} size={64} muted={!earned} />
                <T variant="label" style={{ color: earned ? colors.champagne : 'rgba(246,241,231,0.35)', marginTop: 6 }}>
                  {l.stage}
                </T>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.stats}>
        {[
          [state.completed.length, 'Niveles'],
          [missionsDone, 'Misiones'],
          [deliverables, 'Entregables'],
        ].map(([value, label]) => (
          <Card key={label} style={{ flex: 1, alignItems: 'center', padding: space.lg }}>
            <T style={{ fontFamily: fonts.serif, fontSize: 32, color: colors.ink }}>{value}</T>
            <T variant="label">{label}</T>
          </Card>
        ))}
      </View>

      <T variant="heading" style={{ marginTop: space.xxl, marginBottom: space.md }}>Logros</T>
      {state.achievements.length === 0 ? (
        <Card tone="paper">
          <T variant="small">Tu primer logro aparecerá aquí cuando completes tu primera estación.</T>
        </Card>
      ) : (
        <Card style={{ paddingVertical: space.sm }}>
          {state.achievements.map((a, i) => (
            <View key={a.levelId}>
              {i > 0 && <Divider />}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md }}>
                <Seal icon={LEVELS[a.levelId - 1].symbol} size={40} />
                <View style={{ flex: 1 }}>
                  <T variant="bodyStrong">{a.title}</T>
                  <T variant="small">
                    Nivel {a.levelId} · {new Date(a.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </T>
                </View>
              </View>
            </View>
          ))}
        </Card>
      )}

      <View style={{ marginTop: space.xxxl, gap: space.sm }}>
        <Divider />
        <Button label="Reiniciar viaje (demo)" variant="ghost" onPress={restart} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  passport: { backgroundColor: colors.forestDeep, borderRadius: radius.xl, padding: space.xl },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.champagne, alignItems: 'center', justifyContent: 'center' },
  stamps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: space.lg,
    marginTop: space.xl,
    paddingTop: space.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(246,241,231,0.12)',
    borderStyle: 'dashed',
  },
  stamp: { width: '31%', alignItems: 'center' },
  stats: { flexDirection: 'row', gap: space.md, marginTop: space.lg },
});
