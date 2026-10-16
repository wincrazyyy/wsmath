/*
 * The FAQ question mark, ported from home.js _questionMark (L1226) and _frameFaq (L1245–1330).
 *
 * A glass tube in the shape of a question mark, wound with gold wire, with a ball for the dot. It drifts slowly,
 * bobs and tilts. Each question opened adds a full turn to a spin target (ui/faq.ts → spin(), _faqSpin L143); a
 * spring carries the mark toward it from wherever it is, so turns in a row add up and it never snaps back. It glows
 * while it turns.
 */
import { apply, mul, rx, ry, type Vec3 } from '../lib/math3d';
import { register, reducedMotion, type Frame, type Surface } from '../lib/motion';
import { GOLD_RGB, glow } from '../lib/paint';

type Pt = [number, number, number];

interface QFrame {
  p: [number, number];
  n: [number, number];
}

interface QGeo {
  frames: QFrame[];
  tube: number;
  dot: [number, number];
  dotR: number;
}

export interface FaqCanvas {
  /** Add a full turn (_faqSpin). Nothing under reduced motion. */
  spin(): void;
}

function questionMark(): QGeo {
  // A question mark as a tube: a hook (an arc, then an S-bend into a short stem) and a ball for the dot.
  const path: [number, number][] = [], C = [0, 0.9], r = 0.55;
  for (let k = 0; k <= 40; k++) { const a = ((155 - (205 * k) / 40) * Math.PI) / 180; path.push([C[0] + r * Math.cos(a), C[1] + r * Math.sin(a)]); }
  const P0 = path[path.length - 1], a1 = (-50 * Math.PI) / 180, tg = [Math.sin(a1), -Math.cos(a1)];
  const P1 = [P0[0] + tg[0] * 0.25, P0[1] + tg[1] * 0.25], P2 = [0, 0.32], P3 = [0, 0.05];
  for (let k = 1; k <= 16; k++) {
    const u = k / 16, v = 1 - u;
    path.push([v * v * v * P0[0] + 3 * v * v * u * P1[0] + 3 * v * u * u * P2[0] + u * u * u * P3[0], v * v * v * P0[1] + 3 * v * v * u * P1[1] + 3 * v * u * u * P2[1] + u * u * u * P3[1]]);
  }
  for (let k = 1; k <= 6; k++) path.push([0, 0.05 - (0.36 * k) / 6]);
  // a frame along the curve: the in-plane normal and the depth axis
  const frames = path.map((p, i): QFrame => {
    const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return { p, n: [-dy / l, dx / l] };
  });
  return { frames, tube: 0.1, dot: [0, -0.72], dotR: 0.14 };
}

// this._faqGeo, _faqLast, _faqYaw, _faqSpinTarget, _faqSpinCur, _faqSpinVel
let geo: QGeo | null = null;
let last = 0;
let yaw0: number | undefined;
let spinTarget = 0;
let spinCur = 0;
let spinVel = 0;

function frameFaq(s: Surface, f: Frame): void {
  const c = s.ctx, w = s.w, h = s.h;
  if (!w || !h) return;
  const dpr = s.dpr;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);
  const now = performance.now(), t = f.t, still = f.still, G = GOLD_RGB;
  const dt = Math.min(0.05, Math.max(0, (now - (last || now)) / 1000));
  last = now;
  const Q = geo || (geo = questionMark());
  yaw0 = (yaw0 === undefined ? 0.5 : yaw0) + (still ? 0 : dt * 0.35);
  // Opening an answer adds a full turn on top of the slow drift. A spring carries the turn from wherever the mark
  // is, so clicks in a row add up smoothly and the mark never jumps back. It glows while it turns.
  const tgt = spinTarget;
  let cur = spinCur, vel = spinVel;
  if (still) { cur = tgt; vel = 0; } else { vel += (18 * (tgt - cur) - 8.5 * vel) * dt; cur += vel * dt; }
  if (Math.abs(tgt - cur) < 1e-3 && Math.abs(vel) < 1e-3) { const k = Math.round(tgt / (Math.PI * 2)) * Math.PI * 2; spinTarget = tgt - k; cur = tgt - k; vel = 0; }
  spinCur = cur;
  spinVel = vel;
  const spin = cur, flare = Math.min(1, Math.abs(vel) / 7);
  const yaw = yaw0 + spin, pit = still ? 0.14 : 0.14 + Math.sin(t * 0.45) * 0.06, bob = still ? 0 : Math.sin(t * 0.9) * 0.05;
  const m = mul(rx(pit), ry(yaw)), S = Math.min(h * 0.3, w * 0.42), cx = w / 2, cy = h * 0.47, D = 5;
  const pr = (v: Vec3): Pt => { const q = apply(m, [v[0], v[1] - 0.36 + bob, v[2]]), k = D / (D - q[2]); return [cx + q[0] * S * k, cy - q[1] * S * k, q[2]]; };

  // a pool of light underneath, and a glow when it spins
  const fl = pr([0, -1.08 - bob, 0]);
  c.save();
  c.translate(fl[0], fl[1]);
  c.scale(1, 0.22);
  glow(c, 0, 0, S * 1.05, [[0, 'rgba(' + G + ',0.16)'], [0.5, 'rgba(66,50,102,0.12)'], [1, 'rgba(39,29,65,0)']]);
  c.restore();
  const mid = pr([0, 0.45, 0]);
  glow(c, mid[0], mid[1], S * 1.6, [[0, 'rgba(66,50,102,' + (0.26 + 0.2 * flare).toFixed(3) + ')'], [0.55, 'rgba(48,36,79,0.08)'], [1, 'rgba(39,29,65,0)']]);
  if (flare > 0.01) glow(c, mid[0], mid[1], S * 1.2, [[0, 'rgba(' + G + ',' + (0.18 * flare).toFixed(3) + ')'], [1, 'rgba(' + G + ',0)']]);

  // the glass body of the tube and the dot
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.beginPath();
  Q.frames.forEach((fr, i) => { const p = pr([fr.p[0], fr.p[1], 0]); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); });
  c.strokeStyle = 'rgba(39,29,61,0.42)';
  c.lineWidth = Q.tube * 2 * S;
  c.stroke();
  const dc = pr([Q.dot[0], Q.dot[1], 0]);
  c.beginPath();
  c.arc(dc[0], dc[1], Q.dotR * S, 0, Math.PI * 2);
  c.fillStyle = 'rgba(39,29,61,0.42)';
  c.fill();

  // gold wire: lines along the tube and rings around it, brighter at the front
  const segs: [Pt, Pt][] = [], ring = (center: Vec3, n1: Vec3, n2: Vec3, rad: number, steps: number): void => {
    const pts: Pt[] = [];
    for (let k = 0; k <= steps; k++) {
      const a = (k / steps) * Math.PI * 2, ca = Math.cos(a) * rad, sa = Math.sin(a) * rad;
      pts.push(pr([center[0] + n1[0] * ca + n2[0] * sa, center[1] + n1[1] * ca + n2[1] * sa, center[2] + n1[2] * ca + n2[2] * sa]));
    }
    for (let k = 0; k < steps; k++) segs.push([pts[k], pts[k + 1]]);
  };
  const L = 10, rows = Q.frames.map((fr) => {
    const out: Pt[] = [];
    for (let k = 0; k < L; k++) {
      const a = (k / L) * Math.PI * 2;
      out.push(pr([fr.p[0] + fr.n[0] * Math.cos(a) * Q.tube, fr.p[1] + fr.n[1] * Math.cos(a) * Q.tube, Math.sin(a) * Q.tube]));
    }
    return out;
  });
  for (let k = 0; k < L; k++) for (let i = 0; i < rows.length - 1; i++) segs.push([rows[i][k], rows[i + 1][k]]);
  Q.frames.forEach((fr, i) => { if (i % 4 === 0 || i === Q.frames.length - 1) ring([fr.p[0], fr.p[1], 0], [fr.n[0], fr.n[1], 0], [0, 0, 1], Q.tube, 18); });
  ring([Q.dot[0], Q.dot[1], 0], [1, 0, 0], [0, 1, 0], Q.dotR, 24);
  ring([Q.dot[0], Q.dot[1], 0], [0, 0, 1], [0, 1, 0], Q.dotR, 24);
  ring([Q.dot[0], Q.dot[1], 0], [1, 0, 0], [0, 0, 1], Q.dotR, 24);
  const buckets: [Pt, Pt][][] = [[], [], [], [], [], []];
  for (const sg of segs) {
    const z = (sg[0][2] + sg[1][2]) / 2, lv = Math.max(0, Math.min(5, Math.floor((z + 1.2) * 2.5)));
    buckets[lv].push(sg);
  }
  buckets.forEach((bk, lv) => {
    if (!bk.length) return;
    c.beginPath();
    for (const [a, b] of bk) { c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
    c.strokeStyle = 'rgba(' + G + ',' + Math.min(1, 0.12 + 0.13 * lv + 0.2 * flare).toFixed(3) + ')';
    c.lineWidth = 0.9 + 0.1 * lv;
    c.stroke();
  });
}

export function initFaqCanvas(canvas: HTMLCanvasElement): FaqCanvas {
  register({ canvases: [canvas], draw: (surfaces, f) => frameFaq(surfaces[0], f) });
  if (import.meta.env.DEV) {
    (window as unknown as { __wsmFaq?: unknown }).__wsmFaq = () => ({ yaw: (yaw0 ?? 0.5) + spinCur, drift: yaw0, spin: spinCur, target: spinTarget, vel: spinVel });
  }
  return {
    spin() {
      // Not while the mark is hidden (≤900): the turns would pile up and play all at once if it reappeared.
      if (!reducedMotion() && canvas.clientWidth > 0) spinTarget += Math.PI * 2;
    },
  };
}
