import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Parchment } from '@/components/Parchment';
import { Sprite } from '@/components/Sprite';
import { BackButton, ChunkyButton, GameLabel, T, Screen, useWide } from '@/components/ui';
import { useJourney } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

export default function PersonalMap() {
  const { state } = useJourney();
  const wide = useWide(640);
  const map = state.level1.map;
  if (!map) return <Redirect href="/mision/relato" />;

  const cells = [
    ['SITUACIÓN', map.situation],
    ['PENSAMIENTO', map.thought],
    ['CREENCIA', map.belief],
    ['EMOCIÓN', `${map.emotion}.`],
    ['COMPORTAMIENTO', map.behavior],
  ];
  const date = (state.achievements.find((a) => a.levelId === 1)?.date ?? new Date().toISOString()).slice(0, 10);

  return (
    <Screen maxWidth={860}>
      <BackButton />
      <Parchment>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Sprite name="scroll" width={56} />
          <View style={{ flex: 1 }}>
            <GameLabel size={11} color={colors.verde}>ESTACIÓN 1 · ENTREGABLE</GameLabel>
            <T variant="title" style={{ fontSize: 24, lineHeight: 27 }}>Mapa Personal de Transformación</T>
            <T variant="small" style={{ color: colors.inkSoft }}>
              {state.name || 'Tu mapa'} · {new Date(`${date}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </T>
          </View>
        </View>
        <View style={styles.grid}>
          {cells.map(([label, value], i) => (
            <View key={label} style={[styles.cell, { width: wide ? '48.5%' : '100%' }]}>
              <GameLabel size={11} color={colors.verde}>
                {i + 1} · {label}
              </GameLabel>
              <Text style={styles.cellText}>{value}</Text>
            </View>
          ))}
          <View style={[styles.cell, styles.transform, { width: wide ? '48.5%' : '100%' }]}>
            <GameLabel size={11} color={colors.oro}>6 · QUÉ TRANSFORMAR</GameLabel>
            <Text style={[styles.cellText, { color: colors.bg, fontFamily: fonts.heavy }]}>{map.transform}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ transform: [{ rotate: '-10deg' }] }}>
            <Sprite name="seal" width={72} />
          </View>
        </View>
      </Parchment>
      <ChunkyButton label="Mis frases" variant={state.level1.mantrasSaved ? 'secondary' : 'verde'} onPress={() => router.push('/mision/frases')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  cell: { backgroundColor: colors.bg, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.parchmentEdge, padding: 12, gap: 4 },
  transform: { backgroundColor: colors.verde, borderColor: colors.bosque },
  cellText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 21, color: colors.ink },
});
