import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sprite } from '@/components/Sprite';
import { useGutter } from '@/components/ui';
import { LEVELS } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { getCurrentLevel, getStreak, getTotalXp } from '@/state/missions';
import { colors, fonts, maxContentWidth } from '@/theme/tokens';

/** Sticky game bar: station · streak · XP · passport. */
export function Hud() {
  const { state } = useJourney();
  const insets = useSafeAreaInsets();
  const gutter = useGutter();
  const current = getCurrentLevel(state);
  const station = current?.id ?? Math.max(1, state.completed.length);
  const sprite = (current ?? LEVELS[station - 1]).sprite;

  return (
    <View style={[styles.bar, { paddingTop: insets.top }]}>
      <View style={[styles.row, { paddingHorizontal: gutter }]}>
        <Pressable onPress={() => router.push('/mapa')} style={styles.stat} accessibilityLabel={`Estación ${station} de ${LEVELS.length}`}>
          <Sprite name={sprite} width={28} />
          <Text style={[styles.value, { color: colors.verde }]}>
            {station}/{LEVELS.length}
          </Text>
        </Pressable>
        <View style={styles.stat} accessibilityLabel={`${getStreak(state)} días de racha`}>
          <Sprite name="lantern" width={24} />
          <Text style={[styles.value, { color: colors.brasa }]}>{getStreak(state)}</Text>
        </View>
        <View style={styles.stat} accessibilityLabel={`${getTotalXp(state)} XP`}>
          <Sprite name="gem" width={27} />
          <Text style={[styles.value, { color: colors.oroDark }]}>{getTotalXp(state)}</Text>
        </View>
        <Pressable onPress={() => router.push('/perfil')} style={styles.avatar} accessibilityLabel="Mi pasaporte">
          <Text style={styles.initial}>{(state.name || 'V').charAt(0).toUpperCase()}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.bg, borderBottomWidth: 2, borderBottomColor: colors.divider },
  row: {
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12 },
  value: { fontFamily: fonts.game, fontSize: 16 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bosque, alignItems: 'center', justifyContent: 'center' },
  initial: { fontFamily: fonts.game, fontSize: 16, color: colors.oro },
});
