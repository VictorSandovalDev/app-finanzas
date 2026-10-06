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
import { Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { stepped, useLoop } from '@/components/motion';
import { Sprite } from '@/components/Sprite';
import { ChunkyButton, GameLabel, ProgressBar, T, useGutter } from '@/components/ui';
import { buildTransformation, MAX_FOLLOW_UPS, mentorRespond } from '@/services/mentor';
import { ChatMessage, useJourney } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

const uid = () => Math.random().toString(36).slice(2, 10);
const TOTAL_STEPS = MAX_FOLLOW_UPS + 2;
const CHIPS = ['Me da ansiedad', 'No sé en qué se me va', 'En casa nunca se hablaba de dinero'];
const WAVE = [8, 14, 20, 12, 22, 16, 10, 18, 24, 14, 9, 17, 21, 12, 8, 15, 19, 11];

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
  const column = { width: '100%' as const, maxWidth: 760, alignSelf: 'center' as const, paddingHorizontal: gutter };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <View style={[column, styles.top]}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/nivel/1'))} hitSlop={10} accessibilityLabel="Cerrar">
            <Text style={styles.close}>✕</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <ProgressBar value={(progress / TOTAL_STEPS) * 100} />
          </View>
          <GameLabel color={colors.muted}>
            {progress}/{TOTAL_STEPS}
          </GameLabel>
        </View>
        <View style={styles.headerBorder}>
          <View style={[column, styles.mentorRow]}>
            <Sprite name="mentor" width={56} />
            <View>
              <T variant="h2">Victor</T>
              <Text style={styles.role}>Tu mentor · Estación 1</Text>
            </View>
          </View>
        </View>

        <ScrollView ref={scrollRef} contentContainerStyle={[column, { paddingVertical: 16, gap: 12 }]}>
          {messages.map((m) => (
            <Bubble key={m.id} message={m} />
          ))}
          {thinking && <Typing />}
          {ready && !map && (
            <View style={styles.readyCard}>
              <GameLabel size={11} color={colors.oro}>LISTO PARA EL SIGUIENTE PASO</GameLabel>
              <T variant="h2" style={{ color: colors.bg }}>Tu Mapa Personal de Transformación</T>
              <T style={{ color: colors.verdeTint }}>Victor ordenará tu situación, lo que piensas, lo que crees, lo que sientes y lo que haces.</T>
              <ChunkyButton label={building ? 'Construyendo…' : 'Crear mi mapa'} variant="oro" loading={building} onPress={generate} />
            </View>
          )}
          {map && <ChunkyButton label="Ver mi Mapa Personal" onPress={() => router.push('/mision/mapa-personal')} />}
        </ScrollView>

        {!map && (
          <View style={styles.composerBorder}>
            <View style={[column, { gap: 10, paddingTop: 10, paddingBottom: insets.bottom + 14 }]}>
              {!ready && userTurns === 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {CHIPS.map((c) => (
                    <Pressable key={c} onPress={() => sendText(c)} style={({ pressed }) => [styles.chip, pressed && { marginTop: 2, borderBottomWidth: 2 }]}>
                      <Text style={styles.chipText}>{c}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
              {micError && <T variant="small" style={{ color: colors.lacre }}>{micError}</T>}
              {recording ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.recBox}>
                    <RecDot />
                    <Text style={styles.recText}>Grabando… {Math.floor(recorderState.durationMillis / 1000)}s</Text>
                  </View>
                  <ChunkyButton label="Enviar" variant="lacre" size="sm" onPress={toggleRecording} />
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    onSubmitEditing={() => sendText(draft)}
                    placeholder="Escribe a Victor…"
                    placeholderTextColor={colors.muted}
                    editable={!thinking}
                    style={styles.input}
                    returnKeyType="send"
                  />
                  <ChunkyButton label="Audio" variant="secondary" size="sm" onPress={toggleRecording} disabled={thinking} />
                  <ChunkyButton label="Enviar" size="sm" onPress={() => sendText(draft)} disabled={thinking || !draft.trim()} />
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
    <View style={[styles.bubbleRow, { alignSelf: mine ? 'flex-end' : 'flex-start' }]}>
      {!mine && <Sprite name="mentor" width={32} />}
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        {message.kind === 'audio' && message.audioUri ? (
          <AudioBubble uri={message.audioUri} duration={message.durationSec ?? 0} />
        ) : (
          <Text style={[styles.bubbleText, { color: mine ? colors.bg : colors.ink }]}>{message.text}</Text>
        )}
      </View>
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
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
      accessibilityLabel="Reproducir audio"
    >
      <View style={styles.play}>
        <View style={styles.playTriangle} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, height: 24 }}>
        {WAVE.map((h, i) => (
          <View key={i} style={{ width: 4, height: h, backgroundColor: colors.bg, opacity: 0.8 }} />
        ))}
      </View>
      <GameLabel size={11} color={colors.bg}>
        {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
      </GameLabel>
    </Pressable>
  );
}

function Typing() {
  return (
    <View style={[styles.bubbleRow, { alignSelf: 'flex-start' }]}>
      <Sprite name="mentor" width={32} />
      <View style={[styles.bubble, styles.theirs, { flexDirection: 'row', gap: 5, paddingVertical: 14 }]}>
        {[0, 330, 660].map((d) => (
          <Dot key={d} delay={d} />
        ))}
      </View>
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const v = useLoop(1000, delay);
  return <Animated.View style={{ width: 8, height: 8, backgroundColor: colors.muted, opacity: stepped(v, [0.25, 1]) }} />;
}

function RecDot() {
  const v = useLoop(1000);
  return <Animated.View style={{ width: 10, height: 10, backgroundColor: colors.lacre, opacity: stepped(v, [1, 0.2]) }} />;
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  close: { fontFamily: fonts.title, fontSize: 20, color: colors.muted, width: 36, textAlign: 'center' },
  headerBorder: { borderBottomWidth: 2, borderBottomColor: colors.divider },
  mentorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 4, paddingBottom: 12 },
  role: { fontFamily: fonts.heavy, fontSize: 12, color: colors.verde },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '86%' },
  bubble: { flexShrink: 1, borderWidth: 2, borderBottomWidth: 4, borderRadius: 18, paddingVertical: 11, paddingHorizontal: 14 },
  theirs: { backgroundColor: colors.card, borderColor: colors.border },
  mine: { backgroundColor: colors.verde, borderColor: colors.bosque },
  bubbleText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22 },
  play: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.oro, alignItems: 'center', justifyContent: 'center' },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 2,
    borderLeftWidth: 9,
    borderLeftColor: colors.bosque,
    borderTopWidth: 6,
    borderTopColor: 'transparent',
    borderBottomWidth: 6,
    borderBottomColor: 'transparent',
  },
  readyCard: {
    backgroundColor: colors.verde,
    borderBottomWidth: 6,
    borderBottomColor: colors.bosque,
    borderRadius: 22,
    padding: 18,
    gap: 10,
    marginTop: 6,
  },
  composerBorder: { borderTopWidth: 2, borderTopColor: colors.divider },
  chip: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipText: { fontFamily: fonts.heavy, fontSize: 13, color: colors.ink },
  input: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ink,
    outlineStyle: 'none',
  } as object,
  recBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.lacreTint,
    borderWidth: 2,
    borderColor: colors.lacre,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  recText: { fontFamily: fonts.heavy, fontSize: 14, color: colors.lacre },
});
