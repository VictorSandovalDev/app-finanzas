import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, Divider, Screen, T, Tag } from '@/components/ui';
import { getLevel } from '@/data/levels';
import { MemberSummary, useMembers } from '@/state/admin';
import { useAuth } from '@/state/auth';
import { colors, fonts } from '@/theme/tokens';

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

export default function AdminHome() {
  const { profile, signOut } = useAuth();
  const { members, loading } = useMembers();
  const waiting = members.filter((m) => m.unread > 0).length;

  return (
    <Screen maxWidth={880}>
      <View style={styles.top}>
        <View style={{ flex: 1, gap: 6 }}>
          <T variant="label">Panel del mentor</T>
          <T variant="display">Hola{profile?.name ? `, ${profile.name}` : ''}</T>
          <T>
            {members.length} {members.length === 1 ? 'persona' : 'personas'} en el viaje
            {waiting ? ` · ${waiting} esperando tu respuesta` : ''}
          </T>
        </View>
        <Button label="Salir" variant="quiet" compact onPress={signOut} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.forest} />
      ) : members.length === 0 ? (
        <T>Todavía no hay usuarios. Cuando alguien cree su cuenta en la app, aparecerá aquí.</T>
      ) : (
        <View>
          {members.map((m) => (
            <View key={m.profile.id}>
              <MemberRow member={m} />
              <Divider />
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

function MemberRow({ member }: { member: MemberSummary }) {
  const { profile, journey, lastMessage, unread } = member;
  const unlocked = journey?.unlocked ?? [];
  const completed = journey?.completed ?? [];
  const currentId = unlocked.find((id) => !completed.includes(id));
  const station = currentId ? getLevel(currentId) : undefined;
  const preview = lastMessage ? (lastMessage.kind === 'audio' ? 'Audio' : lastMessage.body) : 'Sin mensajes todavía';

  return (
    <Pressable onPress={() => router.push(`/admin/${profile.id}`)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <View style={styles.avatar}>
        <Text style={styles.initial}>{(profile.name || profile.email || '?').charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.name} numberOfLines={1}>
            {profile.name || profile.email}
          </Text>
          {unread > 0 && <Tag label={`${unread} nuevo${unread > 1 ? 's' : ''}`} tone="umber" />}
        </View>
        <T variant="small" numberOfLines={1}>
          {lastMessage?.sender === 'mentor' ? 'Tú: ' : ''}
          {preview}
        </T>
        <T variant="small" style={{ color: colors.moss }}>
          {station ? `Estación ${station.id} · ${station.stage}` : completed.length ? `${completed.length} estaciones completadas` : 'Sin estación desbloqueada'}
        </T>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        {lastMessage && <T variant="small">{timeAgo(lastMessage.created_at)}</T>}
        <Icon name="caretRight" size={16} color={colors.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.forestSoft, alignItems: 'center', justifyContent: 'center' },
  initial: { fontFamily: fonts.display, fontSize: 20, color: colors.forest },
  name: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.ink, flexShrink: 1 },
});
