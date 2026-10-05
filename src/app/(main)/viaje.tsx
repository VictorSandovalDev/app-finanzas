import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { GroupCard } from '@/components/GroupCard';
import { Icon } from '@/components/Icon';
import { JourneyMap } from '@/components/JourneyMap';
import { ProgressRing } from '@/components/ProgressRing';
import { Button, Card, Pill, Screen, T } from '@/components/ui';
import { formatCOP, getLevel } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { getCurrentLevel, getDeliverables, getJourneyProgress, getNextLockedLevel, getNextMissionHref } from '@/state/missions';
import { colors, radius, space } from '@/theme/tokens';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

export default function Dashboard() {
  const { state } = useJourney();
  const current = getCurrentLevel(state);
  const next = getNextLockedLevel(state);
  const progress = getJourneyProgress(state);
  const lastAchievement = state.achievements[state.achievements.length - 1];
  const deliverables = getDeliverables(state);
  const started = state.unlocked.length > 0;

  return (
    <Screen>
      <View style={styles.header}>
        <T variant="label">Viaje Financiero</T>
        <T variant="display" style={{ marginTop: space.sm }}>
          {greeting()}
          {state.name ? `,\n${state.name}` : ''}
        </T>
      </View>

      <Card tone="forest" style={{ gap: space.lg, padding: space.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          <ProgressRing value={progress} onDark />
          <View style={{ flex: 1, gap: 4 }}>
            <T variant="label" style={{ color: colors.champagne }}>
              {current ? `Nivel ${current.id} · ${current.stage}` : started ? 'Estación completada' : 'Punto de partida'}
            </T>
            <T variant="heading" style={{ color: colors.ivory }}>
              {current ? current.title : started ? 'Tu siguiente estación te espera' : 'Tu viaje está por comenzar'}
            </T>
          </View>
        </View>
        {lastAchievement ? <Pill tone="ink" icon="sparkle" label={lastAchievement.title} /> : null}
        <Button
          label={current ? 'Continuar mi misión' : next ? `Desbloquear Nivel ${next.id}` : 'Ver mi pasaporte'}
          variant="gold"
          icon="arrowRight"
          onPress={() => router.push(current ? getNextMissionHref(state) : next ? `/nivel/${next.id}` : '/perfil')}
        />
      </Card>

      {current?.whatsappUrl ? (
        <View style={{ marginTop: space.lg }}>
          <GroupCard level={current} />
        </View>
      ) : null}

      <Section title="Tu mapa" caption="Descubrir → Entender → Conocer → Organizar → Dirigir → Construir" />
      <JourneyMap state={state} currentId={current?.id} />

      <Section title="Tus entregables" action="Ver todos" onAction={() => router.push('/entregables')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md, paddingRight: space.xl }}>
        {deliverables.map((d) => (
          <Card
            key={d.id}
            tone={d.ready ? 'surface' : 'paper'}
            style={styles.deliverable}
            onPress={d.ready ? () => router.push(d.href) : undefined}
          >
            <Icon name={d.ready ? 'doc' : 'lock'} color={d.ready ? colors.forest : colors.warmGray} />
            <T variant="bodyStrong" style={{ color: d.ready ? colors.ink : colors.warmGray }} numberOfLines={3}>
              {d.title}
            </T>
            <T variant="small">{d.ready ? 'Listo para consultar' : `Nivel ${d.levelId}`}</T>
          </Card>
        ))}
      </ScrollView>

      {next && (
        <>
          <Section title="Siguiente estación" />
          <Card style={{ gap: space.md }} onPress={() => router.push(`/nivel/${next.id}`)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Pill tone="champagne" icon="lock" label={`Nivel ${next.id} · ${next.stage}`} />
              <T variant="bodyStrong">{formatCOP(next.price)}</T>
            </View>
            <T variant="heading">{next.title}</T>
            <T variant="small">{next.promise}</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <T variant="bodyStrong" style={{ color: colors.forest }}>
                {getLevel(next.id)?.available ? 'Ver lo que te espera' : 'Próximamente'}
              </T>
              <Icon name="arrowRight" size={16} color={colors.forest} />
            </View>
          </Card>
        </>
      )}
    </Screen>
  );
}

function Section({ title, caption, action, onAction }: { title: string; caption?: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.section}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <T variant="title" style={{ fontSize: 26 }}>{title}</T>
        {action ? (
          <T variant="bodyStrong" style={{ color: colors.forest, fontSize: 13 }} onPress={onAction}>
            {action}
          </T>
        ) : null}
      </View>
      {caption ? <T variant="small" style={{ marginTop: 4 }}>{caption}</T> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: space.xl, paddingBottom: space.xl },
  section: { marginTop: space.xxxl, marginBottom: space.lg },
  deliverable: { width: 158, minHeight: 150, gap: space.sm, padding: space.lg, borderRadius: radius.md },
});
