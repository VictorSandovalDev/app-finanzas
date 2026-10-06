import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MoneyInput } from '@/components/MoneyInput';
import { Card, ChunkyButton, Column, Columns, GameLabel, MentorSays, ProgressBar, Screen, T } from '@/components/ui';
import { formatCOP } from '@/data/levels';
import { MoneyMap, useJourney } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

/** Striped fill like the design's repeating-linear-gradient bars. */
function Stripes({ a, b, size = 6 }: { a: string; b: string; size?: number }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: 40 }, (_, i) => (
        <View key={i} style={{ height: size, backgroundColor: i % 2 ? b : a }} />
      ))}
    </View>
  );
}

export default function MoneyMapScreen() {
  const { state, update } = useJourney();
  const [map, setMap] = useState<MoneyMap>(state.level2.moneyMap ?? { income: 0, expenses: 0, debt: 0, savings: 0 });
  if (!state.unlocked.includes(2)) return <Redirect href="/nivel/2" />;

  const set = (k: keyof MoneyMap) => (n: number) => setMap((m) => ({ ...m, [k]: n }));
  const out = map.expenses + map.debt + map.savings;
  const free = map.income - out;
  const base = Math.max(map.income, out, 1);
  const pct = (n: number) => Math.round((Math.max(0, n) / base) * 100);
  const saved = !!state.level2.moneyMap;
  const filled = [map.income, map.expenses, map.debt, map.savings].filter(Boolean).length;

  const bars = [
    { key: 'gastos', value: map.expenses, a: colors.verde, b: colors.verdeMid, shade: colors.bosque, text: colors.verde },
    { key: 'deudas', value: map.debt, a: colors.lacre, b: '#D9504F', shade: colors.lacreDark, text: colors.lacre },
    { key: 'ahorro', value: map.savings, a: colors.bosque, b: '#2A5D4C', shade: colors.bosqueDeep, text: colors.bosque },
    { key: 'libre', value: Math.max(0, free), a: colors.oro, b: colors.oroLight, shade: colors.oroDark, text: colors.oroText },
  ];
  const maxBar = Math.max(...bars.map((b) => b.value), 1);

  const tiles = [
    { label: 'GASTOS', value: map.expenses, border: colors.verde, color: colors.verde, bg: colors.card },
    { label: 'DEUDAS', value: map.debt, border: colors.lacre, color: colors.lacre, bg: colors.card },
    { label: 'AHORRO', value: map.savings, border: colors.bosque, color: colors.bosque, bg: colors.card },
    free >= 0
      ? { label: 'LIBRE', value: free, border: colors.oro, color: colors.oroText, bg: colors.oroTint }
      : { label: 'FALTA', value: -free, border: colors.brasa, color: colors.brasaText, bg: colors.brasaTint },
  ];

  const save = () => {
    update((s) => ({ ...s, level2: { ...s.level2, moneyMap: map } }));
    router.replace('/nivel/2');
  };

  return (
    <Screen maxWidth={1000}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/nivel/2'))} hitSlop={10} accessibilityLabel="Cerrar">
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={(filled / 4) * 100} color={colors.verde} shade={colors.bosque} />
        </View>
      </View>
      <View>
        <GameLabel color={colors.verde}>ESTACIÓN 2 · MISIÓN 2</GameLabel>
        <T variant="title">Tu Mapa del Dinero</T>
      </View>
      <Columns>
        <Column>
          <Card style={{ alignItems: 'center', padding: 18 }}>
            <View style={styles.income}>
              <GameLabel size={11} color={colors.oro}>ENTRA CADA MES</GameLabel>
              <Text style={styles.incomeValue}>{formatCOP(map.income)}</Text>
            </View>
            {[32, 56, 80].map((w) => (
              <View key={w} style={{ width: `${w}%`, height: w === 32 ? 20 : 16, overflow: 'hidden' }}>
                <Stripes a={colors.verdeMid} b={colors.verdeLight} size={4} />
              </View>
            ))}
            <View style={styles.bars}>
              {bars.map((b) => (
                <View key={b.key} style={{ flex: Math.max(pct(b.value), 6), gap: 6 }}>
                  <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <View style={{ height: `${Math.max(4, (b.value / maxBar) * 100)}%`, overflow: 'hidden' }}>
                      <Stripes a={b.a} b={b.b} />
                      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, backgroundColor: b.shade }} />
                    </View>
                  </View>
                  <GameLabel size={11} color={b.text} style={{ textAlign: 'center' }}>
                    {pct(b.value)}%
                  </GameLabel>
                </View>
              ))}
            </View>
          </Card>
          <Card style={{ paddingVertical: 6 }}>
            <MoneyInput label="Lo que entra" hint="Tu ingreso del mes" value={map.income} onChange={set('income')} />
            <MoneyInput label="Gastos" hint="Lo que usas para vivir" value={map.expenses} onChange={set('expenses')} />
            <MoneyInput label="Deudas" hint="Cuotas y pagos de crédito" value={map.debt} onChange={set('debt')} />
            <MoneyInput label="Ahorro" hint="Lo que reservas" value={map.savings} onChange={set('savings')} />
          </Card>
        </Column>
        <Column gap={12}>
          <View style={styles.tiles}>
            {tiles.map((t) => (
              <View key={t.label} style={[styles.tile, { borderColor: t.border, backgroundColor: t.bg }]}>
                <GameLabel size={11} color={t.color}>{t.label}</GameLabel>
                <Text style={styles.tileValue}>{formatCOP(t.value)}</Text>
              </View>
            ))}
          </View>
          {map.income > 0 && (
            <MentorSays>
              {free >= 0 ? (
                <Text style={styles.say}>
                  Cada mes te quedan <Text style={{ color: colors.verde, fontFamily: fonts.title }}>{formatCOP(free)}</Text> libres. Ese es tu margen para decidir.
                </Text>
              ) : (
                <Text style={styles.say}>
                  Sale <Text style={{ color: colors.brasaText, fontFamily: fonts.title }}>{formatCOP(-free)}</Text> más de lo que entra. No es un juicio: es información, y se puede dirigir.
                </Text>
              )}
            </MentorSays>
          )}
          <ChunkyButton label={saved ? 'Actualizar mapa' : 'Guardar · +80 XP'} disabled={!map.income} onPress={save} />
        </Column>
      </Columns>
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { fontFamily: fonts.title, fontSize: 20, color: colors.muted, width: 36, textAlign: 'center' },
  income: {
    backgroundColor: colors.verde,
    borderBottomWidth: 5,
    borderBottomColor: colors.bosque,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  incomeValue: { fontFamily: fonts.title, fontSize: 26, color: colors.bg },
  bars: { width: '100%', flexDirection: 'row', gap: 6, height: 160 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '47%', flexGrow: 1, borderWidth: 2, borderBottomWidth: 5, borderRadius: 16, padding: 12 },
  tileValue: { fontFamily: fonts.title, fontSize: 18, color: colors.ink },
  say: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: colors.ink },
});
