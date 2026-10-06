import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { MoneyInput } from '@/components/MoneyInput';
import { BackButton, Button, Divider, Screen, T } from '@/components/ui';
import { COST_GROUPS, COST_TEMPLATE } from '@/data/content';
import { formatCOP } from '@/data/levels';
import { CostGroup, CostItem, useJourney } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

export default function CostOfLife() {
  const { state, update } = useJourney();
  const [items, setItems] = useState<CostItem[]>(state.level3.items.length ? state.level3.items : COST_TEMPLATE.map((t) => ({ ...t, amount: 0 })));
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
      footer={
        <>
          <View style={styles.totalRow}>
            <T variant="small">Tu vida cuesta al mes</T>
            <Text style={styles.total}>{formatCOP(total)}</Text>
          </View>
          <Button label="Ver mi Número de Independencia" icon="arrowRight" disabled={essentials === 0} onPress={finish} />
        </>
      }
    >
      <BackButton onPress={() => (router.canGoBack() ? router.back() : router.replace('/nivel/3'))} label="Estación 3" />
      <View style={{ gap: 10 }}>
        <T variant="label">Estación 3 · Misión 2</T>
        <T variant="display">¿Cuánto cuesta tu vida?</T>
        <T>Empieza por lo esencial. Usa valores mensuales; si algo se paga cada año, divídelo entre doce.</T>
      </View>

      {(Object.keys(COST_GROUPS) as CostGroup[]).map((group) => {
        const groupItems = items.filter((i) => i.group === group);
        const subtotal = groupItems.reduce((sum, i) => sum + i.amount, 0);
        return (
          <View key={group}>
            <View style={styles.groupHead}>
              <View style={{ flex: 1 }}>
                <T variant="heading">{COST_GROUPS[group].title}</T>
                <T variant="small">{COST_GROUPS[group].hint}</T>
              </View>
              <Text style={styles.subtotal}>{formatCOP(subtotal)}</Text>
            </View>
            {groupItems.map((item) => (
              <View key={item.id}>
                <Divider />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <MoneyInput label={item.label} value={item.amount} onChange={(n) => setAmount(item.id, n)} />
                  </View>
                  {item.id.startsWith('custom-') && (
                    <Pressable onPress={() => removeItem(item.id)} hitSlop={10} style={{ paddingLeft: 10 }} accessibilityLabel={`Quitar ${item.label}`}>
                      <Icon name="close" size={16} color={colors.muted} />
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
            <Divider />
            <AddItem onAdd={(label) => addItem(group, label)} />
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
      <Pressable onPress={() => setOpen(true)} style={styles.add}>
        <Icon name="plus" size={16} color={colors.forest} weight="regular" />
        <Text style={styles.addText}>Agregar otra</Text>
      </Pressable>
    );
  }
  return (
    <View style={[styles.add, { gap: 10 }]}>
      <TextInput value={label} onChangeText={setLabel} placeholder="Nombre" placeholderTextColor={colors.muted} autoFocus onSubmitEditing={submit} style={styles.addInput} />
      <Button label="Agregar" variant="secondary" compact onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  total: { fontFamily: fonts.display, fontSize: 26, color: colors.ink, fontVariant: ['tabular-nums'] },
  groupHead: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, paddingBottom: 6 },
  subtotal: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.forest, fontVariant: ['tabular-nums'] },
  add: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14 },
  addText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.forest },
  addInput: {
    flex: 1,
    minWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 8,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    outlineStyle: 'none',
  } as object,
});
