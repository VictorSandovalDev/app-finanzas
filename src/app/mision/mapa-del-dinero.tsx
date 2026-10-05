import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MoneyInput } from '@/components/MoneyInput';
import { Button, Card, Divider, Pill, Screen, T, TopBar } from '@/components/ui';
import { formatCOP } from '@/data/levels';
import { MoneyMap, useJourney } from '@/state/journey';
import { colors, fonts, radius, space } from '@/theme/tokens';

export default function MoneyMapScreen() {
  const { state, update } = useJourney();
  const [map, setMap] = useState<MoneyMap>(state.level2.moneyMap ?? { income: 0, expenses: 0, debt: 0, savings: 0 });

  if (!state.unlocked.includes(2)) return <Redirect href="/nivel/2" />;

  const out = map.expenses + map.debt + map.savings;
  const remaining = map.income - out;
  const base = Math.max(map.income, out, 1);
  const set = (k: keyof MoneyMap) => (n: number) => setMap((m) => ({ ...m, [k]: n }));
  const saved = !!state.level2.moneyMap;

  const segments = [
    { label: 'Gastos', value: map.expenses, color: colors.sage },
    { label: 'Deudas', value: map.debt, color: colors.terracotta },
    { label: 'Ahorro', value: map.savings, color: colors.champagne },
    { label: remaining >= 0 ? 'Queda libre' : 'Falta', value: Math.abs(remaining), color: remaining >= 0 ? colors.paper : colors.terracottaSoft },
  ];

  const save = () => {
    update((s) => ({ ...s, level2: { ...s.level2, moneyMap: map } }));
    router.replace('/nivel/2');
  };

  return (
    <Screen footer={<Button label={saved ? 'Actualizar mi Mapa del Dinero' : 'Guardar mi Mapa del Dinero'} icon="check" disabled={!map.income} onPress={save} />}>
      <TopBar title="Nivel 2 · Mapa del Dinero" />
      <View style={{ gap: space.md, paddingVertical: space.md }}>
        <T variant="title">Mira cómo se mueve tu dinero</T>
        <T>Usa cifras aproximadas de un mes normal. No necesitas exactitud: necesitas ver el recorrido.</T>
      </View>

      <Card style={{ marginTop: space.md, paddingVertical: space.md }}>
        <MoneyInput label="Lo que entra" hint="Tu ingreso del mes" value={map.income} onChange={set('income')} />
        <Divider />
        <MoneyInput label="Gastos" hint="Lo que usas para vivir" value={map.expenses} onChange={set('expenses')} />
        <Divider />
        <MoneyInput label="Deudas" hint="Cuotas y pagos de crédito" value={map.debt} onChange={set('debt')} />
        <Divider />
        <MoneyInput label="Ahorro" hint="Lo que reservas" value={map.savings} onChange={set('savings')} />
      </Card>

      <View style={styles.diagram}>
        <T variant="label" style={{ color: colors.champagne }}>Tu flujo del mes</T>

        <View style={{ gap: space.sm, marginTop: space.lg }}>
          <View style={styles.flowHead}>
            <T style={styles.flowLabel}>Entra</T>
            <T style={styles.flowValue}>{formatCOP(map.income)}</T>
          </View>
          <View style={[styles.bar, { width: `${(map.income / base) * 100}%`, backgroundColor: colors.ivory }]} />
        </View>

        <View style={styles.arrow}>
          <View style={styles.arrowLine} />
          <T variant="small" style={{ color: 'rgba(246,241,231,0.6)' }}>se reparte en</T>
          <View style={styles.arrowLine} />
        </View>

        <View style={styles.stack}>
          {segments.map((s) =>
            s.value > 0 ? <View key={s.label} style={{ flex: s.value, backgroundColor: s.color }} /> : null,
          )}
        </View>

        <View style={{ gap: space.sm, marginTop: space.lg }}>
          {segments.map((s) => (
            <View key={s.label} style={styles.legendRow}>
              <View style={[styles.swatch, { backgroundColor: s.color }]} />
              <T style={[styles.legendLabel, s.label === 'Falta' && { color: colors.terracottaSoft }]}>{s.label}</T>
              <T style={styles.legendValue}>{formatCOP(s.value)}</T>
            </View>
          ))}
        </View>
      </View>

      {map.income > 0 && (
        <Card tone={remaining >= 0 ? 'sage' : 'champagne'} style={{ marginTop: space.lg, gap: space.sm }}>
          <Pill tone={remaining >= 0 ? 'sage' : 'terracotta'} label={remaining >= 0 ? 'Tu mes cierra' : 'Tu mes no cierra'} />
          <T style={{ color: colors.ink }}>
            {remaining >= 0
              ? `Después de todo, te quedan ${formatCOP(remaining)}. Ahora sabes que existen y puedes decidir hacia dónde van.`
              : `Sale ${formatCOP(-remaining)} más de lo que entra. No es un juicio: es información. Y la información se puede dirigir.`}
          </T>
        </Card>
      )}

      <View style={styles.principles}>
        {['Se mide', 'Se conoce', 'Se dirige'].map((p, i) => (
          <View key={p} style={{ alignItems: 'center', flex: 1, gap: 4 }}>
            <T style={{ fontFamily: fonts.serif, fontSize: 24, color: i < 2 ? colors.forest : colors.warmGray }}>{p}</T>
            <T variant="small">{i === 0 ? 'Lo hiciste' : i === 1 ? 'Lo estás viendo' : 'Tu próximo paso'}</T>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  diagram: { backgroundColor: colors.forest, borderRadius: radius.lg, padding: space.xl, marginTop: space.xl },
  flowHead: { flexDirection: 'row', justifyContent: 'space-between' },
  flowLabel: { fontFamily: fonts.serif, fontSize: 22, color: colors.ivory },
  flowValue: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.ivory },
  bar: { height: 14, borderRadius: 7 },
  arrow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginVertical: space.lg },
  arrowLine: { flex: 1, height: 1, backgroundColor: 'rgba(246,241,231,0.25)' },
  stack: { flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', backgroundColor: 'rgba(246,241,231,0.12)', gap: 2 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ivory },
  legendValue: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.ivory },
  principles: { flexDirection: 'row', marginTop: space.xxl, paddingVertical: space.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line },
});
