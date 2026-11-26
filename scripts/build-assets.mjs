#!/usr/bin/env node
/**
 * Regenerates the static SVGs in assets/: the animated header and footer,
 * the link buttons, and the framed project previews.
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

async function save(path, svg) {
  const target = join(root, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, svg);
  console.log(`${path.padEnd(36)} ${(Buffer.byteLength(svg) / 1024).toFixed(1).padStart(6)} KB`);
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

if (groups.has('header')) {
  await save('assets/header.svg', await renderHeader({ variant: 'desktop', embedFonts }));
  await save('assets/header-mobile.svg', await renderHeader({ variant: 'mobile', embedFonts }));
}
if (groups.has('footer')) {
  await save('assets/footer.svg', await renderFooter({ variant: 'desktop', embedFonts }));
  await save('assets/footer-mobile.svg', await renderFooter({ variant: 'mobile', embedFonts }));
}
if (groups.has('buttons')) {
  for (const button of BUTTONS) {
    await save(`assets/buttons/${button.file}.svg`, await renderButton({ ...button, embedFonts }));
  }
}
if (groups.has('projects')) {
  for (const project of PROJECTS) {
    await save(`assets/projects/${project.slug}.svg`, await renderProjectFrame(project, await loadPreview(project.image), { embedFonts }));
  }
}
