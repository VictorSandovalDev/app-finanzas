import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Cover } from '@/components/Cover';
import { GroupRow } from '@/components/GroupCard';
import { Icon, IconName } from '@/components/Icon';
import { FadeUp } from '@/components/motion';
import { BackButton, Button, Divider, MentorNote, Progress, Screen, SectionTitle, T, Tag } from '@/components/ui';
import { formatCOP, getLevel, Level } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { canCompleteLevel, getDeliverables, getLevelXp, getMissions, Mission, STATION_XP } from '@/state/missions';
import { colors, fonts, radius } from '@/theme/tokens';

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

function backToRoute() {
  if (router.canGoBack()) router.back();
  else router.replace('/mapa');
}

function Chips({ level, missions }: { level: Level; missions: number }) {
  return (
    <View style={styles.chips}>
      <View style={styles.chip}>
        <Icon name="play" size={13} color={colors.ink} />
        <Text style={styles.chipText}>{missions} misiones</Text>
      </View>
      <View style={styles.chip}>
        <Icon name="clock" size={13} color={colors.ink} />
        <Text style={styles.chipText}>{level.duration}</Text>
      </View>
      <View style={styles.chip}>
        <Icon name="group" size={13} color={colors.ink} />
        <Text style={styles.chipText}>Grupo privado</Text>
      </View>
    </View>
  );
}

function LockedLevel({ level }: { level: Level }) {
  const { state } = useJourney();
  const previous = level.id > 1 ? getLevel(level.id - 1) : undefined;
  const ready = !previous || state.completed.includes(previous.id);
  const missions = getMissions(state, level.id).filter((m) => !m.optional);

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
      contentStyle={{ gap: 18 }}
    >
      <BackButton onPress={backToRoute} label="Ruta" />
      <FadeUp style={{ gap: 14 }}>
        <View>
          <Cover level={level} height={130} label={`Estación ${level.id} · ${level.stage}`} radius={14} />
          <View style={styles.lockBadge}>
            <Icon name="lock" size={16} color={colors.onDark} weight="bold" />
          </View>
        </View>
        <T variant="display">{level.title}</T>
        <T>{level.promise}</T>
        <Chips level={level} missions={missions.length} />
      </FadeUp>
      <View style={styles.card}>
        <SectionTitle title="Lo que vas a descubrir" />
        {level.learn.map((item, i) => (
          <View key={item} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={styles.learnNum}>
              <Text style={styles.learnNumText}>{i + 1}</Text>
            </View>
            <T style={{ flex: 1, color: colors.ink }}>{item}</T>
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <SectionTitle title="Incluye" />
        {includes.map((it) => (
          <View key={it.text} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Icon name={it.icon} size={20} color={colors.accent} />
            <T style={{ flex: 1, color: colors.ink }}>{it.text}</T>
          </View>
        ))}
      </View>
    </Screen>
  );
}

type Tab = 'misiones' | 'entregable' | 'comunidad';

function ActiveLevel({ level }: { level: Level }) {
  const { state, complete } = useJourney();
  const [tab, setTab] = useState<Tab>('misiones');
  const missions = getMissions(state, level.id);
  const required = missions.filter((m) => !m.optional);
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

  return (
    <Screen contentStyle={{ gap: 18 }}>
      <BackButton onPress={backToRoute} label="Ruta" />
      <FadeUp style={{ gap: 14 }}>
        <Cover level={level} height={130} label={`Estación ${level.id} · ${level.stage}`} radius={14} />
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <T variant="display" style={{ flexShrink: 1 }}>{level.title}</T>
            {completed && <Tag label="Completada" tone="accent" icon="check" />}
          </View>
          <T>{level.promise}</T>
        </View>
        <Chips level={level} missions={required.length} />
        <View style={styles.progressRow}>
          <View style={{ flex: 1 }}>
            <Progress value={(done / required.length) * 100} />
          </View>
          <Text style={styles.progressText}>
            {xp.earned} / {xp.max} XP
          </Text>
        </View>
      </FadeUp>

      <View style={styles.segment}>
        {(['misiones', 'entregable', 'comunidad'] as Tab[]).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.segmentItem, tab === t && styles.segmentOn]} accessibilityRole="tab" accessibilityState={{ selected: tab === t }}>
            <Text style={[styles.segmentText, tab === t && { color: colors.ink }]}>{t === 'misiones' ? 'Misiones' : t === 'entregable' ? 'Entregable' : 'Comunidad'}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'misiones' && (
        <View style={{ gap: 14 }}>
          <View>
            {required.map((m, i) => (
              <View key={m.id}>
                {i > 0 && <Divider />}
                <Lesson mission={m} index={i + 1} isNext={m === next && !completed} locked={!m.done && m !== next} />
              </View>
            ))}
          </View>
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
          <MentorNote action="Hablar con Victor" onPress={() => router.push(level.id === 1 && !state.level1.map ? '/mision/relato' : '/mentor')}>
            {MENTOR_TIPS[level.id] ?? 'Avanzamos una misión a la vez.'}
          </MentorNote>
        </View>
      )}

      {tab === 'entregable' && (
        <Pressable
          onPress={deliverable?.ready ? () => router.push(deliverable.href) : undefined}
          style={({ pressed }) => [styles.card, { flexDirection: 'row', alignItems: 'center' }, pressed && deliverable?.ready && { opacity: 0.85 }]}
        >
          <View style={[styles.delivIcon, deliverable?.ready && { backgroundColor: colors.accentSoft }]}>
            <Icon name="scroll" size={22} color={deliverable?.ready ? colors.accent : colors.muted} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <T variant="label">{deliverable?.ready ? 'Listo para consultar' : 'Al terminar la estación'}</T>
            <T variant="bodyStrong">
              {level.deliverable} + {STATION_XP} XP
            </T>
            <T variant="small">Logro: {level.achievement}</T>
          </View>
          {deliverable?.ready && <Icon name="caretRight" size={16} color={colors.muted} />}
        </Pressable>
      )}

      {tab === 'comunidad' && (
        <View style={{ gap: 14 }}>
          {level.whatsappUrl ? (
            <View style={styles.card}>
              <GroupRow level={level} />
            </View>
          ) : null}
          <T variant="small">Comparte avances, resuelve dudas con Victor y avanza junto a quienes están en la misma estación.</T>
        </View>
      )}
    </Screen>
  );
}

function Lesson({ mission, index, isNext, locked }: { mission: Mission; index: number; isNext: boolean; locked: boolean }) {
  return (
    <Pressable onPress={locked ? undefined : () => router.push(mission.href)} style={({ pressed }) => [styles.lesson, pressed && !locked && { opacity: 0.7 }]}>
      <View style={[styles.num, mission.done && styles.numDone, isNext && styles.numNext]}>
        {mission.done ? <Icon name="check" size={13} color={colors.onDark} weight="bold" /> : <Text style={[styles.numText, isNext && { color: colors.onDark }]}>{index}</Text>}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T variant="bodyStrong" style={locked && { color: colors.muted }}>{mission.title}</T>
        <T variant="small">{mission.done ? `Completada · +${mission.xp} XP` : `${mission.minutes} min · +${mission.xp} XP`}</T>
      </View>
      {isNext ? (
        <View style={styles.play}>
          <Icon name="play" size={15} color={colors.onDark} weight="fill" />
        </View>
      ) : locked ? (
        <Icon name="lock" size={16} color={colors.muted} />
      ) : (
        <Icon name="caretRight" size={16} color={colors.muted} />
      )}
    </Pressable>
  );
}

function ComingSoon({ level }: { level: Level }) {
  return (
    <Screen contentStyle={{ gap: 16 }}>
      <BackButton onPress={backToRoute} label="Ruta" />
      <Cover level={level} height={130} label={`Estación ${level.id} · Próximamente`} radius={14} style={{ opacity: 0.7 }} />
      <T variant="display">{level.title}</T>
      <T>{level.objective}</T>
      <T variant="small">Esta estación se está preparando. Te avisaremos cuando abra.</T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  price: { fontFamily: fonts.display, fontSize: 24, lineHeight: 28, color: colors.ink },
  lockBadge: { position: 'absolute', left: 12, top: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.sunken, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
  chipText: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.ink },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, gap: 12 },
  learnNum: { width: 22, height: 22, borderRadius: 6, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  learnNumText: { fontFamily: fonts.display, fontSize: 12, color: colors.accent },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressText: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.muted, fontVariant: ['tabular-nums'] },
  segment: { flexDirection: 'row', gap: 20, borderBottomWidth: 1, borderBottomColor: colors.line },
  segmentItem: { paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  segmentOn: { borderBottomColor: colors.accentBright },
  segmentText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.muted },
  lesson: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  num: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.sunken, alignItems: 'center', justifyContent: 'center' },
  numDone: { backgroundColor: colors.accentBright },
  numNext: { backgroundColor: colors.ink },
  numText: { fontFamily: fonts.display, fontSize: 13, color: colors.muted },
  play: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  delivIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.sunken, alignItems: 'center', justifyContent: 'center' },
});
