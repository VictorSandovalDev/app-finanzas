import { useCallback, useEffect, useState } from 'react';

import { MessageRow, Profile, supabase } from '@/services/supabase';
import { JourneyState } from '@/state/journey';

export type MemberSummary = {
  profile: Profile;
  journey: Partial<JourneyState> | null;
  lastMessage: MessageRow | null;
  unread: number;
};

/** All members with their progress, latest message and unread count. Mentor only (RLS). */
export function useMembers() {
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [profiles, journeys, messages] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'member').order('created_at', { ascending: false }),
      supabase.from('journeys').select('user_id, state'),
      supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(1000),
    ]);
    const journeyBy = new Map((journeys.data ?? []).map((j) => [j.user_id as string, j.state as Partial<JourneyState>]));
    const rows = (messages.data as MessageRow[]) ?? [];
    const list: MemberSummary[] = ((profiles.data as Profile[]) ?? []).map((p) => {
      const mine = rows.filter((m) => m.member_id === p.id);
      return {
        profile: p,
        journey: journeyBy.get(p.id) ?? null,
        lastMessage: mine[0] ?? null,
        unread: mine.filter((m) => m.sender === 'member' && !m.read_at).length,
      };
    });
    // Members waiting for an answer first, then by latest activity.
    list.sort((a, b) => b.unread - a.unread || (b.lastMessage?.created_at ?? b.profile.created_at).localeCompare(a.lastMessage?.created_at ?? a.profile.created_at));
    setMembers(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(load);
    const channel = supabase
      .channel('admin:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return { members, loading, reload: load };
}
