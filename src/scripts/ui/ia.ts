/*
 * The IA themes, ported from _iaEnter / _iaLeave (home.js L56–60): pointing at a theme cell makes it the hovered
 * theme (state iaHover). The cell carries .is-hot while hovered, so its highlight and its model on the canvas agree;
 * canvases/ia.ts reads `hover` and redraws through onChange.
 */

export interface IaThemes {
  /** Hovered theme, 0–7, or -1. */
  readonly hover: number;
  /** Run after every change of `hover`. */
  onChange(fn: () => void): void;
}

export function initIa(root: HTMLElement): IaThemes | null {
  const cells = Array.from(root.querySelectorAll<HTMLLIElement>('.ia-grid > li.ia-cell[data-theme]'));
  if (!cells.length) return null;
  let hover = -1;
  const listeners: (() => void)[] = [];

  const set = (i: number): void => {
    hover = i;
    cells.forEach((li) => li.classList.toggle('is-hot', Number(li.dataset.theme) === i));
    listeners.forEach((fn) => fn());
  };

  cells.forEach((li) => {
    const i = Number(li.dataset.theme);
    li.addEventListener('mouseenter', () => {
      if (hover !== i) set(i);
    });
    li.addEventListener('mouseleave', () => {
      if (hover !== -1) set(-1);
    });
  });

  return {
    get hover() {
      return hover;
    },
    onChange(fn) {
      listeners.push(fn);
    },
  };
}
