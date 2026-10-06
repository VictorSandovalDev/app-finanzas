import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MoneyInput } from '@/components/MoneyInput';
import { BackButton, Card, ChunkyButton, GameLabel, Screen, T } from '@/components/ui';
import { COST_GROUPS, COST_TEMPLATE } from '@/data/content';
import { formatCOP } from '@/data/levels';
import { CostGroup, CostItem, useJourney } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

export default function CostOfLife() {
  const { state, update } = useJourney();
  const [items, setItems] = useState<CostItem[]>(
    state.level3.items.length ? state.level3.items : COST_TEMPLATE.map((t) => ({ ...t, amount: 0 })),
  );
  if (!state.unlocked.includes(3)) return <Redirect href="/nivel/3" />;

  const total = items.reduce((sum, i) => sum + i.amount, 0);
  const essentials = items.filter((i) => i.group === 'esencial').reduce((sum, i) => sum + i.amount, 0);
  const setAmount = (id: string, amount: number) => setItems((list) => list.map((i) => (i.id === id ? { ...i, amount } : i)));
  const addItem = (group: CostGroup, label: string) => setItems((list) => [...list, { id: `custom-${Date.now()}`, label, amount: 0, group }]);
  const removeItem = (id: string) => setItems((list) => list.filter((i) => i.id !== id));

  const finish = () => {
    update((s) => ({ ...s, level3: { ...s.level3, items, done: true } }));
    router.replace('/mision/numero');
  };

  return (
    <Screen
      maxWidth={720}
      footer={
        <>
          <View style={styles.totalRow}>
            <GameLabel>TU VIDA CUESTA AL MES</GameLabel>
            <Text style={styles.total}>{formatCOP(total)}</Text>
          </View>
          <ChunkyButton label="Revelar mi número · +80 XP" variant="oro" disabled={essentials === 0} onPress={finish} />
        </>
      }
    >
      <BackButton />
      <View>
        <GameLabel color={colors.verde}>ESTACIÓN 3 · MISIÓN 2</GameLabel>
        <T variant="title">¿Cuánto cuesta tu vida?</T>
        <T>Empieza por lo esencial. Usa valores mensuales; si algo se paga cada año, divídelo entre doce.</T>
      </View>

      {(Object.keys(COST_GROUPS) as CostGroup[]).map((group) => {
        const groupItems = items.filter((i) => i.group === group);
        const subtotal = groupItems.reduce((sum, i) => sum + i.amount, 0);
        return (
          <View key={group} style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <T variant="h2">{COST_GROUPS[group].title}</T>
              <Text style={styles.subtotal}>{formatCOP(subtotal)}</Text>
            </View>
            <T variant="small">{COST_GROUPS[group].hint}</T>
            <Card style={{ paddingVertical: 4 }}>
              {groupItems.map((item, idx) => (
                <View key={item.id} style={[{ flexDirection: 'row', alignItems: 'center' }, idx > 0 && styles.divider]}>
                  <View style={{ flex: 1 }}>
                    <MoneyInput compact label={item.label} value={item.amount} onChange={(n) => setAmount(item.id, n)} />
                  </View>
                  {item.id.startsWith('custom-') && (
                    <Pressable onPress={() => removeItem(item.id)} hitSlop={10} style={{ paddingLeft: 8 }} accessibilityLabel={`Quitar ${item.label}`}>
                      <Text style={styles.remove}>✕</Text>
                    </Pressable>
                  )}
                </View>
              ))}
              <AddItem onAdd={(label) => addItem(group, label)} />
            </Card>
          </View>
        );
      })}
    </Screen>
  );
}

function AddItem({ onAdd }: { onAdd: (label: string) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const submit = () => {
    if (label.trim()) onAdd(label.trim());
    setLabel('');
    setOpen(false);
  };
  if (!open) {
    return (
      <Pressable onPress={() => setOpen(true)} style={[styles.divider, { paddingVertical: 12 }]}>
        <Text style={styles.add}>+ AGREGAR OTRA</Text>
      </Pressable>
    );
  }
  return (
    <View style={[styles.divider, { flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 10 }]}>
      <TextInput value={label} onChangeText={setLabel} placeholder="Nombre" placeholderTextColor={colors.muted} autoFocus onSubmitEditing={submit} style={styles.addInput} />
      <ChunkyButton label="Agregar" size="sm" onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontFamily: fonts.title, fontSize: 24, color: colors.bosque },
  subtotal: { fontFamily: fonts.title, fontSize: 15, color: colors.verde },
  divider: { borderTopWidth: 2, borderTopColor: colors.divider },
  remove: { fontFamily: fonts.title, fontSize: 16, color: colors.muted },
  add: { fontFamily: fonts.title, fontSize: 13, letterSpacing: 0.8, color: colors.verde },
  addInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.ink,
    outlineStyle: 'none',
  } as object,
});
