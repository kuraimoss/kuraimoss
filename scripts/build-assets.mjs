#!/usr/bin/env node
/**
 * Regenerates the static SVGs in assets/: the animated header and footer,
 * the link buttons, and the project previews, each in a light and a dark
 * theme (`name.svg` and `name-dark.svg`).
 *
 *   node scripts/build-assets.mjs                      # everything
 *   node scripts/build-assets.mjs --only header,footer # a subset
 *   node scripts/build-assets.mjs --no-embed-fonts     # offline, system fonts
 *
 * Project previews need network access and ImageMagick (`convert`).
 */
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, promisify } from 'node:util';
import { THEME_NAMES } from './lib/theme.mjs';
import { renderHeader } from './header.mjs';
import { renderFooter } from './footer.mjs';
import { BUTTONS, renderButton } from './buttons.mjs';
import { PROJECTS, renderProjectFrame } from './projects.mjs';

const run = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { values } = parseArgs({
  options: {
    only: { type: 'string', default: 'header,footer,buttons,projects' },
    'no-embed-fonts': { type: 'boolean', default: false },
  },
});
const embedFonts = !values['no-embed-fonts'];
const groups = new Set(values.only.split(',').map((group) => group.trim()));
const suffix = (theme) => (theme === 'light' ? '' : `-${theme}`);

async function save(path, svg) {
  const target = join(root, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, svg);
  console.log(`${path.padEnd(40)} ${(Buffer.byteLength(svg) / 1024).toFixed(1).padStart(6)} KB`);
}

/** Downloads a screenshot and crops it to an 800x400 WebP, keeping the top of the page. */
async function loadPreview(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not download ${url}: HTTP ${response.status}`);
  const dir = await mkdtemp(join(tmpdir(), 'profile-preview-'));
  try {
    const source = join(dir, 'source');
    const output = join(dir, 'preview.webp');
    await writeFile(source, Buffer.from(await response.arrayBuffer()));
    await run('convert', [source, '-resize', '800x400^', '-gravity', 'north', '-extent', '800x400', '-strip', '-quality', '78', output]);
    return { mime: 'image/webp', base64: (await readFile(output)).toString('base64') };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

for (const theme of THEME_NAMES) {
  const end = suffix(theme);
  if (groups.has('header')) {
    await save(`assets/header${end}.svg`, await renderHeader({ variant: 'desktop', theme, embedFonts }));
    await save(`assets/header-mobile${end}.svg`, await renderHeader({ variant: 'mobile', theme, embedFonts }));
  }
  if (groups.has('footer')) {
    await save(`assets/footer${end}.svg`, await renderFooter({ variant: 'desktop', theme, embedFonts }));
    await save(`assets/footer-mobile${end}.svg`, await renderFooter({ variant: 'mobile', theme, embedFonts }));
  }
  if (groups.has('buttons')) {
    for (const button of BUTTONS) {
      await save(`assets/buttons/${button.file}${end}.svg`, await renderButton({ ...button, theme, embedFonts }));
    }
  }
}
if (groups.has('projects')) {
  for (const project of PROJECTS) {
    const image = await loadPreview(project.image);
    for (const theme of THEME_NAMES) {
      await save(`assets/projects/${project.slug}${suffix(theme)}.svg`, await renderProjectFrame(project, image, { theme }));
    }
  }
}
