import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Bob, Pop } from '@/components/motion';
import { Sprite } from '@/components/Sprite';
import { BackButton, ChunkyButton, GameLabel, MentorSays, ProgressBar, Screen } from '@/components/ui';
import { INDEPENDENCE_STAGES } from '@/data/content';
import { formatCOP } from '@/data/levels';
import { CostGroup, useJourney } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

const GROUP_LABEL: Record<CostGroup, string> = { esencial: 'Esenciales', personal: 'Personales', futuro: 'Futuro' };

export default function IndependenceNumber() {
  const { state } = useJourney();
  const { items, done, stage } = state.level3;
  if (!done) return <Redirect href="/mision/costo-de-vida" />;

  const total = items.reduce((s, i) => s + i.amount, 0);
  const income = state.level2.moneyMap?.income;
  const gap = income !== undefined ? total - income : undefined;
  const levelDone = state.completed.includes(3);
  const here = stage ?? 0;

  return (
    <Screen maxWidth={1000} contentStyle={{ gap: 22 }}>
      <BackButton />
      <View style={styles.hero}>
        <GameLabel color={colors.oro}>MI NÚMERO DE INDEPENDENCIA</GameLabel>
        <Text style={styles.heroLead}>Para sostener tu vida cada mes necesitas</Text>
        <Pop delay={200} duration={600}>
          <Text style={styles.number} adjustsFontSizeToFit numberOfLines={1}>
            {formatCOP(total)}
          </Text>
        </Pop>
        <View style={styles.parts}>
          {(Object.keys(GROUP_LABEL) as CostGroup[]).map((g) => (
            <View key={g} style={styles.part}>
              <Text style={styles.partText}>
                {GROUP_LABEL[g]} {formatCOP(items.filter((i) => i.group === g).reduce((s, i) => s + i.amount, 0))}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <GameLabel>EL CAMINO DE PUERTAS</GameLabel>
      <View style={styles.doors}>
        {INDEPENDENCE_STAGES.map((s, i) => {
          const isHere = i === here;
          const last = i === INDEPENDENCE_STAGES.length - 1;
          const past = i < here;
          return (
            <View key={s.title} style={styles.door}>
              {isHere && (
                <Bob duration={1600} steps={3}>
                  <View style={styles.you}>
                    <GameLabel size={10} color={colors.bg}>TÚ</GameLabel>
                  </View>
                </Bob>
              )}
              <Sprite
                name={last ? 'house' : 'door'}
                width={isHere || last ? 64 : 56}
                filter={isHere || last ? 'none' : 'grayscale'}
                opacity={isHere || last ? 1 : past ? 0.6 : 0.45}
              />
              <Text style={[styles.doorText, isHere && { color: colors.brasaText, fontFamily: fonts.title }, !isHere && !last && { color: colors.muted }]}>
                {s.title}
              </Text>
            </View>
          );
        })}
      </View>
      <ProgressBar value={((here + 0.5) / INDEPENDENCE_STAGES.length) * 100} color={colors.brasa} shade={colors.lacre} height={10} />

      <MentorSays>
        {gap === undefined ? (
          <Text style={styles.say}>Conocer este número es el primer paso para cubrirlo con tu propio dinero.</Text>
        ) : gap > 0 ? (
          <Text style={styles.say}>
            Hoy entran {formatCOP(income!)}. Te faltan <Text style={{ color: colors.brasaText, fontFamily: fonts.title }}>{formatCOP(gap)}</Text> al mes para cruzar la última puerta.
          </Text>
        ) : (
          <Text style={styles.say}>
            Hoy entran {formatCOP(income!)}: tu ingreso ya cubre tu vida. Te sobran{' '}
            <Text style={{ color: colors.verde, fontFamily: fonts.title }}>{formatCOP(-gap)}</Text> para construir futuro.
          </Text>
        )}
      </MentorSays>

      <View style={{ maxWidth: 420, gap: 10 }}>
        {levelDone ? (
          <ChunkyButton label="Ver mi pasaporte" onPress={() => router.replace('/perfil')} />
        ) : (
          <ChunkyButton label="Guardar y volver a la estación" onPress={() => router.replace('/nivel/3')} />
        )}
        <ChunkyButton label="Ajustar mis cifras" variant="secondary" size="md" onPress={() => router.push('/mision/costo-de-vida')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.bosque,
    borderBottomWidth: 6,
    borderBottomColor: colors.bosqueDeep,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 10,
  },
  heroLead: { fontFamily: fonts.bold, fontSize: 15, color: colors.verdeTint, textAlign: 'center' },
  number: { fontFamily: fonts.game, fontSize: 44, lineHeight: 50, color: colors.oro },
  parts: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, paddingTop: 6 },
  part: { backgroundColor: 'rgba(251,248,242,0.1)', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10 },
  partText: { fontFamily: fonts.heavy, fontSize: 13, color: colors.bg },
  doors: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  door: { flex: 1, alignItems: 'center', gap: 6 },
  you: { backgroundColor: colors.brasa, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  doorText: { fontFamily: fonts.heavy, fontSize: 12, lineHeight: 15, textAlign: 'center', color: colors.ink },
  say: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: colors.ink },
});
