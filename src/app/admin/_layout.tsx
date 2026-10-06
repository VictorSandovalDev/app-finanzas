import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthForm } from '@/components/AuthForm';
import { Button, T, useGutter } from '@/components/ui';
import { useAuth } from '@/state/auth';
import { colors, fonts } from '@/theme/tokens';

/** Mentor area. Only accounts with role "mentor" get past this layout (RLS enforces the same on the data). */
export default function AdminLayout() {
  const { session, profile, loading, signOut } = useAuth();

  if (loading || (session && !profile)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.forest} />
      </View>
    );
  }

  if (!session) return <AdminSignIn />;

  if (profile?.role !== 'mentor') {
    return (
      <View style={[styles.center, { gap: 16, padding: 24 }]}>
        <T variant="title" style={{ textAlign: 'center' }}>Esta cuenta no es de mentor</T>
        <T style={{ textAlign: 'center', maxWidth: 380 }}>
          El panel es solo para el equipo que acompaña a los usuarios. Entra con una cuenta de mentor.
        </T>
        <Button label="Cerrar sesión" variant="secondary" onPress={signOut} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}

function AdminSignIn() {
  const insets = useSafeAreaInsets();
  const gutter = useGutter();
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      bottomOffset={24}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: gutter, paddingTop: insets.top + 32, paddingBottom: 48 }}
    >
      <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center', gap: 28 }}>
        <View style={{ gap: 10 }}>
          <Text style={styles.brand}>Viaje Financiero</Text>
          <T variant="display">Panel del mentor</T>
          <T>Responde a los usuarios y prepara sus entregables.</T>
        </View>
        <AuthForm allowSignup={false} />
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  brand: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 1.3, textTransform: 'uppercase', color: colors.moss },
});
