import { Redirect, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Bob } from '@/components/motion';
import { Sprite, SpriteName } from '@/components/Sprite';
import { BackButton, Chip, ChunkyButton, GameLabel, Screen, T, useWide } from '@/components/ui';
import { MantraRole, useJourney } from '@/state/journey';
import { colors } from '@/theme/tokens';

const ROLES: Record<MantraRole, { label: string; color: string; fg: string; stripes: [string, string]; sprite: SpriteName; w: number }> = {
  reencuadre: { label: 'REENCUADRE', color: colors.brasa, fg: colors.bg, stripes: ['#FCE1DB', '#FAD3CA'], sprite: 'lantern', w: 72 },
  capacidad: { label: 'CAPACIDAD', color: colors.verde, fg: colors.bg, stripes: ['#DDEBE1', '#CFE3D5'], sprite: 'sprout', w: 80 },
  accion: { label: 'ACCIÓN', color: colors.oro, fg: colors.bosque, stripes: ['#FDF0D2', '#FCE6B3'], sprite: 'flag', w: 80 },
};

export default function Mantras() {
  const { state, update } = useJourney();
  const wide = useWide(820);
  const mantras = state.level1.mantras;
  if (!mantras) return <Redirect href="/mision/relato" />;

  const save = () => {
    update((s) => ({ ...s, level1: { ...s.level1, mantrasSaved: true } }));
    router.replace('/nivel/1');
  };

  return (
    <Screen>
      <BackButton />
      <View>
        <GameLabel color={colors.verde}>{mantras.length} CARTAS DESBLOQUEADAS</GameLabel>
        <T variant="title">Tus frases personales</T>
      </View>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16 }}>
        {mantras.map((m) => {
          const r = ROLES[m.role];
          return (
            <View key={m.role} style={[styles.card, { borderColor: r.color }, wide && { flex: 1 }]}>
              <View style={styles.art}>
                <View style={StyleSheet.absoluteFill}>
                  {Array.from({ length: 18 }, (_, i) => (
                    <View key={i} style={{ height: 8, backgroundColor: r.stripes[i % 2] }} />
                  ))}
                </View>
                <Bob duration={2200} steps={3}>
                  <Sprite name={r.sprite} width={r.w} />
                </Bob>
              </View>
              <View style={{ paddingHorizontal: 6, paddingBottom: 8, gap: 8 }}>
                <Chip label={r.label} bg={r.color} fg={r.fg} />
                <T variant="phrase">{m.text}</T>
              </View>
            </View>
          );
        })}
      </View>
      {state.level1.mantrasSaved ? (
        <ChunkyButton label="Volver a la estación" variant="secondary" onPress={() => router.replace('/nivel/1')} style={{ maxWidth: 420 }} />
      ) : (
        <ChunkyButton label="Guardar mis frases · +80 XP" onPress={save} style={{ maxWidth: 420 }} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderWidth: 4, borderBottomWidth: 8, borderRadius: 20, padding: 10, gap: 12 },
  art: { height: 140, borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
