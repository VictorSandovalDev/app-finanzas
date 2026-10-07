import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Celebration } from '@/components/Celebration';
import { BackButton, Button, Divider, Emblem, Screen, SectionTitle, T } from '@/components/ui';
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

  if (!level || !level.available) return <Redirect href="/mapa" />;
  if (open) return <Unlocked level={level} />;

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
    <Screen
      maxWidth={560}
      footer={
        <>
          <Button label={`Pagar ${formatCOP(level.price)}`} loading={paying} onPress={pay} />
          <T variant="small" style={{ textAlign: 'center' }}>Pago único · La estación se abre al confirmar el pago</T>
        </>
      }
    >
      <BackButton kind="close" />
      <T variant="title">Desbloquear estación</T>

      <View style={styles.summary}>
        <Emblem icon={level.icon} size={52} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <T variant="small">Estación {level.id} · {level.stage}</T>
          <T variant="bodyStrong" numberOfLines={2}>{level.title}</T>
        </View>
        <Text style={styles.price}>{formatCOP(level.price)}</Text>
      </View>

      <View style={{ gap: 4 }}>
        <SectionTitle title="Método de pago" />
        {PAYMENT_METHODS.map((m, i) => {
          const on = m.id === method;
          return (
            <View key={m.id}>
              {i > 0 && <Divider />}
              <Pressable onPress={() => setMethod(m.id)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={styles.method}>
                <View style={[styles.radio, on && { borderColor: colors.accent }]}>{on && <View style={styles.radioDot} />}</View>
                <View style={{ flex: 1 }}>
                  <T variant="bodyStrong">{m.label}</T>
                  <T variant="small">{m.hint}</T>
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Visual placeholders only. In production these fields come from the payment provider's
          widget (Wompi / Mercado Pago), so card data never touches our app or servers. */}
      {method === 'tarjeta' && (
        <View style={{ gap: 12 }}>
          <Field placeholder="Número de tarjeta" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Field placeholder="MM/AA" style={{ flex: 1 }} />
            <Field placeholder="CVC" style={{ flex: 1 }} />
          </View>
        </View>
      )}
      {method === 'pse' && <Field placeholder="Selecciona tu banco" />}
      {method === 'nequi' && <Field placeholder="Número de celular Nequi" />}
    </Screen>
  );
}

function Field({ placeholder, style }: { placeholder: string; style?: object }) {
  return <TextInput placeholder={placeholder} placeholderTextColor={colors.muted} style={[styles.field, style]} />;
}

function Unlocked({ level }: { level: Level }) {
  return (
    <Celebration icon={level.icon}>
      <T variant="label" style={{ color: colors.warmSoft }}>Estación {level.id} · {level.stage}</T>
      <Text style={styles.celebrationTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        Estación desbloqueada
      </Text>
      <T style={{ color: colors.onDarkMuted, textAlign: 'center' }}>{level.title}</T>
      <Button label="Entrar a la estación" variant="light" icon="arrowRight" onPress={() => router.replace(`/nivel/${level.id}`)} style={{ alignSelf: 'stretch', marginTop: 12 }} />
    </Celebration>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  price: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, fontVariant: ['tabular-nums'] },
  method: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  field: {
    minWidth: 0,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    outlineStyle: 'none',
  } as object,
  celebrationTitle: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40, color: colors.onDark, textAlign: 'center' },
});
