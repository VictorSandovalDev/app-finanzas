import { Redirect, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { Icon, IconName } from '@/components/Icon';
import { Button, Card, Screen, T, TopBar } from '@/components/ui';
import { MantraRole, useJourney } from '@/state/journey';
import { colors, space, useNativeDriver } from '@/theme/tokens';

const ROLES: Record<MantraRole, { title: string; purpose: string; icon: IconName; tone: 'surface' | 'sage' | 'champagne' }> = {
  reencuadre: { title: 'Reencuadre', purpose: 'Cambia la forma de mirar un pensamiento.', icon: 'compass', tone: 'surface' },
  capacidad: { title: 'Capacidad', purpose: 'Fortalece lo que ya eres capaz de hacer.', icon: 'seed', tone: 'sage' },
  accion: { title: 'Acción', purpose: 'Te mueve hacia un paso concreto esta semana.', icon: 'route', tone: 'champagne' },
};

export default function Mantras() {
  const { state, update } = useJourney();
  const mantras = state.level1.mantras;
  const anims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      180,
      anims.map((a) => Animated.timing(a, { toValue: 1, duration: 500, useNativeDriver })),
    ).start();
  }, [anims]);

  if (!mantras) return <Redirect href="/mision/relato" />;
  const saved = state.level1.mantrasSaved;

  const save = () => {
    update((s) => ({ ...s, level1: { ...s.level1, mantrasSaved: true } }));
    router.replace('/nivel/1');
  };

  return (
    <Screen
      footer={
        saved ? (
          <Button label="Volver al nivel" variant="secondary" onPress={() => router.replace('/nivel/1')} />
        ) : (
          <Button label="Hacer mías estas frases" icon="check" onPress={save} />
        )
      }
    >
      <TopBar title="Nivel 1 · Tus frases" />
      <View style={{ gap: space.md, paddingVertical: space.lg }}>
        <T variant="label">Escritas para ti</T>
        <T variant="title">Tres frases para acompañar tu semana</T>
        <T>Léelas en voz alta cada mañana. No buscan convencerte de nada: te recuerdan hacia dónde vas.</T>
      </View>

      <View style={{ gap: space.lg, marginTop: space.md }}>
        {mantras.map((m, i) => {
          const role = ROLES[m.role];
          return (
            <Animated.View
              key={m.role}
              style={{ opacity: anims[i], transform: [{ translateY: anims[i].interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}
            >
              <Card tone={role.tone} style={{ gap: space.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                  <Icon name={role.icon} size={18} color={colors.forest} />
                  <T variant="label" style={{ color: colors.forest }}>
                    {String(i + 1).padStart(2, '0')} · {role.title}
                  </T>
                </View>
                <T variant="quote">“{m.text}”</T>
                <T variant="small">{role.purpose}</T>
              </Card>
            </Animated.View>
          );
        })}
      </View>
    </Screen>
  );
}
