import { useAudioPlayer } from 'expo-audio';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { audioUrl } from '@/services/supabase';
import { colors, fonts } from '@/theme/tokens';

const WAVE = [6, 11, 16, 9, 18, 13, 8, 15, 19, 11, 7, 14, 17, 10, 6, 12];

/** Plays a private voice note from storage (signed URL fetched on mount). */
export function AudioMessage({ path, duration, onDark }: { path: string; duration: number; onDark: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    audioUrl(path).then(setUrl);
  }, [path]);
  const fg = onDark ? colors.onDark : colors.forest;
  if (!url)
    return (
      <View style={styles.row}>
        <ActivityIndicator color={fg} size="small" />
        <Text style={[styles.duration, { color: fg }]}>Audio</Text>
      </View>
    );
  return <Player url={url} duration={duration} fg={fg} onDark={onDark} />;
}

function Player({ url, duration, fg, onDark }: { url: string; duration: number; fg: string; onDark: boolean }) {
  const player = useAudioPlayer(url);
  return (
    <Pressable
      onPress={() => {
        player.seekTo(0);
        player.play();
      }}
      style={styles.row}
      accessibilityLabel="Reproducir audio"
    >
      <Icon name="play" size={18} color={fg} weight="fill" />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, height: 22 }}>
        {WAVE.map((h, i) => (
          <View key={i} style={{ width: 2, height: h, borderRadius: 1, backgroundColor: onDark ? 'rgba(244,241,233,0.7)' : colors.moss }} />
        ))}
      </View>
      <Text style={[styles.duration, { color: fg }]}>
        {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  duration: { fontFamily: fonts.sansMedium, fontSize: 12, fontVariant: ['tabular-nums'] },
});
