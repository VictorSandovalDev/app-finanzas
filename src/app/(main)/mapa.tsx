import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { FadeUp } from '@/components/motion';
import { Button, Emblem, Progress, Screen, T, Tag } from '@/components/ui';
import { formatCOP, Level, LEVELS } from '@/data/levels';
import { JourneyState, useJourney } from '@/state/journey';
import { getCurrentLevel, getJourneyProgress, getMissions } from '@/state/missions';
import { colors, fonts } from '@/theme/tokens';

type Status = 'done' | 'current' | 'open' | 'locked' | 'soon';

function statusOf(level: Level, state: JourneyState, currentId?: number): Status {
  if (state.completed.includes(level.id)) return 'done';
  if (level.id === currentId) return 'current';
  if (state.unlocked.includes(level.id)) return 'open';
  return level.available ? 'locked' : 'soon';
}

export default function JourneyMap() {
  const { state } = useJourney();
  const current = getCurrentLevel(state);
  const progress = getJourneyProgress(state);

  return (
    <Screen>
      <View style={{ gap: 12, paddingTop: 8 }}>
        <T variant="display">Tu mapa</T>
        <T>
          {state.completed.length} de {LEVELS.length} estaciones completadas · {progress}% del viaje
        </T>
        <Progress value={progress} />
      </View>

      <View>
        {LEVELS.map((level, i) => (
          <FadeUp key={level.id} delay={i * 70}>
            <Station level={level} status={statusOf(level, state, current?.id)} last={i === LEVELS.length - 1} />
          </FadeUp>
        ))}
      </View>
    </Screen>
  );
}

function Station({ level, status, last }: { level: Level; status: Status; last: boolean }) {
  const { state } = useJourney();
  const missions = getMissions(state, level.id).filter((m) => !m.optional);
  const done = missions.filter((m) => m.done).length;
  const tone = status === 'done' ? 'done' : status === 'current' ? 'active' : status === 'open' ? 'default' : 'locked';
  const muted = status === 'locked' || status === 'soon';

  const meta =
    status === 'done'
      ? 'Completada'
      : status === 'current'
        ? `En curso · ${done} de ${missions.length} misiones`
        : status === 'open'
          ? 'Desbloqueada'
          : status === 'locked'
            ? 'Bloqueada'
            : 'Próximamente';

  return (
    <Pressable
      onPress={() => status !== 'soon' && router.push(`/nivel/${level.id}`)}
      disabled={status === 'soon'}
      style={({ pressed }) => [styles.station, pressed && { opacity: 0.75 }]}
      accessibilityLabel={`Estación ${level.id}: ${level.title}. ${meta}`}
    >
      <View style={styles.rail}>
        <Emblem icon={status === 'done' ? 'check' : level.icon} tone={tone} />
        {!last && <View style={[styles.line, { backgroundColor: status === 'done' ? colors.forest : colors.line }]} />}
      </View>
      <View style={styles.body}>
        <Text style={styles.stage}>
          Estación {level.id} · {level.stage}
        </Text>
        <Text style={[styles.title, muted && { color: colors.muted }]} numberOfLines={2}>
          {level.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, status === 'current' && { color: colors.forest }]}>{meta}</Text>
          {status === 'locked' && <Tag label={formatCOP(level.price)} icon="lock" />}
        </View>

        {status === 'current' && (
          <View style={styles.missions}>
            {missions.map((m) => (
              <Pressable key={m.id} onPress={() => router.push(m.href)} style={styles.mission}>
                <View style={[styles.check, m.done && styles.checkDone]}>
                  {m.done ? <Icon name="check" size={11} color={colors.onDark} weight="bold" /> : null}
                </View>
                <Text style={[styles.missionText, m.done && { color: colors.muted }]} numberOfLines={1}>
                  {m.title}
                </Text>
              </Pressable>
            ))}
            <Button
              label="Abrir bitácora"
              variant="secondary"
              compact
              icon="arrowRight"
              onPress={() => router.push(`/nivel/${level.id}`)}
              style={{ alignSelf: 'flex-start', marginTop: 6 }}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  station: { flexDirection: 'row', gap: 16 },
  rail: { alignItems: 'center', width: 44 },
  line: { width: 1, flex: 1, minHeight: 24, marginVertical: 4 },
  body: { flex: 1, minWidth: 0, paddingTop: 2, paddingBottom: 28, gap: 4 },
  stage: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.moss },
  title: { fontFamily: fonts.display, fontSize: 21, lineHeight: 26, color: colors.ink },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 2 },
  meta: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
  missions: { gap: 10, paddingTop: 12 },
  mission: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  check: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: colors.forest, borderColor: colors.forest },
  missionText: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
});
