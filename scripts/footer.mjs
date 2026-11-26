import { themes } from './lib/theme.mjs';
import { Typeset } from './lib/fonts.mjs';
import { esc, svgDocument } from './lib/svg.mjs';
import { baseCss, REDUCED_MOTION } from './lib/motion.mjs';
import { chip, chipWidth, softBackdrop, waves } from './lib/components.mjs';

const LAYOUTS = {
  desktop: {
    width: 960,
    height: 220,
    blobs: [
      { cx: 120, cy: 40, rx: 260, ry: 160, color: 'lavender', drift: 'a' },
      { cx: 860, cy: 50, rx: 240, ry: 150, color: 'mint', drift: 'c' },
      { cx: 480, cy: 250, rx: 360, ry: 140, color: 'peach', drift: 'b' },
    ],
    sparkles: [
      { x: 224, y: 70, r: 8, color: 'lavender', delay: 0 },
      { x: 744, y: 64, r: 10, color: 'peach', delay: 1.4 },
      { x: 862, y: 140, r: 5, color: 'mint', delay: 0.7 },
    ],
    title: { baseline: 90, size: 34 },
    lines: ['Thoughtful interfaces · practical systems · products that work.'],
    lineStart: 122,
    lineSize: 16.5,
    link: { y: 142 },
    waves: [{ period: 320, amplitude: 6, offset: 26, color: 'lavender', seconds: 14 }, { period: 220, amplitude: 7, offset: 14, color: 'peach', seconds: 9 }],
  },
  mobile: {
    width: 480,
    height: 250,
    blobs: [
      { cx: 60, cy: 40, rx: 200, ry: 140, color: 'lavender', drift: 'a' },
      { cx: 430, cy: 50, rx: 180, ry: 130, color: 'mint', drift: 'c' },
      { cx: 240, cy: 280, rx: 260, ry: 120, color: 'peach', drift: 'b' },
    ],
    sparkles: [
      { x: 52, y: 70, r: 7, color: 'lavender', delay: 0 },
      { x: 430, y: 66, r: 8, color: 'peach', delay: 1.4 },
    ],
    title: { baseline: 84, size: 25 },
    lines: ['Thoughtful interfaces. Practical systems.', 'Products that work.'],
    lineStart: 116,
    lineSize: 15,
    link: { y: 160 },
    waves: [{ period: 240, amplitude: 6, offset: 26, color: 'lavender', seconds: 14 }, { period: 160, amplitude: 7, offset: 14, color: 'peach', seconds: 9 }],
  },
};

/** The closing banner: a call to action over soft, slowly moving waves. */
export async function renderFooter({ variant = 'desktop', theme: themeName = 'light', embedFonts = true } = {}) {
  const layout = LAYOUTS[variant] ?? LAYOUTS.desktop;
  const theme = themes[themeName];
  const ts = new Typeset();
  const { width, height } = layout;
  const cx = width / 2;
  const bg = softBackdrop({ theme, width, height, blobs: layout.blobs, sparkles: layout.sparkles });
  const waveOpacity = theme.name === 'light' ? 0.8 : 0.32;
  const wave = waves({
    theme,
    width,
    height,
    layers: layout.waves.map((layer) => ({ ...layer, baseline: height - layer.offset, opacity: waveOpacity })),
  });
  const linkLabel = 'kuraimos.com';
  const linkWidth = chipWidth(linkLabel, { size: 13, icon: true });
  const lines = layout.lines
    .map((line, index) => `<text class="f-body" x="${cx}" y="${layout.lineStart + index * 22}" font-size="${layout.lineSize}" fill="${theme.muted}" text-anchor="middle">${esc(ts.use('body', line))}</text>`)
    .join('');
  const body = `<g clip-path="url(#frame)">
${bg.back}
${wave.svg}
<text class="f-display rise d1" x="${cx}" y="${layout.title.baseline}" font-size="${layout.title.size}" letter-spacing="-1" fill="${theme.ink}" text-anchor="middle">${esc(ts.use('display', 'Let’s build something useful'))}<tspan fill="${theme.accent}">${ts.use('display', '.')}</tspan></text>
<g class="rise d2">${lines}</g>
<g class="rise d3">${chip({ ts, theme, x: cx - linkWidth / 2, y: layout.link.y, label: linkLabel, tint: 'lavender', icon: 'globe', size: 13, height: 32 })}</g>
</g>
${bg.border}`;
  const css = [await ts.css({ embed: embedFonts }), baseCss(), bg.css, wave.css, REDUCED_MOTION].join('\n');
  return svgDocument({
    width,
    height,
    title: 'Let’s build something useful.',
    desc: 'Thoughtful interfaces, practical systems, and products that work. kuraimos.com',
    css,
    defs: bg.defs,
    body,
  });
}
