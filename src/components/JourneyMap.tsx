import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Icon } from '@/components/Icon';
import { formatCOP, Level, LEVELS } from '@/data/levels';
import { JourneyState } from '@/state/journey';
import { colors, fonts, useNativeDriver } from '@/theme/tokens';

const ROW = 128;
const NODE = 60;
const XS = [0.24, 0.72, 0.3, 0.74, 0.26, 0.7];

type Status = 'completed' | 'current' | 'unlocked' | 'locked' | 'soon';

function statusOf(level: Level, state: JourneyState, currentId?: number): Status {
  if (state.completed.includes(level.id)) return 'completed';
  if (level.id === currentId) return 'current';
  if (state.unlocked.includes(level.id)) return 'unlocked';
  return level.available ? 'locked' : 'soon';
}

export function JourneyMap({ state, currentId }: { state: JourneyState; currentId?: number }) {
  const [width, setWidth] = useState(0);
  const height = ROW * LEVELS.length;
  const points = LEVELS.map((_, i) => ({ x: XS[i] * width, y: ROW * i + ROW / 2 }));
  const reached = Math.max(0, state.completed.length + (currentId ? 0 : -1));

  const segment = (from: number, to: number) =>
    points
      .slice(from, to + 1)
      .map((p, i, arr) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = arr[i - 1];
        const midY = (prev.y + p.y) / 2;
        return `C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
      })
      .join(' ');

  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <>
          <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            <Path d={segment(0, LEVELS.length - 1)} stroke={colors.champagne} strokeWidth={2} strokeDasharray="2 8" strokeLinecap="round" fill="none" />
            {reached > 0 && <Path d={segment(0, reached)} stroke={colors.forest} strokeWidth={2.5} fill="none" />}
          </Svg>
          {LEVELS.map((level, i) => (
            <Station key={level.id} level={level} status={statusOf(level, state, currentId)} x={points[i].x} y={points[i].y} width={width} />
          ))}
        </>
      )}
    </View>
  );
}

function Station({ level, status, x, y, width }: { level: Level; status: Status; x: number; y: number; width: number }) {
  const onLeft = x < width / 2;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== 'current') return;
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver }),
    );
    loop.start();
    return () => loop.stop();
  }, [status, pulse]);

  const node = {
    completed: { bg: colors.forest, border: colors.forest, fg: colors.ivory },
    current: { bg: colors.surface, border: colors.champagne, fg: colors.forest },
    unlocked: { bg: colors.sageSoft, border: colors.sage, fg: colors.forest },
    locked: { bg: colors.paper, border: colors.line, fg: colors.warmGray },
    soon: { bg: colors.ivory, border: colors.line, fg: colors.line },
  }[status];

  const caption = {
    completed: 'Completado',
    current: 'Tu misión actual',
    unlocked: 'Desbloqueado',
    locked: formatCOP(level.price),
    soon: 'Próximamente',
  }[status];

  const textWidth = onLeft ? width - x - NODE / 2 - 16 : x - NODE / 2 - 16;

  return (
    <Pressable
      onPress={() => status !== 'soon' && router.push(`/nivel/${level.id}`)}
      accessibilityLabel={`Nivel ${level.id}: ${level.title}. ${caption}`}
      style={{ position: 'absolute', left: 0, top: y - NODE / 2, width, height: NODE }}
    >
      {status === 'current' && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.halo,
            {
              left: x - NODE / 2,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }],
            },
          ]}
        />
      )}
      <View
        style={[
          styles.node,
          { left: x - NODE / 2, backgroundColor: node.bg, borderColor: node.border, borderWidth: status === 'current' ? 2.5 : 1.5 },
        ]}
      >
        <Icon name={status === 'locked' || status === 'soon' ? 'lock' : level.symbol} size={24} color={node.fg} />
        {status === 'completed' && (
          <View style={styles.tick}>
            <Icon name="check" size={11} color={colors.forestDeep} strokeWidth={2.6} />
          </View>
        )}
      </View>
      <View
        style={[
          styles.textBlock,
          onLeft ? { left: x + NODE / 2 + 14, alignItems: 'flex-start' } : { right: width - x + NODE / 2 + 14, alignItems: 'flex-end' },
          { width: Math.max(textWidth, 80) },
        ]}
      >
        <Text style={[styles.stage, status === 'soon' && { color: colors.line }]}>
          {String(level.id).padStart(2, '0')} · {level.stage}
        </Text>
        <Text
          numberOfLines={2}
          style={[styles.title, { textAlign: onLeft ? 'left' : 'right' }, (status === 'locked' || status === 'soon') && { color: colors.warmGray }]}
        >
          {level.title}
        </Text>
        <Text style={[styles.caption, status === 'current' && { color: colors.terracotta }, status === 'soon' && { color: colors.line }]}>
          {caption}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  node: {
    position: 'absolute',
    top: 0,
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    top: 0,
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    backgroundColor: colors.champagne,
  },
  tick: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.champagne,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ivory,
  },
  textBlock: { position: 'absolute', top: -4, gap: 2 },
  stage: { fontFamily: fonts.sansSemi, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: colors.warmGray },
  title: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 21, color: colors.ink },
  caption: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.forest },
});
