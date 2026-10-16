/*
 * The hero canvases, ported from home.js _frame (L2096–2142), the pointer handlers in renderVals (L12–19) and the
 * pointer smoothing in _loop (L618–620).
 *
 * ring-back (behind the photo): the amethyst lamp, the glass dodecahedron with its etched formulas and the small
 * blurred icosahedron. ring-front (in front of the photo, blurred by CSS): the near octahedron. Both canvases cover
 * #top and are drawn in one frame, positioned from #hero-photo.
 */
import { clamp, ease, mul, rx, ry } from '../lib/math3d';
import { register, type Frame, type Surface } from '../lib/motion';
import { GOLD, glow, rgb } from '../lib/paint';
import { drawSolid, solid, type SolidKind, type SolidStyle } from '../lib/solids';

/** When the hero runtime started: the solids fade in from here. */
const born = performance.now();
const G = rgb(GOLD);
/** Pointer across the hero in [-1, 1], eased toward its target each frame. */
const ptr = { x: 0, y: 0, tx: 0, ty: 0 };

interface HeroSolid extends SolidStyle {
  kind: SolidKind;
  layer: 0 | 1;
  x: number;
  y: number;
  r: number;
  depth: number;
  spin: number;
  tilt: number;
  phase: number;
  delay: number;
}

// Three Platonic solids at three depths: a large glass dodecahedron behind his shoulder, a small icosahedron
// further back, and an octahedron close to the camera on the softened front layer.
const objs: HeroSolid[] = [
  { kind: 'dodeca', layer: 0, x: 0.73, y: 0.31, r: 0.25, depth: 1, spin: 0.13, tilt: 0.42, phase: 0.6, delay: 0.5, alpha: 1, formulas: true, etch: true },
  { kind: 'ico', layer: 0, x: -0.03, y: 0.07, r: 0.05, depth: 0.45, spin: -0.21, tilt: 0.3, phase: 2.1, delay: 0.9, alpha: 0.6, blur: 1.2 },
  { kind: 'octa', layer: 1, x: 0.02, y: 0.8, r: 0.1, depth: 1.9, spin: 0.17, tilt: 0.55, phase: 4, delay: 1.2, alpha: 0.8 },
];

/**
 * Where the photo is actually drawn. On tall screens its box is the hero's whole lower row and the image is fitted
 * inside it (object-fit: contain, anchored right bottom; Hero.astro), so the box alone would misplace the lamp and
 * the solids.
 */
function drawnRect(photo: HTMLImageElement): { left: number; top: number; width: number; height: number } {
  const r = photo.getBoundingClientRect();
  const a = Number(photo.getAttribute('width')) / Number(photo.getAttribute('height')) || r.width / r.height;
  if (!r.height || !a) return r;
  if (r.width / r.height > a) {
    const w = r.height * a;
    return { left: r.right - w, top: r.top, width: w, height: r.height };
  }
  const h = r.width / a;
  return { left: r.left, top: r.bottom - h, width: r.width, height: h };
}

function frame(surfaces: Surface[], f: Frame, photo: HTMLImageElement): void {
  const back = surfaces[0], front = surfaces[1];
  const b = back.ctx, fr = front.ctx, w = back.w, h = back.h, dpr = back.dpr;
  b.setTransform(dpr, 0, 0, dpr, 0, 0);
  fr.setTransform(dpr, 0, 0, dpr, 0, 0);
  b.clearRect(0, 0, w, h);
  fr.clearRect(0, 0, w, h);
  const base = back.el.getBoundingClientRect(), ir = drawnRect(photo);
  if (ir.width < 40 || ir.height < 40) return;
  const pl = ir.left - base.left, pt = ir.top - base.top, pw = ir.width, ph = ir.height;

  // A low amethyst lamp behind his head and shoulders, the way a photographer lights a dark backdrop.
  const lx = pl + pw * 0.33, ly = pt + ph * 0.34, lr = Math.max(pw, ph) * 0.8;
  const lamp = b.createRadialGradient(lx, ly, 0, lx, ly, lr);
  lamp.addColorStop(0, 'rgba(44, 30, 67, 0.6)');
  lamp.addColorStop(0.5, 'rgba(30, 20, 47, 0.24)');
  lamp.addColorStop(1, 'rgba(30, 20, 47, 0)');
  b.fillStyle = lamp;
  b.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);

  const t = f.t, px = ptr.x, py = ptr.y;
  const el = f.still ? 99 : (performance.now() - born) / 1000;
  for (const o of objs) {
    const appear = f.still ? 1 : ease(clamp((el - o.delay) / 1.5));
    if (appear <= 0.001) continue;
    const ctx = o.layer ? fr : b;
    const cx = pl + pw * o.x - px * 10 * o.depth, cy = pt + ph * o.y - py * 7 * o.depth;
    const R = pw * o.r * (0.88 + 0.12 * appear);
    if (o.kind === 'dodeca') {
      glow(b, cx, cy, R * 2.7, [[0, 'rgba(66,50,102,' + (0.34 * appear).toFixed(3) + ')'], [0.5, 'rgba(39,29,65,' + (0.12 * appear).toFixed(3) + ')'], [1, 'rgba(39,29,65,0)']]);
    }
    const m = mul(rx(o.tilt + Math.sin(t * 0.13 + o.phase) * 0.12 + py * 0.16), ry(t * o.spin + o.phase + px * 0.3));
    drawSolid(ctx, solid(o.kind), m, cx, cy, R, G, o, appear, dpr);
  }
}

export function initHero(root: HTMLElement): void {
  const back = root.querySelector<HTMLCanvasElement>('#ring-back');
  const front = root.querySelector<HTMLCanvasElement>('#ring-front');
  const photo = root.querySelector<HTMLImageElement>('#hero-photo');
  if (!back || !front || !photo) return;

  const handle = register({
    canvases: [back, front],
    tick(f) {
      const k = Math.min(1, f.dt * 2.2);
      ptr.x += (ptr.tx - ptr.x) * k;
      ptr.y += (ptr.ty - ptr.y) * k;
    },
    draw(surfaces, f) {
      frame(surfaces, f, photo);
    },
  });

  root.addEventListener('pointermove', (e) => {
    const r = back.getBoundingClientRect();
    const w = r.width || window.innerWidth || 1, h = r.height || window.innerHeight || 1;
    ptr.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / w) * 2 - 1));
    ptr.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / h) * 2 - 1));
  });
  root.addEventListener('pointerleave', () => {
    ptr.tx = 0;
    ptr.ty = 0;
  });

  if (!photo.complete) photo.addEventListener('load', () => handle.redraw());
}
