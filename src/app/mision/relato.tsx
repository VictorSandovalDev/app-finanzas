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
import { Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Button, Card, T, TopBar } from '@/components/ui';
import { buildTransformation, mentorRespond } from '@/services/mentor';
import { ChatMessage, useJourney } from '@/state/journey';
import { colors, fonts, maxContentWidth, radius, space, useNativeDriver } from '@/theme/tokens';

const uid = () => Math.random().toString(36).slice(2, 10);

export default function Relato() {
  const { state, update } = useJourney();
  const insets = useSafeAreaInsets();
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
    const name = state.name ? ` ${state.name}` : '';
    update((s) => ({
      ...s,
      level1: {
        ...s.level1,
        messages: [
          {
            id: uid(),
            from: 'mentor',
            kind: 'text',
            text: `Hola${name}. Esta es tu primera misión y no tiene respuestas correctas ni incorrectas.`,
          },
          {
            id: uid(),
            from: 'mentor',
            kind: 'text',
            text: 'Cuéntanos qué está pasando actualmente con tu dinero y qué te gustaría cambiar. Puedes escribir o enviarnos un audio, con tus propias palabras.',
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

  const sendText = () => {
    const text = draft.trim();
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
  const seconds = Math.floor(recorderState.durationMillis / 1000);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.ivory }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        <View style={styles.column}>
          <TopBar title="Nivel 1 · ¿Por qué estás aquí?" />
        </View>
        <ScrollView ref={scrollRef} contentContainerStyle={[styles.column, { paddingBottom: space.xl, gap: space.md }]}>
          <View style={styles.intro}>
            <Icon name="compass" color={colors.champagne} />
            <T variant="small" style={{ textAlign: 'center' }}>
              Tu mentor te hará preguntas solo cuando necesite entender mejor. Tómate el tiempo que necesites.
            </T>
          </View>
          {messages.map((m) => (
            <Bubble key={m.id} message={m} />
          ))}
          {thinking && <Typing />}
          {ready && !map && (
            <Card tone="forest" style={{ gap: space.md, marginTop: space.md }}>
              <T variant="label" style={{ color: colors.champagne }}>Listo para el siguiente paso</T>
              <T variant="heading" style={{ color: colors.ivory }}>Tu Mapa Personal de Transformación</T>
              <T style={{ color: 'rgba(246,241,231,0.75)' }}>
                Vamos a ordenar lo que compartiste: tu situación, lo que piensas, lo que crees, lo que sientes y lo que haces.
              </T>
              <Button label={building ? 'Construyendo tu mapa…' : 'Crear mi mapa'} variant="gold" icon="map" loading={building} onPress={generate} />
            </Card>
          )}
          {map && (
            <Button label="Ver mi Mapa Personal de Transformación" icon="map" onPress={() => router.push('/mision/mapa-personal')} />
          )}
        </ScrollView>

        {!map && (
          <View style={[styles.composerWrap, { paddingBottom: insets.bottom + space.md }]}>
            {micError && <T variant="small" style={{ color: colors.terracotta, marginBottom: space.sm }}>{micError}</T>}
            <View style={styles.composer}>
              {recording ? (
                <View style={styles.recording}>
                  <RecordingDot />
                  <T variant="bodyStrong">Grabando · {formatDuration(seconds)}</T>
                </View>
              ) : (
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder={ready ? 'Si quieres, agrega algo más…' : 'Escribe con tus palabras…'}
                  placeholderTextColor={colors.warmGray}
                  multiline
                  style={styles.input}
                  editable={!thinking}
                />
              )}
              {draft.trim() && !recording ? (
                <RoundButton icon="send" onPress={sendText} disabled={thinking} label="Enviar" />
              ) : (
                <RoundButton icon={recording ? 'stop' : 'mic'} onPress={toggleRecording} disabled={thinking} label={recording ? 'Detener grabación' : 'Grabar audio'} active={recording} />
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
    <View style={[styles.bubbleRow, mine && { justifyContent: 'flex-end' }]}>
      {!mine && (
        <View style={styles.avatar}>
          <Icon name="compass" size={16} color={colors.champagneSoft} />
        </View>
      )}
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        {message.kind === 'audio' && message.audioUri ? (
          <AudioBubble uri={message.audioUri} duration={message.durationSec ?? 0} />
        ) : (
          <T style={{ color: mine ? colors.ivory : colors.ink, fontFamily: mine ? fonts.sans : fonts.sans }}>{message.text}</T>
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
      style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, minWidth: 160 }}
      accessibilityLabel="Reproducir audio"
    >
      <View style={styles.play}>
        <Icon name="play" size={14} color={colors.forest} />
      </View>
      <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center', flex: 1 }}>
        {[6, 12, 8, 16, 10, 14, 7, 12, 9, 15, 6, 10].map((h, i) => (
          <View key={i} style={{ width: 3, height: h, borderRadius: 2, backgroundColor: 'rgba(246,241,231,0.7)' }} />
        ))}
      </View>
      <T variant="small" style={{ color: colors.ivory }}>{formatDuration(duration)}</T>
    </Pressable>
  );
}

function Typing() {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1100, useNativeDriver }));
    loop.start();
    return () => loop.stop();
  }, [v]);
  return (
    <View style={styles.bubbleRow}>
      <View style={styles.avatar}>
        <Icon name="compass" size={16} color={colors.champagneSoft} />
      </View>
      <View style={[styles.bubble, styles.theirs, { flexDirection: 'row', gap: 5, paddingVertical: 16 }]}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.typingDot,
              { opacity: v.interpolate({ inputRange: [0, (i + 1) / 4, 1], outputRange: [0.3, 1, 0.3] }) },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function RecordingDot() {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 0.3, duration: 600, useNativeDriver }),
        Animated.timing(v, { toValue: 1, duration: 600, useNativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return <Animated.View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.terracotta, opacity: v }} />;
}

function RoundButton({ icon, onPress, disabled, label, active }: { icon: 'send' | 'mic' | 'stop'; onPress: () => void; disabled?: boolean; label: string; active?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.round, active && { backgroundColor: colors.terracotta }, (pressed || disabled) && { opacity: 0.6 }]}
    >
      <Icon name={icon} size={20} color={colors.ivory} />
    </Pressable>
  );
}

const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const styles = StyleSheet.create({
  column: { width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', paddingHorizontal: space.xl },
  intro: { alignItems: 'center', gap: space.sm, paddingVertical: space.lg, paddingHorizontal: space.xl },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '82%', paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: radius.lg },
  theirs: { backgroundColor: colors.surface, borderBottomLeftRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  mine: { backgroundColor: colors.forest, borderBottomRightRadius: 6 },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.sage },
  play: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.champagneSoft, alignItems: 'center', justifyContent: 'center' },
  composerWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: space.md,
    paddingHorizontal: space.xl,
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
  },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: space.lg,
    paddingTop: 13,
    paddingBottom: 13,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    outlineStyle: 'none',
  } as object,
  recording: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    backgroundColor: colors.terracottaSoft,
    borderRadius: radius.lg,
  },
  round: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
});
