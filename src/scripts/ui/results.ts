/*
 * The results stage controller, ported from home.js: the handlers _rsTab, _rsPrev, _rsNext, _rsMove, _rsLeave
 * (renderVals L94–113), the panel values (L114–124, L169–173), _rsLaneNow and _rsStep (L970–983), _rsPointer
 * (L984–1002), and the 30%-visible gate and auto-advance timer from componentDidMount (L477–512).
 *
 * - Lane tabs (aria-pressed) switch the lane; the selection jumps to that lane's first record.
 * - Prev / next step through the lane with wrap-around.
 * - Pointing at a tower selects it (mouse padding 4px, touch 10px, frontmost wins); a tap selects on touch.
 * - The reading panel replays rs-in-a / rs-in-b (alternating per change) once the stage has been seen, never under
 *   reduced motion.
 * - Every 4.2 s the selection advances, once the stage has been ≥30% visible for 3.6 s, unless the pointer is on a
 *   tower or there was a touch, click, tab change or prev/next in the last 6 s. No auto-advance under reduced
 *   motion.
 */
import { initResultsCanvas, type RsModel, type RsRecord } from '../canvases/results';
import { reducedMotion } from '../lib/motion';
import type { Lane } from '../../content/types';

const AUTO_EVERY = 4200;
const SEEN_FOR = 3600;
const TOUCH_PAUSE = 6000;

interface RsData {
  lane: number;
  sel: number;
  lanes: Lane[];
  records: RsRecord[];
}

const q = <T extends Element>(root: ParentNode, sel: string): T | null => root.querySelector<T>(sel);

export function initResults(root: HTMLElement): void {
  const dataEl = q<HTMLScriptElement>(root, '#rs-data');
  const canvas = q<HTMLCanvasElement>(root, '#rs-canvas');
  const view = q<HTMLElement>(root, '.rs-view');
  const panel = q<HTMLElement>(root, '[data-rs="panel"]');
  const course = q<HTMLElement>(root, '[data-rs="course"]');
  const name = q<HTMLElement>(root, '[data-rs="name"]');
  const grade = q<HTMLElement>(root, '[data-rs="grade"]');
  const gain = q<HTMLElement>(root, '[data-rs="gain"]');
  const dest = q<HTMLElement>(root, '[data-rs="dest"]');
  const pos = q<HTMLElement>(root, '[data-rs="pos"]');
  const prev = q<HTMLButtonElement>(root, '[data-rs="prev"]');
  const next = q<HTMLButtonElement>(root, '[data-rs="next"]');
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-rs="tabs"] [data-lane]'));
  if (!dataEl || !canvas || !view || !panel || !course || !name || !grade || !gain || !dest || !pos || !prev || !next) return;
  const from = grade.firstChild, to = grade.lastChild;
  if (!from || !to || from.nodeType !== Node.TEXT_NODE || to.nodeType !== Node.TEXT_NODE) return;

  let data: RsData;
  try {
    data = JSON.parse(dataEl.textContent || '') as RsData;
  } catch {
    return;
  }
  const { lanes, records } = data;
  if (!lanes?.length || !records?.length) return;

  const model: RsModel = { lanes, records, lane: data.lane, sel: data.sel, seen: 0, ptr: null, grow: {} };
  /** state.rsTick: counts changes; its parity picks rs-in-a or rs-in-b. */
  let tick = 0;
  /** _rsTouched: last touch, click, tab change, prev/next or pointer move on the stage. */
  let touched = 0;
  /** _rsHot: the pointer is on a tower. */
  let hot = false;

  const pool = (): number[] => records.map((_, i) => i).filter((i) => records[i].lane === model.lane);

  // renderVals for the stage: tabs, the reading panel and "n / total". Then redraw (componentDidUpdate).
  const render = (): void => {
    const p = pool();
    const sel = p.indexOf(model.sel) >= 0 ? model.sel : p[0];
    const cur = records[sel];
    tabs.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.lane) === model.lane)));
    course.textContent = cur.label;
    name.textContent = cur.name;
    from.nodeValue = cur.from;
    to.nodeValue = cur.to;
    gain.textContent = cur.gainText;
    dest.textContent = cur.uni || '';
    pos.textContent = p.indexOf(sel) + 1 + ' / ' + p.length;
    // {{rsPanelAnim}}: 'none' until the stage has been seen and always under reduced motion.
    const anim = !!model.seen && !reducedMotion();
    panel.classList.toggle('is-in-a', anim && tick % 2 === 1);
    panel.classList.toggle('is-in-b', anim && tick % 2 === 0);
    rs.redraw();
  };

  const step = (d: number): void => {
    const p = pool();
    if (!p.length) return;
    const at = p.indexOf(model.sel);
    const nx = at < 0 ? p[0] : p[(at + d + p.length) % p.length];
    if (nx !== model.sel) {
      model.sel = nx;
      tick++;
      render();
    }
  };

  const tab = (l: number): void => {
    const first = Math.max(0, records.findIndex((r) => r.lane === l));
    touched = performance.now();
    if (model.lane === l) return;
    if (model.seen) model.seen = performance.now();
    model.grow = {};
    model.lane = l;
    model.sel = first;
    tick++;
    render();
  };

  const pointer = (e: PointerEvent): void => {
    // Pointing at a tower chooses that student; the frontmost tower under the pointer wins.
    const boxes = rs.hits();
    if (!boxes) return;
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = e.clientX - r.left, y = e.clientY - r.top, pad = e.pointerType === 'touch' ? 10 : 4;
    model.ptr = { x: Math.max(-1, Math.min(1, (x / r.width) * 2 - 1)) };
    let best = -1, bz = -1e9;
    for (const hb of boxes) {
      if (x >= hb.x0 - pad && x <= hb.x1 + pad && y >= hb.y0 - pad && y <= hb.y1 + pad && hb.z > bz) { bz = hb.z; best = hb.ri; }
    }
    hot = best >= 0;
    touched = performance.now();
    view.classList.toggle('is-hot', best >= 0);
    if (best >= 0 && model.sel !== best) {
      model.sel = best;
      tick++;
      render();
    }
  };

  const leave = (): void => {
    hot = false;
    model.ptr = null;
    touched = performance.now();
    view.classList.remove('is-hot');
  };

  // The blocks drop in, and the auto-advance clock starts, once the stage is 30% in view. Under reduced motion the
  // reference has no observer and counts the stage as seen from the start.
  const rs = initResultsCanvas(canvas, model, (en) => {
    if (reducedMotion() || model.seen || en.intersectionRatio < 0.3) return;
    model.seen = performance.now();
    render();
  });
  if (reducedMotion()) model.seen = performance.now();

  tabs.forEach((b) => b.addEventListener('click', () => tab(Number(b.dataset.lane))));
  prev.addEventListener('click', () => {
    touched = performance.now();
    step(-1);
  });
  next.addEventListener('click', () => {
    touched = performance.now();
    step(1);
  });
  view.addEventListener('pointermove', pointer);
  view.addEventListener('pointerdown', pointer);
  view.addEventListener('pointerleave', leave);

  window.setInterval(() => {
    if (reducedMotion() || document.hidden || !rs.visible || !model.seen || hot) return;
    const now = performance.now();
    if (now - model.seen < SEEN_FOR || now - touched < TOUCH_PAUSE) return;
    step(1);
  }, AUTO_EVERY);

  if (import.meta.env.DEV) {
    (window as unknown as { __wsmResults?: unknown }).__wsmResults = { model, hits: () => rs.hits(), get tick() { return tick; } };
  }
}
