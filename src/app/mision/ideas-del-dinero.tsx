import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, Card, ProgressBar, Screen, T, TopBar } from '@/components/ui';
import { MONEY_IDEAS } from '@/data/content';
import { useJourney } from '@/state/journey';
import { colors, space, useNativeDriver } from '@/theme/tokens';

export default function MoneyIdeas() {
  const { state, update } = useJourney();
  const understood = state.level2.understood;
  const firstPending = MONEY_IDEAS.findIndex((i) => !understood.includes(i.id));
  const [index, setIndex] = useState(firstPending === -1 ? 0 : firstPending);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 380, useNativeDriver }).start();
  }, [index, fade]);

  if (!state.unlocked.includes(2)) return <Redirect href="/nivel/2" />;

  const idea = MONEY_IDEAS[index];
  const isLast = index === MONEY_IDEAS.length - 1;
  const allDone = MONEY_IDEAS.every((i) => understood.includes(i.id) || i.id === idea.id);

  const next = () => {
    if (!understood.includes(idea.id)) {
      update((s) => ({ ...s, level2: { ...s.level2, understood: [...s.level2.understood, idea.id] } }));
    }
    if (isLast && allDone) router.replace('/mision/mapa-del-dinero');
    else setIndex((index + 1) % MONEY_IDEAS.length);
  };

  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {index > 0 && <Button label="Anterior" variant="secondary" onPress={() => setIndex(index - 1)} style={{ flex: 1 }} />}
          <Button
            label={isLast && allDone ? 'Dibujar mi Mapa del Dinero' : 'Lo entendí'}
            icon={isLast && allDone ? 'map' : 'check'}
            onPress={next}
            style={{ flex: 2 }}
          />
        </View>
      }
    >
      <TopBar title="Nivel 2 · Las ideas del dinero" />
      <View style={{ gap: space.sm, marginTop: space.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T variant="label">Idea {index + 1} de {MONEY_IDEAS.length}</T>
          <T variant="label" style={{ color: colors.forest }}>{understood.length} comprendidas</T>
        </View>
        <ProgressBar value={(understood.length / MONEY_IDEAS.length) * 100} />
      </View>

      <Animated.View style={{ opacity: fade, marginTop: space.xxl, gap: space.xl }}>
        <T style={{ fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 64, lineHeight: 64, color: colors.champagne }}>
          {String(index + 1).padStart(2, '0')}
        </T>
        <T variant="display">{idea.title}</T>
        <T style={{ fontSize: 17, lineHeight: 27, color: colors.ink }}>{idea.body}</T>
        <Card tone="sage" style={{ gap: space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Icon name="seed" size={18} color={colors.forest} />
            <T variant="label" style={{ color: colors.forest }}>Por ejemplo</T>
          </View>
          <T style={{ color: colors.ink }}>{idea.example}</T>
        </Card>
        {understood.includes(idea.id) && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="check" size={16} color={colors.forest} />
            <T variant="small" style={{ color: colors.forest }}>Ya marcaste esta idea como comprendida</T>
          </View>
        )}
      </Animated.View>
    </Screen>
  );
}
