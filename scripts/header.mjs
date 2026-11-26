import { colors as c } from './lib/theme.mjs';
import { Typeset } from './lib/fonts.mjs';
import { esc, n, monoWidth, MONO_ADVANCE, svgDocument } from './lib/svg.mjs';
import { baseCss, REDUCED_MOTION, typingTimeline } from './lib/motion.mjs';
import { backdrop, brandMark, brandMarkDefs, drawIcon, statusPill, tagPills } from './lib/components.mjs';

// One phrase per core competency, typed in turn.
export const PHRASES = [
  'engineering full-stack software',
  'architecting backend systems',
  'automating cloud infrastructure',
  'integrating PLC, HMI & SCADA',
  'deploying AI & computer vision',
  'shipping SaaS & digital products',
];

const PROMPT = String.fromCharCode(36); // the shell prompt sign
export const NAME = ['Saint Ripen', 'Tumanggor'];
const ROLE = 'SOFTWARE ENGINEER · S.KOM';
const STATUS = 'OPEN TO WORK';
const TAGLINE = ['From the factory floor to the cloud: I engineer', 'reliable platforms and AI-powered SaaS products.'];
const TAGS = ['FULL-STACK', 'BACKEND', 'CLOUD', 'IIOT', 'AI/ML', 'SAAS'];
// Data flows from industrial systems, through backend and cloud services, into AI-powered products.
const LAYERS = [
  { title: 'Industrial automation', stack: 'iiot · plc · hmi · scada', icon: 'cpu' },
  { title: 'Backend & cloud', stack: 'apis · integration · devops', icon: 'cloud' },
  { title: 'AI & SaaS products', stack: 'full-stack · ml · computer vision', icon: 'sparkles' },
];
const CHIPS = ['AUTOMATION', 'CLOUD', 'AI & SAAS'];
const TITLE = 'Saint Ripen Tumanggor, S.Kom. — Software Engineer';
const DESC = 'Software engineer working from the factory floor to the cloud: full-stack and SaaS products, backend systems and integration, cloud and DevOps, industrial automation (IIoT, PLC, HMI, SCADA), and AI with computer vision. Open to work.';

// One request travels down the stack every cycle and each layer lights up as it passes.
const CYCLE = '4.6s';
const LAYER_GLOW = [
  { values: '0;1;1;0;0', keyTimes: '0;.04;.12;.24;1' },
  { values: '0;0;1;1;0;0', keyTimes: '0;.34;.38;.46;.58;1' },
  { values: '0;0;1;1;0;0', keyTimes: '0;.68;.72;.8;.92;1' },
];

const HEADER_CSS = [
  '.caret{animation:blink 1.1s steps(1,end) infinite}',
  '@keyframes blink{50%{opacity:0}}',
  '.flow{animation:flow 1.4s linear infinite}',
  '@keyframes flow{to{stroke-dashoffset:-20}}',
].join('\n');

export const NAME_GRADIENT = '<linearGradient id="name" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FFFFFF"/><stop offset="1" stop-color="#D3C8FF"/></linearGradient>';
const PACKET_GRADIENT = `<radialGradient id="packet"><stop stop-color="${c.accentSoft}" stop-opacity=".95"/><stop offset="1" stop-color="${c.accent}" stop-opacity="0"/></radialGradient>`;

function glow(index) {
  const { values, keyTimes } = LAYER_GLOW[index];
  return `<animate attributeName="opacity" values="${values}" keyTimes="${keyTimes}" dur="${CYCLE}" repeatCount="indefinite"/>`;
}

/** A glowing dot that travels along `path`, pausing at the start, at `mid`, and at the end. */
function packet(path, mid = 0.5) {
  return `<g class="motion" opacity="0"><circle r="11" fill="url(#packet)"/><circle r="3.4" fill="#fff"/><animateMotion path="${path}" keyPoints="0;0;${n(mid)};${n(mid)};1;1" keyTimes="0;.12;.38;.46;.72;1" calcMode="spline" keySplines="0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1" dur="${CYCLE}" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.05;.72;.8;1" dur="${CYCLE}" repeatCount="indefinite"/></g>`;
}

/** A shell prompt that types each phrase character by character, with a blinking caret. */
function typingLine({ ts, x, y, size }) {
  const charWidth = size * MONO_ADVANCE;
  const textX = x + monoWidth(`${PROMPT} `, size);
  const { total, events, windows } = typingTimeline(PHRASES);
  const dur = `${total}ms`;
  const at = (ms) => (ms / total).toFixed(5);
  const keyTimes = events.map((event) => at(event.t)).join(';');
  const widths = events.map((event) => n(event.chars * charWidth)).join(';');
  const caretXs = events.map((event) => n(textX + event.chars * charWidth + 1)).join(';');
  const caret = { y: n(y - size * 0.82), width: n(size * 0.5), height: n(size * 1.05) };
  const phrases = PHRASES.map((phrase, index) => {
    const { start, end } = windows[index];
    return `<text class="f-mono" x="${n(textX)}" y="${y}" font-size="${size}" fill="${c.text}" visibility="hidden">${esc(ts.use('mono', phrase))}<animate attributeName="visibility" values="hidden;visible;hidden" keyTimes="0;${at(start)};${at(end)}" calcMode="discrete" dur="${dur}" repeatCount="indefinite"/></text>`;
  }).join('');
  const defs = `<clipPath id="typed"><rect x="${n(textX)}" y="${n(y - size)}" width="0" height="${n(size * 1.4)}"><animate attributeName="width" values="${widths}" keyTimes="${keyTimes}" calcMode="discrete" dur="${dur}" repeatCount="indefinite"/></rect></clipPath>`;
  const staticEnd = textX + monoWidth(PHRASES[0], size) + 1;
  const body = [
    `<text class="f-mono" x="${x}" y="${y}" font-size="${size}" fill="${c.accent}">${ts.use('mono', PROMPT)}</text>`,
    `<g class="motion"><g clip-path="url(#typed)">${phrases}</g>`,
    `<rect class="caret" x="${n(textX)}" y="${caret.y}" width="${caret.width}" height="${caret.height}" rx="1.5" fill="${c.accent}"><animate attributeName="x" values="${caretXs}" keyTimes="${keyTimes}" calcMode="discrete" dur="${dur}" repeatCount="indefinite"/></rect></g>`,
    `<g class="static"><text class="f-mono" x="${n(textX)}" y="${y}" font-size="${size}" fill="${c.text}">${esc(PHRASES[0])}</text>`,
    `<rect x="${n(staticEnd)}" y="${caret.y}" width="${caret.width}" height="${caret.height}" rx="1.5" fill="${c.accent}"/></g>`,
  ].join('');
  return { defs, body };
}

/** Desktop: industrial systems, backend and cloud, and AI products stacked on a rail. */
function layerStack({ ts }) {
  const x = 588;
  const width = 324;
  const height = 64;
  const railX = 562;
  const tops = [112, 210, 308];
  const centers = tops.map((top) => top + height / 2);
  const railPath = `M${railX} ${centers[0]}V${centers[2]}`;
  const nodes = LAYERS.map((layer, index) => {
    const top = tops[index];
    const cy = centers[index];
    const order = String(index + 1).padStart(2, '0');
    return `<g class="rise d${6 + index}">
<path d="M${railX + 5} ${cy}H${x}" stroke="${c.border}" stroke-width="1.5"/>
<rect x="${x}" y="${top}" width="${width}" height="${height}" rx="14" fill="${c.surface}" stroke="${c.border}"/>
<rect class="motion" x="${x}" y="${top}" width="${width}" height="${height}" rx="14" fill="${c.accent}" fill-opacity=".07" stroke="${c.accent}" stroke-opacity=".85" stroke-width="1.5" opacity="0">${glow(index)}</rect>
<rect x="${x + 14}" y="${cy - 17}" width="34" height="34" rx="10" fill="${c.surfaceRaised}" stroke="${c.borderStrong}"/>
${drawIcon(layer.icon, x + 22, cy - 9, { color: c.accentSoft })}
<text class="f-heading" x="${x + 62}" y="${cy - 3}" font-size="16" fill="${c.text}">${esc(ts.use('heading', layer.title))}</text>
<text class="f-mono" x="${x + 62}" y="${cy + 15}" font-size="11.5" fill="${c.textSubtle}">${esc(ts.use('mono', layer.stack))}</text>
<text class="f-mono" x="${x + width - 16}" y="${cy - 3}" font-size="11" fill="${c.textFaint}" text-anchor="end">${ts.use('mono', order)}</text>
<circle cx="${railX}" cy="${cy}" r="5" fill="${c.well}" stroke="${c.borderStrong}" stroke-width="1.5"/>
<circle class="motion" cx="${railX}" cy="${cy}" r="5" fill="${c.accent}" opacity="0">${glow(index)}</circle>
</g>`;
  }).join('\n');
  return [
    `<path d="${railPath}" stroke="${c.border}" stroke-width="2"/>`,
    `<path class="flow" d="${railPath}" stroke="${c.accent}" stroke-opacity=".5" stroke-width="2" stroke-dasharray="2 8"/>`,
    nodes,
    packet(railPath),
  ].join('\n');
}

/** Mobile: the same three layers as a row of chips. */
function layerChips({ ts, x, cy }) {
  const labels = CHIPS;
  const size = 11;
  const letterSpacing = 1.2;
  const height = 30;
  const gap = 40;
  const chips = [];
  let cursor = x;
  for (const label of labels) {
    const width = monoWidth(label, size, letterSpacing) + 28;
    chips.push({ label, x: cursor, width, cx: cursor + width / 2 });
    cursor += width + gap;
  }
  const start = chips[0].cx;
  const end = chips[2].cx;
  const path = `M${n(start)} ${cy}H${n(end)}`;
  const top = cy - height / 2;
  const body = chips.map((chip, index) => [
    `<rect x="${n(chip.x)}" y="${top}" width="${n(chip.width)}" height="${height}" rx="${height / 2}" fill="${c.surface}" stroke="${c.border}"/>`,
    `<rect class="motion" x="${n(chip.x)}" y="${top}" width="${n(chip.width)}" height="${height}" rx="${height / 2}" fill="${c.accent}" fill-opacity=".1" stroke="${c.accent}" stroke-width="1.3" opacity="0">${glow(index)}</rect>`,
    `<text class="f-mono" x="${n(chip.x + 14)}" y="${n(cy + size * 0.36)}" font-size="${size}" letter-spacing="${letterSpacing}" fill="${c.textMuted}">${esc(ts.use('mono', chip.label))}</text>`,
  ].join('')).join('\n');
  return [
    `<path d="${path}" stroke="${c.border}" stroke-width="1.5"/>`,
    `<path class="flow" d="${path}" stroke="${c.accent}" stroke-opacity=".5" stroke-width="1.5" stroke-dasharray="2 8"/>`,
    packet(path, (chips[1].cx - start) / (end - start)),
    body,
  ].join('\n');
}

async function finish({ ts, width, height, bg, defs, body, embedFonts }) {
  const css = [await ts.css({ embed: embedFonts }), baseCss(), bg.css, HEADER_CSS, REDUCED_MOTION].join('\n');
  return svgDocument({
    width,
    height,
    title: TITLE,
    desc: DESC,
    css,
    defs: [bg.defs, brandMarkDefs, NAME_GRADIENT, PACKET_GRADIENT, defs].join(''),
    body,
  });
}

/** The full name on two lines, with the brand dot after the surname. */
function displayName({ ts, x, size, letterSpacing, baselines }) {
  const [first, last] = NAME;
  const attributes = `class="f-display" x="${x}" font-size="${size}" letter-spacing="${letterSpacing}" fill="url(#name)"`;
  return [
    `<text ${attributes} y="${baselines[0]}">${esc(ts.use('display', first))}</text>`,
    `<text ${attributes} y="${baselines[1]}">${esc(ts.use('display', last))}<tspan fill="${c.accent}">${ts.use('display', '.')}</tspan></text>`,
  ].join('');
}

function tagline({ ts, x, baselines, size }) {
  return TAGLINE.map((line, index) => `<text class="f-body" x="${x}" y="${baselines[index]}" font-size="${size}" fill="${c.textMuted}">${esc(ts.use('body', line))}</text>`).join('\n');
}

async function renderDesktop(embedFonts) {
  const ts = new Typeset();
  const width = 960;
  const height = 420;
  const bg = backdrop({
    width,
    height,
    glows: [
      { cx: 770, cy: 150, rx: 340, ry: 280, color: c.brandBright, opacity: 0.34, className: 'drift-a' },
      { cx: 120, cy: 420, rx: 320, ry: 200, color: c.teal, opacity: 0.08, className: 'drift-b' },
    ],
  });
  const typing = typingLine({ ts, x: 48, y: 266, size: 21 });
  const body = `<g clip-path="url(#frame)">
${bg.back}
<g class="rise d1">${brandMark(48, 40)}<text class="f-mono" x="98" y="62.5" font-size="12.5" letter-spacing="2.2" fill="${c.textSubtle}">${esc(ts.use('mono', ROLE))}</text></g>
<g class="rise d2">${statusPill({ ts, right: 912, y: 38, label: STATUS })}</g>
<g class="rise d2">${displayName({ ts, x: 46, size: 72, letterSpacing: -2.7, baselines: [146, 216] })}</g>
<g class="rise d3">${typing.body}</g>
<g class="rise d4">${tagline({ ts, x: 48, baselines: [308, 334], size: 17.5 })}</g>
<g class="rise d5">${tagPills({ ts, x: 48, y: 352, labels: TAGS })}</g>
${layerStack({ ts })}
</g>
${bg.border}`;
  return finish({ ts, width, height, bg, defs: typing.defs, body, embedFonts });
}

async function renderMobile(embedFonts) {
  const ts = new Typeset();
  const width = 480;
  const height = 436;
  const bg = backdrop({
    width,
    height,
    glows: [
      { cx: 400, cy: 130, rx: 260, ry: 230, color: c.brandBright, opacity: 0.34, className: 'drift-a' },
      { cx: 60, cy: 436, rx: 240, ry: 160, color: c.teal, opacity: 0.08, className: 'drift-b' },
    ],
  });
  const typing = typingLine({ ts, x: 32, y: 232, size: 17 });
  const body = `<g clip-path="url(#frame)">
${bg.back}
<g class="rise d1">${brandMark(32, 32, 32)}<text class="f-mono" x="74" y="52" font-size="11.5" letter-spacing="1.6" fill="${c.textSubtle}">${esc(ts.use('mono', ROLE))}</text></g>
<g class="rise d2">${statusPill({ ts, right: 448, y: 35, label: STATUS, size: 11, letterSpacing: 1.2, height: 26 })}</g>
<g class="rise d2">${displayName({ ts, x: 30, size: 62, letterSpacing: -2.4, baselines: [128, 188] })}</g>
<g class="rise d3">${typing.body}</g>
<g class="rise d4">${tagline({ ts, x: 32, baselines: [270, 294], size: 15.5 })}</g>
<g class="rise d5">${tagPills({ ts, x: 32, y: 312, labels: TAGS, size: 11, letterSpacing: 1.2, gap: 6, padding: 18 })}</g>
<g class="rise d6">${layerChips({ ts, x: 32, cy: 386 })}</g>
</g>
${bg.border}`;
  return finish({ ts, width, height, bg, defs: typing.defs, body, embedFonts });
}

/** The animated profile header. `variant` is "desktop" (960 wide) or "mobile" (480 wide). */
export function renderHeader({ variant = 'desktop', embedFonts = true } = {}) {
  return variant === 'mobile' ? renderMobile(embedFonts) : renderDesktop(embedFonts);
}
