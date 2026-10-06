import { router } from 'expo-router';
import { View } from 'react-native';

import { Hud } from '@/components/Hud';
import { Bob } from '@/components/motion';
import { Sprite } from '@/components/Sprite';
import { Card, ChunkyButton, GameLabel, MentorSays, Screen, T } from '@/components/ui';
import { useJourney } from '@/state/journey';
import { getCurrentLevel, getNextMission, getNextMissionHref } from '@/state/missions';
import { colors } from '@/theme/tokens';

/** Victor's tip for each mission. */
const TIPS: Record<string, string> = {
  relato: 'Antes de hablar de números, quiero entender tu historia. Cuéntamela con tus palabras.',
  frases: 'Tus frases ya están listas. Léelas en voz alta cada mañana de esta semana.',
  ideas: 'Ocho ideas, una a la vez. No necesitas memorizarlas: solo entenderlas.',
  mapa: 'Ten a mano tus movimientos del último mes. Con ellos tu mapa será exacto.',
  recorrido: 'No hay una etapa correcta. Solo un punto de partida honesto.',
  costo: 'Empieza por lo esencial. Si algo se paga cada año, divídelo entre doce.',
};

export default function Mentor() {
  const { state } = useJourney();
  const current = getCurrentLevel(state);
  const mission = getNextMission(state);
  const chatStarted = state.level1.messages.some((m) => m.from === 'user');

  const tip = mission
    ? TIPS[mission.id]
    : current
      ? 'Completaste las misiones de esta estación. Entra a la bitácora para cerrarla.'
      : state.unlocked.length === 0
        ? 'Tu viaje empieza en la Estación 1. Cuando la desbloquees, conversamos.'
        : 'Tu siguiente estación te espera. Avanzamos cuando estés listo.';

  return (
    <Screen header={<Hud />} edgeToEdge maxWidth={760}>
      <View style={{ alignItems: 'center', gap: 6, paddingVertical: 8 }}>
        <Bob duration={2400}>
          <Sprite name="mentor" width={96} />
        </Bob>
        <T variant="title" style={{ fontSize: 26 }}>Victor</T>
        <GameLabel color={colors.verde}>TU MENTOR{current ? ` · ESTACIÓN ${current.id}` : ''}</GameLabel>
      </View>

      <MentorSays size={56}>{tip}</MentorSays>

      {mission && <ChunkyButton label={`Ir a: ${mission.title}`} onPress={() => router.push(getNextMissionHref(state))} />}

      {state.unlocked.includes(1) && (
        <Card onPress={() => router.push('/mision/relato')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Sprite name="scroll" width={36} />
          <View style={{ flex: 1 }}>
            <GameLabel size={11} color={colors.verde}>ESTACIÓN 1 · CONVERSACIÓN</GameLabel>
            <T variant="bodyStrong" style={{ fontSize: 16 }}>¿Por qué estás aquí?</T>
            <T variant="small">{state.level1.map ? 'Completada · ver conversación' : chatStarted ? 'En curso' : 'Sin empezar'}</T>
          </View>
          <T variant="bodyStrong" style={{ color: colors.verde }}>→</T>
        </Card>
      )}
    </Screen>
  );
}
