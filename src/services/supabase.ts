import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// On native, refresh the session only while the app is in the foreground.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

export type Role = 'member' | 'mentor';
export type Profile = { id: string; name: string; email: string | null; role: Role; created_at: string };

export type MessageRow = {
  id: string;
  member_id: string;
  level_id: number;
  sender: 'member' | 'mentor';
  kind: 'text' | 'audio';
  body: string | null;
  audio_path: string | null;
  duration_sec: number | null;
  read_at: string | null;
  created_at: string;
};

export type TransformationRow = {
  member_id: string;
  map: {
    situation: string;
    thought: string;
    belief: string;
    emotion: string;
    behavior: string;
    transform: string;
  };
  mantras: { role: 'reencuadre' | 'capacidad' | 'accion'; text: string }[];
  published_at: string | null;
  updated_at: string;
};

/** Short-lived URL to play a private voice note. */
export async function audioUrl(path: string) {
  const { data } = await supabase.storage.from('audios').createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

/** Uploads a recorded voice note to the member's folder and returns its storage path. */
export async function uploadAudio(memberId: string, uri: string) {
  const blob = await (await fetch(uri)).blob();
  const ext = blob.type.includes('webm') ? 'webm' : 'm4a';
  const path = `${memberId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const body = await blob.arrayBuffer();
  const { error } = await supabase.storage.from('audios').upload(path, body, { contentType: blob.type || 'audio/mp4' });
  if (error) throw error;
  return path;
}
