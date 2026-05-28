/**
 * Design tokens — the RN translation of the CSS custom properties that used to
 * live in `app/globals.css`. Same dreamy-midnight palette; one accent per
 * screen, max two. There is no light mode.
 */

export const colors = {
  // core palette — dreamy midnight
  bgDeep: '#07060f',
  bgCosmos: '#0c0a1c',
  bgElev1: 'rgba(255,255,255,0.03)',
  bgElev2: 'rgba(255,255,255,0.06)',
  bgElev3: 'rgba(255,255,255,0.09)',
  glassBorder: 'rgba(255,255,255,0.09)',
  glassBorderBright: 'rgba(255,255,255,0.18)',

  // text
  textHi: '#f6f4ff',
  textMid: 'rgba(246,244,255,0.66)',
  textLo: 'rgba(246,244,255,0.40)',
  textDisabled: 'rgba(246,244,255,0.22)',

  // accents
  violet: '#8B6FFF',
  violetDeep: '#5B3FE6',
  cyan: '#6BE5FF',
  rose: '#FF8AB4',
  mint: '#5EFFB2',
  amber: '#FFC56B',
} as const;

export type Tone =
  | 'rose'
  | 'mint'
  | 'amber'
  | 'cyan'
  | 'violet'
  | 'lo'
  | 'mid'
  | 'hi';

/** Resolve a tone name to a concrete color (replaces the web `toneColor`). */
export const toneColor = (tone: Tone): string => {
  switch (tone) {
    case 'rose':
      return colors.rose;
    case 'mint':
      return colors.mint;
    case 'amber':
      return colors.amber;
    case 'cyan':
      return colors.cyan;
    case 'violet':
      return colors.violet;
    case 'lo':
      return colors.textLo;
    case 'mid':
      return colors.textMid;
    case 'hi':
      return colors.textHi;
  }
};

/**
 * Font families. On bare RN these must match the PostScript names of fonts
 * linked via `react-native.config.js` assets / `npx react-native-asset`. Until
 * the custom fonts (Geist Mono / Instrument Serif) are bundled, RN falls back
 * to the platform monospace, which keeps the terminal feel.
 */
export const fonts = {
  mono: 'GeistMono-Regular',
  monoFallback: 'monospace',
  display: 'InstrumentSerif-Regular',
  sans: 'Geist-Regular',
} as const;

export const space = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 28,
} as const;
