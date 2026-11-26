import { colors as c } from './lib/theme.mjs';
import { Typeset } from './lib/fonts.mjs';
import { esc, n, svgDocument } from './lib/svg.mjs';
import { baseCss, REDUCED_MOTION } from './lib/motion.mjs';
import { backdrop } from './lib/components.mjs';
import { NAME_GRADIENT } from './header.mjs';

/** A filled sine-like wave from x=0 to at least `span`, closed at `bottom`. */
function wavePath({ span, period, amplitude, baseline, bottom }) {
  let d = `M0 ${baseline}`;
  for (let x = 0; x < span; x += period) {
    d += `Q${n(x + period / 4)} ${n(baseline - amplitude)} ${n(x + period / 2)} ${baseline}`;
    d += `Q${n(x + (period * 3) / 4)} ${n(baseline + amplitude)} ${n(x + period)} ${baseline}`;
  }
  return `${d}V${bottom}H0Z`;
}

/** The closing banner: a call to action over slowly moving waves. */
export async function renderFooter({ variant = 'desktop', embedFonts = true } = {}) {
  const mobile = variant === 'mobile';
  const ts = new Typeset();
  const width = mobile ? 480 : 960;
  const height = mobile ? 236 : 200;
  const cx = width / 2;
  const bg = backdrop({
    width,
    height,
    glows: [{ cx, cy: height + 30, rx: width * 0.55, ry: 170, color: c.brandBright, opacity: 0.3, className: 'drift-a' }],
  });
  const waves = [
    { className: 'wave-a', period: mobile ? 240 : 320, amplitude: 6, baseline: height - 30, color: c.accent, opacity: 0.12, seconds: 14 },
    { className: 'wave-b', period: mobile ? 160 : 220, amplitude: 7, baseline: height - 18, color: c.brandBright, opacity: 0.16, seconds: 9 },
  ];
  const waveCss = waves
    .map((wave) => `.${wave.className}{animation:${wave.className} ${wave.seconds}s linear infinite}@keyframes ${wave.className}{to{transform:translateX(-${wave.period}px)}}`)
    .join('\n');
  const waveShapes = waves
    .map((wave) => `<path class="${wave.className}" d="${wavePath({ span: width + wave.period, period: wave.period, amplitude: wave.amplitude, baseline: wave.baseline, bottom: height })}" fill="${wave.color}" fill-opacity="${wave.opacity}"/>`)
    .join('\n');

  const lines = mobile
    ? ['Thoughtful interfaces. Practical systems.', 'Products that work.']
    : ['Thoughtful interfaces · practical systems · products that work.'];
  const titleY = mobile ? 82 : 88;
  const subtitleY = titleY + (mobile ? 34 : 36);
  const lineGap = 22;
  const linkY = subtitleY + (lines.length - 1) * lineGap + (mobile ? 36 : 34);

  const body = `<g clip-path="url(#frame)">
${bg.back}
${waveShapes}
<text class="f-display rise d1" x="${cx}" y="${titleY}" font-size="${mobile ? 25 : 34}" letter-spacing="-1" fill="url(#name)" text-anchor="middle">${esc(ts.use('display', 'Let’s build something useful'))}<tspan fill="${c.accent}">${ts.use('display', '.')}</tspan></text>
<g class="rise d2">${lines.map((line, index) => `<text class="f-body" x="${cx}" y="${subtitleY + index * lineGap}" font-size="${mobile ? 15 : 16.5}" fill="${c.textMuted}" text-anchor="middle">${esc(ts.use('body', line))}</text>`).join('')}</g>
<text class="f-mono rise d3" x="${cx}" y="${linkY}" font-size="12.5" letter-spacing="1.6" fill="${c.accentSoft}" text-anchor="middle">${esc(ts.use('mono', 'KURAIMOS.COM ↗'))}</text>
</g>
${bg.border}`;

  const css = [await ts.css({ embed: embedFonts }), baseCss(), bg.css, waveCss, REDUCED_MOTION].join('\n');
  return svgDocument({
    width,
    height,
    title: 'Let’s build something useful.',
    desc: 'Thoughtful interfaces, practical systems, and products that work. kuraimos.com',
    css,
    defs: [bg.defs, NAME_GRADIENT].join(''),
    body,
  });
}
