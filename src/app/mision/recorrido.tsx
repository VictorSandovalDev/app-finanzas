import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, Screen, T, TopBar } from '@/components/ui';
import { INDEPENDENCE_STAGES } from '@/data/content';
import { useJourney } from '@/state/journey';
import { colors, radius, space } from '@/theme/tokens';

export default function IndependencePath() {
  const { state, update } = useJourney();
  if (!state.unlocked.includes(3)) return <Redirect href="/nivel/3" />;
  const selected = state.level3.stage;

  return (
    <Screen
      footer={
        <Button
          label="Calcular el costo de mi vida"
          icon="arrowRight"
          disabled={selected === undefined}
          onPress={() => router.push('/mision/costo-de-vida')}
        />
      }
    >
      <TopBar title="Nivel 3 · El recorrido" />
      <View style={{ gap: space.md, paddingVertical: space.md }}>
        <T variant="title">El camino hacia la independencia económica</T>
        <T>
          Todas las personas recorren estas etapas, cada una a su ritmo. No hay una correcta: solo un punto de partida. ¿Dónde
          estás hoy?
        </T>
      </View>

      <View style={{ marginTop: space.lg }}>
        {INDEPENDENCE_STAGES.map((s, i) => {
          const active = selected === i;
          return (
            <View key={s.title} style={{ flexDirection: 'row', gap: space.lg }}>
              <View style={{ alignItems: 'center', width: 44 }}>
                <View style={[styles.door, active && { backgroundColor: colors.forest, borderColor: colors.forest }]}>
                  <Icon name={i === 3 ? 'home' : 'door'} size={20} color={active ? colors.ivory : colors.forest} />
                </View>
                {i < INDEPENDENCE_STAGES.length - 1 && <View style={styles.path} />}
              </View>
              <Pressable
                onPress={() => update((st) => ({ ...st, level3: { ...st.level3, stage: i } }))}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.option, active && { borderColor: colors.forest, backgroundColor: colors.surface }]}
              >
                <T variant="label" style={{ color: active ? colors.terracotta : colors.warmGray }}>
                  {active ? 'Estoy aquí' : `Etapa ${i + 1}`}
                </T>
                <T variant="heading">{s.title}</T>
                <T variant="small">{s.body}</T>
              </Pressable>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  door: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.sageSoft,
    borderWidth: 1.5,
    borderColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  path: { flex: 1, width: 1.5, backgroundColor: colors.champagne, marginVertical: 4 },
  option: {
    flex: 1,
    marginBottom: space.lg,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    gap: 2,
  },
});
