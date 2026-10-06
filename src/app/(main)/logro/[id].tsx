import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Celebration } from '@/components/Celebration';
import { Button, T } from '@/components/ui';
import { formatCOP, getLevel } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { getStreak, STATION_XP } from '@/state/missions';
import { colors, fonts } from '@/theme/tokens';

export default function AchievementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useJourney();
  const level = getLevel(Number(id));
  if (!level) return <Redirect href="/viaje" />;
  const next = getLevel(level.id + 1);

  const stats = [
    { value: `+${STATION_XP}`, label: 'XP' },
    { value: `${getStreak(state)}`, label: 'días de racha' },
    { value: '1', label: 'entregable' },
  ];

  return (
    <Celebration icon="seal">
      <T variant="label" style={{ color: colors.brassSoft }}>Estación {level.id} completada</T>
      <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.75}>
        {level.achievement}
      </Text>
      <View style={styles.stats}>
        {stats.map((s, i) => (
          <View key={s.label} style={[styles.stat, i > 0 && styles.statBorder]}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
      <T style={{ color: colors.onDarkMuted, textAlign: 'center' }}>Recibiste: {level.deliverable}</T>
      <View style={{ alignSelf: 'stretch', gap: 4, marginTop: 8 }}>
        {next?.available ? (
          <Button
            label={state.unlocked.includes(next.id) ? `Ir a la estación ${next.id}` : `Desbloquear estación ${next.id} · ${formatCOP(next.price)}`}
            variant="light"
            icon="arrowRight"
            onPress={() => router.replace(`/nivel/${next.id}`)}
          />
        ) : (
          <Button label="Ver mi pasaporte" variant="light" icon="arrowRight" onPress={() => router.replace('/perfil')} />
        )}
        <Button label="Volver al inicio" variant="quietLight" onPress={() => router.replace('/viaje')} />
      </View>
    </Celebration>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, color: colors.onDark, textAlign: 'center' },
  stats: { flexDirection: 'row', alignSelf: 'stretch', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(244,241,233,0.14)', marginTop: 8 },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 2 },
  statBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(244,241,233,0.14)' },
  statValue: { fontFamily: fonts.display, fontSize: 24, color: colors.onDark, fontVariant: ['tabular-nums'] },
  statLabel: { fontFamily: fonts.sans, fontSize: 12, color: colors.onDarkMuted },
});
