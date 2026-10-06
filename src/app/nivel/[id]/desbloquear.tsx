import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pop, stepped, useOnce } from '@/components/motion';
import { Particles } from '@/components/Particles';
import { Sprite } from '@/components/Sprite';
import { BackButton, Card, ChunkyButton, GameLabel, Screen, T } from '@/components/ui';
import { formatCOP, getLevel, Level } from '@/data/levels';
import { checkout, PAYMENT_METHODS, PaymentMethod } from '@/services/payments';
import { useJourney } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

export default function Unlock() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const level = getLevel(Number(id));
  const { unlock } = useJourney();
  const [method, setMethod] = useState<PaymentMethod>('tarjeta');
  const [paying, setPaying] = useState(false);
  const [open, setOpen] = useState(false);

  if (!level || !level.available) return <Redirect href="/viaje" />;
  if (open) return <DoorOpening level={level} />;

  const pay = async () => {
    setPaying(true);
    const result = await checkout(level.id, method);
    setPaying(false);
    if (result.ok) {
      unlock(level.id);
      setOpen(true);
    }
  };

  return (
    <Screen maxWidth={520}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <BackButton kind="close" />
        <T variant="title" style={{ fontSize: 24 }}>Desbloquear estación</T>
      </View>

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={styles.thumb}>
          <Sprite name={level.sprite} width={48} />
        </View>
        <View style={{ flex: 1 }}>
          <GameLabel size={11} color={colors.muted}>ESTACIÓN {level.id} · {level.stage.toUpperCase()}</GameLabel>
          <T variant="bodyStrong" style={{ fontSize: 16 }}>{level.title}</T>
          <T variant="small" style={{ fontSize: 12 }}>Misiones · entregable · grupo privado</T>
        </View>
        <Text style={styles.price}>{formatCOP(level.price)}</Text>
      </Card>

      <GameLabel>MÉTODO DE PAGO</GameLabel>
      {PAYMENT_METHODS.map((m) => {
        const on = m.id === method;
        return (
          <Pressable
            key={m.id}
            onPress={() => setMethod(m.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={[styles.method, { backgroundColor: on ? colors.verdePick : colors.card, borderColor: on ? colors.verde : colors.border }]}
          >
            <View style={[styles.box, { borderColor: on ? colors.verde : colors.border }]}>
              <View style={[styles.boxDot, { backgroundColor: on ? colors.verde : 'transparent' }]} />
            </View>
            <View style={{ flex: 1 }}>
              <T variant="bodyStrong">{m.label}</T>
              <T variant="small" style={{ fontSize: 12 }}>{m.hint}</T>
            </View>
          </Pressable>
        );
      })}

      {/* Visual placeholders only. In production these fields come from the payment provider's
          widget (Wompi / Mercado Pago) so card data never touches our app or servers. */}
      {method === 'tarjeta' && (
        <View style={{ gap: 10 }}>
          <Field placeholder="Número de tarjeta" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Field placeholder="MM/AA" style={{ flex: 1 }} />
            <Field placeholder="CVC" style={{ flex: 1 }} />
          </View>
        </View>
      )}
      {method === 'pse' && (
        <View style={[styles.field, { flexDirection: 'row', justifyContent: 'space-between' }]}>
          <T>Selecciona tu banco</T>
          <T>⌄</T>
        </View>
      )}
      {method === 'nequi' && <Field placeholder="Número de celular Nequi" />}

      <ChunkyButton label={`Pagar ${formatCOP(level.price)}`} loading={paying} onPress={pay} />
      <T variant="small" style={{ fontSize: 12, textAlign: 'center' }}>Pago protegido. La estación se abre al confirmar el pago.</T>
    </Screen>
  );
}

function Field({ placeholder, style }: { placeholder: string; style?: object }) {
  return <TextInput placeholder={placeholder} placeholderTextColor={colors.muted} style={[styles.field, styles.input, style]} />;
}

function DoorOpening({ level }: { level: Level }) {
  const insets = useSafeAreaInsets();
  const swing = useOnce(1200, 400);
  const frames = [0, 16, 33, 49, 66, 82];
  const left = stepped(swing, frames.map((d) => -d));
  const right = stepped(swing, frames);
  const deg = (v: Animated.AnimatedInterpolation<number>) => v.interpolate({ inputRange: [-90, 90], outputRange: ['-90deg', '90deg'] });

  return (
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <LinearGradient colors={[colors.verde, colors.bosque]} start={{ x: 0.5, y: 0.2 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
      <Particles />
      <View style={styles.center}>
        <View style={styles.doorFrame}>
          <View style={styles.doorInner}>
            <LinearGradient colors={[colors.bg, colors.oroLight, colors.oro, colors.brasa]} locations={[0, 0.3, 0.65, 1]} style={StyleSheet.absoluteFill} />
            <Animated.View style={[styles.leaf, { left: 0, transformOrigin: 'left', transform: [{ perspective: 500 }, { rotateY: deg(left) }] }]}>
              <Planks />
            </Animated.View>
            <Animated.View style={[styles.leaf, { right: 0, transformOrigin: 'right', transform: [{ perspective: 500 }, { rotateY: deg(right) }] }]}>
              <Planks />
            </Animated.View>
          </View>
        </View>
        <Pop delay={1600} style={{ alignItems: 'center', gap: 8 }}>
          <GameLabel size={13} color={colors.oro}>ESTACIÓN {level.id} · {level.stage.toUpperCase()}</GameLabel>
          <Text style={styles.unlocked}>¡Nivel desbloqueado!</Text>
        </Pop>
        <Pop delay={2000} style={{ width: '100%', maxWidth: 340 }}>
          <ChunkyButton label="Entrar a la estación" variant="oro" onPress={() => router.replace(`/nivel/${level.id}`)} />
        </Pop>
      </View>
    </View>
  );
}

function Planks() {
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      {Array.from({ length: 4 }, (_, i) => (
        <View key={i} style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 5, backgroundColor: '#9A6440' }} />
          <View style={{ flex: 1, backgroundColor: '#6B4029' }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  thumb: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.oroTint, alignItems: 'center', justifyContent: 'center' },
  price: { fontFamily: fonts.title, fontSize: 20, color: colors.bosque },
  method: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, borderWidth: 2, borderBottomWidth: 5 },
  box: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  boxDot: { width: 12, height: 12, borderRadius: 3 },
  field: { backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, borderRadius: 14, padding: 14 },
  input: { minWidth: 0, fontFamily: fonts.bold, fontSize: 15, color: colors.ink, outlineStyle: 'none' } as object,
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28, paddingHorizontal: 24 },
  doorFrame: {
    width: 192,
    height: 240,
    padding: 12,
    backgroundColor: '#6B4029',
    borderTopLeftRadius: 96,
    borderTopRightRadius: 96,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 6,
    borderColor: colors.bosque,
  },
  doorInner: { flex: 1, borderTopLeftRadius: 84, borderTopRightRadius: 84, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, overflow: 'hidden' },
  leaf: { position: 'absolute', top: 0, bottom: 0, width: '50%' },
  unlocked: { fontFamily: fonts.title, fontSize: 40, lineHeight: 42, color: colors.bg, textAlign: 'center' },
});
