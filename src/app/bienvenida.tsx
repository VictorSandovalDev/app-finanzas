import { Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FadeUp } from '@/components/motion';
import { RouteIllustration } from '@/components/RouteIllustration';
import { AuthForm } from '@/components/AuthForm';
import { BackButton, Button, T, useGutter, useWide } from '@/components/ui';
import { LEVELS } from '@/data/levels';
import { useAuth } from '@/state/auth';
import { colors, fonts } from '@/theme/tokens';

export default function Onboarding() {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const gutter = useGutter();
  const wide = useWide(900);
  const [step, setStep] = useState<'intro' | 'account'>('intro');

  // Signed in (or just created the account): let the index route decide where to go.
  if (session) return <Redirect href="/" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, flexDirection: wide ? 'row' : 'column' }}>
      {(wide || step === 'intro') && (
        <View style={wide ? { flex: 1 } : { paddingTop: insets.top, backgroundColor: colors.navy }}>
          <RouteIllustration height={wide ? 800 : 280} />
        </View>
      )}
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.panel,
          { paddingHorizontal: wide ? 64 : gutter, paddingBottom: insets.bottom + 32, paddingTop: wide || step === 'account' ? insets.top + 40 : 32 },
        ]}
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
                <T key={l.id} style={[styles.stage, i === 0 && { color: colors.accent }]}>
                  {l.stage}
                  {i < LEVELS.length - 1 ? <T style={styles.sep}>  ·  </T> : null}
                </T>
              ))}
            </View>
            <Button label="Empezar mi viaje" icon="arrowRight" onPress={() => setStep('account')} style={{ maxWidth: 420 }} />
          </FadeUp>
        ) : (
          <FadeUp key="account" style={{ gap: 24, maxWidth: 440 }}>
            <BackButton onPress={() => setStep('intro')} />
            <View style={{ gap: 10 }}>
              <T variant="label">Tu cuenta</T>
              <T variant="display">Guarda tu viaje</T>
              <T>Con tu cuenta, tu progreso y tus conversaciones con Victor te acompañan en cualquier dispositivo.</T>
            </View>
            <AuthForm />
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
});
