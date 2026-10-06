import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { LevelId } from '@/data/levels';
import { supabase } from '@/services/supabase';

export type ChatMessage = {
  id: string;
  from: 'mentor' | 'user';
  kind: 'text' | 'audio';
  text?: string;
  audioUri?: string;
  durationSec?: number;
};

export type TransformationMap = {
  situation: string;
  thought: string;
  belief: string;
  emotion: string;
  behavior: string;
  transform: string;
};

export type MantraRole = 'reencuadre' | 'capacidad' | 'accion';
export type Mantra = { role: MantraRole; text: string };

export type MoneyMap = { income: number; expenses: number; debt: number; savings: number };

export type CostGroup = 'esencial' | 'personal' | 'futuro';
export type CostItem = { id: string; label: string; amount: number; group: CostGroup };

export type Achievement = { levelId: LevelId; title: string; date: string };

export type JourneyState = {
  name: string;
  onboarded: boolean;
  /** ISO date the journey started. */
  joinedAt?: string;
  /** Local days (YYYY-MM-DD) with activity — drives the streak. */
  activity: string[];
  unlocked: LevelId[];
  completed: LevelId[];
  achievements: Achievement[];
  level1: {
    messages: ChatMessage[];
    followUps: number;
    /** The mentor has enough context to build the transformation map. */
    ready?: boolean;
    map?: TransformationMap;
    mantras?: Mantra[];
    mantrasSaved?: boolean;
    joinedGroup?: boolean;
  };
  level2: {
    understood: string[];
    moneyMap?: MoneyMap;
  };
  level3: {
    stage?: number;
    items: CostItem[];
    done?: boolean;
  };
};

const STORAGE_KEY = 'viaje-financiero/v1';

export const initialState: JourneyState = {
  name: '',
  onboarded: false,
  activity: [],
  unlocked: [],
  completed: [],
  achievements: [],
  level1: { messages: [], followUps: 0 },
  level2: { understood: [] },
  level3: { items: [] },
};

type JourneyContextValue = {
  state: JourneyState;
  hydrated: boolean;
  update: (fn: (s: JourneyState) => JourneyState) => void;
  unlock: (id: LevelId) => void;
  complete: (id: LevelId, achievementTitle: string) => void;
  reset: () => void;
};

const JourneyContext = createContext<JourneyContextValue | null>(null);

/** Fields that never leave the device (local chat drafts, audio file URIs). */
function forServer(s: JourneyState) {
  return { ...s, level1: { ...s.level1, messages: [] } };
}

/**
 * Journey progress for the signed-in member. Cached on the device and synced to
 * `journeys.state` in Supabase, so it follows the account across devices.
 */
export function JourneyProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [state, setState] = useState<JourneyState>(initialState);
  const key = userId ? `${STORAGE_KEY}/${userId}` : STORAGE_KEY;
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const hydrated = hydratedKey === key;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let next = initialState;
      try {
        const raw = await AsyncStorage.getItem(key);
        if (raw) next = { ...initialState, ...JSON.parse(raw) };
      } catch {}
      if (userId) {
        const { data } = await supabase.from('journeys').select('state').eq('user_id', userId).maybeSingle();
        const remote = data?.state as Partial<JourneyState> | undefined;
        // The server copy wins once it has content; the local cache only fills an empty account.
        if (remote && Object.keys(remote).length > 0) next = { ...initialState, ...remote, level1: { ...initialState.level1, ...remote.level1 } };
      }
      if (!cancelled) {
        setState(next);
        setHydratedKey(key);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key, userId]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(key, JSON.stringify(state)).catch(() => {});
    if (!userId) return;
    const t = setTimeout(() => {
      supabase
        .from('journeys')
        .update({ state: forServer(state), updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .then(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [state, hydrated, key, userId]);

  /** Every change counts as activity for today's streak. */
  const update = useCallback((fn: (s: JourneyState) => JourneyState) => setState((s) => withActivity(fn(s))), []);

  const unlock = useCallback(
    (id: LevelId) =>
      setState((s) => (s.unlocked.includes(id) ? s : { ...s, unlocked: [...s.unlocked, id].sort() as LevelId[] })),
    [],
  );

  const complete = useCallback(
    (id: LevelId, achievementTitle: string) =>
      update((s) =>
        s.completed.includes(id)
          ? s
          : {
              ...s,
              completed: [...s.completed, id],
              achievements: [...s.achievements, { levelId: id, title: achievementTitle, date: new Date().toISOString() }],
            },
      ),
    [update],
  );

  const reset = useCallback(() => setState(initialState), []);

  const value = useMemo(
    () => ({ state, hydrated, update, unlock, complete, reset }),
    [state, hydrated, update, unlock, complete, reset],
  );

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function localDay(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function withActivity(s: JourneyState): JourneyState {
  const today = localDay();
  return s.activity.includes(today) ? s : { ...s, activity: [...s.activity.slice(-120), today] };
}

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error('useJourney must be used inside JourneyProvider');
  return ctx;
}
