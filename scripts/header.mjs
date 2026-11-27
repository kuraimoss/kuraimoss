import { themes } from './lib/theme.mjs';
import { Typeset } from './lib/fonts.mjs';
import { esc, n, svgDocument } from './lib/svg.mjs';
import { textWidth } from './lib/metrics.mjs';
import { baseCss, REDUCED_MOTION, typingTimeline } from './lib/motion.mjs';
import { chipRows, drawIcon, shadowFilter, softBackdrop } from './lib/components.mjs';

export const NAME = 'kuraimos';
export const FULL_NAME = 'Saint Ripen Tumanggor, S.Kom.';
export const ROLE = 'Software Engineer';

// One phrase per core competency, typed in turn.
export const PHRASES = [
  'Engineering full-stack software',
  'Architecting backend systems',
  'Automating cloud infrastructure',
  'Integrating PLC, HMI & SCADA',
  'Deploying AI & computer vision',
  'Shipping SaaS & digital products',
];

export const COMPETENCIES = {
  fullstack: { label: 'Full-stack development', tint: 'lavender', icon: 'layout' },
  backend: { label: 'Backend & integration', tint: 'sky', icon: 'braces' },
  cloud: { label: 'Cloud & DevOps', tint: 'mint', icon: 'cloud' },
  industrial: { label: 'Industrial automation', tint: 'peach', icon: 'cpu' },
  ai: { label: 'AI & computer vision', tint: 'rose', icon: 'sparkles' },
  saas: { label: 'SaaS products', tint: 'butter', icon: 'layers' },
};
const C = COMPETENCIES;

const TITLE = 'kuraimos — Saint Ripen Tumanggor, S.Kom., Software Engineer';
const DESC = 'Software engineer working across full-stack development, backend and integration, cloud and DevOps, industrial automation (IIoT, PLC, HMI, SCADA), AI and computer vision, and SaaS products.';
const HEADER_CSS = '.caret{animation:blink 1.1s steps(1,end) infinite}@keyframes blink{50%{opacity:0}}';

/** A soft pill, centred on `cx`, that types each phrase in turn with a thin caret. */
function typingPill({ ts, theme, cx, y, size, height }) {
  const role = 'label';
  const prefixWidth = (phrase, chars) => (phrase < 0 || chars <= 0 ? 0 : textWidth([...PHRASES[phrase]].slice(0, chars).join(''), size, role));
  const longest = Math.max(...PHRASES.map((phrase) => textWidth(phrase, size, role)));
  const iconSize = size + 2;
  const width = 16 + iconSize + 9 + longest + 22;
  const x = cx - width / 2;
  const textX = x + 16 + iconSize + 9;
  const baseline = y + height / 2 + size * 0.35;
  const { total, events, windows } = typingTimeline(PHRASES);
  const dur = `${total}ms`;
  const at = (ms) => (ms / total).toFixed(5);
  const keyTimes = events.map((event) => at(event.t)).join(';');
  const widths = events.map((event) => n(prefixWidth(event.phrase, event.chars) + (event.chars ? 1 : 0))).join(';');
  const caretXs = events.map((event) => n(textX + prefixWidth(event.phrase, event.chars) + 2)).join(';');
  const caret = `y="${n(baseline - size * 0.84)}" width="2.4" height="${n(size * 1.12)}" rx="1.2" fill="${theme.accent}"`;
  const phrases = PHRASES.map((phrase, index) => {
    const { start, end } = windows[index];
    return `<text class="f-label" x="${n(textX)}" y="${n(baseline)}" font-size="${size}" fill="${theme.ink}" visibility="hidden">${esc(ts.use(role, phrase))}<animate attributeName="visibility" values="hidden;visible;hidden" keyTimes="0;${at(start)};${at(end)}" calcMode="discrete" dur="${dur}" repeatCount="indefinite"/></text>`;
  }).join('');
  const defs = `<clipPath id="typed"><rect x="${n(textX)}" y="${y}" width="0" height="${height}"><animate attributeName="width" values="${widths}" keyTimes="${keyTimes}" calcMode="discrete" dur="${dur}" repeatCount="indefinite"/></rect></clipPath>`;
  const body = [
    `<rect x="${n(x)}" y="${y}" width="${n(width)}" height="${height}" rx="${height / 2}" fill="${theme.surface}" stroke="${theme.line}" filter="url(#shadow)"/>`,
    drawIcon('sparkles', x + 16, y + (height - iconSize) / 2, { size: iconSize, color: theme.accent, strokeWidth: 1.6 }),
    `<g class="motion"><g clip-path="url(#typed)">${phrases}</g>`,
    `<rect class="caret" x="${n(textX)}" ${caret}><animate attributeName="x" values="${caretXs}" keyTimes="${keyTimes}" calcMode="discrete" dur="${dur}" repeatCount="indefinite"/></rect></g>`,
    `<g class="static"><text class="f-label" x="${n(textX)}" y="${n(baseline)}" font-size="${size}" fill="${theme.ink}">${esc(PHRASES[0])}</text>`,
    `<rect x="${n(textX + prefixWidth(0, [...PHRASES[0]].length) + 2)}" ${caret}/></g>`,
  ].join('');
  return { defs, body };
}

function wordmark({ ts, theme, cx, baseline, size, letterSpacing }) {
  return `<text class="f-display" x="${cx}" y="${baseline}" font-size="${size}" letter-spacing="${letterSpacing}" fill="${theme.ink}" text-anchor="middle">${esc(ts.use('display', NAME))}<tspan fill="${theme.accent}">${ts.use('display', '.')}</tspan></text>`;
}

const LAYOUTS = {
  desktop: {
    width: 960,
    height: 352,
    blobs: [
      { cx: 140, cy: 60, rx: 280, ry: 190, color: 'lavender', drift: 'a' },
      { cx: 860, cy: 80, rx: 260, ry: 180, color: 'mint', drift: 'c' },
      { cx: 790, cy: 330, rx: 300, ry: 190, color: 'peach', drift: 'b' },
      { cx: 160, cy: 345, rx: 260, ry: 170, color: 'sky', drift: 'c' },
      { cx: 480, cy: 375, rx: 220, ry: 110, color: 'rose', drift: 'a' },
    ],
    sparkles: [
      { x: 196, y: 96, r: 9, color: 'lavender', delay: 0 },
      { x: 772, y: 106, r: 11, color: 'peach', delay: 1.6 },
      { x: 150, y: 262, r: 6, color: 'mint', delay: 0.8 },
      { x: 812, y: 258, r: 7, color: 'rose', delay: 2.4 },
      { x: 884, y: 182, r: 5, color: 'sky', delay: 3.1 },
      { x: 82, y: 182, r: 5, color: 'butter', delay: 1.1 },
    ],
    name: { baseline: 113, size: 84, letterSpacing: -3 },
    subtitle: [{ text: `${FULL_NAME} · ${ROLE}`, baseline: 151, size: 17, role: 'label', tone: 'inkSoft' }],
    typing: { y: 171, size: 16, height: 44 },
    chips: { top: 237, size: 13, height: 32, rows: [[C.fullstack, C.backend, C.cloud], [C.industrial, C.ai, C.saas]] },
  },
  mobile: {
    width: 480,
    height: 360,
    blobs: [
      { cx: 70, cy: 50, rx: 200, ry: 150, color: 'lavender', drift: 'a' },
      { cx: 430, cy: 70, rx: 190, ry: 140, color: 'mint', drift: 'c' },
      { cx: 400, cy: 345, rx: 220, ry: 160, color: 'peach', drift: 'b' },
      { cx: 80, cy: 355, rx: 200, ry: 140, color: 'sky', drift: 'c' },
    ],
    sparkles: [
      { x: 58, y: 80, r: 7, color: 'lavender', delay: 0 },
      { x: 424, y: 86, r: 8, color: 'peach', delay: 1.6 },
      { x: 448, y: 184, r: 5, color: 'mint', delay: 0.8 },
    ],
    name: { baseline: 84, size: 64, letterSpacing: -2.4 },
    subtitle: [
      { text: FULL_NAME, baseline: 116, size: 15.5, role: 'label', tone: 'inkSoft' },
      { text: ROLE, baseline: 138, size: 14, role: 'body', tone: 'muted' },
    ],
    typing: { y: 156, size: 14.5, height: 42 },
    chips: { top: 218, size: 12, height: 32, rowGap: 8, gap: 8, rows: [[C.fullstack, C.cloud], [C.backend, C.saas], [C.industrial, C.ai]] },
  },
};

/** The animated profile header. variant: "desktop" | "mobile"; theme: "light" | "dark". */
export async function renderHeader({ variant = 'desktop', theme: themeName = 'light', embedFonts = true } = {}) {
  const layout = LAYOUTS[variant] ?? LAYOUTS.desktop;
  const theme = themes[themeName];
  const ts = new Typeset();
  const { width, height } = layout;
  const cx = width / 2;
  const bg = softBackdrop({ theme, width, height, blobs: layout.blobs, sparkles: layout.sparkles });
  const typing = typingPill({ ts, theme, cx, ...layout.typing });
  const subtitle = layout.subtitle
    .map((line) => `<text class="f-${line.role}" x="${cx}" y="${line.baseline}" font-size="${line.size}" fill="${theme[line.tone]}" text-anchor="middle">${esc(ts.use(line.role, line.text))}</text>`)
    .join('');
  const body = `<g clip-path="url(#frame)">
${bg.back}
<g class="rise d2">${wordmark({ ts, theme, cx, ...layout.name })}</g>
<g class="rise d3">${subtitle}</g>
<g class="rise d4">${typing.body}</g>
${chipRows({ ts, theme, centerX: cx, ...layout.chips, delayStart: 5 })}
</g>
${bg.border}`;
  const css = [await ts.css({ embed: embedFonts }), baseCss(), bg.css, HEADER_CSS, REDUCED_MOTION].join('\n');
  return svgDocument({
    width,
    height,
    title: TITLE,
    desc: DESC,
    css,
    defs: [bg.defs, shadowFilter(theme, { dy: 8, blur: 12 }), typing.defs].join(''),
    body,
  });
}
