import { Platform } from 'react-native';

export const colors = {
  ivory: '#F6F1E7',
  surface: '#FBF8F2',
  paper: '#EFE7D8',
  line: '#E2D9C8',
  ink: '#2B2A26',
  inkSoft: '#5E584F',
  warmGray: '#8A8276',
  forest: '#2F4A3D',
  forestDeep: '#22382E',
  sage: '#8DA290',
  sageSoft: '#DCE3D8',
  champagne: '#C9B38A',
  champagneSoft: '#EFE5D1',
  terracotta: '#B8674A',
  terracottaSoft: '#F1DDD3',
  white: '#FFFFFF',
} as const;

export const fonts = {
  serif: 'CormorantGaramond_600SemiBold',
  serifMedium: 'CormorantGaramond_500Medium',
  serifItalic: 'CormorantGaramond_500Medium_Italic',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemi: 'Inter_600SemiBold',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;

export const shadow = Platform.select({
  web: { boxShadow: '0 1px 2px rgba(43,42,38,0.04), 0 8px 24px rgba(43,42,38,0.06)' } as object,
  default: {
    shadowColor: '#2B2A26',
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
});

/** Content column width on large (web) screens. */
export const maxContentWidth = 560;

/** Animated API native driver is not available on web. */
export const useNativeDriver = Platform.OS !== 'web';
