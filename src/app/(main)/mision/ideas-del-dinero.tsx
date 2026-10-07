import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { FadeUp } from '@/components/motion';
import { BackButton, Button, MentorNote, Progress, Screen, Surface, T } from '@/components/ui';
import { MONEY_IDEAS } from '@/data/content';
import { useJourney } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

export default function MoneyIdeas() {
  const { state, update } = useJourney();
  const understood = state.level2.understood;
  const firstPending = MONEY_IDEAS.findIndex((i) => !understood.includes(i.id));
  const [index, setIndex] = useState(firstPending === -1 ? 0 : firstPending);
  if (!state.unlocked.includes(2)) return <Redirect href="/nivel/2" />;

  const idea = MONEY_IDEAS[index];
  const isLast = index === MONEY_IDEAS.length - 1;
  const allDone = MONEY_IDEAS.every((i) => understood.includes(i.id) || i.id === idea.id);

  const next = () => {
    if (!understood.includes(idea.id)) update((s) => ({ ...s, level2: { ...s.level2, understood: [...s.level2.understood, idea.id] } }));
    if (isLast && allDone) router.replace('/nivel/2');
    else setIndex((index + 1) % MONEY_IDEAS.length);
  };

  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {index > 0 && <Button label="Anterior" variant="secondary" onPress={() => setIndex(index - 1)} style={{ flex: 1 }} />}
          <Button label={isLast && allDone ? 'Terminar misión' : 'Lo entendí'} icon="arrowRight" onPress={next} style={{ flex: 2 }} />
        </View>
      }
    >
      <BackButton onPress={() => (router.canGoBack() ? router.back() : router.replace('/nivel/2'))} label="Estación 2" />
      <View style={{ gap: 8 }}>
        <Progress value={(understood.length / MONEY_IDEAS.length) * 100} />
        <T variant="small">
          {understood.length} de {MONEY_IDEAS.length} ideas comprendidas
        </T>
      </View>

      <FadeUp key={idea.id} style={{ gap: 16 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.warm }}>Idea {String(index + 1).padStart(2, '0')}</Text>
        <T variant="display">{idea.title}</T>
        <T style={{ fontSize: 17, lineHeight: 27, color: colors.ink }}>{idea.body}</T>
        <Surface tone="sunken" style={{ gap: 6 }}>
          <T variant="label">Por ejemplo</T>
          <T style={{ color: colors.ink }}>{idea.example}</T>
        </Surface>
      </FadeUp>

      <MentorNote>No necesitas memorizarlas. Si la puedes explicar con tus palabras, ya es tuya.</MentorNote>
    </Screen>
  );
}
