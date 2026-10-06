import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GroupRow } from '@/components/GroupCard';
import { Icon } from '@/components/Icon';
import { FadeUp } from '@/components/motion';
import { Button, Column, Columns, Divider, Emblem, Progress, Screen, SectionTitle, Surface, T, Tag } from '@/components/ui';
import { formatCOP, LEVELS, LevelId } from '@/data/levels';
import { useJourney } from '@/state/journey';
import {
  getCurrentLevel,
  getDeliverables,
  getMissions,
  getNextLockedLevel,
  getNextMission,
  getNextMissionHref,
  getStreak,
  getTotalXp,
  getWeek,
} from '@/state/missions';
import { colors, fonts } from '@/theme/tokens';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

export default function Home() {
  const { state } = useJourney();
  const current = getCurrentLevel(state);
  const next = getNextLockedLevel(state);
  const streak = getStreak(state);
  const today = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Screen maxWidth={1040}>
      <FadeUp style={{ gap: 10, paddingTop: 8 }}>
        <T variant="label" style={{ color: colors.muted }}>{today}</T>
        <T variant="display">
          {greeting()}
          {state.name ? `, ${state.name}` : ''}
        </T>
        <View style={styles.stats}>
          <Stat icon="flame" value={`${streak} ${streak === 1 ? 'día' : 'días'}`} label="de racha" />
          <View style={styles.statSep} />
          <Stat icon="diamond" value={`${getTotalXp(state)}`} label="XP" />
          <View style={styles.statSep} />
          <Stat icon="compass" value={`${current?.id ?? Math.max(1, state.completed.length)} de ${LEVELS.length}`} label="estaciones" />
        </View>
      </FadeUp>

      <Columns>
        <Column>
          <FadeUp delay={120}>
            <CurrentStation />
          </FadeUp>
          <Week />
          {current?.whatsappUrl ? (
            <View style={{ gap: 14 }}>
              <SectionTitle title="Acompañamiento" />
              <GroupRow level={current} />
            </View>
          ) : null}
        </Column>
        <Column>
          <Deliverables />
          {next?.available && current && (
            <View style={{ gap: 14 }}>
              <SectionTitle title="Siguiente estación" />
              <Pressable onPress={() => router.push(`/nivel/${next.id}`)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
                <Emblem icon={next.icon} tone="locked" />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <T variant="small">Estación {next.id} · {next.stage}</T>
                  <T variant="bodyStrong" numberOfLines={1}>{next.title}</T>
                </View>
                <Tag label={formatCOP(next.price)} icon="lock" />
              </Pressable>
            </View>
          )}
        </Column>
      </Columns>
    </Screen>
  );
}

function Stat({ icon, value, label }: { icon: 'flame' | 'diamond' | 'compass'; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={16} color={colors.brass} weight="regular" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function CurrentStation() {
  const { state } = useJourney();
  const current = getCurrentLevel(state);
  const next = getNextLockedLevel(state);

  if (!current) {
    const level = next ?? LEVELS[LEVELS.length - 1];
    const ready = !next || next.id === 1 || state.completed.includes((next.id - 1) as LevelId);
    return (
      <Surface tone="forest" style={{ gap: 18 }}>
        <T variant="label" style={{ color: colors.brassSoft }}>
          {next ? `Estación ${level.id} · ${level.stage}` : 'Viaje al día'}
        </T>
        <T variant="title" style={{ color: colors.onDark }}>
          {next ? level.title : 'Completaste las estaciones disponibles'}
        </T>
        {next?.available && ready ? (
          <Button label={`Desbloquear por ${formatCOP(next.price)}`} variant="light" icon="arrowRight" onPress={() => router.push(`/nivel/${next.id}`)} />
        ) : (
          <Button label="Ver mi pasaporte" variant="light" icon="arrowRight" onPress={() => router.push('/perfil')} />
        )}
      </Surface>
    );
  }

  const missions = getMissions(state, current.id).filter((m) => !m.optional);
  const done = missions.filter((m) => m.done).length;
  const mission = getNextMission(state);
  return (
    <Surface tone="forest" style={{ gap: 18 }}>
      <View style={{ gap: 8 }}>
        <T variant="label" style={{ color: colors.brassSoft }}>Estación {current.id} · {current.stage}</T>
        <T variant="title" style={{ color: colors.onDark }}>{current.title}</T>
      </View>
      <View style={{ gap: 8 }}>
        <Progress value={(done / missions.length) * 100} color={colors.brass} track="rgba(244,241,233,0.16)" />
        <T variant="small" style={{ color: colors.onDarkMuted }}>
          {done} de {missions.length} misiones{mission ? ` · Sigue: ${mission.title}` : ' · Lista para completar'}
        </T>
      </View>
      <Button label="Continuar mi misión" variant="light" icon="arrowRight" onPress={() => router.push(getNextMissionHref(state))} />
    </Surface>
  );
}

function Week() {
  const { state } = useJourney();
  const streak = getStreak(state);
  return (
    <View style={{ gap: 14 }}>
      <SectionTitle title="Esta semana" />
      <View style={styles.week}>
        {getWeek(state).map((d, i) => (
          <View key={i} style={{ alignItems: 'center', gap: 8, flex: 1 }}>
            <Text style={[styles.day, d.state === 'today' && { color: colors.ink }]}>{d.label}</Text>
            <View
              style={[
                styles.dayDot,
                d.state === 'done' && { backgroundColor: colors.forest, borderColor: colors.forest },
                d.state === 'today' && { borderColor: colors.forest },
              ]}
            >
              {d.state === 'done' ? <Icon name="check" size={12} color={colors.onDark} weight="bold" /> : null}
            </View>
          </View>
        ))}
      </View>
      <T variant="small">
        {streak > 0 ? `Llevas ${streak} ${streak === 1 ? 'día' : 'días'} seguidos avanzando.` : 'Avanza hoy en una misión para empezar tu racha.'}
      </T>
    </View>
  );
}

function Deliverables() {
  const { state } = useJourney();
  const items = getDeliverables(state);
  return (
    <View style={{ gap: 6 }}>
      <SectionTitle title="Entregables" />
      {items.map((d, i) => {
        const unlocked = state.unlocked.includes(d.levelId);
        return (
          <View key={d.id}>
            {i > 0 && <Divider />}
            <Pressable
              onPress={() => router.push(d.ready ? d.href : `/nivel/${d.levelId}`)}
              style={({ pressed }) => [styles.row, { paddingVertical: 12 }, pressed && { opacity: 0.7 }]}
            >
              <Icon name={d.icon} size={22} color={d.ready ? colors.forest : colors.muted} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <T variant="bodyStrong" numberOfLines={1} style={!d.ready && { color: colors.inkSoft }}>
                  {d.title}
                </T>
                <T variant="small">{d.ready ? 'Listo para consultar' : unlocked ? 'En curso' : `Estación ${d.levelId}`}</T>
              </View>
              {d.ready ? <Tag label="Listo" tone="forest" /> : !unlocked ? <Icon name="lock" size={16} color={colors.muted} /> : null}
              <Icon name="caretRight" size={16} color={colors.muted} />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingTop: 4 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.ink, fontVariant: ['tabular-nums'] },
  statLabel: { fontFamily: fonts.sans, fontSize: 14, color: colors.muted },
  statSep: { width: 1, height: 14, backgroundColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  week: { flexDirection: 'row' },
  day: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted },
  dayDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
});
