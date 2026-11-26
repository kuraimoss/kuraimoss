import { colors as c } from './lib/theme.mjs';
import { Typeset } from './lib/fonts.mjs';
import { esc, n, monoWidth, svgDocument } from './lib/svg.mjs';
import { drawIcon } from './lib/components.mjs';

/** Screenshots come from the portfolio CMS at kuraimos.com. */
export const PROJECTS = [
  { slug: 'jobfolio', title: 'Jobfolio', host: 'jobfolio.kuraimos.com', image: 'https://kuraimos.com/uploads/193b841e-f121-44a9-a7fc-0c19b50539f0.jpg' },
  { slug: 'webmail', title: 'Webmail', host: 'webmail.kuraimos.com', image: 'https://kuraimos.com/uploads/1de76fc9-3354-419e-8097-790dbdfff420.jpg' },
  { slug: 'snapnstyle', title: 'SNap & Style payments', host: 'snapnstyle.id', image: 'https://kuraimos.com/uploads/bcf5826d-4df9-4d85-8bdf-f48bbe0e86ad.jpg' },
  { slug: 'plat-detection', title: 'Plat Detection API', host: 'platdetection.kuraimos.com', image: 'https://kuraimos.com/uploads/3f68c7bc-46c9-45eb-a279-4883e001b6dc.jpg' },
  { slug: 'kurabot', title: 'kuraBOT', host: 'wa.me · kuraBOT', status: 'WHATSAPP', image: 'https://kuraimos.com/uploads/6ffca5ab-5218-4c7d-819f-4fa68fa9d13f.jpg' },
  { slug: 'photography', title: 'Full-Stack Photography', host: 'christoophotography.com', image: 'https://kuraimos.com/uploads/8fbaa281-2a85-467e-b1af-5bead8bff787.jpg' },
];

/**
 * Puts a screenshot in a browser-window frame so every project card has the
 * same 2:1 shape. `image` is `{ mime, base64 }`; it is embedded because SVGs
 * shown through <img> cannot load external files.
 */
export async function renderProjectFrame(project, image, { embedFonts = true } = {}) {
  const ts = new Typeset();
  const width = 640;
  const bar = 36;
  const imageHeight = 320;
  const height = bar + imageHeight;
  const radius = 14;
  const urlSize = 12.5;
  const pillWidth = 29 + monoWidth(project.host, urlSize) + 14;
  const pillX = (width - pillWidth) / 2;
  const status = project.status ?? 'LIVE';
  const statusSize = 10.5;
  const statusSpacing = 1.2;
  const statusX = width - 16 - monoWidth(status, statusSize, statusSpacing);

  const body = `<g clip-path="url(#frame)">
<rect width="${width}" height="${height}" fill="${c.well}"/>
<image href="data:${image.mime};base64,${image.base64}" x="0" y="${bar}" width="${width}" height="${imageHeight}" preserveAspectRatio="xMidYMin slice"/>
<rect y="${bar}" width="${width}" height="14" fill="url(#shade)"/>
<rect width="${width}" height="${bar}" fill="${c.surface}"/>
<path d="M0 ${bar - 0.5}H${width}" stroke="${c.border}"/>
${[20, 36, 52].map((cx) => `<circle cx="${cx}" cy="${bar / 2}" r="4.5" fill="${c.borderStrong}"/>`).join('')}
<rect x="${n(pillX)}" y="7" width="${n(pillWidth)}" height="22" rx="11" fill="${c.well}" stroke="${c.border}"/>
${drawIcon('lock', pillX + 12, 12.5, { size: 11, color: c.textSubtle, strokeWidth: 1.6 })}
<text class="f-mono" x="${n(pillX + 29)}" y="${n(bar / 2 + urlSize * 0.36)}" font-size="${urlSize}" fill="${c.textMuted}">${esc(ts.use('mono', project.host))}</text>
<circle cx="${n(statusX - 9)}" cy="${bar / 2}" r="3.5" fill="${project.status ? c.accent : c.success}"/>
<text class="f-mono" x="${n(statusX)}" y="${n(bar / 2 + statusSize * 0.36)}" font-size="${statusSize}" letter-spacing="${statusSpacing}" fill="${c.textSubtle}">${esc(ts.use('mono', status))}</text>
</g>
<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${radius - 0.5}" stroke="${c.borderStrong}"/>`;

  const defs = [
    `<clipPath id="frame"><rect width="${width}" height="${height}" rx="${radius}"/></clipPath>`,
    '<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>',
  ].join('');
  return svgDocument({
    width,
    height,
    title: `${project.title} — preview`,
    desc: `Screenshot of ${project.title} (${project.host}).`,
    css: await ts.css({ embed: embedFonts }),
    defs,
    body,
  });
}
