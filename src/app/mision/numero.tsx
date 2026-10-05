import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { Seal } from '@/components/Seal';
import { Button, Card, Pill, ProgressBar, Screen, T, TopBar } from '@/components/ui';
import { COST_GROUPS, INDEPENDENCE_STAGES } from '@/data/content';
import { formatCOP } from '@/data/levels';
import { CostGroup, useJourney } from '@/state/journey';
import { colors, fonts, radius, space } from '@/theme/tokens';

const GROUP_COLORS: Record<CostGroup, string> = {
  esencial: colors.forest,
  personal: colors.sage,
  futuro: colors.champagne,
};

export default function IndependenceNumber() {
  const { state } = useJourney();
  const { items, done, stage } = state.level3;
  const total = items.reduce((s, i) => s + i.amount, 0);
  const counter = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const id = counter.addListener(({ value }) => setShown(value));
    Animated.timing(counter, { toValue: total, duration: 1600, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => counter.removeListener(id);
  }, [counter, total]);

  if (!done) return <Redirect href="/mision/costo-de-vida" />;

  const byGroup = (Object.keys(COST_GROUPS) as CostGroup[]).map((g) => ({
    group: g,
    value: items.filter((i) => i.group === g).reduce((s, i) => s + i.amount, 0),
  }));
  const essentials = byGroup[0].value;
  const income = state.level2.moneyMap?.income;
  const coverage = income ? Math.round((income / Math.max(total, 1)) * 100) : undefined;
  const levelDone = state.completed.includes(3);

  return (
    <Screen
      footer={
        levelDone ? (
          <Button label="Volver a mi viaje" variant="secondary" onPress={() => router.replace('/viaje')} />
        ) : (
          <Button label="Ir a completar el nivel" icon="arrowRight" onPress={() => router.replace('/nivel/3')} />
        )
      }
    >
      <TopBar title="Entregable · Nivel 3" right={undefined} />

      <View style={styles.hero}>
        <Seal icon="door" size={72} />
        <T variant="label" style={{ color: colors.champagne, marginTop: space.lg }}>Mi Número de Independencia</T>
        <T style={styles.number} adjustsFontSizeToFit numberOfLines={1}>{formatCOP(shown)}</T>
        <T style={{ color: 'rgba(246,241,231,0.75)', textAlign: 'center' }}>
          es lo que cuesta sostener tu vida cada mes.
        </T>
        <View style={styles.heroStats}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <T variant="label" style={{ color: 'rgba(246,241,231,0.55)' }}>Base esencial</T>
            <T style={styles.stat}>{formatCOP(essentials)}</T>
          </View>
          <View style={styles.statDivider} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <T variant="label" style={{ color: 'rgba(246,241,231,0.55)' }}>Al año</T>
            <T style={styles.stat}>{formatCOP(total * 12)}</T>
          </View>
        </View>
      </View>

      <T variant="heading" style={{ marginTop: space.xxl, marginBottom: space.md }}>Cómo se compone</T>
      <Card style={{ gap: space.lg }}>
        {byGroup.map(({ group, value }) => (
          <View key={group} style={{ gap: space.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T variant="bodyStrong">{COST_GROUPS[group].title}</T>
              <T variant="bodyStrong">{formatCOP(value)}</T>
            </View>
            <ProgressBar value={(value / Math.max(total, 1)) * 100} color={GROUP_COLORS[group]} />
          </View>
        ))}
      </Card>

      {coverage !== undefined && (
        <Card tone={coverage >= 100 ? 'sage' : 'champagne'} style={{ marginTop: space.lg, gap: space.sm }}>
          <T variant="label">Según tu Mapa del Dinero</T>
          <T style={{ color: colors.ink }}>
            Tu ingreso actual ({formatCOP(income!)}) cubre el <T variant="bodyStrong">{coverage}%</T> de tu Número de Independencia.
          </T>
        </Card>
      )}

      {stage !== undefined && (
        <Card tone="paper" style={{ marginTop: space.lg, gap: space.sm }}>
          <Pill tone="terracotta" label="Tu etapa hoy" />
          <T variant="heading">{INDEPENDENCE_STAGES[stage].title}</T>
          <T variant="small">
            Conocer este número es el primer paso para cubrirlo con tu propio dinero. En los próximos niveles aprenderás a
            organizarlo y dirigirlo.
          </T>
        </Card>
      )}

      <View style={{ alignItems: 'center', marginTop: space.xl }}>
        <Button label="Ajustar mis cifras" variant="ghost" onPress={() => router.push('/mision/costo-de-vida')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.forestDeep, borderRadius: radius.xl, padding: space.xl, alignItems: 'center', marginTop: space.sm },
  number: { fontFamily: fonts.serif, fontSize: 54, lineHeight: 62, color: colors.ivory, marginVertical: space.sm },
  heroStats: { flexDirection: 'row', alignSelf: 'stretch', marginTop: space.xl, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: 'rgba(246,241,231,0.15)' },
  statDivider: { width: 1, backgroundColor: 'rgba(246,241,231,0.15)' },
  stat: { fontFamily: fonts.serif, fontSize: 22, color: colors.ivory, marginTop: 4 },
});
