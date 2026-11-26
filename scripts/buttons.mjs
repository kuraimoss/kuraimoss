import { colors as c } from './lib/theme.mjs';
import { Typeset } from './lib/fonts.mjs';
import { esc, n, monoWidth, svgDocument } from './lib/svg.mjs';
import { REDUCED_MOTION } from './lib/motion.mjs';
import { drawIcon } from './lib/components.mjs';

export const BUTTONS = [
  { file: 'portfolio', label: 'PORTFOLIO ↗', icon: 'globe', primary: true, title: 'Portfolio — kuraimos.com' },
  { file: 'linkedin', label: 'LINKEDIN', icon: 'linkedin', title: 'LinkedIn' },
  { file: 'instagram', label: 'INSTAGRAM', icon: 'instagram', title: 'Instagram' },
  { file: 'contact', label: 'CONTACT', icon: 'mail', title: 'Contact' },
];

/** A link button. The primary one is filled and catches a slow light sweep. */
export async function renderButton({ label, icon, title, primary = false, embedFonts = true }) {
  const ts = new Typeset();
  const size = 13;
  const letterSpacing = 1.3;
  const height = 44;
  const padding = 16;
  const iconSize = 18;
  const gap = 10;
  const radius = 12;
  const width = Math.ceil(padding + iconSize + gap + monoWidth(label, size, letterSpacing) - letterSpacing + padding);

  const body = `<g clip-path="url(#shape)">
<rect width="${width}" height="${height}" fill="${primary ? 'url(#fill)' : c.surface}"/>
${primary ? `<path class="shine" d="M-70 0h44l-22 ${height}h-44z" fill="url(#shine)"/>` : ''}
</g>
<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${radius - 0.5}" stroke="${primary ? '#FFFFFF' : c.borderStrong}" stroke-opacity="${primary ? 0.22 : 1}"/>
${drawIcon(icon, padding, (height - iconSize) / 2, { size: iconSize, color: primary ? '#FFFFFF' : c.accentSoft })}
<text class="f-mono" x="${padding + iconSize + gap}" y="${n(height / 2 + size * 0.36)}" font-size="${size}" letter-spacing="${letterSpacing}" fill="${primary ? '#FFFFFF' : c.text}">${esc(ts.use('mono', label))}</text>`;

  const defs = [
    `<clipPath id="shape"><rect width="${width}" height="${height}" rx="${radius}"/></clipPath>`,
    '<linearGradient id="fill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7C5CFF"/><stop offset="1" stop-color="#5B44C2"/></linearGradient>',
    '<linearGradient id="shine"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>',
  ].join('');
  const css = [
    await ts.css({ embed: embedFonts }),
    `.shine{animation:shine 6s cubic-bezier(.45,0,.55,1) 1.6s infinite}@keyframes shine{0%{transform:translateX(0)}30%,100%{transform:translateX(${width + 100}px)}}`,
    REDUCED_MOTION,
  ].join('\n');
  return svgDocument({ width, height, title, desc: title, css, defs, body });
}
