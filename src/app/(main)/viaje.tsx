import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GroupCard } from '@/components/GroupCard';
import { Hud } from '@/components/Hud';
import { Bob } from '@/components/motion';
import { Sprite } from '@/components/Sprite';
import { Card, ChunkyButton, Column, Columns, GameLabel, ProgressBar, Screen, T } from '@/components/ui';
import { formatCOP, getLevel, LevelId } from '@/data/levels';
import { useJourney } from '@/state/journey';
import {
  getCurrentLevel,
  getDeliverables,
  getJourneyProgress,
  getMissions,
  getNextLockedLevel,
  getNextMissionHref,
  getStreak,
  getWeek,
  STATION_XP,
} from '@/state/missions';
import { colors, fonts, radius } from '@/theme/tokens';

export default function Dashboard() {
  const { state } = useJourney();
  const current = getCurrentLevel(state);
  const next = getNextLockedLevel(state);
  const lastAchievement = state.achievements[state.achievements.length - 1];

  return (
    <Screen header={<Hud />} edgeToEdge>
      <T variant="title">¡Hola{state.name ? `, ${state.name}` : ''}!</T>
      <Columns>
        <Column>
          <Hero />
          <StreakCard />
          {current?.whatsappUrl ? <GroupCard level={current} /> : null}
        </Column>
        <Column>
          {lastAchievement && (
            <Card onPress={() => router.push(`/logro/${lastAchievement.levelId}`)} style={styles.row}>
              <View style={{ transform: [{ rotate: '-8deg' }] }}>
                <Sprite name="seal" width={56} />
              </View>
              <View style={{ flex: 1 }}>
                <GameLabel size={11} color={colors.lacre}>ÚLTIMO LOGRO</GameLabel>
                <T variant="bodyStrong" style={{ fontSize: 16 }}>{lastAchievement.title}</T>
                <T variant="small">Estación {lastAchievement.levelId} · +{STATION_XP} XP</T>
              </View>
            </Card>
          )}
          <Inventory />
          {next?.available && current && (
            <Card style={styles.row}>
              <View style={styles.nextArt}>
                <Sprite name={next.sprite} width={48} filter="silhouette" opacity={0.2} />
                <Sprite name="lock" width={24} style={{ position: 'absolute', right: -6, bottom: -6 }} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <GameLabel size={11} color={colors.muted}>SIGUIENTE · EST. {next.id}</GameLabel>
                <T variant="bodyStrong" style={{ fontSize: 16 }}>{next.title}</T>
              </View>
              <ChunkyButton label={formatCOP(next.price)} variant="brasa" size="sm" uppercase={false} onPress={() => router.push(`/nivel/${next.id}`)} />
            </Card>
          )}
        </Column>
      </Columns>
    </Screen>
  );
}

function Hero() {
  const { state } = useJourney();
  const current = getCurrentLevel(state);
  const next = getNextLockedLevel(state);

  if (!current) {
    const level = next ?? getLevel(6)!;
    const ready = !next || next.id === 1 || state.completed.includes((next.id - 1) as LevelId);
    return (
      <View style={styles.hero}>
        <Bob duration={2400} style={styles.heroSprite}>
          <Sprite name={level.sprite} width={80} />
        </Bob>
        <GameLabel color={colors.oro}>ESTACIÓN {level.id} · {level.stage.toUpperCase()}</GameLabel>
        <Text style={styles.heroTitle}>{next ? level.title : '¡Completaste las estaciones disponibles!'}</Text>
        {next?.available && ready ? (
          <ChunkyButton label={`Desbloquear · ${formatCOP(next.price)}`} variant="brasa" onPress={() => router.push(`/nivel/${next.id}`)} />
        ) : (
          <ChunkyButton label="Ver mi pasaporte" variant="oro" onPress={() => router.push('/perfil')} />
        )}
      </View>
    );
  }

  const missions = getMissions(state, current.id).filter((m) => !m.optional);
  const done = missions.filter((m) => m.done).length;
  return (
    <View style={styles.hero}>
      <Bob duration={2400} style={styles.heroSprite}>
        <Sprite name={current.sprite} width={80} />
      </Bob>
      <GameLabel color={colors.oro}>ESTACIÓN {current.id} · {current.stage.toUpperCase()}</GameLabel>
      <Text style={styles.heroTitle}>{current.title}</Text>
      <View style={{ gap: 6 }}>
        <ProgressBar value={(done / missions.length) * 100} track="rgba(11,61,46,0.5)" />
        <Text style={styles.heroMeta}>
          {done} de {missions.length} misiones · {getJourneyProgress(state)}% del viaje
        </Text>
      </View>
      <ChunkyButton label="Continuar mi misión" variant="oro" onPress={() => router.push(getNextMissionHref(state))} />
    </View>
  );
}

function StreakCard() {
  const { state } = useJourney();
  const streak = getStreak(state);
  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Sprite name="lantern" width={36} />
        <View>
          <Text style={styles.streak}>
            {streak} {streak === 1 ? 'día' : 'días'} de racha
          </Text>
          <T variant="small">{streak > 0 ? 'Tu farol sigue encendido' : 'Avanza hoy para encender tu farol'}</T>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {getWeek(state).map((d, i) => (
          <View key={i} style={{ alignItems: 'center', gap: 4, flex: 1 }}>
            <Text style={[styles.dayLabel, d.state === 'today' && { color: colors.brasa, fontFamily: fonts.title }]}>{d.label}</Text>
            {d.state === 'done' ? (
              <View style={[styles.dayDot, { backgroundColor: colors.oroDark }]}>
                <View style={[styles.dayFill, { backgroundColor: colors.oro }]} />
              </View>
            ) : d.state === 'today' ? (
              <View style={[styles.dayDot, { borderWidth: 3, borderStyle: 'dashed', borderColor: colors.brasa }]} />
            ) : (
              <View style={[styles.dayDot, { backgroundColor: colors.divider }]} />
            )}
          </View>
        ))}
      </View>
    </Card>
  );
}

function Inventory() {
  const { state } = useJourney();
  return (
    <Card style={{ gap: 12 }}>
      <GameLabel>INVENTARIO · ENTREGABLES</GameLabel>
      <View style={styles.grid}>
        {getDeliverables(state).map((d) => {
          const unlocked = state.unlocked.includes(d.levelId);
          const kind = d.ready ? 'ready' : unlocked ? 'progress' : 'locked';
          return (
            <Pressable
              key={d.id}
              onPress={() => router.push(d.ready ? d.href : `/nivel/${d.levelId}`)}
              style={[styles.item, kind === 'ready' ? styles.itemReady : kind === 'progress' ? styles.itemProgress : styles.itemLocked]}
            >
              {kind === 'locked' ? (
                <Sprite name="lock" width={30} filter="grayscale" opacity={0.6} />
              ) : (
                <Sprite name={d.sprite} width={kind === 'ready' ? 42 : 40} opacity={kind === 'ready' ? 1 : 0.55} />
              )}
              <Text style={[styles.itemText, kind === 'progress' && { color: colors.verde }, kind === 'locked' && { color: colors.muted }]}>
                {d.title}
                {kind === 'progress' ? ' · en curso' : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  hero: {
    backgroundColor: colors.verde,
    borderBottomWidth: 6,
    borderBottomColor: colors.bosque,
    borderRadius: radius.hero,
    padding: 20,
    gap: 14,
    overflow: 'hidden',
  },
  heroSprite: { position: 'absolute', right: 14, top: 14 },
  heroTitle: { fontFamily: fonts.title, fontSize: 26, lineHeight: 29, color: colors.bg, maxWidth: '62%' },
  heroMeta: { fontFamily: fonts.heavy, fontSize: 13, color: colors.verdeTint },
  streak: { fontFamily: fonts.title, fontSize: 18, color: colors.brasa },
  dayLabel: { fontFamily: fonts.heavy, fontSize: 11, color: colors.muted },
  dayDot: { width: 28, height: 28, borderRadius: 14, overflow: 'hidden' },
  dayFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 3, borderRadius: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: {
    width: '47%',
    flexGrow: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  itemReady: { backgroundColor: colors.oroTint, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.oro },
  itemProgress: { backgroundColor: colors.card, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.verde },
  itemLocked: { backgroundColor: colors.divider, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.locked },
  itemText: { fontFamily: fonts.heavy, fontSize: 12, lineHeight: 15, textAlign: 'center', color: colors.ink },
  nextArt: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
