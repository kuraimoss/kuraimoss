import { themes } from './lib/theme.mjs';
import { Typeset } from './lib/fonts.mjs';
import { esc, n, svgDocument } from './lib/svg.mjs';
import { textWidth } from './lib/metrics.mjs';
import { REDUCED_MOTION } from './lib/motion.mjs';
import { drawIcon } from './lib/components.mjs';

export const BUTTONS = [
  { file: 'portfolio', label: 'Portfolio', icon: 'globe', tint: 'lavender', arrow: true, title: 'Portfolio — kuraimos.com' },
  { file: 'linkedin', label: 'LinkedIn', icon: 'linkedin', tint: 'sky', title: 'LinkedIn' },
  { file: 'instagram', label: 'Instagram', icon: 'instagram', tint: 'rose', title: 'Instagram' },
  { file: 'contact', label: 'Contact', icon: 'mail', tint: 'mint', title: 'Contact' },
];

/** A soft, tinted pill button. The portfolio button also catches a slow light sweep. */
export async function renderButton({ label, icon, tint, arrow = false, title, theme: themeName = 'light', embedFonts = true }) {
  const theme = themes[themeName];
  const colors = theme.tints[tint];
  const ts = new Typeset();
  const size = 14;
  const height = 44;
  const padding = 18;
  const iconSize = 18;
  const gap = 9;
  const arrowSize = 14;
  const labelWidth = textWidth(label, size, 'heading');
  const width = Math.ceil(padding + iconSize + gap + labelWidth + (arrow ? 6 + arrowSize : 0) + padding);
  const textX = padding + iconSize + gap;
  const shine = theme.name === 'light' ? 0.65 : 0.14;

  const body = `<g clip-path="url(#shape)">
<rect width="${width}" height="${height}" fill="${colors.bg}"/>
${arrow ? `<path class="shine" d="M-70 0h44l-22 ${height}h-44z" fill="url(#shine)"/>` : ''}
</g>
<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${height / 2 - 0.5}" stroke="${colors.fg}" stroke-opacity=".16"/>
${drawIcon(icon, padding, (height - iconSize) / 2, { size: iconSize, color: colors.fg })}
<text class="f-heading" x="${textX}" y="${n(height / 2 + size * 0.35)}" font-size="${size}" fill="${colors.fg}">${esc(ts.use('heading', label))}</text>
${arrow ? drawIcon('arrow', textX + labelWidth + 6, (height - arrowSize) / 2, { size: arrowSize, color: colors.fg, strokeWidth: 1.9 }) : ''}`;

  const defs = [
    `<clipPath id="shape"><rect width="${width}" height="${height}" rx="${height / 2}"/></clipPath>`,
    `<linearGradient id="shine"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity="${shine}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
  ].join('');
  const css = [
    await ts.css({ embed: embedFonts }),
    `.shine{animation:shine 6s cubic-bezier(.45,0,.55,1) 1.6s infinite}@keyframes shine{0%{transform:translateX(0)}30%,100%{transform:translateX(${width + 100}px)}}`,
    REDUCED_MOTION,
  ].join('\n');
  return svgDocument({ width, height, title, desc: title, css, defs, body });
}
