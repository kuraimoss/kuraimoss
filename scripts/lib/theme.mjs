/**
 * Design tokens shared by every generated SVG: the existing violet brand
 * (#6E56CF) on a near-black violet canvas.
 */
export const colors = {
  canvasTop: '#0D0B18',
  canvasMid: '#110D20',
  canvasBottom: '#1A1231',
  surface: '#14102A',
  surfaceRaised: '#1B1634',
  well: '#0E0B1A',
  border: '#2A2346',
  borderStrong: '#3B2F63',
  text: '#F4F1FF',
  textMuted: '#BDB5D6',
  textSubtle: '#958DB0',
  textFaint: '#6F6790',
  brand: '#6E56CF',
  brandBright: '#8B6CFF',
  brandDeep: '#5B44C2',
  accent: '#A78BFA',
  accentSoft: '#C4B5FD',
  success: '#34D399',
  teal: '#2DD4BF',
};

const SANS_FALLBACK = "'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO_FALLBACK = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

/** Font roles. Each role becomes a `.f-<role>` class and, when embedded, one WOFF2 subset. */
export const fontRoles = {
  display: { family: 'Plus Jakarta Sans', weight: 800, fallback: SANS_FALLBACK },
  heading: { family: 'Plus Jakarta Sans', weight: 700, fallback: SANS_FALLBACK },
  body: { family: 'Plus Jakarta Sans', weight: 500, fallback: SANS_FALLBACK },
  mono: { family: 'JetBrains Mono', weight: 500, fallback: MONO_FALLBACK },
};
