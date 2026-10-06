import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, IconName } from '@/components/Icon';
import { FadeUp } from '@/components/motion';
import { BackButton, Button, Column, Columns, Divider, Emblem, MentorNote, Progress, Screen, SectionTitle, Surface, T, Tag } from '@/components/ui';
import { formatCOP, getLevel, Level } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { canCompleteLevel, getDeliverables, getLevelXp, getMissions, Mission, STATION_XP } from '@/state/missions';
import { colors, fonts } from '@/theme/tokens';

const MENTOR_TIPS: Record<number, string> = {
  1: 'Antes de hablar de números, quiero entender tu historia. No hay respuestas correctas.',
  2: 'Ten a mano tus movimientos del último mes. Con ellos tu mapa será exacto.',
  3: 'Empieza por lo esencial. Si algo se paga cada año, divídelo entre doce.',
};

export default function LevelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useJourney();
  const level = getLevel(Number(id));
  if (!level) return <Redirect href="/mapa" />;
  if (!level.available) return <ComingSoon level={level} />;
  if (!state.unlocked.includes(level.id)) return <LockedLevel level={level} />;
  return <ActiveLevel level={level} />;
}

function backToMap() {
  if (router.canGoBack()) router.back();
  else router.replace('/mapa');
}

function LockedLevel({ level }: { level: Level }) {
  const { state } = useJourney();
  const previous = level.id > 1 ? getLevel(level.id - 1) : undefined;
  const ready = !previous || state.completed.includes(previous.id);

  const includes: { icon: IconName; text: string }[] = [
    { icon: 'scroll', text: `Entregable: ${level.deliverable}` },
    { icon: 'seal', text: `Logro: ${level.achievement}` },
    { icon: 'group', text: `Grupo privado de acompañamiento · ${level.duration}` },
    { icon: 'diamond', text: `${STATION_XP} XP al completar la estación` },
  ];

  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View>
            <T variant="small">Pago único</T>
            <Text style={styles.price}>{formatCOP(level.price)}</Text>
          </View>
          <Button
            label={ready ? 'Desbloquear' : `Completa la estación ${previous!.id}`}
            icon={ready ? 'arrowRight' : 'lock'}
            disabled={!ready}
            onPress={() => router.push(`/nivel/${level.id}/desbloquear`)}
            style={{ flex: 1 }}
          />
        </View>
      }
    >
      <BackButton onPress={backToMap} label="Mapa" />
      <Columns>
        <Column gap={16}>
          <FadeUp style={{ gap: 16 }}>
            <Emblem icon={level.icon} size={64} tone="locked" />
            <T variant="label">
              Estación {level.id} · {level.stage} · {level.duration}
            </T>
            <T variant="display">{level.title}</T>
            <T variant="quote" style={{ color: colors.inkSoft }}>{level.promise}</T>
          </FadeUp>
        </Column>
        <Column gap={16}>
          <SectionTitle title="Lo que vas a descubrir" />
          {level.learn.map((item, i) => (
            <View key={item} style={{ flexDirection: 'row', gap: 14 }}>
              <Text style={styles.num}>{String(i + 1).padStart(2, '0')}</Text>
              <T style={{ flex: 1, color: colors.ink }}>{item}</T>
            </View>
          ))}
          <SectionTitle title="Incluye" />
          {includes.map((it) => (
            <View key={it.text} style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
              <Icon name={it.icon} size={20} color={colors.forest} />
              <T style={{ flex: 1, color: colors.ink }}>{it.text}</T>
            </View>
          ))}
        </Column>
      </Columns>
    </Screen>
  );
}

function ActiveLevel({ level }: { level: Level }) {
  const { state, complete, update } = useJourney();
  const missions = getMissions(state, level.id);
  const required = missions.filter((m) => !m.optional);
  const optional = missions.filter((m) => m.optional);
  const done = required.filter((m) => m.done).length;
  const completed = state.completed.includes(level.id);
  const next = required.find((m) => !m.done);
  const xp = getLevelXp(state, level.id);
  const nextLevel = getLevel(level.id + 1);
  const deliverable = getDeliverables(state).find((d) => d.levelId === level.id);

  const finish = () => {
    complete(level.id, level.achievement);
    router.push(`/logro/${level.id}`);
  };
  const joinGroup = () => {
    if (level.whatsappUrl) Linking.openURL(level.whatsappUrl).catch(() => {});
    if (level.id === 1) update((s) => ({ ...s, level1: { ...s.level1, joinedGroup: true } }));
  };

  return (
    <Screen>
      <BackButton onPress={backToMap} label="Mapa" />
      <FadeUp style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <T variant="label">Estación {level.id} · {level.stage}</T>
          {completed && <Tag label="Completada" tone="forest" icon="check" />}
        </View>
        <T variant="display">{level.title}</T>
        <T>{level.objective}</T>
        <View style={{ gap: 8, paddingTop: 4 }}>
          <Progress value={(done / required.length) * 100} />
          <T variant="small">
            {done} de {required.length} misiones · {xp.earned} de {xp.max} XP
          </T>
        </View>
      </FadeUp>

      <Columns>
        <Column gap={14}>
          <SectionTitle title="Bitácora de misiones" />
          {required.map((m, i) => (m === next && !completed ? <NextMission key={m.id} mission={m} index={i + 1} /> : <MissionRow key={m.id} mission={m} index={i + 1} locked={!m.done} />))}

          {optional.map((m) => (
            <Pressable key={m.id} onPress={joinGroup} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
              <Icon name="group" size={22} color={m.done ? colors.forest : colors.muted} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <T variant="bodyStrong">{m.title}</T>
                <T variant="small">{m.done ? 'Te uniste al grupo' : `Opcional · +${m.xp} XP`}</T>
              </View>
              <Icon name="whatsapp" size={20} color={colors.forest} />
            </Pressable>
          ))}

          <Divider />
          <Pressable
            onPress={completed && deliverable ? () => router.push(deliverable.href) : undefined}
            style={({ pressed }) => [styles.row, pressed && completed && { opacity: 0.7 }]}
          >
            <Icon name="scroll" size={22} color={completed ? colors.forest : colors.brass} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <T variant="small">Recompensa de la estación</T>
              <T variant="bodyStrong">
                {level.deliverable} · {STATION_XP} XP
              </T>
            </View>
            {completed && <Icon name="caretRight" size={16} color={colors.muted} />}
          </Pressable>

          {completed ? (
            nextLevel?.available ? (
              <Button
                label={state.unlocked.includes(nextLevel.id) ? `Ir a la estación ${nextLevel.id}` : `Desbloquear estación ${nextLevel.id}`}
                icon="arrowRight"
                onPress={() => router.push(`/nivel/${nextLevel.id}`)}
              />
            ) : null
          ) : canCompleteLevel(state, level.id) ? (
            <Button label="Completar estación" icon="seal" onPress={finish} />
          ) : null}
        </Column>
        <Column>
          <MentorNote action="Hablar con Victor" onPress={() => router.push(level.id === 1 && !state.level1.map ? '/mision/relato' : '/mentor')}>
            {MENTOR_TIPS[level.id] ?? 'Avanzamos una misión a la vez.'}
          </MentorNote>
        </Column>
      </Columns>
    </Screen>
  );
}

function MissionRow({ mission, index, locked }: { mission: Mission; index: number; locked: boolean }) {
  return (
    <Pressable onPress={locked ? undefined : () => router.push(mission.href)} style={({ pressed }) => [styles.row, pressed && !locked && { opacity: 0.7 }]}>
      <View style={[styles.step, mission.done && styles.stepDone]}>
        {mission.done ? <Icon name="check" size={14} color={colors.onDark} weight="bold" /> : <Text style={styles.stepNum}>{index}</Text>}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T variant="bodyStrong" style={locked && { color: colors.muted }}>{mission.title}</T>
        <T variant="small">{mission.done ? `Completada · +${mission.xp} XP` : `+${mission.xp} XP`}</T>
      </View>
      {locked ? <Icon name="lock" size={16} color={colors.muted} /> : <Icon name="caretRight" size={16} color={colors.muted} />}
    </Pressable>
  );
}

function NextMission({ mission, index }: { mission: Mission; index: number }) {
  return (
    <Surface style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <T variant="label" style={{ color: colors.umber }}>Tu siguiente misión</T>
        <Tag label={`+${mission.xp} XP`} tone="brass" />
      </View>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <View style={[styles.step, { borderColor: colors.forest }]}>
          <Text style={[styles.stepNum, { color: colors.forest }]}>{index}</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <T variant="heading">{mission.title}</T>
          <T>{mission.description}</T>
        </View>
      </View>
      <Button label="Empezar" icon="arrowRight" onPress={() => router.push(mission.href)} />
    </Surface>
  );
}

function ComingSoon({ level }: { level: Level }) {
  return (
    <Screen>
      <BackButton onPress={backToMap} label="Mapa" />
      <View style={{ gap: 16 }}>
        <Emblem icon={level.icon} size={64} tone="locked" />
        <T variant="label">Estación {level.id} · {level.stage} · Próximamente</T>
        <T variant="display">{level.title}</T>
        <T>{level.objective}</T>
        <T variant="small">Esta estación se está preparando. Te avisaremos cuando abra.</T>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  price: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30, color: colors.ink },
  num: { fontFamily: fonts.display, fontSize: 18, lineHeight: 23, color: colors.brass, width: 26, fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 6 },
  step: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  stepDone: { backgroundColor: colors.forest, borderColor: colors.forest },
  stepNum: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.muted },
});
