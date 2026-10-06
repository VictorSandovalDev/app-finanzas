import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AudioMessage } from '@/components/AudioMessage';
import { Icon } from '@/components/Icon';
import { BackButton, Button, Divider, T, Tag, useGutter, useWide } from '@/components/ui';
import { getLevel, LEVELS } from '@/data/levels';
import { MessageRow, Profile, supabase, TransformationRow } from '@/services/supabase';
import { useAuth } from '@/state/auth';
import { useConversation, useTransformation } from '@/state/conversation';
import { JourneyState } from '@/state/journey';
import { colors, fonts } from '@/theme/tokens';

type MapDraft = TransformationRow['map'];
type MantraDraft = TransformationRow['mantras'];

const EMPTY_MAP: MapDraft = { situation: '', thought: '', belief: '', emotion: '', behavior: '', transform: '' };
const EMPTY_MANTRAS: MantraDraft = [
  { role: 'reencuadre', text: '' },
  { role: 'capacidad', text: '' },
  { role: 'accion', text: '' },
];

const MAP_FIELDS: { key: keyof MapDraft; label: string; hint: string }[] = [
  { key: 'situation', label: 'Situación actual', hint: 'En palabras del usuario' },
  { key: 'thought', label: 'Pensamiento', hint: 'Lo que se dice a sí mismo' },
  { key: 'belief', label: 'Creencia', hint: 'Lo que da por cierto' },
  { key: 'emotion', label: 'Emoción', hint: 'Lo que siente' },
  { key: 'behavior', label: 'Comportamiento', hint: 'Lo que termina haciendo' },
  { key: 'transform', label: 'Qué necesita transformar', hint: 'El cambio concreto' },
];

const MANTRA_LABEL = { reencuadre: 'Reencuadre de un pensamiento', capacidad: 'Fortalece una capacidad', accion: 'Mueve a una acción concreta' };

export default function MemberDetail() {
  const { memberId } = useLocalSearchParams<{ memberId: string }>();
  const wide = useWide(1000);
  const insets = useSafeAreaInsets();
  const gutter = useGutter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [journey, setJourney] = useState<Partial<JourneyState> | null>(null);
  const [tab, setTab] = useState<'chat' | 'map'>('chat');

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', memberId).single().then(({ data }) => setProfile(data as Profile));
    supabase.from('journeys').select('state').eq('user_id', memberId).single().then(({ data }) => setJourney((data?.state as Partial<JourneyState>) ?? null));
  }, [memberId]);

  const unlocked = journey?.unlocked ?? [];
  const completed = journey?.completed ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={styles.header}>
        <View style={{ paddingHorizontal: gutter, gap: 10, paddingBottom: 12 }}>
          <BackButton onPress={() => (router.canGoBack() ? router.back() : router.replace('/admin'))} label="Usuarios" />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text style={styles.name}>{profile?.name || profile?.email || '…'}</Text>
            {profile?.email ? <T variant="small">{profile.email}</T> : null}
          </View>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {LEVELS.filter((l) => l.available).map((l) => (
              <Tag
                key={l.id}
                label={`${l.id} · ${l.stage}`}
                tone={completed.includes(l.id) ? 'forest' : unlocked.includes(l.id) ? 'brass' : 'neutral'}
                icon={completed.includes(l.id) ? 'check' : unlocked.includes(l.id) ? undefined : 'lock'}
              />
            ))}
          </View>
          {!wide && (
            <View style={styles.tabs}>
              {(['chat', 'map'] as const).map((t) => (
                <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
                  <Text style={[styles.tabText, tab === t && { color: colors.ink }]}>{t === 'chat' ? 'Conversación' : 'Mapa y frases'}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      {wide ? (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.line }}>
            <Conversation memberId={memberId} />
          </View>
          <View style={{ width: 460 }}>
            <MapEditor memberId={memberId} name={profile?.name ?? ''} />
          </View>
        </View>
      ) : tab === 'chat' ? (
        <Conversation memberId={memberId} />
      ) : (
        <MapEditor memberId={memberId} name={profile?.name ?? ''} />
      )}
    </View>
  );
}

function Conversation({ memberId }: { memberId: string }) {
  const gutter = useGutter();
  const { messages, loading, sendText, sendAudio } = useConversation(memberId, 1, 'mentor');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const rec = useAudioRecorderState(recorder);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages.length]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft('');
    const message = await sendText(text);
    setSending(false);
    if (message) {
      setError(message);
      setDraft(text);
    } else setError(null);
  };

  const toggleRecording = async () => {
    setError(null);
    if (rec.isRecording) {
      const duration = Math.max(1, Math.round(rec.durationMillis / 1000));
      await recorder.stop();
      if (!recorder.uri) return;
      setSending(true);
      const message = await sendAudio(recorder.uri, duration);
      setSending(false);
      if (message) setError(message);
      return;
    }
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) return setError('Permite el micrófono para grabar un audio.');
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      setError('No pudimos acceder al micrófono.');
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: gutter, paddingVertical: 20, gap: 12 }}>
        <T variant="label">Estación 1 · ¿Por qué estás aquí?</T>
        {loading ? (
          <ActivityIndicator color={colors.forest} />
        ) : messages.length === 0 ? (
          <T>El usuario todavía no ha escrito. Cuando lo haga, verás su mensaje aquí en tiempo real.</T>
        ) : (
          messages.map((m) => <MentorBubble key={m.id} message={m} />)
        )}
      </ScrollView>
      <View style={styles.composer}>
        <View style={{ paddingHorizontal: gutter, paddingVertical: 12, gap: 8 }}>
          {error && <T variant="small" style={{ color: colors.umber }}>{error}</T>}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
            {rec.isRecording ? (
              <View style={[styles.input, { justifyContent: 'center', backgroundColor: colors.umberSoft, borderColor: colors.umberSoft }]}>
                <Text style={{ fontFamily: fonts.sansMedium, color: colors.umber }}>Grabando · {Math.floor(rec.durationMillis / 1000)} s</Text>
              </View>
            ) : (
              <TextInput value={draft} onChangeText={setDraft} placeholder="Responde como Victor…" placeholderTextColor={colors.muted} multiline style={styles.input} />
            )}
            {sending ? (
              <View style={styles.round}>
                <ActivityIndicator color={colors.forest} />
              </View>
            ) : draft.trim() && !rec.isRecording ? (
              <Pressable onPress={submit} style={[styles.round, { backgroundColor: colors.forest }]} accessibilityLabel="Enviar">
                <Icon name="send" size={20} color={colors.onDark} weight="fill" />
              </Pressable>
            ) : (
              <Pressable
                onPress={toggleRecording}
                style={[styles.round, rec.isRecording ? { backgroundColor: colors.umber } : styles.roundQuiet]}
                accessibilityLabel={rec.isRecording ? 'Detener y enviar' : 'Grabar audio'}
              >
                <Icon name={rec.isRecording ? 'stop' : 'mic'} size={20} color={rec.isRecording ? colors.onDark : colors.forest} weight={rec.isRecording ? 'fill' : 'regular'} />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function MentorBubble({ message }: { message: MessageRow }) {
  const fromMentor = message.sender === 'mentor';
  const time = new Date(message.created_at).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  return (
    <View style={{ alignSelf: fromMentor ? 'flex-end' : 'flex-start', maxWidth: '86%', gap: 4 }}>
      <View style={[styles.bubble, fromMentor ? styles.mine : styles.theirs]}>
        {message.kind === 'audio' && message.audio_path ? (
          <AudioMessage path={message.audio_path} duration={message.duration_sec ?? 0} onDark={fromMentor} />
        ) : (
          <Text style={[styles.bubbleText, fromMentor && { color: colors.onDark }]}>{message.body}</Text>
        )}
      </View>
      <T variant="small" style={{ alignSelf: fromMentor ? 'flex-end' : 'flex-start', fontSize: 11 }}>
        {time}
        {fromMentor && message.read_at ? ' · Leído' : ''}
      </T>
    </View>
  );
}

function MapEditor({ memberId, name }: { memberId: string; name: string }) {
  const { session } = useAuth();
  const saved = useTransformation(memberId);
  const [map, setMap] = useState<MapDraft>(EMPTY_MAP);
  const [mantras, setMantras] = useState<MantraDraft>(EMPTY_MANTRAS);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Load the saved version once; after that the form belongs to the mentor.
  if (saved && loadedFor !== saved.updated_at) {
    setMap({ ...EMPTY_MAP, ...saved.map });
    setMantras(saved.mantras?.length === 3 ? saved.mantras : EMPTY_MANTRAS);
    setLoadedFor(saved.updated_at);
  }

  const complete = MAP_FIELDS.every((f) => map[f.key].trim()) && mantras.every((m) => m.text.trim());

  const save = async (publish: boolean) => {
    setBusy(true);
    setStatus(null);
    const now = new Date().toISOString();
    const { error } = await supabase.from('transformations').upsert({
      member_id: memberId,
      map,
      mantras,
      updated_by: session?.user.id,
      updated_at: now,
      published_at: publish ? now : (saved?.published_at ?? null),
    });
    setBusy(false);
    setStatus(error ? 'No se pudo guardar. Intenta de nuevo.' : publish ? `Publicado. ${name || 'El usuario'} ya puede verlo en su app.` : 'Borrador guardado.');
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, gap: 18 }}>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <T variant="heading">Mapa Personal de Transformación</T>
          {saved?.published_at ? <Tag label="Publicado" tone="forest" icon="check" /> : saved ? <Tag label="Borrador" /> : null}
        </View>
        <T variant="small">Constrúyelo a partir de la conversación. El usuario lo verá cuando lo publiques.</T>
      </View>

      {MAP_FIELDS.map((f) => (
        <View key={f.key} style={{ gap: 6 }}>
          <Text style={styles.fieldLabel}>
            {f.label} <Text style={{ color: colors.muted, fontFamily: fonts.sans }}>· {f.hint}</Text>
          </Text>
          <TextInput value={map[f.key]} onChangeText={(t) => setMap((m) => ({ ...m, [f.key]: t }))} multiline style={styles.field} placeholderTextColor={colors.muted} />
        </View>
      ))}

      <Divider />
      <T variant="heading">Frases personales</T>
      {mantras.map((m, i) => (
        <View key={m.role} style={{ gap: 6 }}>
          <Text style={styles.fieldLabel}>
            {i + 1}. {MANTRA_LABEL[m.role]}
          </Text>
          <TextInput
            value={m.text}
            onChangeText={(t) => setMantras((list) => list.map((x, j) => (j === i ? { ...x, text: t } : x)))}
            multiline
            style={styles.field}
            placeholder={i === 0 ? 'Puedo mirar mis números con tranquilidad…' : ''}
            placeholderTextColor={colors.muted}
          />
        </View>
      ))}

      {status && <T style={{ color: status.startsWith('No') ? colors.umber : colors.forest }}>{status}</T>}
      <View style={{ gap: 8 }}>
        <Button label={saved?.published_at ? 'Guardar y actualizar' : `Publicar para ${name || 'el usuario'}`} icon="send" loading={busy} disabled={!complete} onPress={() => save(true)} />
        {!saved?.published_at && <Button label="Guardar borrador" variant="secondary" disabled={busy} onPress={() => save(false)} />}
      </View>
      {getLevel(1) && <T variant="small">Al publicar, la misión “¿Por qué estás aquí?” queda completada en la app del usuario.</T>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  name: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, color: colors.ink },
  tabs: { flexDirection: 'row', gap: 22, paddingTop: 4 },
  tab: { paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.forest },
  tabText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.muted },
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18 },
  theirs: { backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderBottomLeftRadius: 6 },
  mine: { backgroundColor: colors.forest, borderBottomRightRadius: 6 },
  bubbleText: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.ink },
  composer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, backgroundColor: colors.bg },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 46,
    maxHeight: 140,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 23,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    outlineStyle: 'none',
  } as object,
  round: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  roundQuiet: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  fieldLabel: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  field: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.surface,
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  } as object,
});
