import { memo, useMemo } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

/**
 * Pixel sprites from the v2 design (sprites.js): grids of 9–16 px, outline #0B3D2E.
 * Rendered as SVG rects so they stay crisp at any size on web and Android.
 */
const P: Record<string, string> = {
  o: '#0B3D2E', g: '#146B3A', l: '#3E9A5C', L: '#8FCB9B',
  y: '#F8B229', Y: '#FDDC8A', d: '#C7861A',
  r: '#EA4630', w: '#BB2528', W: '#8E1A1D',
  c: '#FBF8F2', p: '#EFE3C8', P: '#D9C7A0',
  b: '#9A6440', B: '#6B4029', s: '#EDB98F', S: '#C98B62',
  h: '#E8E2D6', H: '#B9B1A3', k: '#8A8276', K: '#C9C0B0',
};

const S = {
  compass: [
    '.....oooooo.....', '...ooyyyyyyoo...', '..oyyYccccYyyo..', '.oyYcccrrcccYyo.',
    '.oyccccrrccccyo.', 'oyccccrrrrccccyo', 'oyccccrrrrccccyo', 'oycccccyycccccyo',
    'oycccccyycccccyo', 'oyccccggggccccyo', 'oyccccggggccccyo', '.oyccccggccccyo.',
    '.oydcccggcccdyo.', '..oyddccccddyo..', '...ooyyyyyyoo...', '.....oooooo.....',
  ],
  sprout: [
    '................', '..oooo....oooo..', '.oLLllo..ollLLo.', '.oLlllloolllllo.',
    '..ollllggllllo..', '...ooooggoooo...', '......oggo......', '......oggo......',
    '......oggo......', '...oooooooooo...', '...obbbbbbbbo...', '...oBBBBBBBBo...',
    '....obbbbbbo....', '....obbbbbbo....', '....obbbbbbo....', '.....oooooo.....',
  ],
  door: [
    '.....oooooo.....', '...oobbbbbboo...', '..obbBBBBBBbbo..', '.obBByyyyyyBBbo.',
    '.obByyYYYYyyBbo.', 'obbByYYYYYYyBbbo', 'obbByYYccYYyBbbo', 'obbByYYccYYyBbbo',
    'obbByYYYYYYyBbbo', 'obbByyYYYYyyBbbo', 'obbByyyyyyyyBbbo', 'obbByyyyyyyyBbbo',
    'obbByyyyyyyyBbbo', 'obbBddddddddBbbo', 'oKKKKKKKKKKKKKKo', 'oooooooooooooooo',
  ],
  map: [
    'oooooooooooooooo', 'occccoppppocccco', 'oclLcoppppocccco', 'oclLcoprppocwcwo',
    'occccopprpoccwco', 'occrcoppprocwcwo', 'ocrccoppppcrccco', 'orcccoPrPPocccco',
    'occccoPPrPocccco', 'occccoPPPrrcccco', 'oooooooooooooooo',
  ],
  flag: [
    '......B.........', '......Brr.......', '......Brrrr.....', '......Brrrrrr...',
    '......Brrrr.....', '......Brr.......', '......B.........', '......B.........',
    '......B.........', '....ooBoo.......', '..oolllllloo....', '.olllLllllllooo.',
    'olllllllllllllo.', 'ollllllllllllllo', 'oggggggggggggggo', 'oooooooooooooooo',
  ],
  house: [
    '.......oo.......', '......owwo......', '.....owwwwo.....', '....owwwwwwo....',
    '...owwwwwwwwo...', '..owwwwwwwwwwo..', '.oWWWWWWWWWWWWo.', '..occcccccccco..',
    '..occcccoooooo..', '..ocoocoyyyoo..', '..ocobocoyYyoo..', '..ocobocoyyyoo..',
    '..ocobocoooooo..', '..ocobocccccco..', 'llloooooooooooll', 'gggggggggggggggg',
  ],
  lock: [
    '...oooooo...', '..oKKKKKKo..', '..oKo..oKo..', '..oKo..oKo..', '..oKo..oKo..',
    'oooooooooooo', 'oyYyyyyyyydo', 'oYyyyyyyyydo', 'oyyyyooyyydo', 'oyyyyooyyydo',
    'oyyyyoyyyydo', 'oyyyyyyyyydo', 'oddddddddddo', 'oooooooooooo',
  ],
  seal: [
    '.....oooooo.....', '...ooWwwwwWoo...', '..oWwwrwwwwwWo..', '.oWwrwwwwwwwwWo.',
    '.owwwwYYYYwwwwo.', 'oWwwwYwwwwYwwwWo', 'owwwYwwYYwwYwwwo', 'owwwYwYwwYwYwwwo',
    'owwwYwYwwYwYwwwo', 'owwwYwwYYwwYwwwo', 'oWwwwYwwwwYwwwWo', '.owwwwYYYYwwwwo.',
    '.oWwwwwwwwwwwWo.', '..oWWwwwwwwWWo..', '...ooWWWWWWoo...', '.....oooooo.....',
  ],
  lantern: [
    '.....oo.....', '....o..o....', '....o..o....', '..oooooooo..', '.oBBBBBBBBo.',
    '.oYYYYYYYYo.', '.oYYYrrYYYo.', '.oYYrrrrYYo.', '.oYYryyrYYo.', '.oYYryyrYYo.',
    '.oYYYrrYYYo.', '.oYYYYYYYYo.', '.oBBBBBBBBo.', '..oooooooo..',
  ],
  gem: [
    '...ooo...', '..oYYyo..', '.oYYyyyo.', 'oYyyyyydo', 'oyyyyyddo',
    '.oyyyddo.', '..oyddo..', '...odo...', '....o....',
  ],
  mentor: [
    '.....oooooo.....', '...oohhhhhhoo...', '..ohhhhhhhhhho..', '.ohhHsssssHhhho.',
    '.ohHssssssssHho.', '.ohssssssssssho.', '.oHsHHssssHHsHo.', '.osssossssossso.',
    '.osSssssssssSso.', '.oSssssSSssssSo.', '..ohhhhhhhhhho..', '..ohhhoooohhho..',
    '...ohhhhhhhho...', '..oggoohhooggo..', '.ogggggoogggggo.', 'oggggggyyggggggo',
  ],
  scroll: [
    '.oooooooooooo.', 'oPppppppppppPo', '.oooooooooooo.', '..opppppppppo.',
    '..opkkkkkkppo.', '..opppppppppo.', '..opkkkkkpppo.', '..opppppppppo.',
    '..opkkkkkkppo.', '..opppppppwpo.', '.oooooooooooo.', 'oPppppppppppPo',
    '.oooooooooooo.',
  ],
} as const;

export type SpriteName = keyof typeof S;

/** grayscale: CSS grayscale(1). silhouette: CSS brightness(0) — the shape in ink. */
export type SpriteFilter = 'none' | 'grayscale' | 'silhouette';

type Run = { x: number; y: number; w: number; color: string };

function toGray(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const v = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
  return `rgb(${v},${v},${v})`;
}

const runCache = new Map<string, { runs: Run[]; w: number; h: number }>();

function runsFor(name: SpriteName, filter: SpriteFilter) {
  const key = `${name}:${filter}`;
  const cached = runCache.get(key);
  if (cached) return cached;
  const rows = S[name] as readonly string[];
  const w = Math.max(...rows.map((r) => r.length));
  const runs: Run[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const base = P[row[x]];
      if (!base) {
        x++;
        continue;
      }
      let end = x + 1;
      while (end < row.length && row[end] === row[x]) end++;
      const color = filter === 'silhouette' ? '#000000' : filter === 'grayscale' ? toGray(base) : base;
      runs.push({ x, y, w: end - x, color });
      x = end;
    }
  });
  const result = { runs, w, h: rows.length };
  runCache.set(key, result);
  return result;
}

export function spriteSize(name: SpriteName) {
  const rows = S[name] as readonly string[];
  return { w: Math.max(...rows.map((r) => r.length)), h: rows.length };
}

type Props = {
  name: SpriteName;
  /** Rendered width in px; height follows the sprite's aspect ratio unless given. */
  width: number;
  height?: number;
  filter?: SpriteFilter;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
};

export const Sprite = memo(function Sprite({ name, width, height, filter = 'none', opacity = 1, style }: Props) {
  const { runs, w, h } = useMemo(() => runsFor(name, filter), [name, filter]);
  const renderH = height ?? (width * h) / w;
  return (
    <View style={[{ width, height: renderH, opacity }, style]} pointerEvents="none">
      <Svg width={width} height={renderH} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
        {runs.map((r, i) => (
          // A hair of overlap hides anti-aliasing seams between pixels at fractional scales.
          <Rect key={i} x={r.x} y={r.y} width={r.w + 0.04} height={1.04} fill={r.color} />
        ))}
      </Svg>
    </View>
  );
});
