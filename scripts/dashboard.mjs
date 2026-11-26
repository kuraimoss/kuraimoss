import { colors as c } from './lib/theme.mjs';
import { Typeset } from './lib/fonts.mjs';
import { esc, n, formatNumber, monoWidth, svgDocument } from './lib/svg.mjs';
import { baseCss, REDUCED_MOTION } from './lib/motion.mjs';
import { backdrop, drawIcon } from './lib/components.mjs';
import { formatDay } from './lib/github.mjs';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const UPDATED = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

const DASHBOARD_CSS = [
  '.grow{transform-box:fill-box;transform-origin:50% 100%;animation:grow .9s cubic-bezier(.16,1,.3,1) both}',
  '@keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}',
  '.fade{animation:fade .8s ease-out both}',
  '@keyframes fade{from{opacity:0}to{opacity:1}}',
].join('\n');

const BAR_GRADIENTS = [
  `<linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${c.accent}"/><stop offset="1" stop-color="${c.brand}" stop-opacity=".55"/></linearGradient>`,
  `<linearGradient id="barNow" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#EDE7FF"/><stop offset="1" stop-color="${c.accent}"/></linearGradient>`,
].join('');

const plural = (count, word) => (count === 1 ? word : `${word}s`);

function tileData(summary) {
  const { current, longest, today } = summary;
  return [
    { icon: 'activity', label: 'CONTRIBUTIONS', caption: `${formatNumber(summary.allTimeTotal)} all-time`, value: formatNumber(summary.total) },
    {
      icon: 'flame',
      label: 'CURRENT STREAK',
      caption: current.length ? `since ${formatDay(current.start, today)}` : 'no active streak',
      value: formatNumber(current.length),
      unit: plural(current.length, 'day'),
    },
    {
      icon: 'award',
      label: 'LONGEST STREAK',
      caption: longest.length ? `${formatDay(longest.start, today)} – ${formatDay(longest.end, today)}` : 'no streak yet',
      value: formatNumber(longest.length),
      unit: plural(longest.length, 'day'),
    },
    {
      icon: 'calendar',
      label: 'ACTIVE DAYS',
      caption: `${Math.round((summary.activeDays / summary.dayCount) * 100)}% of the past year`,
      value: formatNumber(summary.activeDays),
    },
  ];
}

function tile({ ts, x, y, width, height, data, delay }) {
  const unit = data.unit
    ? `<tspan class="f-body" dx="6" font-size="15" letter-spacing="0" fill="${c.textMuted}">${esc(ts.use('body', data.unit))}</tspan>`
    : '';
  return `<g class="rise d${delay}">
<rect x="${n(x)}" y="${y}" width="${n(width)}" height="${height}" rx="14" fill="${c.surface}" stroke="${c.border}"/>
<rect x="${n(x + 16)}" y="${y + 16}" width="30" height="30" rx="9" fill="${c.surfaceRaised}" stroke="${c.borderStrong}"/>
${drawIcon(data.icon, x + 23, y + 23, { size: 16, color: c.accentSoft })}
<text class="f-mono" x="${n(x + 58)}" y="${y + 28}" font-size="11" letter-spacing="1.1" fill="${c.textMuted}">${esc(ts.use('mono', data.label))}</text>
<text class="f-mono" x="${n(x + 58)}" y="${y + 43}" font-size="11" fill="${c.textSubtle}">${esc(ts.use('mono', data.caption))}</text>
<text class="f-display" x="${n(x + 16)}" y="${y + height - 18}" font-size="30" letter-spacing="-.8" fill="${c.text}">${esc(ts.use('display', data.value))}${unit}</text>
</g>`;
}

/** Weekly contributions for the last year as bars that grow in one after another. */
function weeklyChart({ ts, summary, x, width, top, height, captionY }) {
  const { weeks, peak, peakIndex, average } = summary;
  const slot = width / weeks.length;
  const barWidth = Math.max(3, Math.min(10, slot * 0.62));
  const radius = Math.min(3, barWidth / 2);
  const baseline = top + height;
  const max = Math.max(peak, 1);
  const barX = (index) => x + index * slot + (slot - barWidth) / 2;
  const barHeight = (total) => (total === 0 ? 2 : Math.max(3, (total / max) * height));

  const bars = weeks.map((week, index) => {
    const h = barHeight(week.total);
    const fill = index === weeks.length - 1 ? 'barNow' : 'bar';
    const faded = week.total === 0 ? ' fill-opacity=".35"' : '';
    return `<rect class="grow" style="animation-delay:${(0.45 + index * 0.012).toFixed(3)}s" x="${n(barX(index))}" y="${n(baseline - h)}" width="${n(barWidth)}" height="${n(h)}" rx="${n(radius)}" fill="url(#${fill})"${faded}/>`;
  });

  const ticks = [];
  let lastTickX = -Infinity;
  weeks.forEach((week, index) => {
    const first = week.dates.find((date) => date.endsWith('-01'));
    if (!first) return;
    const label = MONTHS[Number(first.slice(5, 7)) - 1];
    const tickX = barX(index);
    const labelWidth = monoWidth(label, 10.5);
    if (tickX - lastTickX < labelWidth + 8 || tickX + labelWidth > x + width) return;
    ticks.push(`<text class="f-mono" x="${n(tickX)}" y="${baseline + 20}" font-size="10.5" fill="${c.textSubtle}">${esc(ts.use('mono', label))}</text>`);
    lastTickX = tickX;
  });

  const peakX = Math.min(Math.max(barX(peakIndex) + barWidth / 2, x + 12), x + width - 12);
  const averageY = baseline - (average / max) * height;
  const last = weeks.length - 1;
  const lastTop = baseline - barHeight(weeks[last].total);
  const stats = `PEAK ${formatNumber(peak)} · AVG ${formatNumber(average)}/WK`;
  return [
    `<g class="rise d5"><text class="f-mono" x="${x}" y="${captionY}" font-size="11" letter-spacing="1.1" fill="${c.textMuted}">${ts.use('mono', 'WEEKLY CONTRIBUTIONS')}</text>`,
    `<text class="f-mono" x="${x + width}" y="${captionY}" font-size="11" letter-spacing="1.1" fill="${c.textSubtle}" text-anchor="end">${esc(ts.use('mono', stats))}</text></g>`,
    `<path d="M${x} ${baseline + 0.5}H${x + width}" stroke="${c.border}"/>`,
    `<path class="fade" style="animation-delay:1.3s" d="M${x} ${n(averageY)}H${x + width}" stroke="${c.textFaint}" stroke-dasharray="3 5"/>`,
    ...bars,
    `<text class="f-mono fade" style="animation-delay:1.4s" x="${n(peakX)}" y="${top - 8}" font-size="10.5" fill="${c.accentSoft}" text-anchor="middle">${esc(ts.use('mono', formatNumber(peak)))}</text>`,
    weeks[last].total > 0
      ? `<circle class="pulse" cx="${n(barX(last) + barWidth / 2)}" cy="${n(lastTop)}" r="3" fill="${c.accentSoft}"/>`
      : '',
    `<g class="fade" style="animation-delay:.5s">${ticks.join('')}</g>`,
  ].join('\n');
}

/**
 * The activity dashboard: four headline numbers and a weekly bar chart.
 * `variant` is "desktop" (960 wide, one row of tiles) or "mobile" (480 wide, 2x2 tiles).
 */
export async function renderDashboard(summary, { variant = 'desktop', embedFonts = true } = {}) {
  const mobile = variant === 'mobile';
  const ts = new Typeset();
  const width = mobile ? 480 : 960;
  const pad = mobile ? 28 : 40;
  const inner = width - pad * 2;
  const columns = mobile ? 2 : 4;
  const gap = mobile ? 12 : 14;
  const tileWidth = (inner - gap * (columns - 1)) / columns;
  const tileHeight = 100;
  const tilesTop = mobile ? 100 : 92;
  const rows = Math.ceil(4 / columns);
  const tilesBottom = tilesTop + rows * tileHeight + (rows - 1) * gap;
  const captionY = tilesBottom + 40;
  const chartTop = captionY + 28;
  const chartHeight = mobile ? 92 : 84;
  const height = chartTop + chartHeight + 20 + (mobile ? 26 : 24);

  const updated = `UPDATED ${UPDATED.format(new Date(`${summary.today}T00:00:00Z`)).toUpperCase()}`;
  const scope = summary.includesPrivate ? 'LAST 12 MONTHS · INCL. PRIVATE WORK' : 'LAST 12 MONTHS · PUBLIC ACTIVITY';
  const bg = backdrop({
    width,
    height,
    glows: [{ cx: width * 0.78, cy: 40, rx: width * 0.45, ry: 220, color: c.brandBright, opacity: 0.22, className: 'drift-a' }],
  });

  const title = `<text class="f-heading" x="${pad}" y="${mobile ? 44 : 50}" font-size="${mobile ? 19 : 20}" fill="${c.text}">${ts.use('heading', 'Contribution activity')}</text>`;
  const subtitle = `<text class="f-mono" x="${pad}" y="${mobile ? 66 : 72}" font-size="11" letter-spacing="1.1" fill="${c.textSubtle}">${esc(ts.use('mono', scope))}</text>`;
  const stamp = mobile
    ? `<text class="f-mono" x="${pad}" y="84" font-size="10.5" letter-spacing="1.1" fill="${c.textFaint}">${esc(ts.use('mono', updated))}</text>`
    : `<text class="f-mono" x="${width - pad}" y="50" font-size="11" letter-spacing="1.1" fill="${c.textSubtle}" text-anchor="end">${esc(ts.use('mono', updated))}</text>`;

  const tiles = tileData(summary).map((data, index) =>
    tile({
      ts,
      x: pad + (index % columns) * (tileWidth + gap),
      y: tilesTop + Math.floor(index / columns) * (tileHeight + gap),
      width: tileWidth,
      height: tileHeight,
      data,
      delay: index + 1,
    }),
  );

  const body = `<g clip-path="url(#frame)">
${bg.back}
<g class="rise d1">${title}${subtitle}${stamp}</g>
${tiles.join('\n')}
${weeklyChart({ ts, summary, x: pad, width: inner, top: chartTop, height: chartHeight, captionY })}
</g>
${bg.border}`;

  const css = [await ts.css({ embed: embedFonts }), baseCss(), bg.css, DASHBOARD_CSS, REDUCED_MOTION].join('\n');
  return svgDocument({
    width,
    height,
    title: `Contribution activity — @${summary.login}`,
    desc: `${formatNumber(summary.total)} contributions in the last 12 months. Current streak: ${summary.current.length} days. Longest streak: ${summary.longest.length} days. Active on ${summary.activeDays} days.`,
    css,
    defs: [bg.defs, BAR_GRADIENTS].join(''),
    body,
  });
}
