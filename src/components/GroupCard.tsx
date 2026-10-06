import { Linking, View } from 'react-native';

import { Sprite } from '@/components/Sprite';
import { Card, ChunkyButton, GameLabel, T } from '@/components/ui';
import { Level } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { colors } from '@/theme/tokens';

/** Private WhatsApp group of a station. */
export function GroupCard({ level }: { level: Level }) {
  const { update } = useJourney();
  const open = () => {
    if (level.whatsappUrl) Linking.openURL(level.whatsappUrl).catch(() => {});
    if (level.id === 1) update((s) => ({ ...s, level1: { ...s.level1, joinedGroup: true } }));
  };
  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Sprite name="flag" width={44} />
        <View style={{ flex: 1 }}>
          <GameLabel size={11} color={colors.verde}>GRUPO PRIVADO · EST. {level.id}</GameLabel>
          <T variant="bodyStrong" style={{ fontSize: 16 }}>{level.groupHost}</T>
          <T variant="small">{level.groupSession}</T>
        </View>
      </View>
      <ChunkyButton label="Abrir en WhatsApp" size="sm" onPress={open} />
    </Card>
  );
}
