import { Href } from 'expo-router';

import { MONEY_IDEAS } from '@/data/content';
import { getLevel, LEVELS, LevelId } from '@/data/levels';
import { JourneyState } from '@/state/journey';

export type Mission = {
  id: string;
  title: string;
  description: string;
  done: boolean;
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
          description: 'Cuéntanos qué está pasando con tu dinero y qué te gustaría cambiar.',
          done: !!state.level1.map,
          href: state.level1.map ? '/mision/mapa-personal' : '/mision/relato',
        },
        {
          id: 'frases',
          title: 'Tus frases personales',
          description: 'Tres frases para reencuadrar, fortalecerte y pasar a la acción.',
          done: !!state.level1.mantrasSaved,
          href: state.level1.map ? '/mision/frases' : '/mision/relato',
        },
        {
          id: 'grupo',
          title: 'Únete a tu grupo',
          description: 'Acompañamiento durante la semana en el grupo privado del nivel.',
          done: !!state.level1.joinedGroup,
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
          href: '/mision/ideas-del-dinero',
        },
        {
          id: 'mapa',
          title: 'Dibuja tu Mapa del Dinero',
          description: 'Mira cómo entra, se reparte y sale tu dinero cada mes.',
          done: !!state.level2.moneyMap,
          href: '/mision/mapa-del-dinero',
        },
      ];
    case 3:
      return [
        {
          id: 'recorrido',
          title: 'El recorrido a la independencia',
          description: 'Ubica en qué punto del camino estás hoy.',
          done: state.level3.stage !== undefined,
          href: '/mision/recorrido',
        },
        {
          id: 'costo',
          title: 'Calcula el costo de tu vida',
          description: 'Necesidades esenciales, personales y construcción de futuro.',
          done: !!state.level3.done,
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

export function getJourneyProgress(state: JourneyState) {
  const current = getCurrentLevel(state);
  let partial = 0;
  if (current) {
    const missions = getMissions(state, current.id).filter((m) => !m.optional);
    if (missions.length) partial = missions.filter((m) => m.done).length / missions.length;
  }
  return Math.round(((state.completed.length + partial) / LEVELS.length) * 100);
}

export function getNextMissionHref(state: JourneyState): Href {
  const current = getCurrentLevel(state);
  if (!current) {
    const next = getNextLockedLevel(state);
    return next ? `/nivel/${next.id}` : '/perfil';
  }
  const pending = getMissions(state, current.id).find((m) => !m.done && !m.optional);
  if (pending) return pending.href;
  return `/nivel/${current.id}`;
}

export type Deliverable = { id: string; levelId: LevelId; title: string; ready: boolean; href: Href };

export function getDeliverables(state: JourneyState): Deliverable[] {
  return [
    { id: 'mapa-personal', levelId: 1, title: 'Mapa Personal de Transformación', ready: !!state.level1.map, href: '/mision/mapa-personal' },
    { id: 'frases', levelId: 1, title: 'Mis frases personales', ready: !!state.level1.mantras, href: '/mision/frases' },
    { id: 'mapa-dinero', levelId: 2, title: getLevel(2)!.deliverable, ready: !!state.level2.moneyMap, href: '/mision/mapa-del-dinero' },
    { id: 'numero', levelId: 3, title: getLevel(3)!.deliverable, ready: !!state.level3.done, href: '/mision/numero' },
  ];
}
