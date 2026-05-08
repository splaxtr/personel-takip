import { MD3LightTheme } from 'react-native-paper';

export const RENK = {
  primary: '#1B5E20',
  primaryAcik: '#A5D6A7',
  alacak: '#1B5E20',
  borc: '#B71C1C',
  notr: '#212121',
  ikincilMetin: '#616161',
  cizgi: '#E0E0E0',
  arkaplan: '#FAFAFA',
  kart: '#FFFFFF',
  vurguArkaplan: '#F1F8E9',
} as const;

export const PUNTO = {
  devasa: 36,
  buyuk: 28,
  baslik: 24,
  altBaslik: 20,
  govde: 18,
  kucuk: 16,
  detay: 14,
} as const;

export const BOSLUK = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

export const RADIUS = {
  s: 6,
  m: 10,
  l: 14,
} as const;

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: RENK.primary,
    primaryContainer: RENK.primaryAcik,
    background: RENK.arkaplan,
    surface: RENK.kart,
    surfaceVariant: RENK.vurguArkaplan,
    onSurface: RENK.notr,
    onSurfaceVariant: RENK.ikincilMetin,
    outline: RENK.cizgi,
    error: RENK.borc,
  },
};
