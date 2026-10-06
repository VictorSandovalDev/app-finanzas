import { StyleSheet, Text, TextInput, View } from 'react-native';

import { T } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';

const format = (n: number) => (n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');

export function MoneyInput({ label, hint, value, onChange }: { label: string; hint?: string; value: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T variant="bodyStrong" numberOfLines={1}>{label}</T>
        {hint ? <T variant="small" numberOfLines={1}>{hint}</T> : null}
      </View>
      <View style={styles.field}>
        <Text style={styles.prefix}>$</Text>
        <TextInput
          value={format(value)}
          onChangeText={(t) => onChange(Number(t.replace(/\D/g, '').slice(0, 12)) || 0)}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.line}
          style={styles.input}
          accessibilityLabel={label}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 144,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  prefix: { fontFamily: fonts.sans, fontSize: 16, color: colors.muted },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 8,
    paddingLeft: 4,
    textAlign: 'right',
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
    outlineStyle: 'none',
  } as object,
});
