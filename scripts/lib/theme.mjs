/**
 * Design tokens for every generated SVG: a calm pastel system with a light
 * and a dark theme. Text colours keep at least 4.5:1 contrast on their surface.
 */
const light = {
  name: 'light',
  canvasTop: '#FCFBFF',
  canvasBottom: '#F4F1FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F2FE',
  line: '#E8E3F6',
  ink: '#221E3B',
  inkSoft: '#48445F',
  muted: '#6B6784',
  accent: '#7C6CF2',
  accentInk: '#5543CF',
  shadow: '#4B3CB4',
  shadowOpacity: 0.1,
  success: '#2FB985',
  blobOpacity: 0.9,
  blobs: { lavender: '#E3DDFF', peach: '#FFDDCD', mint: '#CFF0E3', sky: '#D7E7FF', rose: '#FFDAE8', butter: '#FFF0C9' },
  tints: {
    lavender: { bg: '#EFEBFF', fg: '#5140B8' },
    sky: { bg: '#E7F0FF', fg: '#2C5BAE' },
    mint: { bg: '#E3F6EE', fg: '#1D7352' },
    peach: { bg: '#FFEDE4', fg: '#A64B23' },
    rose: { bg: '#FFE9F1', fg: '#A8355F' },
    butter: { bg: '#FFF5D8', fg: '#7D5E0C' },
  },
};

const dark = {
  name: 'dark',
  canvasTop: '#17161F',
  canvasBottom: '#1D1B29',
  surface: '#222030',
  surfaceAlt: '#282637',
  line: '#322F45',
  ink: '#EFEDF8',
  inkSoft: '#CFCBE0',
  muted: '#A39FB9',
  accent: '#B5AAFF',
  accentInk: '#C9C1FF',
  shadow: '#000000',
  shadowOpacity: 0.35,
  success: '#5FD3A8',
  blobOpacity: 0.3,
  blobs: { lavender: '#6A5CC4', peach: '#9A6450', mint: '#3E8A70', sky: '#4467A3', rose: '#9A4E72', butter: '#8F7B3C' },
  tints: {
    lavender: { bg: '#2B2844', fg: '#CBC3FF' },
    sky: { bg: '#21304B', fg: '#AECAF7' },
    mint: { bg: '#1E3730', fg: '#9EDFC5' },
    peach: { bg: '#3A2A24', fg: '#F3BDA2' },
    rose: { bg: '#3A2434', fg: '#F2ADC9' },
    butter: { bg: '#36301E', fg: '#EBD38E' },
  },
};

export const themes = { light, dark };
export const THEME_NAMES = Object.keys(themes);

const SANS_FALLBACK = "'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Font roles. Each role becomes a `.f-<role>` class and, when embedded, one WOFF2 subset. */
export const fontRoles = {
  display: { family: 'Plus Jakarta Sans', weight: 800, fallback: SANS_FALLBACK },
  heading: { family: 'Plus Jakarta Sans', weight: 700, fallback: SANS_FALLBACK },
  label: { family: 'Plus Jakarta Sans', weight: 600, fallback: SANS_FALLBACK },
  body: { family: 'Plus Jakarta Sans', weight: 500, fallback: SANS_FALLBACK },
};
