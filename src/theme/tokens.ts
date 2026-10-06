import { Platform } from 'react-native';

/** Design system v2 (Claude Design · "Viaje Financiero v2"). */
export const colors = {
  // Acción
  bosque: '#0B3D2E',
  bosqueDeep: '#062219',
  verde: '#146B3A',
  verdeMid: '#3E9A5C',
  verdeLight: '#8FCB9B',
  verdeTint: '#DDEBE1',
  verdePick: '#EAF4EC',
  oro: '#F8B229',
  oroLight: '#FDDC8A',
  oroDark: '#C7861A',
  oroTint: '#FDF0D2',
  oroText: '#8A5D00',
  brasa: '#EA4630',
  brasaTint: '#FCE1DB',
  brasaText: '#B3361F',
  lacre: '#BB2528',
  lacreDark: '#8E1A1D',
  lacreTint: '#F6D9D9',
  // Neutros
  bg: '#FBF8F2',
  card: '#FFFDF8',
  border: '#E6DDCB',
  divider: '#EFE7D8',
  locked: '#E2D9C8',
  lockedDark: '#C9C0B0',
  parchment: '#EFE3C8',
  parchmentEdge: '#D9C7A0',
  ink: '#2B2A26',
  inkSoft: '#5E584F',
  muted: '#746C61',
  white: '#FFFFFF',
} as const;

export const fonts = {
  title: 'Nunito_900Black',
  heavy: 'Nunito_800ExtraBold',
  bold: 'Nunito_700Bold',
  semi: 'Nunito_600SemiBold',
  /** Silkscreen: only short game labels. */
  game: 'Silkscreen_400Regular',
  /** Cormorant italic: only personal phrases. */
  phrase: 'CormorantGaramond_600SemiBold_Italic',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 } as const;

/** Radios: 12 chips · 14–16 botones · 18–22 tarjetas. */
export const radius = { chip: 12, button: 16, card: 20, hero: 22, pill: 999 } as const;

export const maxContentWidth = 1080;

/** Animated API native driver is not available on web. */
export const useNativeDriver = Platform.OS !== 'web';
