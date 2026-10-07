import { Platform } from 'react-native';

/**
 * "Aula clara" (proposal B): light, airy surfaces, navy ink, green for progress.
 * Manrope for everything; weight carries the hierarchy.
 */
export const colors = {
  bg: '#F4F6FA',
  surface: '#FFFFFF',
  sunken: '#EBEFF5',
  line: '#E3E8F0',
  lineSoft: '#EDF1F6',
  ink: '#10203B',
  inkSoft: '#33415C',
  muted: '#5F6E87',
  label: '#5F6E87',
  /** Buttons and green text (AA on white). */
  accent: '#0B8550',
  /** Progress fills and success marks. */
  accentBright: '#12A664',
  accentSoft: '#E2F6EC',
  /** Dark surfaces: celebrations, onboarding, monograms. */
  navy: '#10203B',
  warm: '#F39C12',
  warmSoft: '#FFF1DD',
  /** Prices, locks and errors (AA on warmSoft). */
  warn: '#A35F00',
  warnSoft: '#FFF1DD',
  danger: '#C2362F',
  onDark: '#FFFFFF',
  onDarkMuted: 'rgba(255,255,255,0.72)',
  white: '#FFFFFF',
} as const;

export const fonts = {
  display: 'Manrope_800ExtraBold',
  displayItalic: 'Manrope_600SemiBold',
  displayMedium: 'Manrope_700Bold',
  sans: 'Manrope_500Medium',
  sansMedium: 'Manrope_600SemiBold',
  sansSemi: 'Manrope_700Bold',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { sm: 8, md: 12, lg: 14, pill: 999 } as const;

export const maxContentWidth = 720;

/** Animated API native driver is not available on web. */
export const useNativeDriver = Platform.OS !== 'web';
