import { fontRoles } from './theme.mjs';

/**
 * SVGs shown through <img> cannot load web fonts, so the fonts are embedded:
 * Google Fonts returns a WOFF2 subset with only the glyphs we ask for
 * (usually 2-8 KB), which is inlined as a data URI.
 */
const CSS_ENDPOINT = 'https://fonts.googleapis.com/css2';
// Google Fonts only serves WOFF2 to browsers it recognises.
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const cache = new Map();

export function embedFontFace({ family, weight }, chars, fetchImpl = globalThis.fetch) {
  const text = [...new Set(chars)].sort().join('');
  const key = `${family}|${weight}|${text}`;
  if (!cache.has(key)) cache.set(key, loadFontFace(family, weight, text, fetchImpl));
  return cache.get(key);
}

async function loadFontFace(family, weight, text, fetchImpl) {
  const familyParam = encodeURIComponent(family).replace(/%20/g, '+');
  const url = `${CSS_ENDPOINT}?family=${familyParam}:wght@${weight}&text=${encodeURIComponent(text)}&display=block`;
  const cssResponse = await fetchImpl(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!cssResponse.ok) throw new Error(`stylesheet request failed with HTTP ${cssResponse.status}`);
  const css = await cssResponse.text();
  const sources = [...css.matchAll(/url\((https:\/\/[^)]+)\)\s*format\(['"]woff2['"]\)/g)].map((match) => match[1]);
  if (sources.length === 0) throw new Error('the stylesheet has no WOFF2 source');
  const rules = [];
  for (const source of sources) {
    const fontResponse = await fetchImpl(source, { headers: { 'User-Agent': USER_AGENT } });
    if (!fontResponse.ok) throw new Error(`font request failed with HTTP ${fontResponse.status}`);
    const data = Buffer.from(await fontResponse.arrayBuffer()).toString('base64');
    rules.push(`@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${data}) format('woff2')}`);
  }
  return rules.join('');
}

/** Collects the glyphs each font role uses while an SVG is being built. */
export class Typeset {
  #chars = new Map();

  /** Records the glyphs `text` needs in `role` and returns the text unchanged. */
  use(role, text) {
    if (!fontRoles[role]) throw new Error(`Unknown font role: ${role}`);
    const chars = this.#chars.get(role) ?? new Set([' ']);
    for (const char of String(text)) chars.add(char);
    this.#chars.set(role, chars);
    return text;
  }

  /** CSS with one `.f-<role>` class per role, plus embedded @font-face rules when `embed` is true. */
  async css({ embed = true, fetchImpl = globalThis.fetch, warn = (message) => console.warn(message) } = {}) {
    const classes = Object.entries(fontRoles)
      .map(([role, spec]) => `.f-${role}{font-family:'${spec.family}',${spec.fallback};font-weight:${spec.weight}}`)
      .join('');
    if (!embed) return classes;
    const faces = [];
    for (const [role, chars] of this.#chars) {
      const spec = fontRoles[role];
      try {
        faces.push(await embedFontFace(spec, chars, fetchImpl));
      } catch (error) {
        warn(`[fonts] ${spec.family} ${spec.weight}: ${error.message}; falling back to system fonts`);
      }
    }
    return faces.join('') + classes;
  }
}
