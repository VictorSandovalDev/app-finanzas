import { Platform } from 'react-native';

/**
 * Editorial direction: ivory paper, deep forest ink, brass used sparingly.
 * Newsreader (serif) for headings, Hanken Grotesk for interface text.
 */
export const colors = {
  bg: '#F4F1E9',
  surface: '#FBFAF6',
  sunken: '#ECE7DB',
  line: '#DCD5C5',
  lineSoft: '#E8E2D5',
  ink: '#1C2420',
  inkSoft: '#4A524C',
  muted: '#6E7067',
  forest: '#1F4A39',
  forestDeep: '#143024',
  forestSoft: '#DCE5DD',
  moss: '#5F7D68',
  brass: '#A8864F',
  brassSoft: '#EFE6D3',
  umber: '#9C4F2E',
  umberSoft: '#F3E3DA',
  onDark: '#F4F1E9',
  onDarkMuted: 'rgba(244,241,233,0.72)',
  white: '#FFFFFF',
} as const;

export const fonts = {
  display: 'Newsreader_400Regular',
  displayItalic: 'Newsreader_400Regular_Italic',
  displayMedium: 'Newsreader_500Medium',
  sans: 'HankenGrotesk_400Regular',
  sansMedium: 'HankenGrotesk_500Medium',
  sansSemi: 'HankenGrotesk_600SemiBold',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

export const maxContentWidth = 720;

/** Animated API native driver is not available on web. */
export const useNativeDriver = Platform.OS !== 'web';
