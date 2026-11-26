import { colors as c } from './theme.mjs';
import { esc, n, monoWidth } from './svg.mjs';

/** Line icons on an 18x18 grid, drawn with strokes (Lucide-style). */
export const ICONS = {
  layout: '<rect x="1.8" y="2.6" width="14.4" height="12.8" rx="2.6"/><path d="M1.8 6.6h14.4M6.6 6.6v8.8"/>',
  braces: '<path d="M6.2 2.6c-1.7 0-2.6.8-2.6 2.5v1.5c0 1.3-.7 2-2 2.4 1.3.4 2 1.1 2 2.4v1.5c0 1.7.9 2.5 2.6 2.5M11.8 2.6c1.7 0 2.6.8 2.6 2.5v1.5c0 1.3.7 2 2 2.4-1.3.4-2 1.1-2 2.4v1.5c0 1.7-.9 2.5-2.6 2.5"/>',
  layers: '<path d="M9 1.9 1.9 5.5 9 9.1l7.1-3.6L9 1.9Z"/><path d="M1.9 9 9 12.6 16.1 9"/><path d="M1.9 12.5 9 16.1l7.1-3.6"/>',
  globe: '<circle cx="9" cy="9" r="7.2"/><ellipse cx="9" cy="9" rx="3.1" ry="7.2"/><path d="M1.8 9h14.4"/>',
  linkedin: '<rect x="1.8" y="1.8" width="14.4" height="14.4" rx="3.2"/><path d="M5.7 8.1v4.6M8.7 12.7V8.1M8.7 10.3c0-1.4.9-2.3 2.1-2.3 1.2 0 1.9.8 1.9 2.2v2.5"/><circle cx="5.7" cy="5.6" r=".35" fill="currentColor"/>',
  instagram: '<rect x="1.8" y="1.8" width="14.4" height="14.4" rx="4.2"/><circle cx="9" cy="9" r="3.3"/><circle cx="13.2" cy="4.8" r=".35" fill="currentColor"/>',
  mail: '<rect x="1.8" y="3.6" width="14.4" height="10.8" rx="2.4"/><path d="m2.6 5.2 6.4 4.6 6.4-4.6"/>',
  lock: '<rect x="3.4" y="8" width="11.2" height="8" rx="2.2"/><path d="M5.9 8V5.9a3.1 3.1 0 0 1 6.2 0V8"/>',
  activity: '<path d="M1.6 9.4h3.2l2.1-5.4 4.2 10 2.1-4.6h3.2"/>',
  flame: '<path d="M6.38 10.88A1.88 1.88 0 0 0 8.25 9c0-1.04-.38-1.5-.75-2.25-.8-1.61-.17-3.04 1.5-4.5.38 1.88 1.5 3.68 3 4.88 1.5 1.2 2.25 2.63 2.25 4.13a5.25 5.25 0 1 1-10.5 0c0-.87.33-1.72.75-2.25a1.88 1.88 0 0 0 1.88 1.88Z"/>', // adapted from Lucide (ISC)
  award: '<circle cx="9" cy="7" r="4.8"/><path d="m6.2 10.9-1.4 5.5L9 14.3l4.2 2.1-1.4-5.5"/>',
  cpu: '<rect x="4.5" y="4.5" width="9" height="9" rx="1.8"/><rect x="7.2" y="7.2" width="3.6" height="3.6" rx=".6"/><path d="M7 1.8v2.7M11 1.8v2.7M7 13.5v2.7M11 13.5v2.7M1.8 7h2.7M1.8 11h2.7M13.5 7h2.7M13.5 11h2.7"/>',
  cloud: '<path d="M13.13 14.25H6.75a5.25 5.25 0 1 1 5.03-6.75h1.35a3.38 3.38 0 1 1 0 6.75Z"/>', // adapted from Lucide (ISC)
  sparkles: '<path d="M7.6 2.2 8.9 6.3l4.1 1.3-4.1 1.3-1.3 4.1-1.3-4.1-4.1-1.3 4.1-1.3 1.3-4.1Z"/><path d="m13.9 11.2.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8Z"/>',
  calendar: '<rect x="2" y="3.4" width="14" height="12.6" rx="2.4"/><path d="M2 7.4h14M6 1.8v3.2M12 1.8v3.2"/>',
};

export function drawIcon(name, x, y, { size = 18, color = c.accentSoft, strokeWidth = 1.7 } = {}) {
  const scale = size / 18;
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(scale)})" fill="none" stroke="${color}" color="${color}" stroke-width="${n(strokeWidth / scale)}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</g>`;
}

/**
 * The shared card background: gradient canvas, soft glows, a fading grid,
 * an optional light glint along the top edge, and a hairline border.
 */
export function backdrop({ width, height, radius = 20, glows = [], glint = true }) {
  const defs = [
    `<linearGradient id="bg" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse"><stop stop-color="${c.canvasTop}"/><stop offset=".55" stop-color="${c.canvasMid}"/><stop offset="1" stop-color="${c.canvasBottom}"/></linearGradient>`,
    `<pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" stroke="${c.accentSoft}" stroke-opacity=".07"/></pattern>`,
    '<radialGradient id="gridFade" cx=".7" cy=".3" r=".85"><stop stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>',
    `<mask id="gridMask"><rect width="${width}" height="${height}" fill="url(#gridFade)"/></mask>`,
    `<linearGradient id="edge"><stop stop-color="${c.accentSoft}" stop-opacity="0"/><stop offset=".5" stop-color="${c.accentSoft}" stop-opacity=".9"/><stop offset="1" stop-color="${c.accentSoft}" stop-opacity="0"/></linearGradient>`,
    `<clipPath id="frame"><rect width="${width}" height="${height}" rx="${radius}"/></clipPath>`,
    ...glows.map((glow, index) => `<radialGradient id="glow${index}"><stop stop-color="${glow.color}" stop-opacity="${glow.opacity}"/><stop offset="1" stop-color="${glow.color}" stop-opacity="0"/></radialGradient>`),
  ].join('');
  const back = [
    `<rect width="${width}" height="${height}" fill="url(#bg)"/>`,
    ...glows.map((glow, index) => `<ellipse${glow.className ? ` class="${glow.className}"` : ''} cx="${glow.cx}" cy="${glow.cy}" rx="${glow.rx}" ry="${glow.ry}" fill="url(#glow${index})"/>`),
    `<rect width="${width}" height="${height}" fill="url(#grid)" mask="url(#gridMask)"/>`,
    glint ? '<rect class="glint" x="-220" y="0" width="220" height="1.5" fill="url(#edge)"/>' : '',
  ].join('\n');
  const border = `<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${radius - 0.5}" stroke="${c.borderStrong}"/>`;
  const css = [
    '.drift-a{transform-box:fill-box;transform-origin:center;animation:drift-a 16s ease-in-out infinite alternate}',
    '.drift-b{transform-box:fill-box;transform-origin:center;animation:drift-b 21s ease-in-out infinite alternate}',
    '@keyframes drift-a{to{transform:translate(-44px,22px) scale(1.12)}}',
    '@keyframes drift-b{to{transform:translate(36px,-18px) scale(1.08)}}',
    glint ? `.glint{animation:glint 9s cubic-bezier(.45,0,.55,1) 1.4s infinite}@keyframes glint{0%{transform:translateX(0)}45%,100%{transform:translateX(${width + 220}px)}}` : '',
  ].join('\n');
  return { defs, back, border, css };
}

export const brandMarkDefs = `<linearGradient id="mark" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c.brandBright}"/><stop offset="1" stop-color="${c.brandDeep}"/></linearGradient>`;

/** The "k" monogram from the existing profile, on a 36x36 grid. */
export function brandMark(x, y, size = 36) {
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(size / 36)})"><rect width="36" height="36" rx="11" fill="url(#mark)"/><rect x=".5" y=".5" width="35" height="35" rx="10.5" stroke="#fff" stroke-opacity=".2"/><path d="M12.5 9.5v17M23.5 9.5 14 18l9.5 8.5" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}

/** A pill with a pulsing green dot, right-aligned to `right`. */
export function statusPill({ ts, right, y, label, size = 11.5, letterSpacing = 1.4, height = 28 }) {
  const width = 29 + monoWidth(label, size, letterSpacing) + 11;
  const x = right - width;
  const cy = y + height / 2;
  const dotX = x + 16;
  return [
    `<rect x="${n(x)}" y="${y}" width="${n(width)}" height="${height}" rx="${height / 2}" fill="${c.surface}" stroke="${c.border}"/>`,
    `<circle class="pulse" cx="${n(dotX)}" cy="${cy}" r="4" fill="${c.success}"/>`,
    `<circle cx="${n(dotX)}" cy="${cy}" r="4" fill="${c.success}"/>`,
    `<text class="f-mono" x="${n(dotX + 13)}" y="${n(cy + size * 0.36)}" font-size="${size}" letter-spacing="${letterSpacing}" fill="${c.textMuted}">${esc(ts.use('mono', label))}</text>`,
  ].join('');
}

/** A row of outlined mono pills starting at `x`. `padding` is the total horizontal padding per pill. */
export function tagPills({ ts, x, y, labels, size = 11.5, letterSpacing = 1.4, height = 28, gap = 8, padding = 24 }) {
  let cursor = x;
  const parts = [];
  for (const label of labels) {
    const width = monoWidth(label, size, letterSpacing) + padding;
    parts.push(
      `<rect x="${n(cursor)}" y="${y}" width="${n(width)}" height="${height}" rx="${height / 2}" fill="${c.surfaceRaised}" fill-opacity=".7" stroke="${c.border}"/>`,
      `<text class="f-mono" x="${n(cursor + padding / 2)}" y="${n(y + height / 2 + size * 0.36)}" font-size="${size}" letter-spacing="${letterSpacing}" fill="${c.textMuted}">${esc(ts.use('mono', label))}</text>`,
    );
    cursor += width + gap;
  }
  return parts.join('');
}
