import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FadeUp } from '@/components/motion';
import { BackButton, Button, Divider, Screen, Surface, T } from '@/components/ui';
import { useJourney } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

export default function PersonalMap() {
  const { state } = useJourney();
  const map = state.level1.map;
  if (!map) return <Redirect href="/mision/relato" />;

  const rows = [
    ['Situación actual', map.situation],
    ['Pensamiento', map.thought],
    ['Creencia', map.belief],
    ['Emoción', map.emotion],
    ['Comportamiento', map.behavior],
  ];
  const stamp = state.achievements.find((a) => a.levelId === 1)?.date ?? state.joinedAt;
  const date = stamp ? new Date(stamp).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  return (
    <Screen>
      <BackButton />
      <FadeUp style={{ gap: 10 }}>
        <T variant="label">Estación 1 · Entregable</T>
        <T variant="display">Mapa Personal de Transformación</T>
        <T variant="small">
          {[state.name, date].filter(Boolean).join(' · ')}
        </T>
      </FadeUp>

      <View>
        {rows.map(([label, value], i) => (
          <View key={label}>
            <Divider />
            <View style={styles.row}>
              <Text style={styles.num}>{String(i + 1).padStart(2, '0')}</Text>
              <View style={{ flex: 1, gap: 4 }}>
                <T variant="label">{label}</T>
                <Text style={[styles.value, i === 0 && styles.quote]}>{i === 0 ? `“${value}”` : value}</Text>
              </View>
            </View>
          </View>
        ))}
        <Divider />
      </View>

      <Surface tone="forest" style={{ gap: 8 }}>
        <T variant="label" style={{ color: colors.brassSoft }}>Qué necesitas transformar</T>
        <T variant="title" style={{ color: colors.onDark, fontSize: 22, lineHeight: 29 }}>{map.transform}</T>
      </Surface>

      <T variant="small">Revisa este mapa con Victor en el grupo de la semana. Puedes ajustarlo a medida que te conoces mejor.</T>
      <Button label="Ver mis frases personales" icon="arrowRight" variant={state.level1.mantrasSaved ? 'secondary' : 'primary'} onPress={() => router.push('/mision/frases')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16, paddingVertical: 18 },
  num: { fontFamily: fonts.display, fontSize: 18, lineHeight: 22, color: colors.brass, width: 26, fontVariant: ['tabular-nums'] },
  value: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.ink },
  quote: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 27 },
});
