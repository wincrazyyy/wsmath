/*
 * The section menu (≤960px), ported from _toggleNav, _closeNav and _navKey (home.js renderVals L130–138).
 *
 * The Menu button toggles aria-expanded on itself and data-open on #site-menu together; the CSS shows the panel
 * and swaps the icons from those. Any link in the panel closes it. Escape, on the button or inside the panel,
 * closes it and returns focus to the button. While closed the panel is display:none, so nothing in it is reachable.
 */

export function initNav(root: ParentNode): void {
  const menu = root.querySelector<HTMLElement>('#site-menu');
  const btn = root.querySelector<HTMLButtonElement>('button[aria-controls="site-menu"]');
  if (!menu || !btn) return;

  let open = btn.getAttribute('aria-expanded') === 'true';
  const set = (v: boolean): void => {
    open = v;
    btn.setAttribute('aria-expanded', String(v));
    menu.setAttribute('data-open', String(v));
  };

  btn.addEventListener('click', () => set(!open));
  menu.addEventListener('click', (e) => {
    if (open && e.target instanceof Element && e.target.closest('a')) set(false);
  });
  const onKey = (e: KeyboardEvent): void => {
    if (e.key !== 'Escape' || !open) return;
    set(false);
    btn.focus();
  };
  btn.addEventListener('keydown', onKey);
  menu.addEventListener('keydown', onKey);
}
