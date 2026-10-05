import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Seal } from '@/components/Seal';
import { Button, Card, Divider, Screen, T, TopBar } from '@/components/ui';
import { formatCOP, getLevel } from '@/data/levels';
import { checkout, PAYMENT_METHODS, PaymentMethod } from '@/services/payments';
import { useJourney } from '@/state/journey';
import { colors, fonts, radius, space, useNativeDriver } from '@/theme/tokens';

export default function Unlock() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const level = getLevel(Number(id));
  const { unlock } = useJourney();
  const [method, setMethod] = useState<PaymentMethod>('tarjeta');
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  if (!level || !level.available) return <Redirect href="/viaje" />;

  const pay = async () => {
    setPaying(true);
    const result = await checkout(level.id, method);
    setPaying(false);
    if (result.ok) {
      unlock(level.id);
      setDone(true);
    }
  };

  if (done) return <Unlocked levelId={level.id} title={level.title} />;

  return (
    <Screen
      footer={
        <>
          <Button label={`Pagar ${formatCOP(level.price)}`} icon="key" loading={paying} onPress={pay} />
          <T variant="small" style={{ textAlign: 'center' }}>Pago seguro · Acceso inmediato al confirmar</T>
        </>
      }
    >
      <TopBar title="Desbloquear nivel" />
      <T variant="title" style={{ marginTop: space.md }}>Estás a un paso de tu siguiente estación</T>

      <Card style={{ marginTop: space.xl, gap: space.lg }}>
        <View style={{ flexDirection: 'row', gap: space.lg, alignItems: 'center' }}>
          <View style={styles.levelMark}>
            <Icon name={level.symbol} color={colors.champagneSoft} />
          </View>
          <View style={{ flex: 1 }}>
            <T variant="label">Nivel {level.id} · {level.stage}</T>
            <T variant="heading">{level.title}</T>
          </View>
        </View>
        <Divider />
        {[
          ['Misiones guiadas', 'check'],
          [`Entregable: ${level.deliverable}`, 'doc'],
          [`Grupo privado de WhatsApp · ${level.duration}`, 'chat'],
          [`Logro: ${level.achievement}`, 'sparkle'],
        ].map(([label, icon]) => (
          <View key={label} style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
            <Icon name={icon as 'check'} size={18} color={colors.forest} />
            <T style={{ flex: 1, color: colors.ink }}>{label}</T>
          </View>
        ))}
        <Divider />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <T variant="bodyStrong">Total</T>
          <T style={{ fontFamily: fonts.serif, fontSize: 28, color: colors.ink }}>{formatCOP(level.price)}</T>
        </View>
      </Card>

      <T variant="label" style={{ marginTop: space.xxl, marginBottom: space.md }}>Método de pago</T>
      <View style={{ gap: space.sm }}>
        {PAYMENT_METHODS.map((m) => {
          const selected = m.id === method;
          return (
            <Pressable
              key={m.id}
              onPress={() => setMethod(m.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.method, selected && { borderColor: colors.forest, backgroundColor: colors.surface }]}
            >
              <View style={[styles.radio, selected && { borderColor: colors.forest }]}>
                {selected && <View style={styles.radioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <T variant="bodyStrong">{m.label}</T>
                <T variant="small">{m.hint}</T>
              </View>
            </Pressable>
          );
        })}
      </View>
      <T variant="small" style={{ marginTop: space.lg }}>
        Este es un pago único por nivel. No es una suscripción y no se renueva automáticamente.
      </T>
    </Screen>
  );
}

function Unlocked({ levelId, title }: { levelId: number; title: string }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const level = getLevel(levelId)!;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 60, useNativeDriver }),
      Animated.timing(fade, { toValue: 1, duration: 600, delay: 200, useNativeDriver }),
    ]).start();
  }, [scale, fade]);

  return (
    <Screen
      background={colors.forestDeep}
      footer={<Button label="Entrar al nivel" variant="gold" icon="arrowRight" onPress={() => router.replace(`/nivel/${levelId}`)} />}
    >
      <View style={{ alignItems: 'center', gap: space.xl, paddingTop: space.xxxl * 1.5 }}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Seal icon={level.symbol} size={170} />
        </Animated.View>
        <Animated.View style={{ opacity: fade, alignItems: 'center', gap: space.md }}>
          <T variant="label" style={{ color: colors.champagne }}>Nivel desbloqueado</T>
          <T variant="display" style={{ color: colors.ivory, textAlign: 'center' }}>{title}</T>
          <T style={{ color: 'rgba(246,241,231,0.75)', textAlign: 'center' }}>
            Se abrió una nueva estación en tu mapa. Tu primera misión ya te está esperando.
          </T>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  levelMark: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.warmGray, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.forest },
});
