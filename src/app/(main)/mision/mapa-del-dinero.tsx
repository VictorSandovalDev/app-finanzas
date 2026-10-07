import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MoneyInput } from '@/components/MoneyInput';
import { BackButton, Button, Column, Columns, Divider, MentorNote, Screen, SectionTitle, T } from '@/components/ui';
import { formatCOP } from '@/data/levels';
import { MoneyMap, useJourney } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

export default function MoneyMapScreen() {
  const { state, update } = useJourney();
  const [map, setMap] = useState<MoneyMap>(state.level2.moneyMap ?? { income: 0, expenses: 0, debt: 0, savings: 0 });
  if (!state.unlocked.includes(2)) return <Redirect href="/nivel/2" />;

  const set = (k: keyof MoneyMap) => (n: number) => setMap((m) => ({ ...m, [k]: n }));
  const out = map.expenses + map.debt + map.savings;
  const free = map.income - out;
  const base = Math.max(map.income, out, 1);
  const pct = (n: number) => Math.round((Math.max(0, n) / base) * 100);

  const parts = [
    { label: 'Gastos', value: map.expenses, color: colors.accent },
    { label: 'Deudas', value: map.debt, color: colors.warn },
    { label: 'Ahorro', value: map.savings, color: colors.label },
    { label: free >= 0 ? 'Queda libre' : 'Falta', value: Math.abs(free), color: free >= 0 ? colors.warm : colors.warnSoft },
  ];

  const save = () => {
    update((s) => ({ ...s, level2: { ...s.level2, moneyMap: map } }));
    router.replace('/nivel/2');
  };

  return (
    <Screen maxWidth={960}>
      <BackButton onPress={() => (router.canGoBack() ? router.back() : router.replace('/nivel/2'))} label="Estación 2" />
      <View style={{ gap: 10 }}>
        <T variant="label">Estación 2 · Misión 2</T>
        <T variant="display">Tu Mapa del Dinero</T>
        <T>Usa cifras aproximadas de un mes normal. No necesitas exactitud: necesitas ver el recorrido.</T>
      </View>

      <Columns>
        <Column gap={0}>
          <SectionTitle title="Tu mes" />
          <MoneyInput label="Lo que entra" hint="Tu ingreso del mes" value={map.income} onChange={set('income')} />
          <Divider />
          <MoneyInput label="Gastos" hint="Lo que usas para vivir" value={map.expenses} onChange={set('expenses')} />
          <Divider />
          <MoneyInput label="Deudas" hint="Cuotas y pagos de crédito" value={map.debt} onChange={set('debt')} />
          <Divider />
          <MoneyInput label="Ahorro" hint="Lo que reservas" value={map.savings} onChange={set('savings')} />
        </Column>
        <Column gap={18}>
          <SectionTitle title="Cómo se reparte" />
          <View>
            <T variant="small">Entra cada mes</T>
            <Text style={styles.income}>{formatCOP(map.income)}</Text>
          </View>
          <View style={styles.bar}>
            {parts.map((p) => (p.value > 0 ? <View key={p.label} style={{ flex: p.value, backgroundColor: p.color }} /> : null))}
            {out === 0 && map.income === 0 ? <View style={{ flex: 1, backgroundColor: colors.lineSoft }} /> : null}
          </View>
          <View>
            {parts.map((p) => (
              <View key={p.label} style={styles.legend}>
                <View style={[styles.swatch, { backgroundColor: p.color }]} />
                <Text style={[styles.legendLabel, p.label === 'Falta' && { color: colors.warn }]}>{p.label}</Text>
                <Text style={styles.legendPct}>{pct(p.value)}%</Text>
                <Text style={styles.legendValue}>{formatCOP(p.value)}</Text>
              </View>
            ))}
          </View>
          {map.income > 0 && (
            <MentorNote>
              {free >= 0
                ? `Cada mes te quedan ${formatCOP(free)} libres. Ese es tu margen para decidir.`
                : `Sale ${formatCOP(-free)} más de lo que entra. No es un juicio: es información, y se puede dirigir.`}
            </MentorNote>
          )}
          <Button label={state.level2.moneyMap ? 'Actualizar mi mapa' : 'Guardar mi Mapa del Dinero'} icon="check" disabled={!map.income} onPress={save} />
        </Column>
      </Columns>
    </Screen>
  );
}

const styles = StyleSheet.create({
  income: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40, color: colors.ink, fontVariant: ['tabular-nums'] },
  bar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2, backgroundColor: colors.lineSoft },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  swatch: { width: 10, height: 10, borderRadius: 2 },
  legendLabel: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  legendPct: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, width: 40, textAlign: 'right', fontVariant: ['tabular-nums'] },
  legendValue: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.ink, minWidth: 96, textAlign: 'right', fontVariant: ['tabular-nums'] },
});
