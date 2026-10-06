import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FadeUp } from '@/components/motion';
import { RouteIllustration } from '@/components/RouteIllustration';
import { Button, T, useGutter, useWide } from '@/components/ui';
import { LEVELS } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

export default function Onboarding() {
  const { update } = useJourney();
  const insets = useSafeAreaInsets();
  const gutter = useGutter();
  const wide = useWide(900);
  const [step, setStep] = useState<'intro' | 'name'>('intro');
  const [name, setName] = useState('');

  const start = () => {
    if (!name.trim()) return;
    update((s) => ({ ...s, name: name.trim(), onboarded: true, joinedAt: s.joinedAt ?? new Date().toISOString() }));
    router.replace('/nivel/1');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, flexDirection: wide ? 'row' : 'column' }}>
      <View style={wide ? { flex: 1 } : { paddingTop: insets.top, backgroundColor: colors.forestDeep }}>
        <RouteIllustration height={wide ? 800 : 280} />
      </View>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.panel, { paddingHorizontal: wide ? 64 : gutter, paddingBottom: insets.bottom + 32, paddingTop: wide ? insets.top + 48 : 32 }]}
      >
        {step === 'intro' ? (
          <FadeUp key="intro" style={{ gap: 28 }}>
            <View style={{ gap: 14 }}>
              <T variant="label">Viaje Financiero</T>
              <T variant="display" style={styles.hero}>
                No es un curso.{'\n'}Es tu viaje.
              </T>
              <T style={styles.lead}>Seis estaciones para entender, organizar y dirigir tu dinero, con un mentor que te acompaña en cada una.</T>
            </View>
            <View style={styles.stages}>
              {LEVELS.map((l, i) => (
                <T key={l.id} style={[styles.stage, i === 0 && { color: colors.forest }]}>
                  {l.stage}
                  {i < LEVELS.length - 1 ? <T style={styles.sep}>  ·  </T> : null}
                </T>
              ))}
            </View>
            <Button label="Empezar mi viaje" icon="arrowRight" onPress={() => setStep('name')} style={{ maxWidth: 420 }} />
          </FadeUp>
        ) : (
          <FadeUp key="name" style={{ gap: 24 }}>
            <View style={{ gap: 12 }}>
              <T variant="label">Antes de partir</T>
              <T variant="display">¿Cómo te llamamos?</T>
              <T>Victor, tu mentor, te saludará por tu nombre en cada estación.</T>
            </View>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              placeholderTextColor={colors.line}
              autoFocus
              returnKeyType="go"
              onSubmitEditing={start}
              style={styles.input}
              accessibilityLabel="Tu nombre"
            />
            <View style={{ gap: 4, maxWidth: 420 }}>
              <Button label="Iniciar mi viaje" icon="arrowRight" disabled={!name.trim()} onPress={start} />
              <Button label="Atrás" variant="quiet" onPress={() => setStep('intro')} />
            </View>
          </FadeUp>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { flexGrow: 1, justifyContent: 'center', maxWidth: 560 },
  hero: { fontSize: 40, lineHeight: 46 },
  lead: { fontSize: 17, lineHeight: 26, maxWidth: 440 },
  stages: { flexDirection: 'row', flexWrap: 'wrap' },
  stage: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.muted },
  sep: { color: colors.line },
  input: {
    maxWidth: 420,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink,
    paddingVertical: 10,
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.ink,
    outlineStyle: 'none',
  } as object,
});
