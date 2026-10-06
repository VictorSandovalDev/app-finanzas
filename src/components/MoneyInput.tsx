import { StyleSheet, Text, TextInput, View } from 'react-native';

import { T } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';

const format = (n: number) => (n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');

export function MoneyInput({
  label,
  hint,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (n: number) => void;
  compact?: boolean;
}) {
  return (
    <View style={[styles.row, compact && { paddingVertical: 8 }]}>
      <View style={{ flex: 1 }}>
        <T variant="bodyStrong" style={{ fontSize: compact ? 14 : 15 }}>{label}</T>
        {hint ? <T variant="small" style={{ fontSize: 12 }}>{hint}</T> : null}
      </View>
      <View style={styles.field}>
        <Text style={styles.prefix}>$</Text>
        <TextInput
          value={format(value)}
          onChangeText={(t) => onChange(Number(t.replace(/\D/g, '').slice(0, 12)) || 0)}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.lockedDark}
          style={styles.input}
          accessibilityLabel={label}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  prefix: { fontFamily: fonts.heavy, fontSize: 15, color: colors.muted },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 4,
    textAlign: 'right',
    fontFamily: fonts.title,
    fontSize: 15,
    color: colors.ink,
    outlineStyle: 'none',
  } as object,
});
