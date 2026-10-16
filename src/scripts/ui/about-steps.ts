/*
 * The three "How I teach" steps, ported from _go, _listIn, _listOut (home.js L22–40) and the auto-advance in
 * _aboutTick (L633–643).
 *
 * The active step carries .is-active on #about-steps > li.step and decides the solid beside Winson. Pointing at a
 * step (mouseenter), clicking it or focusing it selects it. The steps walk on by themselves every 4.8 s while no
 * pointer is in the list, nothing inside it has keyboard focus and 8 s have passed since the last interaction. That
 * check runs from the about scene's per-frame tick (canvases/about.ts), so it only happens while the about canvas is
 * on screen and never under reduced motion.
 *
 * The steps are focusable (tabindex="0", PLAN.md §7.3) where the reference's are not. Only keyboard focus
 * (:focus-visible) holds the pause, so a mouse click or a tap, which also focuses the step, leaves the auto-advance
 * timing exactly as in the reference.
 */

const AUTO_EVERY = 4800;
const PAUSE_AFTER = 8000;

export interface AboutSteps {
  /** The active step, 0–2. */
  readonly step: number;
  /** performance.now() of the last step change (the gold hairline runs from here). */
  readonly stepAt: number;
  /** Whether the steps are currently walking on their own (set by tick). */
  readonly auto: boolean;
  /** Restart the step clock, e.g. when the section first comes into view. */
  restart(now: number): void;
  /** Called by the about scene every frame while it is on screen. */
  tick(now: number): void;
  /** Run after every step change. */
  onChange(fn: (step: number) => void): void;
}

const focusVisible = (el: Element): boolean => {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
};

export function initAboutSteps(root: HTMLElement): AboutSteps | null {
  const list = root.querySelector<HTMLOListElement>('#about-steps');
  if (!list) return null;
  const items = Array.from(list.querySelectorAll<HTMLLIElement>(':scope > li.step'));
  if (!items.length) return null;

  let step = Math.max(0, items.findIndex((li) => li.classList.contains('is-active')));
  let stepAt = 0;
  let touched = -1e9;
  let inList = false;
  let keyFocus = false;
  let auto = false;
  const listeners: ((step: number) => void)[] = [];

  const set = (i: number): void => {
    step = i;
    items.forEach((li, k) => li.classList.toggle('is-active', k === i));
    listeners.forEach((fn) => fn(i));
  };

  const go = (i: number): void => {
    touched = performance.now();
    if (step !== i) {
      stepAt = performance.now();
      set(i);
    }
  };

  items.forEach((li, i) => {
    li.addEventListener('mouseenter', () => go(i));
    li.addEventListener('click', () => go(i));
    li.addEventListener('focus', () => {
      keyFocus = focusVisible(li);
      go(i);
    });
  });
  list.addEventListener('mouseenter', () => {
    inList = true;
    touched = performance.now();
  });
  list.addEventListener('mouseleave', () => {
    inList = false;
    touched = performance.now();
  });
  // Keyboard focus leaving the list counts as an interaction, as the pointer leaving it does.
  list.addEventListener('focusout', (e) => {
    if (e.relatedTarget instanceof Node && list.contains(e.relatedTarget)) return;
    if (keyFocus) touched = performance.now();
    keyFocus = false;
  });

  return {
    get step() {
      return step;
    },
    get stepAt() {
      return stepAt;
    },
    get auto() {
      return auto;
    },
    restart(now) {
      stepAt = now;
    },
    tick(now) {
      if (!stepAt) stepAt = now;
      const ae = document.activeElement;
      const focused = keyFocus && !!(ae && ae !== document.body && list.contains(ae));
      auto = !inList && !focused && now - touched > PAUSE_AFTER;
      if (auto && now - stepAt > AUTO_EVERY) {
        stepAt = now;
        set((step + 1) % items.length);
      }
    },
    onChange(fn) {
      listeners.push(fn);
    },
  };
}
