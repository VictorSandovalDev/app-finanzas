import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Cover } from '@/components/Cover';
import { GroupRow } from '@/components/GroupCard';
import { Icon, IconName } from '@/components/Icon';
import { FadeUp } from '@/components/motion';
import { Button, Column, Columns, Divider, MentorNote, Progress, Screen, SectionTitle, T, Tag } from '@/components/ui';
import { formatCOP, Level, LEVELS, LevelId } from '@/data/levels';
import { useAuth } from '@/state/auth';
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
import { colors, fonts, radius } from '@/theme/tokens';

const MENTOR_TIPS: Record<string, string> = {
  relato: 'Antes de hablar de números, quiero entender tu historia. Cuéntamela con tus palabras.',
  frases: 'Tus frases ya están listas. Léelas en voz alta cada mañana de esta semana.',
  ideas: 'Son ocho ideas, una a la vez. Basta con que puedas explicarlas con tus palabras.',
  mapa: 'Ten a mano tus movimientos del último mes. Con ellos tu mapa será exacto.',
  recorrido: 'No hay una etapa correcta. Solo un punto de partida honesto.',
  costo: 'Empieza por lo esencial. Si algo se paga cada año, divídelo entre doce.',
};

export default function Home() {
  const { state } = useJourney();
  const { profile } = useAuth();
  const current = getCurrentLevel(state);
  const mission = getNextMission(state);
  const streak = getStreak(state);
  const name = state.name || profile?.name || '';
  const today = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Screen maxWidth={1040} contentStyle={{ gap: 20 }}>
      <FadeUp style={{ gap: 14, paddingTop: 4 }}>
        <View style={styles.greet}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T variant="label">{today}</T>
            <T variant="display" numberOfLines={1}>
              Hola{name ? `, ${name}` : ''}
            </T>
          </View>
          <Pressable onPress={() => router.push('/perfil')} style={styles.avatar} accessibilityLabel="Mi perfil">
            <Text style={styles.avatarText}>{(name || 'V').charAt(0).toUpperCase()}</Text>
          </Pressable>
        </View>
        <View style={styles.chips}>
          <Chip icon="flame" tint={colors.warm} label={`${streak} ${streak === 1 ? 'día' : 'días'}`} />
          <Chip icon="diamond" tint="#3C8DE0" label={`${getTotalXp(state)} XP`} />
          <Chip icon="compass" label={`Estación ${current?.id ?? Math.max(1, state.completed.length)} de ${LEVELS.length}`} />
        </View>
      </FadeUp>

      <Columns gap={20}>
        <Column gap={20}>
          <FadeUp delay={100}>
            <ContinueCard />
          </FadeUp>
          {current && (
            <MentorNote action="Hablar con Victor" onPress={() => router.push(current.id === 1 ? '/mision/relato' : '/mentor')}>
              {(mission && MENTOR_TIPS[mission.id]) || 'Completaste las misiones de esta estación. Entra a la bitácora para cerrarla.'}
            </MentorNote>
          )}
          <Week streak={streak} />
        </Column>
        <Column gap={20}>
          <RouteStrip />
          {current?.whatsappUrl ? (
            <View style={styles.card}>
              <GroupRow level={current} />
            </View>
          ) : null}
          <Deliverables />
        </Column>
      </Columns>
    </Screen>
  );
}

function Chip({ icon, label, tint }: { icon: IconName; label: string; tint?: string }) {
  return (
    <View style={styles.chip}>
      <Icon name={icon} size={14} color={tint ?? colors.ink} weight={tint ? 'fill' : 'regular'} />
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function ContinueCard() {
  const { state } = useJourney();
  const current = getCurrentLevel(state);
  const next = getNextLockedLevel(state);

  if (!current) {
    const level = next ?? LEVELS[LEVELS.length - 1];
    const ready = !next || next.id === 1 || state.completed.includes((next.id - 1) as LevelId);
    return (
      <View style={styles.card}>
        <Cover level={level} label={`Estación ${level.id} · ${level.stage}`} />
        <View style={{ gap: 3 }}>
          <T variant="label">{next ? 'Tu siguiente estación' : 'Viaje al día'}</T>
          <T variant="heading">{next ? level.title : 'Completaste las estaciones disponibles'}</T>
        </View>
        {next?.available && ready ? (
          <Button label={`Desbloquear · ${formatCOP(next.price)}`} icon="arrowRight" onPress={() => router.push(`/nivel/${next.id}`)} />
        ) : (
          <Button label="Ver mi perfil" variant="secondary" icon="arrowRight" onPress={() => router.push('/perfil')} />
        )}
      </View>
    );
  }

  const missions = getMissions(state, current.id).filter((m) => !m.optional);
  const done = missions.filter((m) => m.done).length;
  const mission = getNextMission(state);
  return (
    <View style={styles.card}>
      <Cover level={current} label={`Estación ${current.id} · ${current.stage}`} />
      <View style={{ gap: 3 }}>
        <T variant="label">Continúa donde quedaste</T>
        <T variant="heading">{mission ? mission.title : `Completa la estación ${current.id}`}</T>
      </View>
      <View style={styles.progressRow}>
        <View style={{ flex: 1 }}>
          <Progress value={(done / missions.length) * 100} />
        </View>
        <Text style={styles.progressText}>
          {done} de {missions.length}
        </Text>
      </View>
      <Button label={mission ? 'Continuar misión' : 'Abrir estación'} leadingIcon="play" onPress={() => router.push(getNextMissionHref(state))} />
    </View>
  );
}

function RouteStrip() {
  const { state } = useJourney();
  return (
    <View style={{ gap: 12 }}>
      <SectionTitle title="Tu ruta" action="Ver todo" onAction={() => router.push('/mapa')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {LEVELS.filter((l) => l.available).map((l) => (
          <MiniStation key={l.id} level={l} />
        ))}
      </ScrollView>
    </View>
  );

  function MiniStation({ level }: { level: Level }) {
    const done = state.completed.includes(level.id);
    const unlocked = state.unlocked.includes(level.id);
    return (
      <Pressable onPress={() => router.push(`/nivel/${level.id}`)} style={({ pressed }) => [styles.mini, pressed && { opacity: 0.85 }]}>
        <Cover level={level} height={70} radius={0} />
        <View style={{ padding: 10, gap: 5 }}>
          {done ? (
            <View style={styles.miniStatus}>
              <Icon name="seal" size={13} color={colors.accent} weight="fill" />
              <Text style={[styles.miniStatusText, { color: colors.accent }]}>Completada</Text>
            </View>
          ) : unlocked ? (
            <View style={styles.miniStatus}>
              <Icon name="play" size={12} color={colors.accent} weight="fill" />
              <Text style={[styles.miniStatusText, { color: colors.accent }]}>En curso</Text>
            </View>
          ) : (
            <Tag label={formatCOP(level.price)} tone="warn" icon="lock" />
          )}
          <Text style={styles.miniTitle} numberOfLines={2}>
            {level.title}
          </Text>
        </View>
      </Pressable>
    );
  }
}

function Week({ streak }: { streak: number }) {
  const { state } = useJourney();
  return (
    <View style={[styles.card, { gap: 14 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon name="flame" size={22} color={colors.warm} weight="fill" />
        <View style={{ flex: 1 }}>
          <T variant="bodyStrong">{streak > 0 ? `${streak} ${streak === 1 ? 'día' : 'días'} de racha` : 'Empieza tu racha hoy'}</T>
          <T variant="small">{streak > 0 ? 'Sigue así: una misión al día basta.' : 'Avanza en una misión para encenderla.'}</T>
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {getWeek(state).map((d, i) => (
          <View key={i} style={{ alignItems: 'center', gap: 6, flex: 1 }}>
            <Text style={[styles.day, d.state === 'today' && { color: colors.ink }]}>{d.label}</Text>
            <View style={[styles.dayDot, d.state === 'done' && { backgroundColor: colors.accentBright, borderColor: colors.accentBright }, d.state === 'today' && { borderColor: colors.accentBright }]}>
              {d.state === 'done' ? <Icon name="check" size={12} color={colors.onDark} weight="bold" /> : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function Deliverables() {
  const { state } = useJourney();
  const items = getDeliverables(state);
  return (
    <View style={{ gap: 10 }}>
      <SectionTitle title="Entregables" />
      <View style={[styles.card, { paddingVertical: 4, gap: 0 }]}>
        {items.map((d, i) => {
          const unlocked = state.unlocked.includes(d.levelId);
          return (
            <View key={d.id}>
              {i > 0 && <Divider />}
              <Pressable onPress={() => router.push(d.ready ? d.href : `/nivel/${d.levelId}`)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
                <View style={[styles.delivIcon, d.ready && { backgroundColor: colors.accentSoft }]}>
                  <Icon name={d.icon} size={18} color={d.ready ? colors.accent : colors.muted} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <T variant="bodyStrong" numberOfLines={1} style={!d.ready && { color: colors.inkSoft }}>
                    {d.title}
                  </T>
                  <T variant="small">{d.ready ? 'Listo para consultar' : unlocked ? 'En curso' : `Estación ${d.levelId}`}</T>
                </View>
                {!unlocked ? <Icon name="lock" size={16} color={colors.muted} /> : <Icon name="caretRight" size={16} color={colors.muted} />}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  greet: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentBright, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.display, fontSize: 16, color: colors.onDark },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.sunken, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
  chipText: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.ink },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, gap: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressText: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.muted, fontVariant: ['tabular-nums'] },
  mini: { width: 150, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, overflow: 'hidden' },
  miniStatus: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  miniStatusText: { fontFamily: fonts.sansSemi, fontSize: 12 },
  miniTitle: { fontFamily: fonts.sansSemi, fontSize: 13.5, lineHeight: 18, color: colors.ink },
  day: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.muted },
  dayDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  delivIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.sunken, alignItems: 'center', justifyContent: 'center' },
});
