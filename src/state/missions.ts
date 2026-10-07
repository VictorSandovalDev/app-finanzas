import { Href } from 'expo-router';

import { IconName } from '@/components/Icon';
import { MONEY_IDEAS } from '@/data/content';
import { getLevel, LEVELS, LevelId } from '@/data/levels';
import { JourneyState, localDay } from '@/state/journey';

/** XP for finishing a station, on top of its missions. */
export const STATION_XP = 150;

export type Mission = {
  id: string;
  title: string;
  description: string;
  done: boolean;
  xp: number;
  /** Approximate time it takes. */
  minutes: number;
  icon: IconName;
  /** Optional missions do not block completing the level. */
  optional?: boolean;
  href: Href;
};

export function getMissions(state: JourneyState, levelId: LevelId): Mission[] {
  switch (levelId) {
    case 1:
      return [
        {
          id: 'relato',
          title: '¿Por qué estás aquí?',
          description: 'Cuéntale a Victor qué pasa con tu dinero y qué te gustaría cambiar.',
          done: !!state.level1.map,
          xp: 50,
          minutes: 15,
          icon: 'chat',
          href: state.level1.map ? '/mision/mapa-personal' : '/mision/relato',
        },
        {
          id: 'frases',
          title: 'Tus frases personales',
          description: 'Tres cartas para reencuadrar, fortalecerte y pasar a la acción.',
          done: !!state.level1.mantrasSaved,
          xp: 80,
          minutes: 5,
          icon: 'quotes',
          href: state.level1.map ? '/mision/frases' : '/mision/relato',
        },
        {
          id: 'grupo',
          title: 'Únete a tu grupo',
          description: 'Acompañamiento durante la semana en el grupo privado.',
          done: !!state.level1.joinedGroup,
          xp: 20,
          minutes: 2,
          icon: 'group',
          optional: true,
          href: '/nivel/1',
        },
      ];
    case 2:
      return [
        {
          id: 'ideas',
          title: 'Las ocho ideas del dinero',
          description: 'Conceptos simples para quitarle lo misterioso a las finanzas.',
          done: state.level2.understood.length >= MONEY_IDEAS.length,
          xp: 50,
          minutes: 8,
          icon: 'plant',
          href: '/mision/ideas-del-dinero',
        },
        {
          id: 'mapa',
          title: 'Dibuja tu Mapa del Dinero',
          description: 'Mira cómo entra, se reparte y sale tu dinero cada mes.',
          done: !!state.level2.moneyMap,
          xp: 80,
          minutes: 12,
          icon: 'map',
          href: '/mision/mapa-del-dinero',
        },
      ];
    case 3:
      return [
        {
          id: 'recorrido',
          title: 'El camino de puertas',
          description: 'Ubica en qué punto del camino a la independencia estás hoy.',
          done: state.level3.stage !== undefined,
          xp: 50,
          minutes: 6,
          icon: 'door',
          href: '/mision/recorrido',
        },
        {
          id: 'costo',
          title: 'Calcula el costo de tu vida',
          description: 'Necesidades esenciales, personales y construcción de futuro.',
          done: !!state.level3.done,
          xp: 80,
          minutes: 15,
          icon: 'house',
          href: state.level3.done ? '/mision/numero' : '/mision/costo-de-vida',
        },
      ];
    default:
      return [];
  }
}

export function canCompleteLevel(state: JourneyState, levelId: LevelId) {
  return getMissions(state, levelId)
    .filter((m) => !m.optional)
    .every((m) => m.done);
}

/** First unlocked level that is not yet completed. */
export function getCurrentLevel(state: JourneyState) {
  return LEVELS.find((l) => state.unlocked.includes(l.id) && !state.completed.includes(l.id));
}

/** The next level the user could buy. */
export function getNextLockedLevel(state: JourneyState) {
  return LEVELS.find((l) => !state.unlocked.includes(l.id));
}

/** XP earned in one level, and the most it can give (optional missions excluded from the max). */
export function getLevelXp(state: JourneyState, levelId: LevelId) {
  const missions = getMissions(state, levelId);
  const earned =
    missions.filter((m) => m.done).reduce((sum, m) => sum + m.xp, 0) + (state.completed.includes(levelId) ? STATION_XP : 0);
  const max = missions.filter((m) => !m.optional).reduce((sum, m) => sum + m.xp, 0) + STATION_XP;
  return { earned, max };
}

export function getTotalXp(state: JourneyState) {
  return LEVELS.reduce((sum, l) => sum + getLevelXp(state, l.id).earned, 0);
}

export function getJourneyProgress(state: JourneyState) {
  const current = getCurrentLevel(state);
  let partial = 0;
  if (current) {
    const missions = getMissions(state, current.id).filter((m) => !m.optional);
    if (missions.length) partial = missions.filter((m) => m.done).length / missions.length;
  }
  return Math.round(((state.completed.length + partial) / LEVELS.length) * 100);
}

export function getNextMission(state: JourneyState) {
  const current = getCurrentLevel(state);
  if (!current) return undefined;
  return getMissions(state, current.id).find((m) => !m.done && !m.optional);
}

export function getNextMissionHref(state: JourneyState): Href {
  const current = getCurrentLevel(state);
  if (!current) {
    const next = getNextLockedLevel(state);
    return next ? `/nivel/${next.id}` : '/perfil';
  }
  return getNextMission(state)?.href ?? `/nivel/${current.id}`;
}

/** Consecutive active days ending today (or yesterday, if today has no activity yet). */
export function getStreak(state: JourneyState) {
  const days = new Set(state.activity);
  const cursor = new Date();
  if (!days.has(localDay(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(localDay(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export type WeekDay = { label: string; state: 'done' | 'today' | 'missed' | 'future' };

/** Monday → Sunday of the current week. */
export function getWeek(state: JourneyState): WeekDay[] {
  const days = new Set(state.activity);
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const today = localDay(now);
  return ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = localDay(d);
    if (days.has(key)) return { label, state: 'done' };
    if (key === today) return { label, state: 'today' };
    return { label, state: key < today ? 'missed' : 'future' };
  });
}

export type Deliverable = { id: string; levelId: LevelId; title: string; ready: boolean; icon: IconName; href: Href };

export function getDeliverables(state: JourneyState): Deliverable[] {
  return [
    { id: 'mapa-personal', levelId: 1, title: 'Mapa Personal de Transformación', ready: !!state.level1.map, icon: 'scroll', href: '/mision/mapa-personal' },
    { id: 'frases', levelId: 1, title: 'Mis frases personales', ready: !!state.level1.mantrasSaved, icon: 'quotes', href: '/mision/frases' },
    { id: 'mapa-dinero', levelId: 2, title: getLevel(2)!.deliverable, ready: !!state.level2.moneyMap, icon: 'map', href: '/mision/mapa-del-dinero' },
    { id: 'numero', levelId: 3, title: 'Mi Número de Independencia', ready: !!state.level3.done, icon: 'house', href: '/mision/numero' },
  ];
}
