export { colors } from './colors';

export const fonts = {
  heading: 'SpaceGrotesk_700Bold',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const radius = { card: 18, cardLg: 20, pill: 999, sm: 12 } as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;
/** Mindste touch-mål. */
export const TOUCH = 44;
