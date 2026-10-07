import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FadeUp } from '@/components/motion';
import { BackButton, Button, Divider, MentorNote, Screen, SectionTitle, Surface, T } from '@/components/ui';
import { INDEPENDENCE_STAGES } from '@/data/content';
import { formatCOP } from '@/data/levels';
import { CostGroup, useJourney } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

const GROUP_LABEL: Record<CostGroup, string> = { esencial: 'Necesidades esenciales', personal: 'Necesidades personales', futuro: 'Construcción de futuro' };

export default function IndependenceNumber() {
  const { state } = useJourney();
  const { items, done, stage } = state.level3;
  if (!done) return <Redirect href="/mision/costo-de-vida" />;

  const total = items.reduce((s, i) => s + i.amount, 0);
  const income = state.level2.moneyMap?.income;
  const gap = income !== undefined ? total - income : undefined;
  const here = stage ?? 0;

  return (
    <Screen>
      <BackButton />
      <FadeUp>
        <Surface tone="dark" style={{ gap: 10 }}>
          <T variant="label" style={{ color: colors.warmSoft }}>Mi Número de Independencia</T>
          <T style={{ color: colors.onDarkMuted }}>Para sostener tu vida cada mes necesitas</T>
          <Text style={styles.number} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {formatCOP(total)}
          </Text>
          <T variant="small" style={{ color: colors.onDarkMuted }}>{formatCOP(total * 12)} al año</T>
        </Surface>
      </FadeUp>

      <View>
        <SectionTitle title="Cómo se compone" />
        {(Object.keys(GROUP_LABEL) as CostGroup[]).map((g) => (
          <View key={g}>
            <View style={styles.row}>
              <T style={{ flex: 1, color: colors.ink }}>{GROUP_LABEL[g]}</T>
              <Text style={styles.amount}>{formatCOP(items.filter((i) => i.group === g).reduce((s, i) => s + i.amount, 0))}</Text>
            </View>
            <Divider />
          </View>
        ))}
      </View>

      <View style={{ gap: 16 }}>
        <SectionTitle title="El camino" />
        <View style={styles.steps}>
          {INDEPENDENCE_STAGES.map((s, i) => (
            <View key={s.title} style={styles.step}>
              <View style={styles.track}>
                <View style={[styles.segment, i === 0 && { opacity: 0 }, { backgroundColor: i <= here ? colors.accent : colors.line }]} />
                <View style={[styles.dot, i < here && styles.dotPast, i === here && styles.dotHere]} />
                <View style={[styles.segment, i === INDEPENDENCE_STAGES.length - 1 && { opacity: 0 }, { backgroundColor: i < here ? colors.accent : colors.line }]} />
              </View>
              <Text style={[styles.stepText, i === here && { color: colors.ink, fontFamily: fonts.sansSemi }]}>{s.title}</Text>
            </View>
          ))}
        </View>
      </View>

      <MentorNote>
        {gap === undefined
          ? 'Conocer este número es el primer paso para cubrirlo con tu propio dinero.'
          : gap > 0
            ? `Hoy entran ${formatCOP(income!)}. Te faltan ${formatCOP(gap)} al mes para llegar a la independencia económica.`
            : `Hoy entran ${formatCOP(income!)}: tu ingreso ya cubre tu vida y te sobran ${formatCOP(-gap)} para construir futuro.`}
      </MentorNote>

      <View style={{ gap: 4 }}>
        {state.completed.includes(3) ? (
          <Button label="Ver mi pasaporte" icon="arrowRight" onPress={() => router.replace('/perfil')} />
        ) : (
          <Button label="Volver a la estación" icon="arrowRight" onPress={() => router.replace('/nivel/3')} />
        )}
        <Button label="Ajustar mis cifras" variant="quiet" onPress={() => router.push('/mision/costo-de-vida')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  number: { fontFamily: fonts.display, fontSize: 52, lineHeight: 60, color: colors.onDark, fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  amount: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.ink, fontVariant: ['tabular-nums'] },
  steps: { flexDirection: 'row' },
  step: { flex: 1, alignItems: 'center', gap: 10 },
  track: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  segment: { flex: 1, height: 1 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bg },
  dotPast: { backgroundColor: colors.accent, borderColor: colors.accent },
  dotHere: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.warm, borderColor: colors.warm },
  stepText: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: colors.muted, textAlign: 'center', paddingHorizontal: 2 },
});
