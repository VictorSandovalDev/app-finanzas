import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, T } from '@/components/ui';
import { useAuth } from '@/state/auth';
import { colors, fonts } from '@/theme/tokens';

type Mode = 'signup' | 'signin';

/** Create an account or sign in with email and password. */
export function AuthForm({ initialMode = 'signup', allowSignup = true, onDone }: { initialMode?: Mode; allowSignup?: boolean; onDone?: () => void }) {
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState<Mode>(allowSignup ? initialMode : 'signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const valid = email.includes('@') && password.length >= 8 && (mode === 'signin' || name.trim().length > 0);

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    const message = mode === 'signup' ? await signUp(name, email, password) : await signIn(email, password);
    setBusy(false);
    if (message) setError(message);
    else onDone?.();
  };

  return (
    <View style={{ gap: 18 }}>
      {allowSignup && (
        <View style={styles.switch}>
          {(['signup', 'signin'] as Mode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => {
                setMode(m);
                setError(null);
              }}
              style={[styles.switchItem, mode === m && styles.switchActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === m }}
            >
              <Text style={[styles.switchText, mode === m && { color: colors.ink }]}>{m === 'signup' ? 'Crear cuenta' : 'Ya tengo cuenta'}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {mode === 'signup' && (
        <Field label="Tu nombre" value={name} onChangeText={setName} autoComplete="name" textContentType="name" placeholder="Cómo quieres que te llamemos" />
      )}
      <Field
        label="Correo"
        value={email}
        onChangeText={setEmail}
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="tu@correo.com"
      />
      <Field
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        textContentType={mode === 'signup' ? 'newPassword' : 'password'}
        placeholder="Mínimo 8 caracteres"
        onSubmitEditing={submit}
      />

      {error && <T style={{ color: colors.danger }}>{error}</T>}
      <Button label={mode === 'signup' ? 'Crear mi cuenta' : 'Entrar'} icon="arrowRight" loading={busy} disabled={!valid} onPress={submit} />
    </View>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel={label} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  switch: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  switchItem: { paddingVertical: 10, marginRight: 22, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  switchActive: { borderBottomColor: colors.accent },
  switchText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.muted },
  label: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.inkSoft },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: colors.surface,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.ink,
    outlineStyle: 'none',
  } as object,
});
