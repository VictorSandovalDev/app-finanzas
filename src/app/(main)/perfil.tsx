import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Divider, Emblem, Progress, Screen, SectionTitle, T } from '@/components/ui';
import { LEVELS } from '@/data/levels';
import { useAuth } from '@/state/auth';
import { useJourney } from '@/state/journey';
import { getCurrentLevel, getDeliverables, getMissions, getStreak, getTotalXp } from '@/state/missions';
import { colors, fonts } from '@/theme/tokens';

export default function Passport() {
  const { state } = useJourney();
  const { signOut, session } = useAuth();
  const current = getCurrentLevel(state);
  const since = state.joinedAt ? new Date(state.joinedAt).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }) : undefined;

  const stats = [
    { value: getStreak(state), label: 'días de racha' },
    { value: getTotalXp(state), label: 'XP' },
    { value: getDeliverables(state).filter((d) => d.ready).length, label: 'entregables' },
  ];

  const leave = async () => {
    await signOut();
    router.replace('/bienvenida');
  };

  return (
    <Screen>
      <View style={{ gap: 8, paddingTop: 8 }}>
        <T variant="label">Pasaporte financiero</T>
        <T variant="display">{state.name || 'Tu pasaporte'}</T>
        {since && <T>En el viaje desde {since}</T>}
      </View>

      <View style={styles.stats}>
        {stats.map((s, i) => (
          <View key={s.label} style={[styles.stat, i > 0 && styles.statBorder]}>
            <Text style={styles.statValue}>{s.value}</Text>
            <T variant="small">{s.label}</T>
          </View>
        ))}
      </View>

      <View style={{ gap: 18 }}>
        <SectionTitle title="Sellos de estación" />
        <View style={styles.stamps}>
          {LEVELS.map((l) => {
            const earned = state.completed.includes(l.id);
            const active = l.id === current?.id;
            return (
              <View key={l.id} style={styles.stamp}>
                <Emblem icon={earned ? 'seal' : l.icon} size={56} tone={earned ? 'done' : active ? 'default' : 'locked'} />
                <Text style={[styles.stampLabel, !earned && !active && { color: colors.muted }]}>{l.stage}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <SectionTitle title="Logros" />
        {LEVELS.filter((l) => l.available).map((l) => {
          const missions = getMissions(state, l.id).filter((m) => !m.optional);
          const full = state.completed.includes(l.id);
          const done = full ? missions.length : missions.filter((m) => m.done).length;
          return (
            <View key={l.id}>
              <Divider />
              <View style={styles.achievement}>
                <View style={{ flex: 1, gap: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                    <T variant="bodyStrong" style={[{ flex: 1 }, !state.unlocked.includes(l.id) && { color: colors.muted }]}>
                      {l.achievement}
                    </T>
                    <Text style={styles.count}>
                      {done}/{missions.length}
                    </Text>
                  </View>
                  <Progress value={(done / missions.length) * 100} color={full ? colors.brass : colors.forest} />
                </View>
              </View>
            </View>
          );
        })}
        <Divider />
      </View>

      <View style={{ gap: 4 }}>
        <T variant="small" style={{ textAlign: 'center' }}>{session?.user.email}</T>
        <Button label="Cerrar sesión" variant="quiet" onPress={leave} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  stat: { flex: 1, paddingVertical: 16, gap: 2 },
  statBorder: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.line, paddingLeft: 16 },
  statValue: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, color: colors.ink, fontVariant: ['tabular-nums'] },
  stamps: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 22 },
  stamp: { width: '33.33%', alignItems: 'center', gap: 8 },
  stampLabel: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink },
  achievement: { paddingVertical: 14 },
  count: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.muted, fontVariant: ['tabular-nums'] },
});
