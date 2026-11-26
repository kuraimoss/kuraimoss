#!/usr/bin/env node
/**
 * Builds the activity dashboard SVGs from live GitHub data.
 *
 *   GITHUB_TOKEN=... node scripts/build-dashboard.mjs --login kuraimoss --out dist
 *   node scripts/build-dashboard.mjs --fixture data.json --out dist      # offline
 *
 * Writes light and dark variants for desktop and mobile. The "Profile
 * dashboard" workflow runs this every day and publishes dist/
 * to the `output` branch, which the README links to.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { fetchContributions, summarize } from './lib/github.mjs';
import { renderDashboard } from './dashboard.mjs';

const { values } = parseArgs({
  options: {
    login: { type: 'string', default: 'kuraimoss' },
    out: { type: 'string', default: 'dist' },
    fixture: { type: 'string' },
    'save-fixture': { type: 'string' },
    'no-embed-fonts': { type: 'boolean', default: false },
  },
});

const data = values.fixture
  ? JSON.parse(await readFile(values.fixture, 'utf8'))
  : await fetchContributions({ login: values.login, token: process.env.GITHUB_TOKEN || process.env.GH_TOKEN });
if (values['save-fixture']) await writeFile(values['save-fixture'], JSON.stringify(data));

const summary = summarize(data);
await mkdir(values.out, { recursive: true });
const outputs = [
  ['desktop', 'light', 'dashboard.svg'],
  ['desktop', 'dark', 'dashboard-dark.svg'],
  ['mobile', 'light', 'dashboard-mobile.svg'],
  ['mobile', 'dark', 'dashboard-mobile-dark.svg'],
];
for (const [variant, theme, name] of outputs) {
  const svg = await renderDashboard(summary, { variant, theme, embedFonts: !values['no-embed-fonts'] });
  await writeFile(join(values.out, name), svg);
  console.log(`${join(values.out, name).padEnd(28)} ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
}
console.log(`@${summary.login}: ${summary.total} contributions in the last year, current streak ${summary.current.length} days, longest ${summary.longest.length} days.`);
