import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkWellFormed, esc, monoWidth } from '../lib/svg.mjs';
import { typingTimeline } from '../lib/motion.mjs';
import { Typeset } from '../lib/fonts.mjs';
import { computeStreaks, formatDay, normalizeDays, summarize } from '../lib/github.mjs';
import { renderHeader, PHRASES } from '../header.mjs';
import { renderFooter } from '../footer.mjs';
import { BUTTONS, renderButton } from '../buttons.mjs';
import { PROJECTS, renderProjectFrame } from '../projects.mjs';
import { renderDashboard } from '../dashboard.mjs';

const addDays = (date, amount) => new Date(Date.parse(`${date}T00:00:00Z`) + amount * 86_400_000).toISOString().slice(0, 10);
const series = (start, counts) => counts.map((count, index) => ({ date: addDays(start, index), count }));

function calendar(start, counts, extra = {}) {
  const days = series(start, counts);
  const weeks = [];
  for (let index = 0; index < days.length; index += 7) weeks.push(days.slice(index, index + 7));
  const total = counts.reduce((sum, count) => sum + count, 0);
  return { login: 'octo', createdAt: `${start}T00:00:00Z`, restrictedContributions: 0, lastYear: { total, weeks }, history: days, allTimeTotal: total, ...extra };
}

test('esc escapes markup characters', () => {
  assert.equal(esc(`<a href="x">Tom & 'Jerry'</a>`), '&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;');
});

test('monoWidth counts characters, not UTF-16 units', () => {
  assert.equal(monoWidth('ab', 10), 12);
  assert.equal(monoWidth('a·b', 10, 1), 21);
});

test('checkWellFormed catches broken markup', () => {
  assert.deepEqual(checkWellFormed('<svg><g><rect/></g></svg>'), []);
  assert.ok(checkWellFormed('<svg><g></svg>').length > 0);
  assert.ok(checkWellFormed('<svg><text>a & b</text></svg>').length > 0);
});

test('typing timeline moves forward and ends every phrase empty', () => {
  const { total, events, windows } = typingTimeline(['ab', 'xyz']);
  for (let index = 1; index < events.length; index += 1) assert.ok(events[index].t > events[index - 1].t);
  assert.ok(events.at(-1).t < total);
  assert.equal(events.at(-1).chars, 0);
  assert.equal(Math.max(...events.map((event) => event.chars)), 3);
  assert.equal(windows.length, 2);
  assert.ok(windows[0].end <= windows[1].start);
});

test('current streak survives a quiet today but not a quiet yesterday', () => {
  assert.equal(computeStreaks(series('2026-01-01', [1, 1, 0, 1, 1, 1, 0])).current.length, 3);
  assert.equal(computeStreaks(series('2026-01-01', [1, 1, 1, 0, 0])).current.length, 0);
  assert.equal(computeStreaks(series('2026-01-01', [2, 3, 4])).current.length, 3);
  assert.equal(computeStreaks([]).current.length, 0);
});

test('longest streak keeps the first longest run and its dates', () => {
  const { longest } = computeStreaks(series('2026-03-01', [1, 1, 1, 0, 1, 1, 1, 0, 1]));
  assert.deepEqual(longest, { length: 3, start: '2026-03-01', end: '2026-03-03' });
});

test('normalizeDays merges duplicates and fills gaps', () => {
  const days = normalizeDays([
    { date: '2026-01-03', count: 2 },
    { date: '2026-01-01', count: 1 },
    { date: '2026-01-03', count: 5 },
  ]);
  assert.deepEqual(days, [
    { date: '2026-01-01', count: 1 },
    { date: '2026-01-02', count: 0 },
    { date: '2026-01-03', count: 5 },
  ]);
});

test('summarize reports totals, weekly peak, and complete-week average', () => {
  const counts = [...Array(7).fill(1), ...Array(7).fill(3), 2, 0];
  const summary = summarize(calendar('2026-01-04', counts, { restrictedContributions: 4, allTimeTotal: 100 }));
  assert.equal(summary.total, 30);
  assert.equal(summary.allTimeTotal, 100);
  assert.equal(summary.includesPrivate, true);
  assert.equal(summary.activeDays, 15);
  assert.deepEqual(summary.weeks.map((week) => week.total), [7, 21, 2]);
  assert.equal(summary.peakIndex, 1);
  assert.equal(summary.average, 14);
  assert.equal(summary.current.length, 15); // today is quiet, so the streak counts back from yesterday
  assert.equal(summary.longest.length, 15);
});

test('formatDay adds the year only when it differs', () => {
  assert.equal(formatDay('2026-01-04', '2026-11-26'), 'Jan 4');
  assert.equal(formatDay('2025-12-27', '2026-11-26'), 'Dec 27, 2025');
});

test('Typeset embeds fonts and falls back quietly when Google Fonts fails', async () => {
  const fakeFetch = async (url) => {
    if (String(url).startsWith('https://fonts.googleapis.com')) {
      return new Response("@font-face { src: url(https://fonts.gstatic.com/x.woff2) format('woff2'); }");
    }
    return new Response(new Uint8Array([1, 2, 3]));
  };
  const ts = new Typeset();
  ts.use('mono', 'unique-glyphs-for-test');
  const css = await ts.css({ fetchImpl: fakeFetch });
  assert.match(css, /@font-face\{font-family:'JetBrains Mono';[^}]*base64,AQID/);

  const warnings = [];
  const failing = new Typeset();
  failing.use('body', 'another-unique-string');
  const fallback = await failing.css({ fetchImpl: async () => new Response('nope', { status: 500 }), warn: (message) => warnings.push(message) });
  assert.doesNotMatch(fallback, /@font-face/);
  assert.match(fallback, /\.f-body\{font-family:'Plus Jakarta Sans'/);
  assert.equal(warnings.length, 1);
});

test('every generated SVG is well formed, labelled, and respects reduced motion', async () => {
  const counts = Array.from({ length: 370 }, (_, index) => (index % 9 === 0 ? 0 : (index % 13) + 1));
  const summary = summarize(calendar('2025-11-22', counts, { restrictedContributions: 10 }));
  const image = { mime: 'image/webp', base64: 'AAAA' };
  const documents = {
    'header desktop': await renderHeader({ variant: 'desktop', embedFonts: false }),
    'header mobile': await renderHeader({ variant: 'mobile', embedFonts: false }),
    'footer desktop': await renderFooter({ variant: 'desktop', embedFonts: false }),
    'footer mobile': await renderFooter({ variant: 'mobile', embedFonts: false }),
    'dashboard desktop': await renderDashboard(summary, { variant: 'desktop', embedFonts: false }),
    'dashboard mobile': await renderDashboard(summary, { variant: 'mobile', embedFonts: false }),
    button: await renderButton({ ...BUTTONS[0], embedFonts: false }),
    project: await renderProjectFrame(PROJECTS[0], image, { embedFonts: false }),
  };
  for (const [name, svg] of Object.entries(documents)) {
    assert.deepEqual(checkWellFormed(svg), [], name);
    assert.match(svg, /<title id="title">[^<]+<\/title>/, name);
  }
  for (const name of ['header desktop', 'header mobile', 'footer desktop', 'dashboard desktop', 'button']) {
    assert.match(documents[name], /prefers-reduced-motion:reduce/, name);
  }
  for (const phrase of PHRASES) assert.ok(documents['header desktop'].includes(phrase), phrase);
  assert.match(documents['dashboard desktop'], /INCL\. PRIVATE WORK/);
});
