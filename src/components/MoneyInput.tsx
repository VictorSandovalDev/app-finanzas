import { StyleSheet, TextInput, View } from 'react-native';

import { T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/theme/tokens';

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
    <View style={[styles.row, compact && { paddingVertical: space.sm }]}>
      <View style={{ flex: 1 }}>
        <T variant="bodyStrong" style={{ fontSize: compact ? 14 : 15 }}>{label}</T>
        {hint ? <T variant="small">{hint}</T> : null}
      </View>
      <View style={styles.field}>
        <T style={styles.prefix}>$</T>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
  },
  prefix: { color: colors.warmGray, fontFamily: fonts.sansMedium },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 4,
    textAlign: 'right',
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: colors.ink,
    outlineStyle: 'none',
  } as object,
});
