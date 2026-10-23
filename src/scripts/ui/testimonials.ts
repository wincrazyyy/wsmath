/*
 * The testimonial rows' Pause / Play button (_tmToggle, home.js L128; tmPaused, tmToggleLabel L167–168).
 *
 * The button's aria-pressed swaps its icons (CSS); the controller also sets its label ("Pause" / "Play", the last
 * child, a bare text node) and data-paused on the section, which pauses both tracks in CSS. Hover or focus inside a
 * row pauses that row in CSS alone, and under reduced motion the rows are plain scrollers (Students.astro).
 */

/*
 * "Read full" and the full-testimonial dialogs (ui/QuoteDialog.astro). The buttons work by themselves through
 * commandfor / command; where the browser lacks invoker commands this does the same. Where it lacks closedby="any", a
 * click on the backdrop (outside the dialog's box) closes the dialog.
 */
export function initQuoteDialogs(root: HTMLElement): void {
  if (!('commandForElement' in HTMLButtonElement.prototype)) {
    root.addEventListener('click', (e) => {
      const btn = (e.target as Element).closest<HTMLButtonElement>('button[commandfor]');
      if (!btn) return;
      const dialog = document.getElementById(btn.getAttribute('commandfor') ?? '');
      if (!(dialog instanceof HTMLDialogElement)) return;
      const command = btn.getAttribute('command');
      if (command === 'show-modal' && !dialog.open) dialog.showModal();
      else if (command === 'close') dialog.close();
    });
  }
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    root.querySelectorAll('dialog').forEach((dialog) => {
      dialog.addEventListener('click', (e) => {
        if (e.target !== dialog) return;
        const r = dialog.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
      });
    });
  }
}

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
