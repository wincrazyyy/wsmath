/*
 * The testimonial rows' Pause / Play button (_tmToggle, home.js L128; tmPaused, tmToggleLabel L167–168).
 *
 * The button's aria-pressed swaps its icons (CSS); the controller also sets its label ("Pause" / "Play", the last
 * child, a bare text node) and data-paused on the section, which pauses both tracks in CSS. Hover or focus inside a
 * row pauses that row in CSS alone, and under reduced motion the rows are plain scrollers (Students.astro).
 */

export function initTestimonials(root: HTMLElement): void {
  const btn = root.querySelector<HTMLButtonElement>('.tm-toggle');
  const label = btn?.lastChild;
  if (!btn || !label || label.nodeType !== Node.TEXT_NODE) return;
  btn.addEventListener('click', () => {
    const paused = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(paused));
    label.nodeValue = paused ? 'Play' : 'Pause';
    root.dataset.paused = String(paused);
  });
}
