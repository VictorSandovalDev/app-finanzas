import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { useBreath } from '@/components/motion';
import { BackButton, Button, Progress, T, useGutter } from '@/components/ui';
import { buildTransformation, MAX_FOLLOW_UPS, mentorRespond } from '@/services/mentor';
import { ChatMessage, useJourney } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

const uid = () => Math.random().toString(36).slice(2, 10);
const TOTAL_STEPS = MAX_FOLLOW_UPS + 2;
const SUGGESTIONS = ['Me da ansiedad revisar mis cuentas', 'No sé en qué se me va el dinero', 'En casa nunca se hablaba de dinero'];
const WAVE = [6, 11, 16, 9, 18, 13, 8, 15, 19, 11, 7, 14, 17, 10, 6, 12];

export default function Relato() {
  const { state, update } = useJourney();
  const insets = useSafeAreaInsets();
  const gutter = useGutter();
  const { messages, ready, followUps, map } = state.level1;
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [building, setBuilding] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  useEffect(() => {
    if (messages.length > 0) return;
    const name = state.name ? `, ${state.name}` : '';
    update((s) => ({
      ...s,
      level1: {
        ...s.level1,
        messages: [
          {
            id: uid(),
            from: 'mentor',
            kind: 'text',
            text: `Hola${name}. Antes de hablar de números, quiero entender tu historia. ¿Qué está pasando con tu dinero y qué te gustaría cambiar?`,
          },
        ],
      },
    }));
  }, [messages.length, state.name, update]);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages.length, thinking, ready]);

  if (!state.unlocked.includes(1)) return <Redirect href="/nivel/1" />;

  const userTurns = messages.filter((m) => m.from === 'user').length;
  const progress = map ? TOTAL_STEPS : ready ? TOTAL_STEPS - 1 : Math.min(userTurns, TOTAL_STEPS - 2);

  const send = async (message: ChatMessage) => {
    const next = [...messages, message];
    update((s) => ({ ...s, level1: { ...s.level1, messages: next } }));
    setThinking(true);
    const turn = await mentorRespond(next, followUps);
    setThinking(false);
    update((s) => ({
      ...s,
      level1: {
        ...s.level1,
        messages: [...s.level1.messages, { id: uid(), from: 'mentor', kind: 'text', text: turn.reply }],
        followUps: turn.readyForMap ? s.level1.followUps : s.level1.followUps + 1,
        ready: turn.readyForMap,
      },
    }));
  };

  const sendText = (raw: string) => {
    const text = raw.trim();
    if (!text || thinking) return;
    setDraft('');
    send({ id: uid(), from: 'user', kind: 'text', text });
  };

  const toggleRecording = async () => {
    setMicError(null);
    if (recorderState.isRecording) {
      const durationSec = Math.round(recorderState.durationMillis / 1000);
      await recorder.stop();
      if (recorder.uri) send({ id: uid(), from: 'user', kind: 'audio', audioUri: recorder.uri, durationSec });
      return;
    }
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setMicError('Necesitamos permiso del micrófono para grabar tu audio.');
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      setMicError('No pudimos acceder al micrófono en este dispositivo.');
    }
  };

  const generate = async () => {
    setBuilding(true);
    const result = await buildTransformation(messages);
    update((s) => ({ ...s, level1: { ...s.level1, map: result.map, mantras: result.mantras } }));
    setBuilding(false);
    router.replace('/mision/mapa-personal');
  };

  const recording = recorderState.isRecording;
  const column = { width: '100%' as const, maxWidth: 720, alignSelf: 'center' as const, paddingHorizontal: gutter };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <View style={styles.header}>
          <View style={[column, { gap: 12, paddingBottom: 14 }]}>
            <BackButton onPress={() => (router.canGoBack() ? router.back() : router.replace('/nivel/1'))} label="Estación 1" />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.monogram}>
                <Text style={styles.monogramText}>V</Text>
              </View>
              <View style={{ flex: 1 }}>
                <T variant="bodyStrong">Victor</T>
                <T variant="small">Tu mentor · ¿Por qué estás aquí?</T>
              </View>
              <Text style={styles.step}>
                {progress} de {TOTAL_STEPS}
              </Text>
            </View>
            <Progress value={(progress / TOTAL_STEPS) * 100} height={2} />
          </View>
        </View>

        <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={[column, { paddingVertical: 20, gap: 14 }]}>
          {messages.map((m) => (
            <Bubble key={m.id} message={m} />
          ))}
          {thinking && <Typing />}
          {ready && !map && (
            <View style={styles.ready}>
              <T variant="label" style={{ color: colors.brassSoft }}>Siguiente paso</T>
              <T variant="title" style={{ color: colors.onDark, fontSize: 22, lineHeight: 28 }}>Tu Mapa Personal de Transformación</T>
              <T style={{ color: colors.onDarkMuted }}>Victor ordenará tu situación, lo que piensas, lo que crees, lo que sientes y lo que haces.</T>
              <Button label={building ? 'Construyendo tu mapa…' : 'Crear mi mapa'} variant="light" icon="arrowRight" loading={building} onPress={generate} />
            </View>
          )}
          {map && <Button label="Ver mi Mapa Personal" icon="arrowRight" onPress={() => router.push('/mision/mapa-personal')} />}
        </ScrollView>

        {!map && (
          <View style={styles.composer}>
            <View style={[column, { gap: 10, paddingTop: 10, paddingBottom: 12 }]}>
              {!ready && userTurns === 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8 }}>
                  {SUGGESTIONS.map((c) => (
                    <Pressable key={c} onPress={() => sendText(c)} style={({ pressed }) => [styles.suggestion, pressed && { opacity: 0.7 }]}>
                      <Text style={styles.suggestionText}>{c}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
              {micError && <T variant="small" style={{ color: colors.umber }}>{micError}</T>}
              {recording ? (
                <View style={styles.inputRow}>
                  <View style={styles.recording}>
                    <RecordingDot />
                    <Text style={styles.recText}>Grabando · {Math.floor(recorderState.durationMillis / 1000)} s</Text>
                  </View>
                  <RoundButton icon="stop" label="Detener y enviar" onPress={toggleRecording} tone="umber" />
                </View>
              ) : (
                <View style={styles.inputRow}>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    onSubmitEditing={() => sendText(draft)}
                    placeholder="Escribe a Victor…"
                    placeholderTextColor={colors.muted}
                    editable={!thinking}
                    multiline
                    style={styles.input}
                  />
                  {draft.trim() ? (
                    <RoundButton icon="send" label="Enviar" onPress={() => sendText(draft)} disabled={thinking} />
                  ) : (
                    <RoundButton icon="mic" label="Grabar audio" onPress={toggleRecording} disabled={thinking} tone="quiet" />
                  )}
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const mine = message.from === 'user';
  return (
    <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
      {message.kind === 'audio' && message.audioUri ? (
        <AudioBubble uri={message.audioUri} duration={message.durationSec ?? 0} />
      ) : (
        <Text style={[styles.bubbleText, mine && { color: colors.onDark }]}>{message.text}</Text>
      )}
    </View>
  );
}

function AudioBubble({ uri, duration }: { uri: string; duration: number }) {
  const player = useAudioPlayer(uri);
  return (
    <Pressable
      onPress={() => {
        player.seekTo(0);
        player.play();
      }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
      accessibilityLabel="Reproducir audio"
    >
      <Icon name="play" size={18} color={colors.onDark} weight="fill" />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, height: 22 }}>
        {WAVE.map((h, i) => (
          <View key={i} style={{ width: 2, height: h, borderRadius: 1, backgroundColor: 'rgba(244,241,233,0.7)' }} />
        ))}
      </View>
      <Text style={styles.duration}>
        {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
      </Text>
    </Pressable>
  );
}

function Typing() {
  return (
    <View style={[styles.bubble, styles.theirs, { flexDirection: 'row', gap: 6, paddingVertical: 16 }]}>
      {[0, 1, 2].map((i) => (
        <Dot key={i} index={i} />
      ))}
    </View>
  );
}

function Dot({ index }: { index: number }) {
  const v = useBreath(1200 + index * 150);
  return <Animated.View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.muted, opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }) }} />;
}

function RecordingDot() {
  const v = useBreath(1000);
  return <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.umber, opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }} />;
}

function RoundButton({ icon, label, onPress, disabled, tone = 'forest' }: { icon: 'send' | 'mic' | 'stop'; label: string; onPress: () => void; disabled?: boolean; tone?: 'forest' | 'quiet' | 'umber' }) {
  const bg = tone === 'forest' ? colors.forest : tone === 'umber' ? colors.umber : colors.surface;
  const fg = tone === 'quiet' ? colors.forest : colors.onDark;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.round, { backgroundColor: bg }, tone === 'quiet' && styles.roundQuiet, (pressed || disabled) && { opacity: 0.6 }]}
    >
      <Icon name={icon} size={20} color={fg} weight={tone === 'quiet' ? 'regular' : 'fill'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  monogram: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  monogramText: { fontFamily: fonts.display, fontSize: 21, lineHeight: 24, color: colors.onDark },
  step: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted, fontVariant: ['tabular-nums'] },
  bubble: { maxWidth: '86%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18 },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderBottomLeftRadius: 6 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.forest, borderBottomRightRadius: 6 },
  bubbleText: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.ink },
  duration: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.onDark, fontVariant: ['tabular-nums'] },
  ready: { backgroundColor: colors.forest, borderRadius: 16, padding: 20, gap: 12, marginTop: 6 },
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
  recording: { flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 23, backgroundColor: colors.umberSoft },
  recText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.umber },
  round: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  roundQuiet: { borderWidth: 1, borderColor: colors.line },
});
