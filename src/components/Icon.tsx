import type { IconWeight } from 'phosphor-react-native';
// Per-icon imports keep the bundle small (the package ships 3,000+ icons).
import { ArrowLeftIcon } from 'phosphor-react-native/src/icons/ArrowLeft';
import { ArrowRightIcon } from 'phosphor-react-native/src/icons/ArrowRight';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { ChatCircleTextIcon } from 'phosphor-react-native/src/icons/ChatCircleText';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { ClockIcon } from 'phosphor-react-native/src/icons/Clock';
import { CompassIcon } from 'phosphor-react-native/src/icons/Compass';
import { DiamondIcon } from 'phosphor-react-native/src/icons/Diamond';
import { DoorOpenIcon } from 'phosphor-react-native/src/icons/DoorOpen';
import { FlameIcon } from 'phosphor-react-native/src/icons/Flame';
import { HouseIcon } from 'phosphor-react-native/src/icons/House';
import { HouseLineIcon } from 'phosphor-react-native/src/icons/HouseLine';
import { IdentificationBadgeIcon } from 'phosphor-react-native/src/icons/IdentificationBadge';
import { LockSimpleIcon } from 'phosphor-react-native/src/icons/LockSimple';
import { MapTrifoldIcon } from 'phosphor-react-native/src/icons/MapTrifold';
import { MicrophoneIcon } from 'phosphor-react-native/src/icons/Microphone';
import { PaperPlaneRightIcon } from 'phosphor-react-native/src/icons/PaperPlaneRight';
import { PlantIcon } from 'phosphor-react-native/src/icons/Plant';
import { PlayIcon } from 'phosphor-react-native/src/icons/Play';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { QuotesIcon } from 'phosphor-react-native/src/icons/Quotes';
import { ScrollIcon } from 'phosphor-react-native/src/icons/Scroll';
import { SealCheckIcon } from 'phosphor-react-native/src/icons/SealCheck';
import { SignpostIcon } from 'phosphor-react-native/src/icons/Signpost';
import { StopIcon } from 'phosphor-react-native/src/icons/Stop';
import { UsersThreeIcon } from 'phosphor-react-native/src/icons/UsersThree';
import { WhatsappLogoIcon } from 'phosphor-react-native/src/icons/WhatsappLogo';
import { XIcon } from 'phosphor-react-native/src/icons/X';

import { colors } from '@/theme/tokens';

/** Phosphor icons (MIT). Only the icons the app uses are imported. */
const ICONS = {
  arrowLeft: ArrowLeftIcon,
  arrowRight: ArrowRightIcon,
  caretRight: CaretRightIcon,
  chat: ChatCircleTextIcon,
  check: CheckIcon,
  clock: ClockIcon,
  compass: CompassIcon,
  diamond: DiamondIcon,
  door: DoorOpenIcon,
  flame: FlameIcon,
  home: HouseIcon,
  house: HouseLineIcon,
  passport: IdentificationBadgeIcon,
  lock: LockSimpleIcon,
  map: MapTrifoldIcon,
  mic: MicrophoneIcon,
  send: PaperPlaneRightIcon,
  plant: PlantIcon,
  play: PlayIcon,
  plus: PlusIcon,
  quotes: QuotesIcon,
  scroll: ScrollIcon,
  seal: SealCheckIcon,
  signpost: SignpostIcon,
  stop: StopIcon,
  group: UsersThreeIcon,
  whatsapp: WhatsappLogoIcon,
  close: XIcon,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 22,
  color = colors.ink,
  weight = 'light',
  duotoneColor,
}: {
  name: IconName;
  size?: number;
  color?: string;
  weight?: IconWeight;
  duotoneColor?: string;
}) {
  const Component = ICONS[name];
  return <Component size={size} color={color} weight={weight} duotoneColor={duotoneColor ?? color} duotoneOpacity={0.16} />;
}
