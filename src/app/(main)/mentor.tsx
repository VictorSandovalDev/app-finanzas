import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, Divider, MentorNote, Screen, SectionTitle, T } from '@/components/ui';
import { useJourney } from '@/state/journey';
import { getCurrentLevel, getNextMission, getNextMissionHref } from '@/state/missions';
import { colors, fonts } from '@/theme/tokens';

/** Victor's note for each mission. */
const TIPS: Record<string, string> = {
  relato: 'Antes de hablar de números, quiero entender tu historia. Cuéntamela con tus palabras, sin prisa.',
  frases: 'Tus frases ya están listas. Léelas en voz alta cada mañana de esta semana.',
  ideas: 'Son ocho ideas, una a la vez. No necesitas memorizarlas: basta con que puedas explicarlas.',
  mapa: 'Ten a mano tus movimientos del último mes. Con ellos tu Mapa del Dinero será exacto.',
  recorrido: 'No hay una etapa correcta. Solo un punto de partida honesto.',
  costo: 'Empieza por lo esencial. Si algo se paga cada año, divídelo entre doce.',
};

export default function Mentor() {
  const { state } = useJourney();
  const current = getCurrentLevel(state);
  const mission = getNextMission(state);

  const tip = mission
    ? TIPS[mission.id]
    : current
      ? 'Completaste las misiones de esta estación. Entra a la bitácora para cerrarla.'
      : state.unlocked.length === 0
        ? 'Tu viaje empieza en la Estación 1. Cuando la desbloquees, conversamos.'
        : 'Tu siguiente estación te espera. Avanzamos cuando estés listo.';

  return (
    <Screen>
      <View style={{ gap: 12, paddingTop: 8 }}>
        <T variant="display">Tu mentor</T>
        <T>Victor te acompaña en cada estación. Escríbele o envíale un audio cuando lo necesites.</T>
      </View>

      <MentorNote>{tip}</MentorNote>
      {mission && <Button label={mission.title} icon="arrowRight" onPress={() => router.push(getNextMissionHref(state))} />}

      {state.unlocked.includes(1) && (
        <View style={{ gap: 6 }}>
          <SectionTitle title="Conversaciones" />
          <Divider />
          <Pressable onPress={() => router.push('/mision/relato')} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
            <Icon name="chat" size={22} color={colors.forest} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.title}>¿Por qué estás aquí?</Text>
              <T variant="small">
                Estación 1 · {state.level1.map ? 'Mapa Personal listo' : 'Conversación con Victor'}
              </T>
            </View>
            <Icon name="caretRight" size={16} color={colors.muted} />
          </Pressable>
          <Divider />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  title: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.ink },
});
