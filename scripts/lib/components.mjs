import { esc, n } from './svg.mjs';
import { textWidth } from './metrics.mjs';

/** Line icons on an 18x18 grid, drawn with strokes (Lucide-style). */
export const ICONS = {
  layout: '<rect x="1.8" y="2.6" width="14.4" height="12.8" rx="2.6"/><path d="M1.8 6.6h14.4M6.6 6.6v8.8"/>',
  braces: '<path d="M6.2 2.6c-1.7 0-2.6.8-2.6 2.5v1.5c0 1.3-.7 2-2 2.4 1.3.4 2 1.1 2 2.4v1.5c0 1.7.9 2.5 2.6 2.5M11.8 2.6c1.7 0 2.6.8 2.6 2.5v1.5c0 1.3.7 2 2 2.4-1.3.4-2 1.1-2 2.4v1.5c0 1.7-.9 2.5-2.6 2.5"/>',
  layers: '<path d="M9 1.9 1.9 5.5 9 9.1l7.1-3.6L9 1.9Z"/><path d="M1.9 9 9 12.6 16.1 9"/><path d="M1.9 12.5 9 16.1l7.1-3.6"/>',
  globe: '<circle cx="9" cy="9" r="7.2"/><ellipse cx="9" cy="9" rx="3.1" ry="7.2"/><path d="M1.8 9h14.4"/>',
  linkedin: '<rect x="1.8" y="1.8" width="14.4" height="14.4" rx="3.2"/><path d="M5.7 8.1v4.6M8.7 12.7V8.1M8.7 10.3c0-1.4.9-2.3 2.1-2.3 1.2 0 1.9.8 1.9 2.2v2.5"/><circle cx="5.7" cy="5.6" r=".35" fill="currentColor"/>',
  instagram: '<rect x="1.8" y="1.8" width="14.4" height="14.4" rx="4.2"/><circle cx="9" cy="9" r="3.3"/><circle cx="13.2" cy="4.8" r=".35" fill="currentColor"/>',
  mail: '<rect x="1.8" y="3.6" width="14.4" height="10.8" rx="2.4"/><path d="m2.6 5.2 6.4 4.6 6.4-4.6"/>',
  arrow: '<path d="M5 13 13 5M6.6 5H13v6.4"/>',
  activity: '<path d="M1.6 9.4h3.2l2.1-5.4 4.2 10 2.1-4.6h3.2"/>',
  flame: '<path d="M6.38 10.88A1.88 1.88 0 0 0 8.25 9c0-1.04-.38-1.5-.75-2.25-.8-1.61-.17-3.04 1.5-4.5.38 1.88 1.5 3.68 3 4.88 1.5 1.2 2.25 2.63 2.25 4.13a5.25 5.25 0 1 1-10.5 0c0-.87.33-1.72.75-2.25a1.88 1.88 0 0 0 1.88 1.88Z"/>', // adapted from Lucide (ISC)
  award: '<circle cx="9" cy="7" r="4.8"/><path d="m6.2 10.9-1.4 5.5L9 14.3l4.2 2.1-1.4-5.5"/>',
  calendar: '<rect x="2" y="3.4" width="14" height="12.6" rx="2.4"/><path d="M2 7.4h14M6 1.8v3.2M12 1.8v3.2"/>',
  cpu: '<rect x="4.5" y="4.5" width="9" height="9" rx="1.8"/><rect x="7.2" y="7.2" width="3.6" height="3.6" rx=".6"/><path d="M7 1.8v2.7M11 1.8v2.7M7 13.5v2.7M11 13.5v2.7M1.8 7h2.7M1.8 11h2.7M13.5 7h2.7M13.5 11h2.7"/>',
  cloud: '<path d="M13.13 14.25H6.75a5.25 5.25 0 1 1 5.03-6.75h1.35a3.38 3.38 0 1 1 0 6.75Z"/>', // adapted from Lucide (ISC)
  sparkles: '<path d="M7.6 2.2 8.9 6.3l4.1 1.3-4.1 1.3-1.3 4.1-1.3-4.1-4.1-1.3 4.1-1.3 1.3-4.1Z"/><path d="m13.9 11.2.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8Z"/>',
};

export function drawIcon(name, x, y, { size = 18, color, strokeWidth = 1.7 } = {}) {
  const scale = size / 18;
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(scale)})" fill="none" stroke="${color}" color="${color}" stroke-width="${n(strokeWidth / scale)}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</g>`;
}

/** A four-point sparkle centred on (x, y) with radius `r`. */
export function sparklePath(x, y, r) {
  return `M${n(x)} ${n(y - r)}Q${n(x)} ${n(y)} ${n(x + r)} ${n(y)}Q${n(x)} ${n(y)} ${n(x)} ${n(y + r)}Q${n(x)} ${n(y)} ${n(x - r)} ${n(y)}Q${n(x)} ${n(y)} ${n(x)} ${n(y - r)}Z`;
}

export function shadowFilter(theme, { id = 'shadow', dy = 10, blur = 14, opacity = theme.shadowOpacity } = {}) {
  return `<filter id="${id}" x="-30%" y="-30%" width="160%" height="200%" color-interpolation-filters="sRGB"><feDropShadow dx="0" dy="${dy}" stdDeviation="${blur}" flood-color="${theme.shadow}" flood-opacity="${opacity}"/></filter>`;
}

/**
 * The soft canvas shared by every card: a gentle gradient, pastel blobs that
 * drift slowly, optional twinkling sparkles, and a hairline border.
 * blobs: [{ cx, cy, rx, ry, color: 'lavender' | 'peach' | ..., drift: 'a' | 'b' | 'c' }]
 * sparkles: [{ x, y, r, color: 'lavender' | ..., delay }]
 */
export function softBackdrop({ theme, width, height, radius = 28, blobs = [], sparkles = [] }) {
  const defs = [
    `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${theme.canvasTop}"/><stop offset="1" stop-color="${theme.canvasBottom}"/></linearGradient>`,
    `<clipPath id="frame"><rect width="${width}" height="${height}" rx="${radius}"/></clipPath>`,
    ...blobs.map((blob, index) => {
      const color = theme.blobs[blob.color];
      return `<radialGradient id="blob${index}"><stop stop-color="${color}" stop-opacity="${theme.blobOpacity}"/><stop offset=".6" stop-color="${color}" stop-opacity="${n(theme.blobOpacity * 0.45)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
    }),
  ].join('');
  const back = [
    `<rect width="${width}" height="${height}" fill="url(#bg)"/>`,
    ...blobs.map((blob, index) => `<ellipse class="drift-${blob.drift ?? 'a'}" cx="${blob.cx}" cy="${blob.cy}" rx="${blob.rx}" ry="${blob.ry}" fill="url(#blob${index})"/>`),
    ...sparkles.map((s) => `<path class="twinkle" style="animation-delay:${s.delay ?? 0}s" d="${sparklePath(s.x, s.y, s.r)}" fill="${theme.tints[s.color ?? 'lavender'].fg}" fill-opacity=".55"/>`),
  ].join('\n');
  const border = `<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${radius - 0.5}" stroke="${theme.line}"/>`;
  const css = [
    '.drift-a,.drift-b,.drift-c{transform-box:fill-box;transform-origin:center}',
    '.drift-a{animation:drift-a 18s ease-in-out infinite alternate}',
    '.drift-b{animation:drift-b 23s ease-in-out infinite alternate}',
    '.drift-c{animation:drift-c 27s ease-in-out infinite alternate}',
    '@keyframes drift-a{to{transform:translate(-34px,16px) scale(1.1)}}',
    '@keyframes drift-b{to{transform:translate(30px,-14px) scale(1.08)}}',
    '@keyframes drift-c{to{transform:translate(-20px,-18px) scale(1.12)}}',
    '.twinkle{transform-box:fill-box;transform-origin:center;animation:twinkle 5s ease-in-out infinite}',
    '@keyframes twinkle{0%,100%{opacity:.35;transform:scale(.6) rotate(0deg)}50%{opacity:1;transform:scale(1) rotate(25deg)}}',
  ].join('\n');
  return { defs, back, border, css };
}

/** Width of a tinted chip: padding, optional icon, and label. */
export function chipWidth(label, { size = 13, icon = false, role = 'label' } = {}) {
  return 13 + (icon ? size + 2 + 7 : 0) + textWidth(label, size, role) + 14;
}

/** A tinted, fully rounded chip with an optional leading icon. */
export function chip({ ts, theme, x, y, label, tint = 'lavender', icon, size = 13, height = 32, role = 'label' }) {
  const colors = theme.tints[tint];
  const iconSize = icon ? size + 2 : 0;
  const width = chipWidth(label, { size, icon: Boolean(icon), role });
  const textX = x + 13 + (icon ? iconSize + 7 : 0);
  return [
    `<rect x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${height}" rx="${height / 2}" fill="${colors.bg}"/>`,
    icon ? drawIcon(icon, x + 13, y + (height - iconSize) / 2, { size: iconSize, color: colors.fg, strokeWidth: 1.6 }) : '',
    `<text class="f-${role}" x="${n(textX)}" y="${n(y + height / 2 + size * 0.35)}" font-size="${size}" fill="${colors.fg}">${esc(ts.use(role, label))}</text>`,
  ].join('');
}

/** Lays chips out in centred rows. `rows` is a list of rows of `{ label, tint, icon }`. */
export function chipRows({ ts, theme, centerX, top, rows, size = 13, height = 32, gap = 10, rowGap = 10, delayStart = 5 }) {
  return rows
    .map((row, rowIndex) => {
      const widths = row.map((item) => chipWidth(item.label, { size, icon: Boolean(item.icon) }));
      const total = widths.reduce((sum, width) => sum + width, 0) + gap * (row.length - 1);
      let x = centerX - total / 2;
      const y = top + rowIndex * (height + rowGap);
      const parts = row.map((item, index) => {
        const svg = chip({ ts, theme, x, y, size, height, ...item });
        x += widths[index] + gap;
        return svg;
      });
      return `<g class="rise d${delayStart + rowIndex}">${parts.join('')}</g>`;
    })
    .join('\n');
}

/** A mint "status" pill with a softly pulsing dot, centred on `cx`. */
export function statusChip({ ts, theme, cx, y, label, size = 12.5, height = 30 }) {
  const colors = theme.tints.mint;
  const width = 30 + textWidth(label, size, 'label') + 14;
  const x = cx - width / 2;
  const dotX = x + 17;
  const cy = y + height / 2;
  return [
    `<rect x="${n(x)}" y="${y}" width="${n(width)}" height="${height}" rx="${height / 2}" fill="${colors.bg}"/>`,
    `<circle class="pulse" cx="${n(dotX)}" cy="${cy}" r="4" fill="${theme.success}"/>`,
    `<circle cx="${n(dotX)}" cy="${cy}" r="4" fill="${theme.success}"/>`,
    `<text class="f-label" x="${n(x + 30)}" y="${n(cy + size * 0.35)}" font-size="${size}" fill="${colors.fg}">${esc(ts.use('label', label))}</text>`,
  ].join('');
}

/** Gentle wave shapes for the bottom edge of a banner, moving sideways in a loop. */
export function waves({ theme, width, height, layers }) {
  const shapes = layers.map((layer, index) => {
    let d = `M0 ${layer.baseline}`;
    for (let x = 0; x < width + layer.period; x += layer.period) {
      d += `Q${n(x + layer.period / 4)} ${n(layer.baseline - layer.amplitude)} ${n(x + layer.period / 2)} ${layer.baseline}`;
      d += `Q${n(x + (layer.period * 3) / 4)} ${n(layer.baseline + layer.amplitude)} ${n(x + layer.period)} ${layer.baseline}`;
    }
    const color = theme.blobs[layer.color];
    return `<path class="wave-${index}" d="${d}V${height}H0Z" fill="${color}" fill-opacity="${layer.opacity}"/>`;
  });
  const css = layers
    .map((layer, index) => `.wave-${index}{animation:wave-${index} ${layer.seconds}s linear infinite}@keyframes wave-${index}{to{transform:translateX(-${layer.period}px)}}`)
    .join('\n');
  return { svg: shapes.join('\n'), css };
}
