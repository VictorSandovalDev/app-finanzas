import { Linking, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, T } from '@/components/ui';
import { Level } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { colors } from '@/theme/tokens';

/** Private WhatsApp group of a station. */
export function GroupRow({ level }: { level: Level }) {
  const { update } = useJourney();
  const open = () => {
    if (level.whatsappUrl) Linking.openURL(level.whatsappUrl).catch(() => {});
    if (level.id === 1) update((s) => ({ ...s, level1: { ...s.level1, joinedGroup: true } }));
  };
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Icon name="group" size={20} color={colors.accent} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T variant="bodyStrong" numberOfLines={1}>{level.groupHost}</T>
        <T variant="small" numberOfLines={1}>{level.groupSession}</T>
      </View>
      <Button label="Abrir" icon="whatsapp" variant="secondary" compact onPress={open} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
});
