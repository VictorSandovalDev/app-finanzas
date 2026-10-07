import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AudioMessage } from '@/components/AudioMessage';
import { Icon } from '@/components/Icon';
import { useBreath } from '@/components/motion';
import { BackButton, Button, MentorAvatar, T, useGutter } from '@/components/ui';
import { MessageRow } from '@/services/supabase';
import { useAuth } from '@/state/auth';
import { useConversation } from '@/state/conversation';
import { useJourney } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

const SUGGESTIONS = ['Me da ansiedad revisar mis cuentas', 'No sé en qué se me va el dinero', 'En casa nunca se hablaba de dinero'];

export default function Relato() {
  const { session } = useAuth();
  const { state } = useJourney();
  const insets = useSafeAreaInsets();
  const gutter = useGutter();
  const memberId = session?.user.id;
  const { messages, loading, sendText, sendAudio } = useConversation(memberId, 1, 'member');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages.length]);

  if (!state.unlocked.includes(1)) return <Redirect href="/nivel/1" />;

  const map = state.level1.map;
  const memberTurns = messages.filter((m) => m.sender === 'member').length;
  const lastIsMine = messages[messages.length - 1]?.sender === 'member';

  const submit = async (raw: string) => {
    if (!raw.trim() || sending) return;
    setSending(true);
    setError(null);
    setDraft('');
    const message = await sendText(raw);
    setSending(false);
    if (message) {
      setError(message);
      setDraft(raw);
    }
  };

  const toggleRecording = async () => {
    setError(null);
    if (recorderState.isRecording) {
      const durationSec = Math.max(1, Math.round(recorderState.durationMillis / 1000));
      await recorder.stop();
      if (!recorder.uri) return;
      setSending(true);
      const message = await sendAudio(recorder.uri, durationSec);
      setSending(false);
      if (message) setError(message);
      return;
    }
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError('Necesitamos permiso del micrófono para grabar tu audio.');
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      setError('No pudimos acceder al micrófono en este dispositivo.');
    }
  };

  const recording = recorderState.isRecording;
  const column = { width: '100%' as const, maxWidth: 720, alignSelf: 'center' as const, paddingHorizontal: gutter };
  const greeting = `Hola${state.name ? `, ${state.name}` : ''}. Antes de hablar de números, quiero entender tu historia. ¿Qué está pasando con tu dinero y qué te gustaría cambiar? Puedes escribirme o enviarme un audio.`;

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <View style={styles.header}>
          <View style={[column, { gap: 12, paddingBottom: 14 }]}>
            <BackButton onPress={() => (router.canGoBack() ? router.back() : router.replace('/nivel/1'))} label="Estación 1" />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <MentorAvatar />
              <View style={{ flex: 1 }}>
                <T variant="bodyStrong">Victor</T>
                <T variant="small">Tu mentor · responde en el día</T>
              </View>
            </View>
          </View>
        </View>

        <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={[column, { paddingVertical: 20, gap: 14 }]}>
          <View style={[styles.bubble, styles.theirs]}>
            <Text style={styles.bubbleText}>{greeting}</Text>
          </View>
          {loading ? <ActivityIndicator color={colors.accent} /> : messages.map((m) => <Bubble key={m.id} message={m} />)}

          {lastIsMine && !map && (
            <T variant="small" style={{ alignSelf: 'center', textAlign: 'center', paddingHorizontal: 24 }}>
              Victor lee cada mensaje y te responde personalmente. Te avisaremos aquí cuando responda.
            </T>
          )}

          {map ? (
            <View style={styles.ready}>
              <T variant="label" style={{ color: colors.warmSoft }}>Victor preparó tu entregable</T>
              <T variant="title" style={{ color: colors.onDark, fontSize: 22, lineHeight: 28 }}>Tu Mapa Personal de Transformación</T>
              <Button label="Ver mi mapa" variant="light" icon="arrowRight" onPress={() => router.push('/mision/mapa-personal')} />
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.composer}>
          <View style={[column, { gap: 10, paddingTop: 10, paddingBottom: 12 }]}>
            {memberTurns === 0 && !loading && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8 }}>
                {SUGGESTIONS.map((c) => (
                  <Pressable key={c} onPress={() => setDraft(c)} style={({ pressed }) => [styles.suggestion, pressed && { opacity: 0.7 }]}>
                    <Text style={styles.suggestionText}>{c}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
            {error && <T variant="small" style={{ color: colors.danger }}>{error}</T>}
            {recording ? (
              <View style={styles.inputRow}>
                <View style={styles.recording}>
                  <RecordingDot />
                  <Text style={styles.recText}>Grabando · {Math.floor(recorderState.durationMillis / 1000)} s</Text>
                </View>
                <RoundButton icon="stop" label="Detener y enviar" onPress={toggleRecording} tone="warn" />
              </View>
            ) : (
              <View style={styles.inputRow}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Escribe a Victor…"
                  placeholderTextColor={colors.muted}
                  multiline
                  style={styles.input}
                  accessibilityLabel="Mensaje para Victor"
                />
                {sending ? (
                  <View style={styles.round}>
                    <ActivityIndicator color={colors.accent} />
                  </View>
                ) : draft.trim() ? (
                  <RoundButton icon="send" label="Enviar" onPress={() => submit(draft)} />
                ) : (
                  <RoundButton icon="mic" label="Grabar audio" onPress={toggleRecording} tone="quiet" />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Bubble({ message }: { message: MessageRow }) {
  const mine = message.sender === 'member';
  return (
    <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
      {message.kind === 'audio' && message.audio_path ? (
        <AudioMessage path={message.audio_path} duration={message.duration_sec ?? 0} onDark={mine} />
      ) : (
        <Text style={[styles.bubbleText, mine && { color: colors.onDark }]}>{message.body}</Text>
      )}
    </View>
  );
}

function RecordingDot() {
  const v = useBreath(1000);
  return <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }} />;
}

function RoundButton({ icon, label, onPress, tone = 'accent' }: { icon: 'send' | 'mic' | 'stop'; label: string; onPress: () => void; tone?: 'accent' | 'quiet' | 'warn' }) {
  const bg = tone === 'accent' ? colors.accent : tone === 'warn' ? colors.danger : colors.surface;
  const fg = tone === 'quiet' ? colors.accent : colors.onDark;
  return (
    <Pressable onPress={onPress} accessibilityLabel={label} style={({ pressed }) => [styles.round, { backgroundColor: bg }, tone === 'quiet' && styles.roundQuiet, pressed && { opacity: 0.7 }]}>
      <Icon name={icon} size={20} color={fg} weight={tone === 'quiet' ? 'regular' : 'fill'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  bubble: { maxWidth: '86%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18 },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderBottomLeftRadius: 6 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.accent, borderBottomRightRadius: 6 },
  bubbleText: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.ink },
  ready: { backgroundColor: colors.accent, borderRadius: 16, padding: 20, gap: 12, marginTop: 6 },
  composer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, backgroundColor: colors.bg },
  suggestion: { borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colors.surface },
  suggestionText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 46,
    maxHeight: 130,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 23,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    outlineStyle: 'none',
  } as object,
  recording: { flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 23, backgroundColor: '#FDECEA' },
  recText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.danger },
  round: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  roundQuiet: { borderWidth: 1, borderColor: colors.line },
});
