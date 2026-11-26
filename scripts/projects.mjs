import { themes } from './lib/theme.mjs';
import { svgDocument } from './lib/svg.mjs';
import { shadowFilter } from './lib/components.mjs';

/** Screenshots come from the portfolio CMS at kuraimos.com. Each card sits on its own pastel plate. */
export const PROJECTS = [
  { slug: 'jobfolio', title: 'Jobfolio', tint: 'butter', image: 'https://kuraimos.com/uploads/193b841e-f121-44a9-a7fc-0c19b50539f0.jpg' },
  { slug: 'webmail', title: 'Webmail', tint: 'rose', image: 'https://kuraimos.com/uploads/1de76fc9-3354-419e-8097-790dbdfff420.jpg' },
  { slug: 'snapnstyle', title: 'SNap & Style payments', tint: 'peach', image: 'https://kuraimos.com/uploads/bcf5826d-4df9-4d85-8bdf-f48bbe0e86ad.jpg' },
  { slug: 'plat-detection', title: 'Plat Detection API', tint: 'sky', image: 'https://kuraimos.com/uploads/3f68c7bc-46c9-45eb-a279-4883e001b6dc.jpg' },
  { slug: 'kurabot', title: 'kuraBOT', tint: 'mint', image: 'https://kuraimos.com/uploads/6ffca5ab-5218-4c7d-819f-4fa68fa9d13f.jpg' },
  { slug: 'photography', title: 'Full-Stack Photography', tint: 'lavender', image: 'https://kuraimos.com/uploads/8fbaa281-2a85-467e-b1af-5bead8bff787.jpg' },
];

/**
 * A screenshot resting on a soft pastel plate, so every project card has the
 * same shape. `image` is `{ mime, base64 }`; it is embedded because SVGs shown
 * through <img> cannot load external files.
 */
export async function renderProjectFrame(project, image, { theme: themeName = 'light' } = {}) {
  const theme = themes[themeName];
  const tint = theme.tints[project.tint];
  const plateEnd = theme.name === 'light' ? theme.blobs[project.tint] : theme.canvasBottom;
  const width = 640;
  const height = 360;
  const radius = 24;
  const shot = { x: 36, y: 36, width: 568, height: 284, radius: 14 };

  const defs = [
    `<clipPath id="frame"><rect width="${width}" height="${height}" rx="${radius}"/></clipPath>`,
    `<clipPath id="shot"><rect x="${shot.x}" y="${shot.y}" width="${shot.width}" height="${shot.height}" rx="${shot.radius}"/></clipPath>`,
    `<linearGradient id="plate" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${tint.bg}"/><stop offset="1" stop-color="${plateEnd}"/></linearGradient>`,
    `<radialGradient id="glow"><stop stop-color="${theme.name === 'light' ? '#FFFFFF' : theme.blobs[project.tint]}" stop-opacity="${theme.name === 'light' ? 0.75 : 0.35}"/><stop offset="1" stop-color="${theme.name === 'light' ? '#FFFFFF' : theme.blobs[project.tint]}" stop-opacity="0"/></radialGradient>`,
    shadowFilter(theme, { id: 'lift', dy: 12, blur: 16, opacity: theme.name === 'light' ? 0.16 : 0.5 }),
  ].join('');

  const body = `<g clip-path="url(#frame)">
<rect width="${width}" height="${height}" fill="url(#plate)"/>
<ellipse cx="${width * 0.86}" cy="0" rx="280" ry="190" fill="url(#glow)"/>
<rect x="${shot.x}" y="${shot.y}" width="${shot.width}" height="${shot.height}" rx="${shot.radius}" fill="${theme.surface}" filter="url(#lift)"/>
<g clip-path="url(#shot)"><image href="data:${image.mime};base64,${image.base64}" x="${shot.x}" y="${shot.y}" width="${shot.width}" height="${shot.height}" preserveAspectRatio="xMidYMin slice"/></g>
<rect x="${shot.x + 0.5}" y="${shot.y + 0.5}" width="${shot.width - 1}" height="${shot.height - 1}" rx="${shot.radius - 0.5}" stroke="${theme.line}" stroke-opacity=".9"/>
</g>
<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${radius - 0.5}" stroke="${theme.line}"/>`;

  return svgDocument({
    width,
    height,
    title: `${project.title} — preview`,
    desc: `Screenshot of ${project.title}.`,
    css: '',
    defs,
    body,
  });
}
