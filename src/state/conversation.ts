import { useCallback, useEffect, useState } from 'react';

import { MessageRow, supabase, TransformationRow, uploadAudio } from '@/services/supabase';

/**
 * Live conversation between a member and the mentor for one station.
 * Used by the member's chat and by the mentor's admin panel.
 */
export function useConversation(memberId: string | undefined, levelId: number, as: 'member' | 'mentor') {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const key = `${memberId}:${levelId}`;

  useEffect(() => {
    if (!memberId) return;
    let active = true;
    supabase
      .from('messages')
      .select('*')
      .eq('member_id', memberId)
      .eq('level_id', levelId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        setMessages((data as MessageRow[]) ?? []);
        setLoadedKey(`${memberId}:${levelId}`);
      });

    const channel = supabase
      .channel(`messages:${memberId}:${levelId}:${as}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `member_id=eq.${memberId}` },
        (payload) => {
          const row = payload.new as MessageRow;
          if (!row?.id || row.level_id !== levelId) return;
          setMessages((list) => {
            const i = list.findIndex((m) => m.id === row.id);
            if (i === -1) return [...list, row].sort((a, b) => a.created_at.localeCompare(b.created_at));
            const next = list.slice();
            next[i] = row;
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [memberId, levelId, as]);

  // Mark the other side's messages as read once they are on screen.
  useEffect(() => {
    if (!memberId) return;
    const other = as === 'member' ? 'mentor' : 'member';
    const unread = messages.filter((m) => m.sender === other && !m.read_at).map((m) => m.id);
    if (unread.length === 0) return;
    supabase.from('messages').update({ read_at: new Date().toISOString() }).in('id', unread).then(() => {});
  }, [messages, memberId, as]);

  const add = (row: MessageRow | null) => {
    if (!row) return;
    setMessages((list) => (list.some((m) => m.id === row.id) ? list : [...list, row]));
  };

  const sendText = useCallback(
    async (body: string) => {
      if (!memberId || !body.trim()) return 'empty';
      const { data, error } = await supabase
        .from('messages')
        .insert({ member_id: memberId, level_id: levelId, sender: as, kind: 'text', body: body.trim() })
        .select()
        .single();
      add(data as MessageRow);
      return error ? 'No pudimos enviar el mensaje. Revisa tu conexión.' : null;
    },
    [memberId, levelId, as],
  );

  const sendAudio = useCallback(
    async (uri: string, durationSec: number) => {
      if (!memberId) return 'empty';
      try {
        const path = await uploadAudio(memberId, uri);
        const { data, error } = await supabase
          .from('messages')
          .insert({ member_id: memberId, level_id: levelId, sender: as, kind: 'audio', audio_path: path, duration_sec: durationSec })
          .select()
          .single();
        add(data as MessageRow);
        return error ? 'No pudimos enviar el audio.' : null;
      } catch {
        return 'No pudimos subir el audio. Revisa tu conexión.';
      }
    },
    [memberId, levelId, as],
  );

  const loading = loadedKey !== key;
  return { messages: loading ? [] : messages, loading, sendText, sendAudio };
}

/** The member's Personal Map, as the mentor last saved it. */
export function useTransformation(memberId: string | undefined) {
  const [row, setRow] = useState<TransformationRow | null>(null);

  useEffect(() => {
    if (!memberId) return;
    supabase
      .from('transformations')
      .select('*')
      .eq('member_id', memberId)
      .maybeSingle()
      .then(({ data }) => setRow((data as TransformationRow) ?? null));
    const channel = supabase
      .channel(`transformations:${memberId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transformations', filter: `member_id=eq.${memberId}` }, (payload) =>
        setRow((payload.new as TransformationRow) ?? null),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [memberId]);

  return row;
}
