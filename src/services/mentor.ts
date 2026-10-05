/**
 * Mentor for Level 1.
 *
 * This is a local, rule-based stand-in so the experience can be designed and tested end to end.
 * In production these two functions should call our backend, which runs an LLM (e.g. Claude)
 * with the mentor prompt, transcribes audio, and returns the same shapes. Never ship an API key
 * in the client.
 */
import { ChatMessage, Mantra, TransformationMap } from '@/state/journey';

export const MAX_FOLLOW_UPS = 3;

type Dimension = 'thought' | 'belief' | 'emotion' | 'behavior';

const normalize = (t: string) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const EMOTIONS: [RegExp, string][] = [
  [/ansiedad|ansios|angusti|estres|preocup|nervios/, 'Ansiedad'],
  [/miedo|temor|asust|panico/, 'Miedo'],
  [/culpa/, 'Culpa'],
  [/verguenza|pena|me da cosa/, 'Vergüenza'],
  [/frustr|rabia|impotencia|cansad/, 'Frustración'],
  [/triste|desanim|desesper/, 'Desánimo'],
  [/confund|perdid|abrumad|no entiendo/, 'Confusión'],
];

type Pattern = 'evitar' | 'credito' | 'impulso' | 'desorden' | 'ayudar' | 'findemes';

const PATTERNS: [RegExp, Pattern][] = [
  [/evito|no reviso|no miro|no quiero ver|ignoro|no abro/, 'evitar'],
  [/tarjeta|credito|prestamo|deud|cuotas|debo/, 'credito'],
  [/impuls|antojo|compro sin|gasto de mas|se me va|gasto mucho/, 'impulso'],
  [/no se en que|no se cuanto|desorden|no llevo|no anoto|no tengo control/, 'desorden'],
  [/ayudo a|depende de mi|le presto|les presto|le doy|mi familia/, 'ayudar'],
  [/fin de mes|no me alcanza|quincena|no alcanza|vivo al dia/, 'findemes'],
];

const THOUGHT_HINT = /pienso|siento que|creo que|no soy|nunca voy|no sirvo|soy mal|no puedo|no se manejar/;
const BELIEF_HINT = /el dinero es|el dinero no|los ricos|no merezco|me ensenaron|en mi casa|mis padres|mi mama|mi papa|siempre ha sido/;

function userText(messages: ChatMessage[]) {
  return normalize(
    messages
      .filter((m) => m.from === 'user' && m.kind === 'text')
      .map((m) => m.text ?? '')
      .join(' \n '),
  );
}

function detect(messages: ChatMessage[]) {
  const text = userText(messages);
  const emotion = EMOTIONS.find(([re]) => re.test(text))?.[1];
  const pattern = PATTERNS.find(([re]) => re.test(text))?.[1];
  const covered: Record<Dimension, boolean> = {
    thought: THOUGHT_HINT.test(text),
    belief: BELIEF_HINT.test(text),
    emotion: !!emotion,
    behavior: !!pattern,
  };
  return { text, emotion, pattern, covered };
}

function fragment(messages: ChatMessage[]) {
  const last = [...messages].reverse().find((m) => m.from === 'user' && m.kind === 'text')?.text;
  if (!last) return null;
  const sentence = last.split(/[.!?\n]/).map((s) => s.trim()).find((s) => s.length > 12) ?? last.trim();
  return sentence.length > 70 ? `${sentence.slice(0, 67).trim()}…` : sentence;
}

const OPENERS = [
  'Gracias por contarlo con tanta honestidad.',
  'Entiendo. Lo que describes le pasa a muchas más personas de lo que imaginas.',
  'Eso que dices es importante.',
];

const QUESTIONS: Record<Dimension, (frag: string | null) => string> = {
  emotion: () =>
    '¿Qué sientes cuando tienes que mirar tus cuentas o hacer un pago importante? Puedes describirlo como una sensación en el cuerpo.',
  behavior: () =>
    'Y en la práctica, ¿qué sueles hacer cuando llega el dinero? ¿Y cuando se acaba antes de lo esperado?',
  thought: (frag) =>
    frag
      ? `Cuando dices «${frag}», ¿qué es lo primero que piensas sobre ti en ese momento?`
      : 'Cuando piensas en tu dinero, ¿qué es lo primero que te dices sobre ti?',
  belief: () =>
    '¿Qué aprendiste en casa sobre el dinero? ¿Hay alguna frase que escuchabas con frecuencia?',
};

export type MentorTurn = { reply: string; readyForMap: boolean };

export async function mentorRespond(messages: ChatMessage[], followUps: number): Promise<MentorTurn> {
  await wait(900);
  const { covered } = detect(messages);
  const missing = (['emotion', 'behavior', 'thought', 'belief'] as Dimension[]).filter((d) => !covered[d]);
  const lastIsAudio = messages[messages.length - 1]?.kind === 'audio';

  if (missing.length === 0 || followUps >= MAX_FOLLOW_UPS) {
    return {
      reply:
        'Creo que ya tengo una imagen clara de lo que está pasando. Con lo que me compartiste puedo construir tu Mapa Personal de Transformación.',
      readyForMap: true,
    };
  }

  const opener = lastIsAudio ? 'Gracias por tu audio, te escuché con atención.' : OPENERS[followUps % OPENERS.length];
  return { reply: `${opener} ${QUESTIONS[missing[0]](fragment(messages))}`, readyForMap: false };
}

const THOUGHTS: Partial<Record<Pattern, string>> = {
  evitar: '«Si miro mis cuentas me voy a sentir peor.»',
  credito: '«Ya lo pagaré después; ahora lo necesito.»',
  impulso: '«Me lo merezco, ya veré cómo lo cubro.»',
  desorden: '«No sé manejar mi dinero y no sé por dónde empezar.»',
  ayudar: '«Si no ayudo, estoy fallando.»',
  findemes: '«Nunca me va a alcanzar.»',
};

const BELIEFS: Partial<Record<Pattern, string>> = {
  evitar: 'Las finanzas son complicadas y no son para mí.',
  credito: 'El crédito es dinero extra que me salva el mes.',
  impulso: 'El dinero está para disfrutarlo ahora; el futuro es incierto.',
  desorden: 'Las finanzas son complejas y son cosa de expertos.',
  ayudar: 'Mi bienestar viene después del de los demás.',
  findemes: 'El dinero siempre es escaso.',
};

const BEHAVIORS: Record<Pattern, string> = {
  evitar: 'Evitar mirar extractos, saldos y cuentas.',
  credito: 'Usar el crédito para cubrir el mes y sumar cuotas.',
  impulso: 'Compras no planeadas para aliviar el estado de ánimo.',
  desorden: 'Decidir sin saber cuánto entra y cuánto sale.',
  ayudar: 'Dar o prestar dinero sin un límite definido.',
  findemes: 'Vivir al día, sin reservar nada al inicio del mes.',
};

const TRANSFORMS: Record<Pattern, string> = {
  evitar: 'Pasar de evitar los números a mirarlos con calma, una vez por semana.',
  credito: 'Dejar de usar el crédito como extensión del ingreso y conocer el costo real de cada cuota.',
  impulso: 'Crear una pausa entre el impulso y la compra.',
  desorden: 'Saber con exactitud cuánto entra y cuánto sale cada mes.',
  ayudar: 'Ayudar desde un límite claro, sin descuidar tu propia base.',
  findemes: 'Anticipar el mes en lugar de sobrevivirlo.',
};

const ACTIONS: Record<Pattern, string> = {
  evitar: 'Esta semana reviso mis movimientos durante diez minutos, sin juzgarme.',
  credito: 'Antes de pasar la tarjeta, me pregunto cuánto me costará en total.',
  impulso: 'Cuando quiero comprar algo no planeado, espero 24 horas antes de decidir.',
  desorden: 'Hoy anoto todo lo que entra y sale, aunque sea en una libreta.',
  ayudar: 'Defino cuánto puedo dar este mes sin afectar lo esencial.',
  findemes: 'Apenas recibo mi ingreso, separo primero lo esencial.',
};

export async function buildTransformation(
  messages: ChatMessage[],
): Promise<{ map: TransformationMap; mantras: Mantra[] }> {
  await wait(1600);
  const { text, emotion, pattern } = detect(messages);
  const p: Pattern = pattern ?? 'desorden';
  const firstStory = messages.find((m) => m.from === 'user' && m.kind === 'text')?.text?.trim();
  const situation = firstStory
    ? firstStory.length > 220
      ? `${firstStory.slice(0, 217).trim()}…`
      : firstStory
    : 'Compartiste tu historia por audio. Tu mentor la revisará contigo en el grupo de la semana.';

  let belief = BELIEFS[p]!;
  if (/no merezco/.test(text)) belief = 'No merezco tener dinero de sobra.';
  else if (/mis padres|en mi casa|mi mama|mi papa/.test(text) && p !== 'ayudar')
    belief = 'El dinero es escaso y suele traer problemas a la familia.';

  return {
    map: {
      situation,
      thought: THOUGHTS[p]!,
      belief,
      emotion: emotion ?? 'Inquietud',
      behavior: BEHAVIORS[p],
      transform: TRANSFORMS[p],
    },
    mantras: [
      {
        role: 'reencuadre',
        text:
          p === 'evitar' || p === 'desorden'
            ? 'Puedo mirar mis números con tranquilidad. Conocerlos me permite tomar mejores decisiones.'
            : p === 'findemes'
              ? 'Mi dinero no es poco por naturaleza: cuando lo conozco, puedo hacerlo rendir.'
              : 'Mis decisiones de ayer no me definen. Hoy puedo elegir distinto.',
      },
      {
        role: 'capacidad',
        text: 'Aprendo a mi ritmo. Cada paso que doy me hace más capaz de dirigir mi dinero.',
      },
      { role: 'accion', text: ACTIONS[p] },
    ],
  };
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
