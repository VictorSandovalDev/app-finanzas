import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { MoneyInput } from '@/components/MoneyInput';
import { Button, Card, Divider, Screen, T, TopBar } from '@/components/ui';
import { COST_GROUPS, COST_TEMPLATE } from '@/data/content';
import { formatCOP } from '@/data/levels';
import { CostGroup, CostItem, useJourney } from '@/state/journey';
import { colors, fonts, radius, space } from '@/theme/tokens';

export default function CostOfLife() {
  const { state, update } = useJourney();
  const [items, setItems] = useState<CostItem[]>(
    state.level3.items.length ? state.level3.items : COST_TEMPLATE.map((t) => ({ ...t, amount: 0 })),
  );

  if (!state.unlocked.includes(3)) return <Redirect href="/nivel/3" />;

  const total = items.reduce((sum, i) => sum + i.amount, 0);
  const essentials = items.filter((i) => i.group === 'esencial').reduce((sum, i) => sum + i.amount, 0);

  const setAmount = (id: string, amount: number) => setItems((list) => list.map((i) => (i.id === id ? { ...i, amount } : i)));
  const addItem = (group: CostGroup, label: string) =>
    setItems((list) => [...list, { id: `custom-${Date.now()}`, label, amount: 0, group }]);
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
            <T variant="label">Tu vida cuesta al mes</T>
            <T style={styles.total}>{formatCOP(total)}</T>
          </View>
          <Button label="Revelar mi Número de Independencia" icon="sparkle" disabled={essentials === 0} onPress={finish} />
        </>
      }
    >
      <TopBar title="Nivel 3 · Costo de vida" />
      <View style={{ gap: space.md, paddingVertical: space.md }}>
        <T variant="title">¿Cuánto cuesta sostener tu vida?</T>
        <T>Empieza por lo esencial. Usa valores mensuales; si algo se paga cada año, divídelo entre doce.</T>
      </View>

      {(Object.keys(COST_GROUPS) as CostGroup[]).map((group) => {
        const groupItems = items.filter((i) => i.group === group);
        const subtotal = groupItems.reduce((sum, i) => sum + i.amount, 0);
        return (
          <View key={group} style={{ marginTop: space.xl }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <T variant="heading">{COST_GROUPS[group].title}</T>
              <T variant="bodyStrong" style={{ color: colors.forest }}>{formatCOP(subtotal)}</T>
            </View>
            <T variant="small" style={{ marginBottom: space.sm }}>{COST_GROUPS[group].hint}</T>
            <Card style={{ paddingVertical: space.sm }}>
              {groupItems.map((item, idx) => (
                <View key={item.id}>
                  {idx > 0 && <Divider />}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <MoneyInput compact label={item.label} value={item.amount} onChange={(n) => setAmount(item.id, n)} />
                    </View>
                    {item.id.startsWith('custom-') && (
                      <Pressable onPress={() => removeItem(item.id)} hitSlop={10} style={{ paddingLeft: space.sm }} accessibilityLabel={`Quitar ${item.label}`}>
                        <Icon name="close" size={16} color={colors.warmGray} />
                      </Pressable>
                    )}
                  </View>
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
      <Pressable onPress={() => setOpen(true)} style={styles.add}>
        <T variant="bodyStrong" style={{ color: colors.forest, fontSize: 14 }}>+ Agregar otra</T>
      </Pressable>
    );
  }
  return (
    <View style={[styles.add, { flexDirection: 'row', gap: space.sm, alignItems: 'center' }]}>
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="Nombre"
        placeholderTextColor={colors.warmGray}
        autoFocus
        onSubmitEditing={submit}
        style={styles.addInput}
      />
      <Pressable onPress={submit} style={styles.addButton} accessibilityLabel="Agregar">
        <Icon name="check" size={18} color={colors.ivory} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm },
  total: { fontFamily: fonts.serif, fontSize: 28, color: colors.ink },
  add: { paddingTop: space.md, paddingBottom: space.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    outlineStyle: 'none',
  } as object,
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
});
