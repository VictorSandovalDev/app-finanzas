import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { GroupCard } from '@/components/GroupCard';
import { Icon } from '@/components/Icon';
import { Seal } from '@/components/Seal';
import { Button, Card, Divider, IconBadge, Pill, ProgressBar, Screen, T, TopBar } from '@/components/ui';
import { formatCOP, getLevel, Level } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { canCompleteLevel, getDeliverables, getMissions, Mission } from '@/state/missions';
import { colors, radius, space } from '@/theme/tokens';

const QUOTES: Record<number, string> = {
  1: 'Antes de cambiar lo que haces con tu dinero, vale la pena entender por qué lo haces.',
  2: 'El dinero puede medirse, conocerse y dirigirse.',
  3: 'Cuando conoces el costo de tu vida, dejas de adivinar.',
};

export default function LevelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useJourney();
  const level = getLevel(Number(id));
  if (!level) return <Redirect href="/viaje" />;

  if (!level.available) return <ComingSoon level={level} />;
  if (!state.unlocked.includes(level.id)) return <LockedLevel level={level} />;
  return <ActiveLevel level={level} />;
}

function LockedLevel({ level }: { level: Level }) {
  const { state } = useJourney();
  const previous = level.id > 1 ? getLevel(level.id - 1) : undefined;
  const ready = !previous || state.completed.includes(previous.id);

  return (
    <Screen
      footer={
        <>
          <View style={styles.priceRow}>
            <View>
              <T variant="label">Desbloqueo único</T>
              <T variant="title" style={{ fontSize: 28 }}>{formatCOP(level.price)}</T>
            </View>
            <Pill tone="sage" label={level.duration} />
          </View>
          <Button
            label={ready ? 'Desbloquear nivel' : `Completa el Nivel ${previous!.id} para desbloquear`}
            icon={ready ? 'key' : 'lock'}
            disabled={!ready}
            onPress={() => router.push(`/nivel/${level.id}/desbloquear`)}
          />
        </>
      }
    >
      <TopBar title={`Nivel ${level.id}`} />
      <View style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xl }}>
        <View>
          <Seal icon={level.symbol} size={132} muted />
          <View style={styles.lockBadge}>
            <Icon name="lock" size={18} color={colors.ivory} />
          </View>
        </View>
        <Pill tone="champagne" label={`${level.stage} · Bloqueado`} icon="lock" />
        <T variant="display" style={{ textAlign: 'center', fontSize: 36, lineHeight: 40 }}>{level.title}</T>
        <T variant="quote" style={{ textAlign: 'center', fontSize: 20, color: colors.inkSoft }}>{level.promise}</T>
      </View>

      <Card style={{ gap: space.md }}>
        <T variant="label">El objetivo</T>
        <T>{level.objective}</T>
      </Card>

      <T variant="heading" style={{ marginTop: space.xxl, marginBottom: space.md }}>Lo que vas a descubrir</T>
      <View style={{ gap: space.md }}>
        {level.learn.map((item, i) => (
          <View key={item} style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
            <T style={styles.number}>{String(i + 1).padStart(2, '0')}</T>
            <T style={{ flex: 1, color: colors.ink }}>{item}</T>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.xxl }}>
        <Card tone="champagne" style={styles.rewardCard}>
          <Icon name="doc" color="#8A6F3E" />
          <T variant="label" style={{ color: '#8A6F3E' }}>Recompensa</T>
          <T variant="bodyStrong">{level.deliverable}</T>
        </Card>
        <Card tone="sage" style={styles.rewardCard}>
          <Icon name="sparkle" color={colors.forest} />
          <T variant="label" style={{ color: colors.forest }}>Logro</T>
          <T variant="bodyStrong">{level.achievement}</T>
        </Card>
      </View>

      <Card tone="paper" style={{ marginTop: space.md, flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
        <Icon name="chat" color={colors.forest} />
        <T variant="small" style={{ flex: 1, color: colors.inkSoft }}>
          Incluye acceso al grupo privado de WhatsApp del nivel durante {level.duration}.
        </T>
      </Card>
    </Screen>
  );
}

function ActiveLevel({ level }: { level: Level }) {
  const { state, complete } = useJourney();
  const missions = getMissions(state, level.id);
  const required = missions.filter((m) => !m.optional);
  const done = required.filter((m) => m.done).length;
  const completed = state.completed.includes(level.id);
  const canComplete = canCompleteLevel(state, level.id);
  const nextMission = missions.find((m) => !m.done && !m.optional);
  const nextLevel = getLevel(level.id + 1);

  const finish = () => {
    complete(level.id, level.achievement);
    router.push(`/logro/${level.id}`);
  };

  return (
    <Screen>
      <TopBar title={`Nivel ${level.id} · ${level.stage}`} />
      <View style={{ gap: space.md, paddingTop: space.md }}>
        <Pill tone={completed ? 'champagne' : 'sage'} icon={completed ? 'check' : 'key'} label={completed ? 'Nivel completado' : 'Nivel desbloqueado'} />
        <T variant="display" style={{ fontSize: 36, lineHeight: 40 }}>{level.title}</T>
        <T>{level.objective}</T>
      </View>

      <Card tone="paper" style={{ marginTop: space.xl, gap: space.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T variant="label">Progreso del nivel</T>
          <T variant="label" style={{ color: colors.forest }}>{done} de {required.length} misiones</T>
        </View>
        <ProgressBar value={(done / Math.max(1, required.length)) * 100} />
        <T variant="small">Duración sugerida: {level.duration} · Entregable: {level.deliverable}</T>
      </Card>

      {QUOTES[level.id] ? (
        <View style={styles.quote}>
          <T variant="quote">“{QUOTES[level.id]}”</T>
        </View>
      ) : null}

      <T variant="heading" style={{ marginBottom: space.md }}>Misiones</T>
      <View style={{ gap: space.md }}>
        {missions
          .filter((m) => m.id !== 'grupo')
          .map((m, i) => (
            <MissionCard key={m.id} mission={m} index={i + 1} isNext={m === nextMission} />
          ))}
      </View>

      {level.whatsappUrl ? (
        <View style={{ marginTop: space.xl }}>
          <GroupCard level={level} />
        </View>
      ) : null}

      <View style={{ marginTop: space.xxl, gap: space.md }}>
        {completed ? (
          <>
            <Button label={`Ver mi ${level.deliverable}`} icon="doc" variant="secondary" onPress={() => router.push(getDeliverables(state).find((d) => d.levelId === level.id)!.href)} />
            {nextLevel?.available && (
              <Button
                label={state.unlocked.includes(nextLevel.id) ? `Ir al Nivel ${nextLevel.id}` : `Desbloquear Nivel ${nextLevel.id}`}
                icon="arrowRight"
                onPress={() => router.push(`/nivel/${nextLevel.id}`)}
              />
            )}
          </>
        ) : canComplete ? (
          <Button label="Completar nivel" icon="sparkle" variant="gold" onPress={finish} />
        ) : nextMission ? (
          <Button label="Continuar mi misión" icon="arrowRight" onPress={() => router.push(nextMission.href)} />
        ) : null}
      </View>
    </Screen>
  );
}

function MissionCard({ mission, index, isNext }: { mission: Mission; index: number; isNext: boolean }) {
  return (
    <Card onPress={() => router.push(mission.href)} style={[styles.mission, isNext && { borderColor: colors.champagne, borderWidth: 1.5 }]}>
      <View style={[styles.missionMark, mission.done && { backgroundColor: colors.forest, borderColor: colors.forest }]}>
        {mission.done ? <Icon name="check" size={16} color={colors.ivory} strokeWidth={2.2} /> : <T variant="label" style={{ color: colors.forest }}>{index}</T>}
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        {isNext && <T variant="label" style={{ color: colors.terracotta }}>Tu siguiente misión</T>}
        {mission.done && <T variant="label" style={{ color: colors.forest }}>Misión completada</T>}
        <T variant="bodyStrong">{mission.title}</T>
        <T variant="small">{mission.description}</T>
      </View>
      <Icon name="arrowRight" size={18} color={colors.warmGray} />
    </Card>
  );
}

function ComingSoon({ level }: { level: Level }) {
  return (
    <Screen>
      <TopBar title={`Nivel ${level.id}`} />
      <View style={{ alignItems: 'center', gap: space.lg, paddingTop: space.xxxl }}>
        <IconBadge name={level.symbol} tone="muted" size={88} />
        <Pill tone="champagne" label="Próximamente" />
        <T variant="display" style={{ textAlign: 'center', fontSize: 36 }}>{level.title}</T>
        <T style={{ textAlign: 'center' }}>{level.objective}</T>
        <Divider style={{ alignSelf: 'stretch', marginVertical: space.lg }} />
        <T variant="small" style={{ textAlign: 'center' }}>
          Esta estación se está preparando. Te avisaremos cuando puedas desbloquearla.
        </T>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: space.sm },
  lockBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.ivory,
  },
  number: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 20, color: colors.champagne, width: 28 },
  rewardCard: { flex: 1, gap: space.sm, padding: space.lg, borderRadius: radius.md },
  quote: { borderLeftWidth: 2, borderLeftColor: colors.champagne, paddingLeft: space.lg, marginVertical: space.xxl },
  mission: { flexDirection: 'row', alignItems: 'center', gap: space.lg, padding: space.lg, borderRadius: radius.md, borderWidth: 1.5, borderColor: 'transparent' },
  missionMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
