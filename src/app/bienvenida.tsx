import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { Icon, IconName } from '@/components/Icon';
import { Seal } from '@/components/Seal';
import { Button, Screen, T } from '@/components/ui';
import { LEVELS } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { colors, fonts, radius, space, useNativeDriver } from '@/theme/tokens';

const STEPS = 4;

export default function Onboarding() {
  const { update } = useJourney();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver }).start();
  }, [step, fade]);

  const dark = step === 0;
  const start = () => {
    update((s) => ({ ...s, name: name.trim(), onboarded: true }));
    router.replace('/nivel/1');
  };

  const footer = (
    <>
      {step < STEPS - 1 ? (
        <Button label={step === 0 ? 'Comenzar' : 'Continuar'} variant={dark ? 'gold' : 'primary'} icon="arrowRight" onPress={() => setStep(step + 1)} />
      ) : (
        <Button label="Iniciar mi viaje" icon="compass" disabled={!name.trim()} onPress={start} />
      )}
      <View style={styles.dots}>
        {Array.from({ length: STEPS }, (_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i === step ? (dark ? colors.champagne : colors.forest) : dark ? 'rgba(246,241,231,0.25)' : colors.line }, i === step && { width: 22 }]}
          />
        ))}
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen background={dark ? colors.forestDeep : colors.ivory} footer={footer}>
        <Animated.View style={{ opacity: fade, paddingTop: space.xxl }}>
          {step === 0 && <Intro />}
          {step === 1 && <Route />}
          {step === 2 && <HowItWorks />}
          {step === 3 && (
            <View style={{ gap: space.lg, paddingTop: space.xxl }}>
              <T variant="label">Antes de partir</T>
              <T variant="display">¿Cómo te llamamos?</T>
              <T>Tu viaje es personal. Así te saludaremos en cada estación.</T>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Tu nombre"
                placeholderTextColor={colors.warmGray}
                style={styles.input}
                autoFocus
                returnKeyType="go"
                onSubmitEditing={() => name.trim() && start()}
              />
            </View>
          )}
        </Animated.View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Intro() {
  return (
    <View style={{ alignItems: 'center', gap: space.xl, paddingTop: space.xxl }}>
      <Seal icon="compass" size={150} />
      <T variant="label" style={{ color: colors.champagne }}>Viaje Financiero</T>
      <T variant="display" style={{ color: colors.ivory, textAlign: 'center', fontSize: 44, lineHeight: 48 }}>
        No es un curso.{'\n'}Es tu viaje.
      </T>
      <T style={{ color: 'rgba(246,241,231,0.75)', textAlign: 'center', maxWidth: 340 }}>
        Un recorrido por estaciones para entender, organizar y dirigir tu dinero, a tu ritmo y con acompañamiento.
      </T>
    </View>
  );
}

function Route() {
  return (
    <View style={{ gap: space.lg }}>
      <T variant="label">La ruta</T>
      <T variant="title">Seis estaciones.{'\n'}Una transformación en cada una.</T>
      <View style={{ marginTop: space.md }}>
        {LEVELS.map((l, i) => (
          <View key={l.id} style={styles.routeRow}>
            <View style={{ alignItems: 'center', width: 28 }}>
              <View style={[styles.routeDot, i === 0 && { backgroundColor: colors.forest, borderColor: colors.forest }]} />
              {i < LEVELS.length - 1 && <View style={styles.routeLine} />}
            </View>
            <View style={{ flex: 1, paddingBottom: space.lg }}>
              <T style={styles.routeStage}>{l.stage}</T>
              <T variant="small">{l.promise}</T>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const HOW: { icon: IconName; title: string; body: string }[] = [
  { icon: 'key', title: 'Desbloqueas cada estación', body: 'Avanzas cuando estás listo. Cada nivel se abre de forma independiente.' },
  { icon: 'compass', title: 'Misiones, no lecciones', body: 'Trabajas sobre tu propia vida y tu propio dinero, no sobre ejemplos genéricos.' },
  { icon: 'doc', title: 'Entregables reales', body: 'Cada nivel te deja un documento útil que puedes volver a consultar.' },
  { icon: 'chat', title: 'Acompañamiento', body: 'Un grupo privado por nivel para avanzar junto a otras personas.' },
];

function HowItWorks() {
  return (
    <View style={{ gap: space.lg }}>
      <T variant="label">Cómo funciona</T>
      <T variant="title">Avanzas descubriendo, no memorizando.</T>
      <View style={{ gap: space.xl, marginTop: space.md }}>
        {HOW.map((h) => (
          <View key={h.title} style={{ flexDirection: 'row', gap: space.lg }}>
            <View style={styles.howIcon}>
              <Icon name={h.icon} color={colors.forest} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <T variant="bodyStrong">{h.title}</T>
              <T variant="small">{h.body}</T>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: space.sm },
  dot: { width: 6, height: 6, borderRadius: 3 },
  input: {
    marginTop: space.md,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.forest,
    paddingVertical: space.md,
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.ink,
    outlineStyle: 'none',
  } as object,
  routeRow: { flexDirection: 'row', gap: space.md },
  routeDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: colors.champagne, backgroundColor: colors.ivory, marginTop: 5 },
  routeLine: { flex: 1, width: 1.5, backgroundColor: colors.line, marginVertical: 2 },
  routeStage: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink, lineHeight: 26 },
  howIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.sageSoft, alignItems: 'center', justifyContent: 'center' },
});
