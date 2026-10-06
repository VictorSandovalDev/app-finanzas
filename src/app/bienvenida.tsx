import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sprite } from '@/components/Sprite';
import { ChunkyButton, T, useGutter, useWide } from '@/components/ui';
import { ValleyScene } from '@/components/ValleyScene';
import { LEVELS } from '@/data/levels';
import { useJourney } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

export default function Onboarding() {
  const { update } = useJourney();
  const insets = useSafeAreaInsets();
  const gutter = useGutter();
  const wide = useWide(880);
  const [step, setStep] = useState<'intro' | 'name'>('intro');
  const [name, setName] = useState('');

  const start = () => {
    if (!name.trim()) return;
    update((s) => ({ ...s, name: name.trim(), onboarded: true, joinedAt: s.joinedAt ?? new Date().toISOString() }));
    router.replace('/nivel/1');
  };

  const content =
    step === 'intro' ? (
      <>
        <Speech text="¡Hola! Soy Victor. Te acompaño en cada estación." />
        <View style={{ gap: 10 }}>
          <T variant="title" style={styles.hero}>
            No es un curso.{'\n'}Es tu viaje.
          </T>
          <T style={styles.lead}>Seis estaciones para entender, organizar y dirigir tu dinero. Una misión a la vez.</T>
        </View>
        <View style={styles.chips}>
          {LEVELS.map((l) => (
            <View key={l.id} style={[styles.chip, l.id === 1 && { backgroundColor: colors.verde }]}>
              <Text style={[styles.chipText, l.id === 1 && { color: colors.bg }]}>
                {l.id} {l.stage.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
        <View style={{ gap: 12, maxWidth: 420 }}>
          <ChunkyButton label="Empezar mi viaje" onPress={() => setStep('name')} />
        </View>
      </>
    ) : (
      <>
        <Speech text="Antes de partir, ¿cómo te llamo?" />
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre"
          placeholderTextColor={colors.lockedDark}
          autoFocus
          returnKeyType="go"
          onSubmitEditing={start}
          style={styles.input}
          accessibilityLabel="Tu nombre"
        />
        <View style={{ gap: 12, maxWidth: 420 }}>
          <ChunkyButton label="Iniciar mi viaje" disabled={!name.trim()} onPress={start} />
          <ChunkyButton label="Atrás" variant="secondary" size="md" onPress={() => setStep('intro')} />
        </View>
      </>
    );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[{ flexGrow: 1 }, wide && { flexDirection: 'row' }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={wide ? { flex: 1, minHeight: 480 } : { paddingTop: insets.top, backgroundColor: '#FDDC8A' }}>
          <ValleyScene height={wide ? undefined : 300} />
        </View>
        <View
          style={[
            styles.panel,
            { paddingHorizontal: wide ? 56 : gutter, paddingBottom: insets.bottom + 32, paddingTop: wide ? insets.top + 32 : 24 },
          ]}
        >
          {content}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Speech({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
      <Sprite name="mentor" width={64} />
      <View style={styles.speech}>
        <T variant="bodyStrong" style={{ fontFamily: fonts.bold }}>{text}</T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { flex: 1, justifyContent: 'center', gap: 24 },
  hero: { fontSize: 38, lineHeight: 40 },
  lead: { fontFamily: fonts.semi, fontSize: 17, lineHeight: 25, maxWidth: 420 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: colors.divider, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  chipText: { fontFamily: fonts.game, fontSize: 11, color: colors.inkSoft },
  speech: {
    flexShrink: 1,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    maxWidth: 420,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.title,
    fontSize: 22,
    color: colors.bosque,
    outlineStyle: 'none',
  } as object,
});
