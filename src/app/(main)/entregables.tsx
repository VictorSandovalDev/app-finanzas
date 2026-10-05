import { router } from 'expo-router';
import { View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Card, Pill, Screen, T } from '@/components/ui';
import { getLevel } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { getDeliverables } from '@/state/missions';
import { colors, space } from '@/theme/tokens';

export default function Deliverables() {
  const { state } = useJourney();
  const items = getDeliverables(state);
  const ready = items.filter((d) => d.ready).length;

  return (
    <Screen>
      <View style={{ paddingTop: space.xl, paddingBottom: space.xl, gap: space.sm }}>
        <T variant="label">Tu archivo personal</T>
        <T variant="display">Entregables</T>
        <T>Cada estación te deja un documento real. Vuelve a ellos cuando necesites recordar de dónde vienes y hacia dónde vas.</T>
        <Pill tone="sage" icon="doc" label={`${ready} de ${items.length} obtenidos`} />
      </View>

      <View style={{ gap: space.md }}>
        {items.map((d) => {
          const level = getLevel(d.levelId)!;
          return (
            <Card
              key={d.id}
              tone={d.ready ? 'surface' : 'paper'}
              onPress={d.ready ? () => router.push(d.href) : () => router.push(`/nivel/${d.levelId}`)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}
            >
              <View
                style={{
                  width: 52,
                  height: 64,
                  borderRadius: 8,
                  backgroundColor: d.ready ? colors.forest : colors.ivory,
                  borderWidth: d.ready ? 0 : 1,
                  borderColor: colors.line,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={d.ready ? level.symbol : 'lock'} color={d.ready ? colors.champagneSoft : colors.warmGray} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="label">Nivel {level.id} · {level.stage}</T>
                <T variant="heading" style={{ fontSize: 20, color: d.ready ? colors.ink : colors.warmGray }}>{d.title}</T>
                <T variant="small">{d.ready ? 'Toca para abrir' : state.unlocked.includes(level.id) ? 'Completa la misión para obtenerlo' : 'Se obtiene al desbloquear el nivel'}</T>
              </View>
              <Icon name="arrowRight" size={18} color={colors.warmGray} />
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
