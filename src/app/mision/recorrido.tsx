import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Sprite } from '@/components/Sprite';
import { BackButton, ChunkyButton, GameLabel, MentorSays, Screen, T } from '@/components/ui';
import { INDEPENDENCE_STAGES } from '@/data/content';
import { useJourney } from '@/state/journey';
import { colors } from '@/theme/tokens';

export default function IndependencePath() {
  const { state, update } = useJourney();
  if (!state.unlocked.includes(3)) return <Redirect href="/nivel/3" />;
  const selected = state.level3.stage;

  return (
    <Screen
      maxWidth={720}
      footer={
        <ChunkyButton label="Calcular el costo de mi vida" disabled={selected === undefined} onPress={() => router.push('/mision/costo-de-vida')} />
      }
    >
      <BackButton />
      <View>
        <GameLabel color={colors.verde}>ESTACIÓN 3 · MISIÓN 1</GameLabel>
        <T variant="title">El camino de puertas</T>
      </View>
      <MentorSays>No hay una etapa correcta. Elige la puerta en la que estás hoy, con honestidad.</MentorSays>
      <View style={{ gap: 12 }}>
        {INDEPENDENCE_STAGES.map((s, i) => {
          const active = selected === i;
          const last = i === INDEPENDENCE_STAGES.length - 1;
          return (
            <Pressable
              key={s.title}
              onPress={() => update((st) => ({ ...st, level3: { ...st.level3, stage: i } }))}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={[styles.option, active && { borderColor: colors.brasa, backgroundColor: colors.brasaTint }]}
            >
              <Sprite name={last ? 'house' : 'door'} width={52} filter={active || last ? 'none' : 'grayscale'} opacity={active || last ? 1 : 0.6} />
              <View style={{ flex: 1, gap: 2 }}>
                <GameLabel size={11} color={active ? colors.brasa : colors.muted}>{active ? 'ESTOY AQUÍ' : `PUERTA ${i + 1}`}</GameLabel>
                <T variant="h2">{s.title}</T>
                <T variant="small">{s.body}</T>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: colors.border,
    borderRadius: 18,
  },
});
