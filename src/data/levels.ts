import { IconName } from '@/components/Icon';

export type LevelId = 1 | 2 | 3 | 4 | 5 | 6;

export type Level = {
  id: LevelId;
  /** Journey verb: DESCUBRIR → ENTENDER → CONOCER → ORGANIZAR → DIRIGIR → CONSTRUIR */
  stage: string;
  title: string;
  promise: string;
  objective: string;
  /** Price in COP. */
  price: number;
  duration: string;
  deliverable: string;
  achievement: string;
  /** Station emblem. */
  icon: IconName;
  learn: string[];
  whatsappUrl: string;
  /** Who leads the private group and when it meets. */
  groupHost: string;
  groupSession: string;
  available: boolean;
};

// TODO: replace the WhatsApp invite links, hosts and session times with the real private groups.
export const LEVELS: Level[] = [
  {
    id: 1,
    stage: 'Descubrir',
    title: 'Tu relación con el dinero',
    promise: 'Antes de los números, tu historia.',
    objective:
      'Entender por qué sientes que necesitas entrenamiento financiero antes de trabajar directamente con números.',
    price: 10000,
    duration: '1 semana',
    deliverable: 'Mapa Personal de Transformación',
    achievement: 'Conciencia financiera desbloqueada',
    icon: 'compass',
    learn: [
      'Identificar el pensamiento que hoy guía tus decisiones',
      'Reconocer la creencia y la emoción detrás de él',
      'Ver con claridad tu patrón con el dinero',
      'Recibir frases personales para empezar a moverte',
    ],
    whatsappUrl: 'https://chat.whatsapp.com/nivel-1',
    groupHost: 'Martina acompaña el grupo',
    groupSession: 'Sesión en vivo el jueves, 7:00 p. m.',
    available: true,
  },
  {
    id: 2,
    stage: 'Entender',
    title: 'Entender el dinero',
    promise: 'El dinero no es magia: se mide, se conoce y se dirige.',
    objective:
      'Explicar de forma sencilla cómo funciona el dinero y quitarle la apariencia de algo complejo o mágico.',
    price: 20000,
    duration: '1 semana',
    deliverable: 'Mapa del Dinero',
    achievement: 'Entendimiento financiero desbloqueado',
    icon: 'plant',
    learn: [
      'Dinero que entra y dinero que sale',
      'Ingreso, gasto, deuda y ahorro sin tecnicismos',
      'Cómo fluye el dinero en tu vida',
      'Abundancia consciente, sin promesas mágicas',
    ],
    whatsappUrl: 'https://chat.whatsapp.com/nivel-2',
    groupHost: 'Martina acompaña el grupo',
    groupSession: 'Sesión en vivo el jueves, 7:00 p. m.',
    available: true,
  },
  {
    id: 3,
    stage: 'Conocer',
    title: '¿Cuánto cuesta mi vida?',
    promise: 'Un número que te devuelve el control.',
    objective:
      'Descubrir cuánto dinero necesitas realmente para sostener tu vida y entender la independencia económica.',
    price: 30000,
    duration: '1 semana',
    deliverable: 'Mi Número de Independencia',
    achievement: 'Conozco el costo de mi vida',
    icon: 'door',
    learn: [
      'El recorrido hacia la independencia económica',
      'Tus necesidades esenciales, una por una',
      'Necesidades personales y construcción de futuro',
      'Tu costo de vida mensual, claro y visible',
    ],
    whatsappUrl: 'https://chat.whatsapp.com/nivel-3',
    groupHost: 'Martina acompaña el grupo',
    groupSession: 'Sesión en vivo el jueves, 7:00 p. m.',
    available: true,
  },
  {
    id: 4,
    stage: 'Organizar',
    title: 'Ordenar tu dinero',
    promise: 'Cada peso con un lugar.',
    objective: 'Crear una estructura simple para distribuir tu dinero cada mes.',
    price: 79000,
    duration: '1 semana',
    deliverable: 'Mi Plan Mensual',
    achievement: 'Orden financiero desbloqueado',
    icon: 'map',
    learn: [],
    whatsappUrl: '',
    groupHost: 'Martina acompaña el grupo',
    groupSession: 'Sesión en vivo el jueves, 7:00 p. m.',
    available: false,
  },
  {
    id: 5,
    stage: 'Dirigir',
    title: 'Tomar el timón',
    promise: 'Decidir antes de que el mes decida por ti.',
    objective: 'Dirigir tus decisiones de gasto, deuda y ahorro con intención.',
    price: 89000,
    duration: '1 semana',
    deliverable: 'Mi Brújula de Decisiones',
    achievement: 'Dirección financiera desbloqueada',
    icon: 'signpost',
    learn: [],
    whatsappUrl: '',
    groupHost: 'Martina acompaña el grupo',
    groupSession: 'Sesión en vivo el jueves, 7:00 p. m.',
    available: false,
  },
  {
    id: 6,
    stage: 'Construir',
    title: 'La casa con la ventana encendida',
    promise: 'Del mes a mes al largo plazo.',
    objective: 'Diseñar el camino hacia tu independencia económica.',
    price: 99000,
    duration: '2 semanas',
    deliverable: 'Mi Plan de Futuro',
    achievement: 'Constructor de futuro',
    icon: 'house',
    learn: [],
    whatsappUrl: '',
    groupHost: 'Martina acompaña el grupo',
    groupSession: 'Sesión en vivo el jueves, 7:00 p. m.',
    available: false,
  },
];

export const getLevel = (id: number) => LEVELS.find((l) => l.id === id);

export function formatCOP(value: number) {
  const rounded = Math.round(value);
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${rounded < 0 ? '-' : ''}$${digits}`;
}
