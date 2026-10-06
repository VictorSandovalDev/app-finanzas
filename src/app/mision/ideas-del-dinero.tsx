import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Pop } from '@/components/motion';
import { Sprite } from '@/components/Sprite';
import { Card, ChunkyButton, GameLabel, MentorSays, ProgressBar, Screen, T } from '@/components/ui';
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
    if (!understood.includes(idea.id)) {
      update((s) => ({ ...s, level2: { ...s.level2, understood: [...s.level2.understood, idea.id] } }));
    }
    if (isLast && allDone) router.replace('/nivel/2');
    else setIndex((index + 1) % MONEY_IDEAS.length);
  };

  return (
    <Screen
      maxWidth={720}
      footer={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {index > 0 && <ChunkyButton label="Atrás" variant="secondary" onPress={() => setIndex(index - 1)} style={{ flex: 1 }} />}
          <ChunkyButton label={isLast && allDone ? 'Terminar · +50 XP' : 'Lo entendí'} onPress={next} style={{ flex: 2 }} />
        </View>
      }
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/nivel/2'))} hitSlop={10} accessibilityLabel="Cerrar">
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={(understood.length / MONEY_IDEAS.length) * 100} color={colors.verde} shade={colors.bosque} />
        </View>
        <GameLabel color={colors.muted}>
          {understood.length}/{MONEY_IDEAS.length}
        </GameLabel>
      </View>

      <Pop key={idea.id} duration={400} style={{ gap: 16 }}>
        <GameLabel color={colors.verde}>ESTACIÓN 2 · IDEA {index + 1}</GameLabel>
        <T variant="title">{idea.title}</T>
        <T style={{ fontSize: 17, lineHeight: 26, color: colors.ink }}>{idea.body}</T>
        <Card bg={colors.verdeTint} borderColor={colors.verdeLight} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Sprite name="sprout" width={40} />
          <View style={{ flex: 1 }}>
            <GameLabel size={11} color={colors.verde}>POR EJEMPLO</GameLabel>
            <T variant="bodyStrong">{idea.example}</T>
          </View>
        </Card>
        {understood.includes(idea.id) && <GameLabel size={11} color={colors.oroDark}>✓ YA LA ENTENDISTE</GameLabel>}
      </Pop>

      <MentorSays>No necesitas memorizarlas. Si la puedes explicar con tus palabras, ya es tuya.</MentorSays>
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { fontFamily: fonts.title, fontSize: 20, color: colors.muted, width: 36, textAlign: 'center' },
});
