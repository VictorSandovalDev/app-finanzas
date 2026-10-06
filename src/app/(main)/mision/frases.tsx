import { Redirect, router } from 'expo-router';
import { View } from 'react-native';

import { Icon } from '@/components/Icon';
import { FadeUp } from '@/components/motion';
import { BackButton, Button, Screen, Surface, T, useWide } from '@/components/ui';
import { MantraRole, useJourney } from '@/state/journey';
import { colors } from '@/theme/tokens';

const ROLES: Record<MantraRole, { title: string; purpose: string }> = {
  reencuadre: { title: 'Reencuadre', purpose: 'Cambia la forma de mirar un pensamiento.' },
  capacidad: { title: 'Capacidad', purpose: 'Fortalece lo que ya eres capaz de hacer.' },
  accion: { title: 'Acción', purpose: 'Te mueve hacia un paso concreto esta semana.' },
};

export default function Mantras() {
  const { state, update } = useJourney();
  const wide = useWide();
  const mantras = state.level1.mantras;
  if (!mantras) return <Redirect href="/mision/relato" />;

  const save = () => {
    update((s) => ({ ...s, level1: { ...s.level1, mantrasSaved: true } }));
    router.replace('/nivel/1');
  };

  return (
    <Screen maxWidth={960}>
      <BackButton />
      <View style={{ gap: 10 }}>
        <T variant="label">Estación 1 · Tus frases</T>
        <T variant="display">Tres frases para tu semana</T>
        <T>Léelas en voz alta cada mañana. No buscan convencerte de nada: te recuerdan hacia dónde vas.</T>
      </View>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 14 }}>
        {mantras.map((m, i) => (
          <FadeUp key={m.role} delay={i * 140} style={wide ? { flex: 1 } : undefined}>
            <Surface style={{ gap: 14, flex: wide ? 1 : undefined }}>
              <Icon name="quotes" size={22} color={colors.brass} weight="fill" />
              <T variant="quote">{m.text}</T>
              <View style={{ gap: 2 }}>
                <T variant="label">{ROLES[m.role].title}</T>
                <T variant="small">{ROLES[m.role].purpose}</T>
              </View>
            </Surface>
          </FadeUp>
        ))}
      </View>
      {state.level1.mantrasSaved ? (
        <Button label="Volver a la estación" variant="secondary" onPress={() => router.replace('/nivel/1')} style={{ maxWidth: 420 }} />
      ) : (
        <Button label="Guardar mis frases" icon="check" onPress={save} style={{ maxWidth: 420 }} />
      )}
    </Screen>
  );
}
