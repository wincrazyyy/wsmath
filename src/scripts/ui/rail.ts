/*
 * The section rail (SectionRail.astro).
 *
 * The section being read is the one under a line 40% down the viewport. The gold line's length follows it: it
 * reaches dot i as section i arrives at that line and runs on toward dot i+1 as the reader moves through it, so
 * the fill always meets the glowing dot rather than tracking raw page height (sections differ a lot in length).
 * Measured once per animation frame while scrolling or resizing; sections render lazily (content-visibility), so
 * their positions are read fresh each time rather than cached. When the current section changes, its label shows
 * for a moment (data-flash).
 *
 * data-awake marks the rail as in use: set on load, while the page scrolls and while it is touched, cleared a
 * moment after. Touch screens show the rail only then (SectionRail.astro); elsewhere it is always shown.
 */

const READ_LINE = 0.4;
const FLASH_MS = 1400;
const AWAKE_MS = 1600;

export function initRail(rail: HTMLElement): void {
  const links = Array.from(rail.querySelectorAll<HTMLAnchorElement>('.rail-link'));
  const sections = links.map((a) => document.getElementById(a.hash.slice(1)));
  if (!links.length || sections.some((s) => !s)) return;
  const els = sections as HTMLElement[];
  const last = els.length - 1;

  let current = -1;
  let flash = 0;
  let raf = 0;

  const setCurrent = (i: number): void => {
    if (i === current) return;
    const first = current < 0;
    links.forEach((a) => a.removeAttribute('aria-current'));
    links[current]?.removeAttribute('data-flash');
    current = i;
    const link = links[i];
    link.setAttribute('aria-current', 'location');
    if (first) return; // no flash for where the page opens
    link.setAttribute('data-flash', '');
    window.clearTimeout(flash);
    flash = window.setTimeout(() => link.removeAttribute('data-flash'), FLASH_MS);
  };

  const update = (): void => {
    raf = 0;
    const line = window.innerHeight * READ_LINE;
    // The last section whose top has passed the reading line.
    let i = 0;
    for (let k = 0; k <= last; k++) if (els[k].getBoundingClientRect().top <= line) i = k;
    const r = els[i].getBoundingClientRect();
    const through = r.height > 0 ? Math.min(1, Math.max(0, (line - r.top) / r.height)) : 0;
    // At the very bottom the last section may never reach the line; finish there all the same.
    const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atEnd) i = last;
    setCurrent(i);
    const p = atEnd ? 1 : Math.min(1, (i + (i < last ? through : 0)) / last);
    rail.style.setProperty('--p', p.toFixed(4));
  };

  let sleep = 0;
  const wake = (): void => {
    rail.setAttribute('data-awake', '');
    window.clearTimeout(sleep);
    sleep = window.setTimeout(() => rail.removeAttribute('data-awake'), AWAKE_MS);
  };

  const queue = (): void => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  window.addEventListener('scroll', () => { queue(); wake(); }, { passive: true });
  window.addEventListener('resize', queue);
  rail.addEventListener('pointerdown', wake);
  rail.addEventListener('pointerup', wake);
  update();
  wake();
}
