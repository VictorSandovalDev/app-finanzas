import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ReactNode, useState } from 'react';
import Svg, { Path as SvgPath } from 'react-native-svg';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Hud } from '@/components/Hud';
import { Bob, stepped, useLoop } from '@/components/motion';
import { Sprite } from '@/components/Sprite';
import { Card, GameLabel, Node, Screen, T } from '@/components/ui';
import { formatCOP, Level, LEVELS } from '@/data/levels';
import { JourneyState, useJourney } from '@/state/journey';
import { getCurrentLevel, getMissions } from '@/state/missions';
import { colors, fonts } from '@/theme/tokens';

/** Horizontal zig-zag of the route, in px. */
const OFFSETS = [0, -56, -24, 24, -36, -8, 30, -30];

export default function JourneyMap() {
  const { state } = useJourney();
  const current = getCurrentLevel(state);
  const available = LEVELS.filter((l) => l.available);
  const soon = LEVELS.filter((l) => !l.available);
  let step = 0;
  const offset = () => OFFSETS[step++ % OFFSETS.length];

  return (
    <Screen header={<Hud />} edgeToEdge maxWidth={640} contentStyle={{ gap: 18 }}>
      {available.map((level) => (
        <View key={level.id} style={{ gap: 18 }}>
          <Banner level={level} state={state} isCurrent={level.id === current?.id} />
          <Path level={level} state={state} isCurrent={level.id === current?.id} offset={offset} />
        </View>
      ))}
      <View style={{ gap: 10, paddingTop: 8 }}>
        {soon.map((level) => (
          <Card key={level.id} style={styles.banner} radius={18}>
            <Sprite name={level.sprite} width={44} filter="silhouette" opacity={0.2} />
            <View style={{ flex: 1 }}>
              <GameLabel size={11} color={colors.muted}>ESTACIÓN {level.id} · {level.stage.toUpperCase()}</GameLabel>
              <T variant="bodyStrong" style={{ fontSize: 16, color: colors.muted }}>{level.title}</T>
            </View>
            <GameLabel size={10} color={colors.muted}>PRONTO</GameLabel>
          </Card>
        ))}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(251,248,242,0)', 'rgba(251,248,242,0.55)', 'rgba(251,248,242,0.85)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>
    </Screen>
  );
}

function Banner({ level, state, isCurrent }: { level: Level; state: JourneyState; isCurrent: boolean }) {
  const completed = state.completed.includes(level.id);
  const unlocked = state.unlocked.includes(level.id);
  const go = () => router.push(`/nivel/${level.id}`);
  const label = `ESTACIÓN ${level.id} · ${level.stage.toUpperCase()}`;

  if (completed) {
    return (
      <Pressable onPress={go} style={[styles.banner, styles.solid, { backgroundColor: colors.oro, borderBottomColor: colors.oroDark }]}>
        <Sprite name={level.sprite} width={44} />
        <View style={{ flex: 1 }}>
          <GameLabel size={11} color={colors.bosque}>{label}</GameLabel>
          <Text style={[styles.bannerTitle, { color: colors.bosque }]}>{level.title}</Text>
        </View>
        <View style={styles.doneChip}>
          <GameLabel size={11} color={colors.bosque}>✓ HECHO</GameLabel>
        </View>
      </Pressable>
    );
  }
  if (unlocked || isCurrent) {
    return (
      <View style={[styles.banner, styles.solid, { backgroundColor: colors.verde, borderBottomColor: colors.bosque }]}>
        <Sprite name={level.sprite} width={44} />
        <View style={{ flex: 1 }}>
          <GameLabel size={11} color={colors.oro}>{label}</GameLabel>
          <Text style={[styles.bannerTitle, { color: colors.bg }]}>{level.title}</Text>
        </View>
        <Pressable onPress={go} style={styles.logButton} accessibilityRole="button">
          <Text style={styles.logText}>BITÁCORA</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <Card onPress={go} style={styles.banner} radius={18}>
      <Sprite name={level.sprite} width={44} filter="silhouette" opacity={0.22} />
      <View style={{ flex: 1 }}>
        <GameLabel size={11} color={colors.muted}>{label}</GameLabel>
        <Text style={[styles.bannerTitle, { color: colors.inkSoft }]}>{level.title}</Text>
      </View>
      <View style={styles.pricePill}>
        <Sprite name="lock" width={12} />
        <Text style={styles.priceText}>{formatCOP(level.price)}</Text>
      </View>
    </Card>
  );
}

const GAP = 14;
/** Rendered heights, so the trail can be drawn without measuring each node. */
const H = { node: 60, current: 107, currentCenter: 34 + 36, badge: 68 };

type Stop = { key: string; x: number; h: number; center: number; reached: boolean; el: ReactNode };

function Path({ level, state, isCurrent, offset }: { level: Level; state: JourneyState; isCurrent: boolean; offset: () => number }) {
  const [width, setWidth] = useState(0);
  const completed = state.completed.includes(level.id);
  const unlocked = state.unlocked.includes(level.id);
  const missions = getMissions(state, level.id).filter((m) => !m.optional);
  const next = missions.find((m) => !m.done);

  const stops: Stop[] = missions.map((m) => {
    const x = offset();
    if (unlocked && m.done)
      return {
        key: m.id,
        x,
        h: H.node,
        center: H.node / 2,
        reached: true,
        el: (
          <Pressable onPress={() => router.push(m.href)} accessibilityLabel={`${m.title}: completada`}>
            <DoneNode />
          </Pressable>
        ),
      };
    if (unlocked && m === next && isCurrent)
      return { key: m.id, x, h: H.current, center: H.currentCenter, reached: true, el: <CurrentNode onPress={() => router.push(m.href)} label={m.title} /> };
    return { key: m.id, x, h: H.node, center: H.node / 2, reached: false, el: <LockedNode /> };
  });

  if (unlocked) {
    const x = offset();
    stops.push(
      completed
        ? {
            key: 'seal',
            x,
            h: H.badge,
            center: H.badge / 2,
            reached: true,
            el: (
              <Pressable onPress={() => router.push(`/logro/${level.id}`)} style={styles.sealNode} accessibilityLabel={level.achievement}>
                <View style={{ transform: [{ rotate: '-8deg' }] }}>
                  <Sprite name="seal" width={44} />
                </View>
              </Pressable>
            ),
          }
        : {
            key: 'reward',
            x,
            h: H.badge,
            center: H.badge / 2,
            reached: false,
            el: (
              <View style={styles.rewardNode}>
                <Sprite name="scroll" width={36} filter="grayscale" opacity={0.5} />
              </View>
            ),
          },
    );
  }

  // Trail points: from the banner above, through every stop, down to the next banner.
  const tops = stops.map((_, i) => stops.slice(0, i).reduce((sum, st) => sum + st.h + GAP, 0));
  const points = stops.map((st, i) => ({ x: st.x, y: tops[i] + st.center, reached: st.reached }));
  const total = stops.reduce((sum, st) => sum + st.h + GAP, 0) - GAP;
  const pad = 18;
  const top = { x: 0, y: -pad, reached: unlocked };
  const bottom = { x: 0, y: total + pad, reached: completed };
  const all = [top, ...points, bottom];
  const cx = width / 2;
  const seg = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const midY = (a.y + b.y) / 2;
    return `M ${cx + a.x} ${a.y + pad} C ${cx + a.x} ${midY + pad}, ${cx + b.x} ${midY + pad}, ${cx + b.x} ${b.y + pad}`;
  };
  const doneTrail = all.slice(1).map((b, i) => (all[i].reached && b.reached ? seg(all[i], b) : '')).join(' ');
  const fullTrail = all.slice(1).map((b, i) => seg(all[i], b)).join(' ');

  return (
    <View style={{ alignItems: 'center', gap: GAP }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={total + pad * 2} style={{ position: 'absolute', top: -pad, left: 0 }} pointerEvents="none">
          <SvgPath d={fullTrail} stroke={colors.locked} strokeWidth={8} strokeDasharray="8 10" fill="none" />
          {doneTrail.trim() ? <SvgPath d={doneTrail} stroke={colors.oro} strokeWidth={8} strokeDasharray="8 10" fill="none" /> : null}
        </Svg>
      )}
      {isCurrent && (
        <View style={{ position: 'absolute', right: 0, top: 30 }}>
          <Sprite name={level.sprite} width={96} opacity={0.9} />
        </View>
      )}
      {stops.map((st) => (
        <At key={st.key} x={st.x}>
          {st.el}
        </At>
      ))}
    </View>
  );
}

function At({ x, children }: { x: number; children: ReactNode }) {
  return <View style={{ transform: [{ translateX: x }] }}>{children}</View>;
}

function DoneNode() {
  return (
    <Node size={64} color={colors.oro} shade={colors.oroDark}>
      <Text style={styles.check}>✓</Text>
    </Node>
  );
}

function LockedNode() {
  return (
    <Node size={64} color={colors.locked} shade={colors.lockedDark}>
      <Sprite name="lock" width={22} filter="grayscale" opacity={0.55} />
    </Node>
  );
}

function CurrentNode({ onPress, label }: { onPress: () => void; label: string }) {
  const pulse = useLoop(1400);
  return (
    <View style={{ alignItems: 'center', paddingTop: 34 }}>
      <Bob duration={1600} steps={3} style={styles.startBubble}>
        <Text style={styles.startText}>EMPEZAR</Text>
      </Bob>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pulse,
          { opacity: stepped(pulse, [0.8, 0.5, 0.25, 0]), transform: [{ scale: stepped(pulse, [1, 1.15, 1.3, 1.45]) }] },
        ]}
      />
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Empezar: ${label}`}>
        <Node size={78} color={colors.verde} shade={colors.bosque}>
          <Sprite name="lantern" width={30} />
        </Node>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  solid: { borderRadius: 18, borderBottomWidth: 5 },
  bannerTitle: { fontFamily: fonts.title, fontSize: 17, lineHeight: 21 },
  doneChip: { backgroundColor: 'rgba(251,248,242,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  logButton: { backgroundColor: colors.bosque, borderWidth: 2, borderColor: colors.verdeMid, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10 },
  logText: { fontFamily: fonts.title, fontSize: 12, letterSpacing: 0.7, color: colors.bg },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brasa,
    borderBottomWidth: 4,
    borderBottomColor: colors.lacre,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  priceText: { fontFamily: fonts.title, fontSize: 13, color: colors.bg },
  check: { fontFamily: fonts.title, fontSize: 26, color: colors.bosque },
  sealNode: {
    width: 72,
    height: 68,
    borderRadius: 36,
    backgroundColor: colors.oroTint,
    borderWidth: 3,
    borderColor: colors.oro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardNode: {
    width: 72,
    height: 68,
    borderRadius: 36,
    backgroundColor: colors.divider,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.lockedDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBubble: {
    position: 'absolute',
    top: 0,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    zIndex: 2,
  },
  startText: { fontFamily: fonts.title, fontSize: 13, letterSpacing: 0.8, color: colors.verde },
  pulse: { position: 'absolute', top: 34, width: 78, height: 73, borderRadius: 40, borderWidth: 6, borderColor: colors.oro },
});
