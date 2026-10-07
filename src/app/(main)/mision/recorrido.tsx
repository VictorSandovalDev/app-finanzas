import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BackButton, Button, Divider, MentorNote, Screen, T } from '@/components/ui';
import { INDEPENDENCE_STAGES } from '@/data/content';
import { useJourney } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

export default function IndependencePath() {
  const { state, update } = useJourney();
  if (!state.unlocked.includes(3)) return <Redirect href="/nivel/3" />;
  const selected = state.level3.stage;

  return (
    <Screen footer={<Button label="Calcular el costo de mi vida" icon="arrowRight" disabled={selected === undefined} onPress={() => router.push('/mision/costo-de-vida')} />}>
      <BackButton onPress={() => (router.canGoBack() ? router.back() : router.replace('/nivel/3'))} label="Estación 3" />
      <View style={{ gap: 10 }}>
        <T variant="label">Estación 3 · Misión 1</T>
        <T variant="display">El camino a la independencia</T>
        <T>Todas las personas recorren estas etapas, cada una a su ritmo. ¿Dónde estás hoy?</T>
      </View>
      <View>
        {INDEPENDENCE_STAGES.map((s, i) => {
          const active = selected === i;
          return (
            <View key={s.title}>
              <Divider />
              <Pressable
                onPress={() => update((st) => ({ ...st, level3: { ...st.level3, stage: i } }))}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={styles.option}
              >
                <View style={[styles.radio, active && { borderColor: colors.accent }]}>{active && <View style={styles.radioDot} />}</View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.num}>Etapa {i + 1}</Text>
                  <T variant="heading">{s.title}</T>
                  <T variant="small">{s.body}</T>
                </View>
              </Pressable>
            </View>
          );
        })}
        <Divider />
      </View>
      <MentorNote>No hay una etapa correcta. Solo un punto de partida honesto.</MentorNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: { flexDirection: 'row', gap: 16, paddingVertical: 18 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.accent },
  num: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.label },
});
