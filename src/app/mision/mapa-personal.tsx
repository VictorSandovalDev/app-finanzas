import { Redirect, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon, IconName } from '@/components/Icon';
import { Seal } from '@/components/Seal';
import { Button, Card, Divider, Pill, Screen, T, TopBar } from '@/components/ui';
import { useJourney } from '@/state/journey';
import { colors, radius, space } from '@/theme/tokens';

export default function PersonalMap() {
  const { state } = useJourney();
  const map = state.level1.map;
  if (!map) return <Redirect href="/mision/relato" />;

  const chain: { label: string; hint: string; value: string; icon: IconName }[] = [
    { label: 'Pensamiento', hint: 'Lo que te dices', value: map.thought, icon: 'sparkle' },
    { label: 'Creencia', hint: 'Lo que das por cierto', value: map.belief, icon: 'key' },
    { label: 'Emoción', hint: 'Lo que sientes', value: map.emotion, icon: 'seed' },
    { label: 'Comportamiento', hint: 'Lo que terminas haciendo', value: map.behavior, icon: 'route' },
  ];

  return (
    <Screen
      footer={
        <Button
          label={state.level1.mantrasSaved ? 'Ver mis frases personales' : 'Siguiente: tus frases personales'}
          icon="arrowRight"
          onPress={() => router.push('/mision/frases')}
        />
      }
    >
      <TopBar title="Entregable · Nivel 1" />

      <View style={styles.document}>
        <View style={{ alignItems: 'center', gap: space.md }}>
          <Seal icon="compass" size={84} />
          <T variant="label">Mapa Personal de Transformación</T>
          <T variant="title" style={{ textAlign: 'center' }}>{state.name || 'Tu mapa'}</T>
          <T variant="small">{new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</T>
        </View>

        <Divider style={{ marginVertical: space.xl }} />

        <T variant="label">Situación actual</T>
        <T variant="quote" style={{ fontSize: 20, lineHeight: 28, marginTop: space.sm }}>“{map.situation}”</T>

        <View style={{ marginTop: space.xxl }}>
          {chain.map((c, i) => (
            <View key={c.label} style={{ flexDirection: 'row', gap: space.lg }}>
              <View style={{ alignItems: 'center', width: 40 }}>
                <View style={styles.node}>
                  <Icon name={c.icon} size={18} color={colors.forest} />
                </View>
                {i < chain.length - 1 && <View style={styles.connector} />}
              </View>
              <View style={{ flex: 1, paddingBottom: space.xl, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
                  <T variant="label" style={{ color: colors.forest }}>{c.label}</T>
                  <T variant="small">· {c.hint}</T>
                </View>
                <T style={{ color: colors.ink, fontSize: 16 }}>{c.value}</T>
              </View>
            </View>
          ))}
        </View>

        <Card tone="forest" style={{ gap: space.sm }}>
          <T variant="label" style={{ color: colors.champagne }}>Qué necesitas transformar</T>
          <T variant="heading" style={{ color: colors.ivory }}>{map.transform}</T>
        </Card>
      </View>

      <View style={{ alignItems: 'center', marginTop: space.xl, gap: space.md }}>
        <Pill tone="sage" icon="check" label="Guardado en tus entregables" />
        <T variant="small" style={{ textAlign: 'center' }}>
          Revisa este mapa con tu mentor en el grupo de la semana. Puedes ajustarlo a medida que te conoces mejor.
        </T>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  document: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.xl,
    borderWidth: 1,
    borderColor: colors.line,
  },
  node: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.sageSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: { flex: 1, width: 1.5, backgroundColor: colors.champagne, marginVertical: 4 },
});
