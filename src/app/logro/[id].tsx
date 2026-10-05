import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Seal } from '@/components/Seal';
import { Button, Card, Screen, T } from '@/components/ui';
import { formatCOP, getLevel } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { colors, space, useNativeDriver } from '@/theme/tokens';

const PARTICLES = [
  { x: -120, delay: 0, size: 6 },
  { x: -70, delay: 500, size: 4 },
  { x: -20, delay: 900, size: 5 },
  { x: 40, delay: 250, size: 4 },
  { x: 90, delay: 700, size: 6 },
  { x: 130, delay: 1100, size: 4 },
];

export default function AchievementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useJourney();
  const level = getLevel(Number(id));
  const scale = useRef(new Animated.Value(0.3)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const text = useRef(new Animated.Value(0)).current;
  const particles = useRef(PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 50, useNativeDriver }),
      Animated.timing(text, { toValue: 1, duration: 700, delay: 600, useNativeDriver }),
    ]).start();
    const rotation = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 24000, easing: Easing.linear, useNativeDriver }));
    rotation.start();
    const floats = particles.map((p, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(PARTICLES[i].delay),
          Animated.timing(p, { toValue: 1, duration: 3200, easing: Easing.out(Easing.quad), useNativeDriver }),
        ]),
      ),
    );
    floats.forEach((f) => f.start());
    return () => {
      rotation.stop();
      floats.forEach((f) => f.stop());
    };
  }, [scale, spin, text, particles]);

  if (!level) return <Redirect href="/viaje" />;
  const next = getLevel(level.id + 1);

  return (
    <Screen
      background={colors.forestDeep}
      footer={
        <>
          {next?.available && (
            <Button
              label={state.unlocked.includes(next.id) ? `Ir al Nivel ${next.id}` : `Desbloquear Nivel ${next.id} · ${formatCOP(next.price)}`}
              variant="gold"
              icon={state.unlocked.includes(next.id) ? 'arrowRight' : 'key'}
              onPress={() => router.replace(`/nivel/${next.id}`)}
            />
          )}
          <Button label="Volver a mi viaje" variant="ghost" style={{ minHeight: 44 }} onPress={() => router.replace('/viaje')} />
        </>
      }
    >
      <View style={{ alignItems: 'center', paddingTop: space.xxxl }}>
        <View style={styles.stage}>
          {PARTICLES.map((p, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  width: p.size,
                  height: p.size,
                  left: 110 + p.x,
                  opacity: particles[i].interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.9, 0] }),
                  transform: [{ translateY: particles[i].interpolate({ inputRange: [0, 1], outputRange: [180, -20] }) }],
                },
              ]}
            />
          ))}
          <Animated.View
            style={[
              styles.ring,
              { transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] },
            ]}
          />
          <Animated.View style={{ transform: [{ scale }] }}>
            <Seal icon={level.symbol} size={180} />
          </Animated.View>
        </View>

        <Animated.View
          style={{
            opacity: text,
            transform: [{ translateY: text.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
            alignItems: 'center',
            gap: space.md,
            marginTop: space.xl,
          }}
        >
          <T variant="label" style={{ color: colors.champagne }}>Misión completada · Nivel {level.id}</T>
          <T variant="display" style={{ color: colors.ivory, textAlign: 'center', fontSize: 34, lineHeight: 40, letterSpacing: 1 }}>
            {level.achievement.toUpperCase()}
          </T>
          <T style={{ color: 'rgba(246,241,231,0.72)', textAlign: 'center', maxWidth: 360 }}>
            Completaste la estación {level.stage.toLowerCase()}. Esto ya forma parte de tu historia financiera.
          </T>

          <Card style={styles.reward}>
            <Icon name="doc" color={colors.champagne} />
            <View style={{ flex: 1 }}>
              <T variant="label" style={{ color: colors.champagne }}>Recompensa obtenida</T>
              <T variant="bodyStrong" style={{ color: colors.ivory }}>{level.deliverable}</T>
            </View>
          </Card>
          {next?.available && (
            <T variant="small" style={{ color: 'rgba(246,241,231,0.6)', textAlign: 'center', marginTop: space.sm }}>
              Tu siguiente estación: {next.title}
            </T>
          )}
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 216,
    height: 216,
    borderRadius: 108,
    borderWidth: 1,
    borderColor: 'rgba(201,179,138,0.45)',
    borderStyle: 'dashed',
  },
  particle: { position: 'absolute', top: 0, borderRadius: 4, backgroundColor: colors.champagne },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(246,241,231,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201,179,138,0.35)',
    marginTop: space.lg,
  },
});
