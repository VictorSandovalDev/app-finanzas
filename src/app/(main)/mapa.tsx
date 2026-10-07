import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { FadeUp } from '@/components/motion';
import { Ring } from '@/components/Ring';
import { Screen, T, Tag } from '@/components/ui';
import { formatCOP, Level, LEVELS } from '@/data/levels';
import { JourneyState, useJourney } from '@/state/journey';
import { getCurrentLevel, getDeliverables, getJourneyProgress, getMissions } from '@/state/missions';
import { colors, fonts, radius } from '@/theme/tokens';

type Status = 'done' | 'current' | 'open' | 'locked' | 'soon';

function statusOf(level: Level, state: JourneyState, currentId?: number): Status {
  if (state.completed.includes(level.id)) return 'done';
  if (level.id === currentId) return 'current';
  if (state.unlocked.includes(level.id)) return 'open';
  return level.available ? 'locked' : 'soon';
}

export default function RouteScreen() {
  const { state } = useJourney();
  const current = getCurrentLevel(state);
  const missionsTotal = LEVELS.reduce((n, l) => n + getMissions(state, l.id).filter((m) => !m.optional).length, 0);

  return (
    <Screen contentStyle={{ gap: 20 }}>
      <View style={{ gap: 14, paddingTop: 4 }}>
        <View>
          <T variant="label">Tu ruta</T>
          <T variant="display">Independencia financiera</T>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ring value={getJourneyProgress(state)} />
          <View style={{ flex: 1 }}>
            <T variant="bodyStrong">
              {state.completed.length} de {LEVELS.length} estaciones
            </T>
            <T variant="small">
              {missionsTotal} misiones · {getDeliverables(state).length} entregables
            </T>
          </View>
        </View>
      </View>

      <View style={styles.track}>
        <View style={styles.trackLine} />
        {LEVELS.map((level, i) => (
          <FadeUp key={level.id} delay={i * 60}>
            <Station level={level} status={statusOf(level, state, current?.id)} />
          </FadeUp>
        ))}
      </View>
    </Screen>
  );
}

function Station({ level, status }: { level: Level; status: Status }) {
  const { state } = useJourney();
  const missions = getMissions(state, level.id).filter((m) => !m.optional);
  const next = missions.find((m) => !m.done);
  const go = () => status !== 'soon' && router.push(`/nivel/${level.id}`);

  const node =
    status === 'done' ? (
      <View style={[styles.node, styles.nodeDone]}>
        <Icon name="check" size={18} color={colors.onDark} weight="bold" />
      </View>
    ) : status === 'current' || status === 'open' ? (
      <View style={[styles.node, styles.nodeCurrent]}>
        <Icon name={level.icon} size={18} color={colors.accent} />
      </View>
    ) : (
      <View style={styles.node}>
        <Icon name={status === 'soon' ? level.icon : 'lock'} size={18} color={colors.muted} />
      </View>
    );

  return (
    <View style={[styles.station, status === 'soon' && { opacity: 0.55 }]}>
      {node}
      {status === 'current' ? (
        <Pressable onPress={go} style={({ pressed }) => [styles.currentCard, pressed && { opacity: 0.9 }]}>
          <Text style={styles.eyebrow}>
            Estación {level.id} · {level.stage} · En curso
          </Text>
          <Text style={styles.title}>{level.title}</Text>
          <View style={{ marginTop: 4 }}>
            {missions.map((m) => (
              <Pressable key={m.id} onPress={() => router.push(m.href)} style={styles.lesson}>
                <View style={[styles.num, m.done && styles.numDone, m === next && styles.numNext]}>
                  {m.done ? <Icon name="check" size={11} color={colors.onDark} weight="bold" /> : <Text style={[styles.numText, m === next && { color: colors.onDark }]}>{missions.indexOf(m) + 1}</Text>}
                </View>
                <Text style={[styles.lessonText, m.done && { color: colors.muted }]} numberOfLines={1}>
                  {m.title}
                </Text>
                <Text style={styles.minutes}>{m.minutes} min</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      ) : (
        <Pressable onPress={go} disabled={status === 'soon'} style={({ pressed }) => [{ flex: 1, minWidth: 0, gap: 2, paddingTop: 1 }, pressed && { opacity: 0.7 }]}>
          <Text style={styles.eyebrow}>
            Estación {level.id} · {level.stage}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {level.title}
          </Text>
          {status === 'done' ? (
            <Text style={[styles.meta, { color: colors.accent }]}>Completada · {level.deliverable}</Text>
          ) : status === 'open' ? (
            <Text style={[styles.meta, { color: colors.accent }]}>Desbloqueada</Text>
          ) : status === 'locked' ? (
            <View style={{ marginTop: 6 }}>
              <Tag label={`Desbloquear · ${formatCOP(level.price)}`} tone="warn" icon="lock" />
            </View>
          ) : (
            <Text style={styles.meta}>Próximamente</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const NODE = 40;
const styles = StyleSheet.create({
  track: { gap: 18, position: 'relative' },
  trackLine: { position: 'absolute', left: NODE / 2 - 1, top: NODE / 2, bottom: NODE / 2, width: 2, backgroundColor: colors.line },
  station: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  node: { width: NODE, height: NODE, borderRadius: NODE / 2, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  nodeDone: { backgroundColor: colors.accentBright, borderColor: colors.accentBright },
  nodeCurrent: { borderColor: colors.accentBright, borderWidth: 2, shadowColor: colors.accentBright, shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
  currentCard: { flex: 1, minWidth: 0, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 12, gap: 2 },
  eyebrow: { fontFamily: fonts.sansSemi, fontSize: 10.5, letterSpacing: 0.9, textTransform: 'uppercase', color: colors.label },
  title: { fontFamily: fonts.sansSemi, fontSize: 16, lineHeight: 21, color: colors.ink },
  meta: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.muted, marginTop: 2 },
  lesson: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, borderTopWidth: 1, borderTopColor: colors.lineSoft },
  num: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.sunken, alignItems: 'center', justifyContent: 'center' },
  numDone: { backgroundColor: colors.accentBright },
  numNext: { backgroundColor: colors.ink },
  numText: { fontFamily: fonts.display, fontSize: 10.5, color: colors.muted },
  lessonText: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 13.5, color: colors.ink },
  minutes: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
});
