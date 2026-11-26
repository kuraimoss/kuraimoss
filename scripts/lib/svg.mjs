/**
 * Small helpers for writing SVG by hand.
 */

/** Escapes text for XML text nodes and attribute values. */
export function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Formats a coordinate with at most two decimals. */
export function n(value) {
  const rounded = Math.round(value * 100) / 100;
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

/** JetBrains Mono advances every glyph by 600/1000 em, so mono text widths are exact. */
export const MONO_ADVANCE = 0.6;

export function monoWidth(text, size, letterSpacing = 0) {
  return [...String(text)].length * (size * MONO_ADVANCE + letterSpacing);
}

/** Wraps generated pieces in a self-contained, accessible SVG document. */
export function svgDocument({ width, height, title, desc, css, defs = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">${esc(desc)}</desc>
<style>${css}</style>
<defs>${defs}</defs>
${body}
</svg>
`;
}

const BARE_AMPERSAND = /&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/;

/**
 * Minimal well-formedness check for the markup these scripts generate:
 * balanced tags, double-quoted attributes, and no stray "<", ">" or "&".
 * Returns a list of problems; an empty list means the document looks valid.
 */
export function checkWellFormed(xml) {
  const problems = [];
  const source = xml.replace(/<!--[\s\S]*?-->/g, '');
  const tagPattern = /<(\/?)([A-Za-z][\w:.-]*)((?:\s+[\w:.-]+="[^"<]*")*)\s*(\/?)>/g;
  const stack = [];
  let cursor = 0;
  for (const match of source.matchAll(tagPattern)) {
    const [whole, closing, name, attributes, selfClosing] = match;
    const text = source.slice(cursor, match.index);
    if (text.includes('<')) problems.push(`unexpected "<" before <${name}>`);
    if (text.includes('>')) problems.push(`unexpected ">" before <${name}>`);
    if (BARE_AMPERSAND.test(text) || BARE_AMPERSAND.test(attributes)) problems.push(`bare "&" near <${name}>`);
    cursor = match.index + whole.length;
    if (closing) {
      const open = stack.pop();
      if (open !== name) problems.push(`</${name}> closes <${open ?? 'nothing'}>`);
    } else if (!selfClosing) {
      stack.push(name);
    }
  }
  if (source.slice(cursor).trim()) problems.push('content after the last tag');
  if (stack.length > 0) problems.push(`unclosed tags: ${stack.join(', ')}`);
  return problems;
}
