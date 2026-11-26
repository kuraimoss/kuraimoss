/**
 * Motion shared by every animated SVG. Entrance animations keep the final
 * state as the base style, so switching animations off never hides content.
 */
export function baseCss() {
  const delays = Array.from({ length: 16 }, (_, index) => `.d${index + 1}{animation-delay:${((index + 1) * 0.07).toFixed(2)}s}`).join('');
  return [
    '.rise{animation:rise .9s cubic-bezier(.16,1,.3,1) both}',
    '@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
    delays,
    '.static{display:none}',
    '.pulse{transform-box:fill-box;transform-origin:center;opacity:0;animation:pulse 2.4s cubic-bezier(0,0,.2,1) infinite}',
    '@keyframes pulse{0%{opacity:.55;transform:scale(1)}80%,100%{opacity:0;transform:scale(3.2)}}',
  ].join('\n');
}

/** Must come last: honours the viewer's reduced-motion setting. */
export const REDUCED_MOTION = '@media (prefers-reduced-motion:reduce){*{animation:none!important}.motion{display:none}.static{display:inline}}';

/**
 * Builds a discrete timeline that types and then deletes each phrase in turn.
 * `events` lists every change of the visible character count (and which phrase it belongs to); `windows` says
 * when each phrase is on screen. Times are in milliseconds within one cycle.
 */
export function typingTimeline(phrases, { leadMs = 500, typeMs = 60, holdMs = 2400, deleteMs = 24, gapMs = 500 } = {}) {
  const events = [{ t: 0, chars: 0, phrase: -1 }];
  const windows = [];
  let t = leadMs;
  phrases.forEach((phrase, index) => {
    const length = [...phrase].length;
    const start = t;
    for (let count = 1; count <= length; count += 1) {
      events.push({ t, chars: count, phrase: index });
      t += typeMs;
    }
    t += holdMs;
    for (let count = length - 1; count >= 0; count -= 1) {
      events.push({ t, chars: count, phrase: index });
      t += deleteMs;
    }
    windows.push({ start, end: t });
    t += gapMs;
  });
  return { total: t, events, windows };
}
