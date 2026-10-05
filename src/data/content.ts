import { CostGroup } from '@/state/journey';

export type MoneyIdea = { id: string; title: string; body: string; example: string };

export const MONEY_IDEAS: MoneyIdea[] = [
  {
    id: 'entra-sale',
    title: 'Dinero que entra, dinero que sale',
    body: 'Todo en tus finanzas se reduce a dos movimientos: el dinero que llega a ti y el dinero que se va. Nada más.',
    example: 'Tu salario entra. El arriendo sale.',
  },
  {
    id: 'suma-resta',
    title: 'Es una suma y una resta',
    body: 'No necesitas fórmulas. Lo que entra menos lo que sale te dice si este mes te quedó algo o te faltó.',
    example: '$2.500.000 entran − $2.300.000 salen = $200.000 quedan.',
  },
  {
    id: 'ingreso',
    title: 'Ingreso',
    body: 'Es todo el dinero que recibes: salario, honorarios, ventas, apoyos. Conocerlo con exactitud es el punto de partida.',
    example: 'Si tu ingreso varía, se trabaja con el promedio de tus últimos meses.',
  },
  {
    id: 'gasto',
    title: 'Gasto',
    body: 'Es el dinero que usas para vivir. Algunos gastos sostienen tu vida; otros la hacen más agradable. Ambos cuentan.',
    example: 'Mercado, transporte, una cena con amigos.',
  },
  {
    id: 'deuda',
    title: 'Deuda',
    body: 'Es dinero que usaste hoy y que pagarás después, normalmente con un costo extra. No es buena ni mala: es una herramienta que se mide.',
    example: 'Una compra a 12 cuotas con tarjeta de crédito.',
  },
  {
    id: 'ahorro',
    title: 'Ahorro',
    body: 'Es la parte del dinero que decides no usar hoy para que trabaje por tu tranquilidad o tus planes de mañana.',
    example: 'Separar el 10% apenas recibes tu ingreso.',
  },
  {
    id: 'flujo',
    title: 'El flujo del dinero',
    body: 'El dinero se mueve como el agua: entra, se reparte y sale. Cuando ves el recorrido completo, puedes decidir hacia dónde va.',
    example: 'Ingreso → necesidades → deudas → ahorro → disfrute.',
  },
  {
    id: 'abundancia',
    title: 'Abundancia consciente',
    body: 'Abundancia no es tener mucho de repente. Es sentir que lo que tienes es suficiente para vivir con dignidad y que puedes hacerlo crecer con decisiones claras.',
    example: 'Saber que tu mes está cubierto también es abundancia.',
  },
];

export const INDEPENDENCE_STAGES = [
  { title: 'Dependencia', body: 'Otras personas cubren la mayor parte de tus gastos.' },
  { title: 'Primeras responsabilidades', body: 'Empiezas a pagar algunas cosas por tu cuenta.' },
  { title: 'Independencia parcial', body: 'Cubres tu vida, pero sin margen o con ayuda ocasional.' },
  { title: 'Independencia económica', body: 'Sostienes tu vida y construyes futuro con tu propio dinero.' },
];

export const COST_TEMPLATE: { id: string; label: string; group: CostGroup }[] = [
  { id: 'vivienda', label: 'Vivienda', group: 'esencial' },
  { id: 'agua', label: 'Agua', group: 'esencial' },
  { id: 'energia', label: 'Energía', group: 'esencial' },
  { id: 'gas', label: 'Gas', group: 'esencial' },
  { id: 'alimentacion', label: 'Alimentación', group: 'esencial' },
  { id: 'transporte', label: 'Transporte', group: 'esencial' },
  { id: 'internet', label: 'Internet', group: 'esencial' },
  { id: 'celular', label: 'Plan celular', group: 'esencial' },
  { id: 'salud', label: 'Salud', group: 'esencial' },
  { id: 'cuidado', label: 'Cuidado personal', group: 'personal' },
  { id: 'ocio', label: 'Ocio y vida social', group: 'personal' },
  { id: 'ropa', label: 'Ropa', group: 'personal' },
  { id: 'ahorro', label: 'Ahorro', group: 'futuro' },
  { id: 'emergencias', label: 'Fondo de emergencias', group: 'futuro' },
  { id: 'formacion', label: 'Formación', group: 'futuro' },
];

export const COST_GROUPS: Record<CostGroup, { title: string; hint: string }> = {
  esencial: { title: 'Necesidades esenciales', hint: 'Lo que sostiene tu vida cada mes.' },
  personal: { title: 'Necesidades personales', hint: 'Lo que hace tu vida más tuya.' },
  futuro: { title: 'Construcción de futuro', hint: 'Lo que hoy reservas para mañana.' },
};
