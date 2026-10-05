import { Linking, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, Card, T } from '@/components/ui';
import { Level } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { colors, space } from '@/theme/tokens';

export function GroupCard({ level }: { level: Level }) {
  const { state, update } = useJourney();
  const joined = level.id === 1 && state.level1.joinedGroup;

  const open = () => {
    if (level.whatsappUrl) Linking.openURL(level.whatsappUrl).catch(() => {});
    if (level.id === 1) update((s) => ({ ...s, level1: { ...s.level1, joinedGroup: true } }));
  };

  return (
    <Card tone="sage" style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chat" size={20} color={colors.ivory} />
        </View>
        <View style={{ flex: 1 }}>
          <T variant="label" style={{ color: colors.forest }}>Grupo privado · Nivel {level.id}</T>
          <T variant="bodyStrong">Acompañamiento de la semana</T>
        </View>
      </View>
      <T variant="small" style={{ color: colors.inkSoft }}>
        Comparte avances, resuelve dudas con tu mentor y avanza junto a quienes están en la misma estación.
      </T>
      <Button label={joined ? 'Abrir grupo de WhatsApp' : 'Unirme al grupo de WhatsApp'} variant="secondary" onPress={open} />
    </Card>
  );
}
