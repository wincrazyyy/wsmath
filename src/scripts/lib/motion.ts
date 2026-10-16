/*
 * The page's canvas runtime, ported from componentDidMount (home.js L352–580) and _loop (L609).
 *
 * - One requestAnimationFrame loop for the whole page. Each canvas module registers a Scene.
 * - An IntersectionObserver per scene flips `visible`. The loop runs only while some scene is visible and the tab is
 *   shown, and only visible scenes tick and draw.
 * - A ResizeObserver per canvas keeps the backing store at CSS size × min(devicePixelRatio, 2) and redraws.
 * - prefers-reduced-motion: reduce → no loop. Every scene draws one still frame once fonts are ready, on resize and
 *   whenever its controller calls `redraw()` after a state change (the reference's componentDidUpdate).
 * - Only scenes on screen ever draw. Anything that changes an off-screen scene marks it dirty, and it draws as soon as
 *   it comes into view (no work in hidden sections, PLAN.md §11).
 * - A shared clock `t` advances by dt × speed. dt is capped at 50 ms, as in the reference.
 * - Nothing draws before the maths faces used in canvas labels have loaded (or 3 s after the page load event).
 */

export interface Surface {
  el: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  /** CSS pixels. */
  w: number;
  h: number;
  dpr: number;
}

export interface Frame {
  /** Shared clock in seconds (frozen at 0 under reduced motion). */
  t: number;
  /** Seconds since the previous frame; 0 for one-off draws. */
  dt: number;
  /** performance.now() timebase. */
  now: number;
  /** prefers-reduced-motion: reduce. */
  still: boolean;
  /** The canvas faces (Noto Serif Display, Noto Sans Math) have loaded. */
  fonts: boolean;
}

export interface Scene {
  /** Canvases drawn together (the hero has a back and a front layer). The first is observed for visibility. */
  canvases: HTMLCanvasElement[];
  /** Draw one frame. Called only while visible (or once per state change / resize under reduced motion). */
  draw(surfaces: Surface[], frame: Frame): void;
  /** Advance per-frame state (springs, pointer smoothing) before draw. Called only from the running loop. */
  tick?(frame: Frame): void;
  /** Element whose visibility gates the scene. Defaults to the first canvas. */
  observe?: Element;
  threshold?: number | number[];
  onIntersect?(entry: IntersectionObserverEntry): void;
}

export interface Handle {
  readonly visible: boolean;
  /** performance.now() when the scene first became visible, 0 until then. */
  readonly seenAt: number;
  /** Draw now if the loop won't (reduced motion, or the scene is off screen). Call after any state change. */
  redraw(): void;
}

interface Entry {
  scene: Scene;
  surfaces: Surface[];
  visible: boolean;
  seenAt: number;
  /** Something changed (size, fonts, state) while the scene couldn't draw; draw when it next can. */
  dirty: boolean;
}

const SPEED = 1;
const entries: Entry[] = [];
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let still = motionQuery.matches;
let fontsReady = false;
let started = false;
let clock = 0;
let raf = 0;
let last = 0;

export const reducedMotion = (): boolean => still;

const frameNow = (dt = 0, now = performance.now()): Frame => ({ t: clock, dt, now, still, fonts: fontsReady });

function fit(e: Entry): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  for (const s of e.surfaces) {
    const w = s.el.clientWidth, h = s.el.clientHeight;
    s.w = w;
    s.h = h;
    s.dpr = dpr;
    if (!w || !h) continue;
    const W = Math.round(w * dpr), H = Math.round(h * dpr);
    if (s.el.width !== W || s.el.height !== H) {
      s.el.width = W;
      s.el.height = H;
    }
  }
}

function draw(e: Entry, f: Frame = frameNow()): void {
  if (!started || !e.surfaces[0].w || !e.surfaces[0].h) {
    e.dirty = true;
    return;
  }
  e.dirty = false;
  e.scene.draw(e.surfaces, f);
}

/** Draw now if the scene is on screen; otherwise mark it so it draws when it next comes into view. */
function refresh(e: Entry): void {
  if (e.visible) draw(e);
  else e.dirty = true;
}

function refreshAll(): void {
  for (const e of entries) {
    fit(e);
    refresh(e);
  }
}

function step(now: number): void {
  raf = 0;
  if (still || document.hidden || !entries.some((e) => e.visible)) return;
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  clock += dt * SPEED;
  const f = frameNow(dt, now);
  for (const e of entries) {
    if (!e.visible) continue;
    e.scene.tick?.(f);
    draw(e, f);
  }
  raf = requestAnimationFrame(step);
}

function wake(): void {
  if (raf || still || !started || document.hidden || !entries.some((e) => e.visible)) return;
  last = performance.now();
  raf = requestAnimationFrame(step);
}

function sleep(): void {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

export function register(scene: Scene): Handle {
  const surfaces: Surface[] = scene.canvases.map((el) => {
    const ctx = el.getContext('2d');
    if (!ctx) throw new Error(`Canvas #${el.id} has no 2D context`);
    return { el, ctx, w: 0, h: 0, dpr: 1 };
  });
  const e: Entry = { scene, surfaces, visible: false, seenAt: 0, dirty: true };
  entries.push(e);
  fit(e);

  const ro = new ResizeObserver(() => {
    fit(e);
    refresh(e);
  });
  scene.canvases.forEach((c) => ro.observe(c));

  const io = new IntersectionObserver(
    (list) => {
      const en = list[list.length - 1];
      e.visible = en.isIntersecting;
      if (e.visible && !e.seenAt) e.seenAt = performance.now();
      scene.onIntersect?.(en);
      if (!e.visible) return;
      // Under reduced motion there is no loop, so a scene that changed while off screen draws its still frame now.
      if (e.dirty && (still || !raf)) draw(e);
      wake();
    },
    { threshold: scene.threshold ?? 0 },
  );
  io.observe(scene.observe ?? scene.canvases[0]);

  return {
    get visible() {
      return e.visible;
    },
    get seenAt() {
      return e.seenAt;
    },
    redraw() {
      if (!e.visible) e.dirty = true;
      else if (still || !raf) draw(e);
    },
  };
}

// Fonts: canvas text only uses a web face once it has loaded, so request the maths faces explicitly (they're not
// used in the DOM), then wait for every pending load. Start drawing after that, or 3 s after the page has loaded.
// The requests wait for the load event: the slices they pull (Greek, the italic latin-ext for "ˣ") are canvas-only,
// and fetching them earlier competes with the hero photo and the text faces for the first paint.
const pageLoaded = new Promise<void>((resolve) => {
  if (document.readyState === 'complete') resolve();
  else window.addEventListener('load', () => resolve(), { once: true });
});
const fontLoads: Promise<unknown> = pageLoaded.then(() =>
  document.fonts
    ? Promise.all([
        document.fonts.load('italic 400 56px "Noto Serif Display"', 'xθφ'),
        document.fonts.load('400 56px "Noto Serif Display"', 'Δπ'),
        document.fonts.load('56px "Noto Sans Math"', '∫∑∂√∞'),
      ]).then(() => document.fonts.ready)
    : undefined,
);

const begin = (): void => {
  if (started) return;
  started = true;
  refreshAll();
  wake();
};

fontLoads
  .then(() => {
    fontsReady = true;
    if (started) refreshAll();
    else begin();
  })
  .catch(begin);
void pageLoaded.then(() => window.setTimeout(begin, 3000));

// A window resize can change devicePixelRatio without resizing any canvas (moving between screens, zooming).
window.addEventListener('resize', refreshAll);
document.addEventListener('visibilitychange', () => (document.hidden ? sleep() : wake()));
motionQuery.addEventListener('change', (ev) => {
  still = ev.matches;
  if (still) {
    sleep();
    refreshAll();
  } else {
    wake();
  }
});
