import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme/tokens';

export type IconName =
  | 'compass'
  | 'seed'
  | 'door'
  | 'map'
  | 'route'
  | 'home'
  | 'lock'
  | 'check'
  | 'arrowRight'
  | 'arrowLeft'
  | 'mic'
  | 'send'
  | 'stop'
  | 'chat'
  | 'doc'
  | 'user'
  | 'sparkle'
  | 'play'
  | 'close'
  | 'key'
  | 'passport';

type Props = { name: IconName; size?: number; color?: string; strokeWidth?: number };

export function Icon({ name, size = 22, color = colors.ink, strokeWidth = 1.6 }: Props) {
  const p = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {render(name, p, color)}
    </Svg>
  );
}

function render(name: IconName, p: object, color: string) {
  switch (name) {
    case 'compass':
      return (
        <>
          <Circle cx={12} cy={12} r={9} {...p} />
          <Path d="M15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5z" {...p} />
        </>
      );
    case 'seed':
      return (
        <>
          <Path d="M12 20v-8" {...p} />
          <Path d="M12 12c0-4 3-6 7-6 0 4-3 6-7 6z" {...p} />
          <Path d="M12 14c0-3-2.5-5-6-5 0 3 2.5 5 6 5z" {...p} />
        </>
      );
    case 'door':
      return (
        <>
          <Path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17" {...p} />
          <Path d="M4 21h16" {...p} />
          <Circle cx={14.5} cy={12} r={0.9} fill={color} />
        </>
      );
    case 'map':
      return (
        <>
          <Path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" {...p} />
          <Path d="M9 4v14M15 6v14" {...p} />
        </>
      );
    case 'route':
      return (
        <>
          <Circle cx={6} cy={19} r={2} {...p} />
          <Circle cx={18} cy={5} r={2} {...p} />
          <Path d="M8 19h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16" {...p} />
        </>
      );
    case 'home':
      return (
        <>
          <Path d="M4 11 12 4l8 7" {...p} />
          <Path d="M6 9.5V20h12V9.5M10 20v-5h4v5" {...p} />
        </>
      );
    case 'lock':
      return (
        <>
          <Rect x={5} y={10.5} width={14} height={10} rx={2} {...p} />
          <Path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" {...p} />
        </>
      );
    case 'check':
      return <Path d="M5 12.5l4.5 4.5L19 7.5" {...p} />;
    case 'arrowRight':
      return <Path d="M5 12h14M13 6l6 6-6 6" {...p} />;
    case 'arrowLeft':
      return <Path d="M19 12H5M11 6l-6 6 6 6" {...p} />;
    case 'mic':
      return (
        <>
          <Rect x={9} y={3} width={6} height={11} rx={3} {...p} />
          <Path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" {...p} />
        </>
      );
    case 'send':
      return <Path d="M4 12 20 4l-6 16-3-7-7-1z" {...p} />;
    case 'stop':
      return <Rect x={7} y={7} width={10} height={10} rx={2} fill={color} />;
    case 'chat':
      return (
        <>
          <Path d="M4 5h16v11H9l-5 4V5z" {...p} />
          <Path d="M8 9.5h8M8 12.5h5" {...p} />
        </>
      );
    case 'doc':
      return (
        <>
          <Path d="M7 3h7l4 4v14H7z" {...p} />
          <Path d="M14 3v4h4M10 12h5M10 16h5" {...p} />
        </>
      );
    case 'user':
      return (
        <>
          <Circle cx={12} cy={8} r={4} {...p} />
          <Path d="M4 21c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5" {...p} />
        </>
      );
    case 'sparkle':
      return <Path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" {...p} />;
    case 'play':
      return <Path d="M8 5v14l11-7z" fill={color} />;
    case 'close':
      return <Path d="M6 6l12 12M18 6 6 18" {...p} />;
    case 'key':
      return (
        <>
          <Circle cx={8} cy={15} r={4} {...p} />
          <Path d="M11 12l9-9M17 6l3 3" {...p} />
        </>
      );
    case 'passport':
      return (
        <>
          <Path d="M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6z" {...p} />
          <Circle cx={12} cy={10} r={3} {...p} />
          <Path d="M9 16h6" {...p} />
        </>
      );
  }
}
