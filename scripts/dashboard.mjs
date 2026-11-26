import { themes } from './lib/theme.mjs';
import { Typeset } from './lib/fonts.mjs';
import { esc, n, formatNumber, svgDocument } from './lib/svg.mjs';
import { textWidth } from './lib/metrics.mjs';
import { baseCss, REDUCED_MOTION } from './lib/motion.mjs';
import { drawIcon, shadowFilter, softBackdrop } from './lib/components.mjs';
import { formatDay } from './lib/github.mjs';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const UPDATED = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const TILE_TINTS = ['lavender', 'peach', 'mint', 'sky'];
const BARS = {
  light: { top: '#B9AEFF', bottom: '#8E80F2', nowTop: '#FFC9AE', nowBottom: '#F29A73' },
  dark: { top: '#A79BFF', bottom: '#5E52B8', nowTop: '#F6C2A6', nowBottom: '#B9775A' },
};

const DASHBOARD_CSS = [
  '.grow{transform-box:fill-box;transform-origin:50% 100%;animation:grow .9s cubic-bezier(.16,1,.3,1) both}',
  '@keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}',
  '.fade{animation:fade .8s ease-out both}',
  '@keyframes fade{from{opacity:0}to{opacity:1}}',
].join('\n');

const plural = (count, word) => (count === 1 ? word : `${word}s`);

function tileData(summary) {
  const { current, longest, today } = summary;
  return [
    { icon: 'activity', label: 'Contributions', caption: `${formatNumber(summary.allTimeTotal)} all-time`, value: formatNumber(summary.total) },
    {
      icon: 'flame',
      label: 'Current streak',
      caption: current.length ? `since ${formatDay(current.start, today)}` : 'no active streak',
      value: formatNumber(current.length),
      unit: plural(current.length, 'day'),
    },
    {
      icon: 'award',
      label: 'Longest streak',
      caption: longest.length ? `${formatDay(longest.start, today)} – ${formatDay(longest.end, today)}` : 'no streak yet',
      value: formatNumber(longest.length),
      unit: plural(longest.length, 'day'),
    },
    {
      icon: 'calendar',
      label: 'Active days',
      caption: `${Math.round((summary.activeDays / summary.dayCount) * 100)}% of the past year`,
      value: formatNumber(summary.activeDays),
    },
  ];
}

function tile({ ts, theme, x, y, width, height, data, tint, delay }) {
  const colors = theme.tints[tint];
  const unit = data.unit
    ? `<tspan class="f-body" dx="6" font-size="15" letter-spacing="0" fill="${theme.muted}">${esc(ts.use('body', data.unit))}</tspan>`
    : '';
  return `<g class="rise d${delay}">
<rect x="${n(x)}" y="${y}" width="${n(width)}" height="${height}" rx="18" fill="${theme.surface}" stroke="${theme.line}" filter="url(#shadow)"/>
<circle cx="${n(x + 36)}" cy="${y + 36}" r="17" fill="${colors.bg}"/>
${drawIcon(data.icon, x + 27, y + 27, { size: 18, color: colors.fg })}
<text class="f-label" x="${n(x + 62)}" y="${y + 41}" font-size="13.5" fill="${theme.inkSoft}">${esc(ts.use('label', data.label))}</text>
<text class="f-display" x="${n(x + 20)}" y="${y + 88}" font-size="30" letter-spacing="-.8" fill="${theme.ink}">${esc(ts.use('display', data.value))}${unit}</text>
<text class="f-body" x="${n(x + 20)}" y="${y + height - 18}" font-size="12.5" fill="${theme.muted}">${esc(ts.use('body', data.caption))}</text>
</g>`;
}

/** Weekly contributions for the last year as soft bars that grow in one after another. */
function weeklyChart({ ts, theme, summary, x, width, top, height, captionY }) {
  const { weeks, peak, peakIndex, average } = summary;
  const slot = width / weeks.length;
  const barWidth = Math.max(3, Math.min(10, slot * 0.62));
  const radius = Math.min(4, barWidth / 2);
  const baseline = top + height;
  const max = Math.max(peak, 1);
  const barX = (index) => x + index * slot + (slot - barWidth) / 2;
  const barHeight = (total) => (total === 0 ? 2 : Math.max(3, (total / max) * height));
  const last = weeks.length - 1;

  const bars = weeks.map((week, index) => {
    const h = barHeight(week.total);
    const faded = week.total === 0 ? ' fill-opacity=".35"' : '';
    return `<rect class="grow" style="animation-delay:${(0.45 + index * 0.012).toFixed(3)}s" x="${n(barX(index))}" y="${n(baseline - h)}" width="${n(barWidth)}" height="${n(h)}" rx="${n(radius)}" fill="url(#${index === last ? 'barNow' : 'bar'})"${faded}/>`;
  });

  const ticks = [];
  let lastTickX = -Infinity;
  weeks.forEach((week, index) => {
    const first = week.dates.find((date) => date.endsWith('-01'));
    if (!first) return;
    const label = MONTHS[Number(first.slice(5, 7)) - 1];
    const tickX = barX(index);
    const labelWidth = textWidth(label, 11.5, 'body');
    if (tickX - lastTickX < labelWidth + 10 || tickX + labelWidth > x + width) return;
    ticks.push(`<text class="f-body" x="${n(tickX)}" y="${baseline + 20}" font-size="11.5" fill="${theme.muted}">${esc(ts.use('body', label))}</text>`);
    lastTickX = tickX;
  });

  const peakX = Math.min(Math.max(barX(peakIndex) + barWidth / 2, x + 12), x + width - 12);
  const averageY = baseline - (average / max) * height;
  const lastTop = baseline - barHeight(weeks[last].total);
  const stats = `Peak ${formatNumber(peak)} · Avg ${formatNumber(average)} / week`;
  return [
    `<g class="rise d5"><text class="f-label" x="${x}" y="${captionY}" font-size="13.5" fill="${theme.inkSoft}">${ts.use('label', 'Weekly contributions')}</text>`,
    `<text class="f-body" x="${x + width}" y="${captionY}" font-size="12.5" fill="${theme.muted}" text-anchor="end">${esc(ts.use('body', stats))}</text></g>`,
    `<path d="M${x} ${baseline + 0.5}H${x + width}" stroke="${theme.line}"/>`,
    `<path class="fade" style="animation-delay:1.3s" d="M${x} ${n(averageY)}H${x + width}" stroke="${theme.muted}" stroke-opacity=".5" stroke-dasharray="3 5"/>`,
    ...bars,
    `<text class="f-label fade" style="animation-delay:1.4s" x="${n(peakX)}" y="${top - 8}" font-size="12" fill="${theme.accentInk}" text-anchor="middle">${esc(ts.use('label', formatNumber(peak)))}</text>`,
    weeks[last].total > 0 ? `<circle class="pulse" cx="${n(barX(last) + barWidth / 2)}" cy="${n(lastTop)}" r="3" fill="${theme.tints.peach.fg}"/>` : '',
    `<g class="fade" style="animation-delay:.5s">${ticks.join('')}</g>`,
  ].join('\n');
}

/**
 * The activity dashboard: four headline numbers and a weekly bar chart.
 * variant: "desktop" (960 wide, one row of tiles) | "mobile" (480 wide, 2x2); theme: "light" | "dark".
 */
export async function renderDashboard(summary, { variant = 'desktop', theme: themeName = 'light', embedFonts = true } = {}) {
  const mobile = variant === 'mobile';
  const theme = themes[themeName];
  const ts = new Typeset();
  const width = mobile ? 480 : 960;
  const pad = mobile ? 28 : 40;
  const inner = width - pad * 2;
  const columns = mobile ? 2 : 4;
  const gap = mobile ? 12 : 14;
  const tileWidth = (inner - gap * (columns - 1)) / columns;
  const tileHeight = 124;
  const tilesTop = mobile ? 106 : 96;
  const rows = Math.ceil(4 / columns);
  const tilesBottom = tilesTop + rows * tileHeight + (rows - 1) * gap;
  const captionY = tilesBottom + 40;
  const chartTop = captionY + 30;
  const chartHeight = mobile ? 92 : 84;
  const height = chartTop + chartHeight + 20 + (mobile ? 28 : 26);

  const updated = `Updated ${UPDATED.format(new Date(`${summary.today}T00:00:00Z`))}`;
  const scope = summary.includesPrivate ? 'Last 12 months · includes private work' : 'Last 12 months · public activity';
  const blobs = mobile
    ? [
        { cx: 60, cy: 30, rx: 220, ry: 160, color: 'lavender', drift: 'a' },
        { cx: 440, cy: 80, rx: 200, ry: 150, color: 'mint', drift: 'c' },
        { cx: 400, cy: height, rx: 240, ry: 160, color: 'peach', drift: 'b' },
      ]
    : [
        { cx: 120, cy: 30, rx: 320, ry: 190, color: 'lavender', drift: 'a' },
        { cx: 880, cy: 60, rx: 280, ry: 170, color: 'mint', drift: 'c' },
        { cx: 820, cy: height + 20, rx: 320, ry: 170, color: 'peach', drift: 'b' },
      ];
  const bg = softBackdrop({ theme, width, height, blobs });

  const title = `<text class="f-heading" x="${pad}" y="${mobile ? 46 : 52}" font-size="${mobile ? 19 : 20}" fill="${theme.ink}">${ts.use('heading', 'Contribution activity')}</text>`;
  const subtitle = `<text class="f-body" x="${pad}" y="${mobile ? 68 : 74}" font-size="13.5" fill="${theme.muted}">${esc(ts.use('body', scope))}</text>`;
  const stamp = mobile
    ? `<text class="f-body" x="${pad}" y="88" font-size="12.5" fill="${theme.muted}">${esc(ts.use('body', updated))}</text>`
    : `<text class="f-body" x="${width - pad}" y="52" font-size="12.5" fill="${theme.muted}" text-anchor="end">${esc(ts.use('body', updated))}</text>`;

  const tiles = tileData(summary).map((data, index) =>
    tile({
      ts,
      theme,
      x: pad + (index % columns) * (tileWidth + gap),
      y: tilesTop + Math.floor(index / columns) * (tileHeight + gap),
      width: tileWidth,
      height: tileHeight,
      data,
      tint: TILE_TINTS[index],
      delay: index + 1,
    }),
  );
  const colors = BARS[theme.name];
  const gradients = [
    `<linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${colors.top}"/><stop offset="1" stop-color="${colors.bottom}"/></linearGradient>`,
    `<linearGradient id="barNow" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${colors.nowTop}"/><stop offset="1" stop-color="${colors.nowBottom}"/></linearGradient>`,
  ].join('');

  const body = `<g clip-path="url(#frame)">
${bg.back}
<g class="rise d1">${title}${subtitle}${stamp}</g>
${tiles.join('\n')}
${weeklyChart({ ts, theme, summary, x: pad, width: inner, top: chartTop, height: chartHeight, captionY })}
</g>
${bg.border}`;

  const css = [await ts.css({ embed: embedFonts }), baseCss(), bg.css, DASHBOARD_CSS, REDUCED_MOTION].join('\n');
  return svgDocument({
    width,
    height,
    title: `Contribution activity — @${summary.login}`,
    desc: `${formatNumber(summary.total)} contributions in the last 12 months. Current streak: ${summary.current.length} days. Longest streak: ${summary.longest.length} days. Active on ${summary.activeDays} days.`,
    css,
    defs: [bg.defs, shadowFilter(theme, { dy: 8, blur: 12 }), gradients].join(''),
    body,
  });
}
