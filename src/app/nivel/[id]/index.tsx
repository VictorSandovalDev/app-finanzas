import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Hud } from '@/components/Hud';
import { Bob } from '@/components/motion';
import { Sprite } from '@/components/Sprite';
import { BackButton, Card, ChunkyButton, Column, Columns, GameLabel, MentorSays, Node, ProgressBar, Screen, T } from '@/components/ui';
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View>
            <T variant="small" style={{ fontFamily: fonts.heavy, fontSize: 12 }}>Pago único</T>
            <Text style={styles.price}>{formatCOP(level.price)}</Text>
          </View>
          <ChunkyButton
            label={ready ? 'Desbloquear' : `Completa la estación ${previous!.id}`}
            variant="brasa"
            disabled={!ready}
            onPress={() => router.push(`/nivel/${level.id}/desbloquear`)}
            style={{ flex: 1 }}
          />
        </View>
      }
    >
      <BackButton onPress={() => (router.canGoBack() ? router.back() : router.replace('/mapa'))} />
      <Columns gap={20}>
        <Column gap={14}>
          <View style={{ alignItems: 'center', gap: 14 }}>
            <View style={styles.lockedArt}>
              <Sprite name={level.sprite} width={128} filter="silhouette" opacity={0.18} />
              <Bob duration={2000} steps={3} style={{ position: 'absolute', bottom: 6, right: 14 }}>
                <Sprite name="lock" width={60} />
              </Bob>
            </View>
            <GameLabel color={colors.muted}>
              ESTACIÓN {level.id} · {level.stage.toUpperCase()} · {level.duration.toUpperCase()}
            </GameLabel>
            <T variant="title" style={{ textAlign: 'center' }}>{level.title}</T>
            <T style={{ fontSize: 16, textAlign: 'center' }}>{level.promise}</T>
          </View>
        </Column>
        <Column gap={14}>
          <Card style={{ gap: 10 }}>
            <GameLabel>LO QUE VAS A DESCUBRIR</GameLabel>
            {level.learn.map((item, i) => (
              <View key={item} style={{ flexDirection: 'row', gap: 10 }}>
                <View style={styles.num}>
                  <Text style={styles.numText}>{i + 1}</Text>
                </View>
                <T style={{ flex: 1, color: colors.ink, lineHeight: 21 }}>{item}</T>
              </View>
            ))}
          </Card>
          <GameLabel style={{ paddingTop: 4 }}>RECOMPENSAS</GameLabel>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Reward bg={colors.oroTint} border={colors.oro} sprite={<Sprite name="scroll" width={42} />} label={level.deliverable} />
            <Reward bg={colors.lacreTint} border={colors.lacre} sprite={<Sprite name="seal" width={40} />} label={level.achievement} />
            <Reward
              bg={colors.card}
              border={colors.border}
              sprite={<Sprite name="gem" width={36} />}
              label={<GameLabel color={colors.oroDark}>+{STATION_XP} XP</GameLabel>}
            />
          </View>
        </Column>
      </Columns>
    </Screen>
  );
}

function Reward({ bg, border, sprite, label }: { bg: string; border: string; sprite: ReactNode; label: ReactNode }) {
  return (
    <View style={[styles.reward, { backgroundColor: bg, borderColor: border }]}>
      {sprite}
      {typeof label === 'string' ? <Text style={styles.rewardText}>{label}</Text> : label}
    </View>
  );
}

function ActiveLevel({ level }: { level: Level }) {
  const { state, complete, update } = useJourney();
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
    <Screen header={<Hud />} edgeToEdge maxWidth={1000}>
      <View style={styles.hero}>
        <LinearGradient colors={[colors.verdeTint, '#B9DCC2']} style={StyleSheet.absoluteFill} />
        <Bob duration={2400}>
          <Sprite name={level.sprite} width={96} />
        </Bob>
        <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
          <GameLabel color={colors.verde}>ESTACIÓN {level.id} · {level.stage.toUpperCase()}</GameLabel>
          <T variant="title" style={{ fontSize: 26, lineHeight: 28 }}>{level.title}</T>
          <ProgressBar value={(done / required.length) * 100} color={colors.verde} shade={colors.bosque} track="rgba(11,61,46,0.15)" height={14} />
          <Text style={styles.heroMeta}>
            {done} de {required.length} misiones · {xp.earned} / {xp.max} XP
          </Text>
        </View>
      </View>

      <Columns>
        <Column gap={12}>
          <GameLabel>BITÁCORA DE MISIONES</GameLabel>
          {required.map((m) =>
            m.done ? <DoneMission key={m.id} mission={m} /> : m === next ? <NextMission key={m.id} mission={m} /> : <PendingMission key={m.id} mission={m} />,
          )}
          {missions
            .filter((m) => m.optional)
            .map((m) => (
              <Card
                key={m.id}
                dashed
                bg={colors.bg}
                borderColor={colors.lockedDark}
                radius={18}
                onPress={() => {
                  if (level.whatsappUrl) Linking.openURL(level.whatsappUrl).catch(() => {});
                  if (level.id === 1) update((st) => ({ ...st, level1: { ...st.level1, joinedGroup: true } }));
                }}
                style={styles.row}
              >
                <Sprite name={m.sprite} width={40} opacity={0.7} />
                <View style={{ flex: 1 }}>
                  <T variant="bodyStrong" style={{ color: colors.inkSoft }}>{m.title}</T>
                  <GameLabel size={10} color={m.done ? colors.oroDark : colors.muted}>
                    {m.done ? `HECHO · +${m.xp} XP` : `OPCIONAL · +${m.xp} XP`}
                  </GameLabel>
                </View>
              </Card>
            ))}
          <Card bg={colors.oroTint} borderColor={colors.oro} radius={18} style={styles.row} onPress={completed && deliverable ? () => router.push(deliverable.href) : undefined}>
            <Sprite name="scroll" width={42} />
            <View style={{ flex: 1 }}>
              <GameLabel size={10} color={colors.oroText}>RECOMPENSA DE ESTACIÓN</GameLabel>
              <T variant="bodyStrong">
                {level.deliverable} + {STATION_XP} XP
              </T>
            </View>
          </Card>

          {completed ? (
            nextLevel?.available ? (
              <ChunkyButton
                label={state.unlocked.includes(nextLevel.id) ? `Ir a la estación ${nextLevel.id}` : `Desbloquear estación ${nextLevel.id}`}
                variant={state.unlocked.includes(nextLevel.id) ? 'verde' : 'brasa'}
                onPress={() => router.push(`/nivel/${nextLevel.id}`)}
              />
            ) : null
          ) : canCompleteLevel(state, level.id) ? (
            <ChunkyButton label="Completar estación" variant="oro" onPress={finish} />
          ) : null}
        </Column>
        <Column>
          <View style={{ paddingTop: 26 }}>
            <Pressable onPress={() => router.push(level.id === 1 && !state.level1.map ? '/mision/relato' : '/mentor')}>
              <MentorSays size={72} footer={<GameLabel size={11} color={colors.verde}>HABLAR CON VICTOR →</GameLabel>}>
                {MENTOR_TIPS[level.id] ?? 'Avanzamos una misión a la vez.'}
              </MentorSays>
            </Pressable>
          </View>
        </Column>
      </Columns>
    </Screen>
  );
}

function DoneMission({ mission }: { mission: Mission }) {
  return (
    <Card radius={18} style={styles.row} onPress={() => router.push(mission.href)}>
      <Node size={40} color={colors.oro} shade={colors.oroDark}>
        <Text style={{ fontFamily: fonts.title, fontSize: 18, color: colors.bosque }}>✓</Text>
      </Node>
      <View style={{ flex: 1 }}>
        <T variant="bodyStrong" style={{ fontSize: 16 }}>{mission.title}</T>
        <GameLabel size={10} color={colors.oroDark}>MISIÓN COMPLETADA · +{mission.xp} XP</GameLabel>
      </View>
    </Card>
  );
}

function NextMission({ mission }: { mission: Mission }) {
  return (
    <Card borderColor={colors.verde} edge={6} radius={18} style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <GameLabel size={11} color={colors.brasa}>TU SIGUIENTE MISIÓN</GameLabel>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Sprite name="gem" width={14} />
          <GameLabel size={11} color={colors.oroDark}>+{mission.xp} XP</GameLabel>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Sprite name={mission.sprite} width={52} />
        <View style={{ flex: 1 }}>
          <T variant="h2">{mission.title}</T>
          <T style={{ fontSize: 14, lineHeight: 20 }}>{mission.description}</T>
        </View>
      </View>
      <ChunkyButton label="Empezar" size="md" onPress={() => router.push(mission.href)} />
    </Card>
  );
}

function PendingMission({ mission }: { mission: Mission }) {
  return (
    <Card radius={18} bg={colors.divider} borderColor={colors.locked} style={styles.row}>
      <Sprite name="lock" width={26} filter="grayscale" opacity={0.6} />
      <View style={{ flex: 1 }}>
        <T variant="bodyStrong" style={{ color: colors.muted }}>{mission.title}</T>
        <GameLabel size={10} color={colors.muted}>+{mission.xp} XP</GameLabel>
      </View>
    </Card>
  );
}

function ComingSoon({ level }: { level: Level }) {
  return (
    <Screen>
      <BackButton />
      <View style={{ alignItems: 'center', gap: 14, paddingTop: 24 }}>
        <View style={styles.lockedArt}>
          <Sprite name={level.sprite} width={128} filter="silhouette" opacity={0.18} />
        </View>
        <GameLabel color={colors.muted}>ESTACIÓN {level.id} · {level.stage.toUpperCase()} · PRONTO</GameLabel>
        <T variant="title" style={{ textAlign: 'center' }}>{level.title}</T>
        <T style={{ textAlign: 'center', maxWidth: 420 }}>{level.objective}</T>
        <T variant="small" style={{ textAlign: 'center' }}>Esta estación se está preparando. Te avisaremos cuando abra.</T>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  price: { fontFamily: fonts.title, fontSize: 24, lineHeight: 26, color: colors.bosque },
  lockedArt: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.divider,
    borderWidth: 4,
    borderStyle: 'dashed',
    borderColor: colors.lockedDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: { width: 20, height: 20, borderRadius: 6, backgroundColor: colors.verdeTint, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  numText: { fontFamily: fonts.title, fontSize: 12, color: colors.verde },
  reward: {
    flex: 1,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
  },
  rewardText: { fontFamily: fonts.heavy, fontSize: 11, lineHeight: 14, textAlign: 'center', color: colors.ink },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: radius.hero,
    borderBottomWidth: 6,
    borderBottomColor: colors.verdeLight,
    overflow: 'hidden',
  },
  heroMeta: { fontFamily: fonts.heavy, fontSize: 13, color: colors.bosque },
});
