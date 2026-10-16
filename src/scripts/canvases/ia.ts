/*
 * The IA canvas, ported from home.js _frameIa (L1593–1653) and _iaGeo (L1496–1592).
 *
 * One overlay (#ia-canvas, 40px larger than .ia-wrap on every side) draws a quiet wireframe in each theme cell
 * (#ia-obj-0..7): Archimedes' sphere in its cylinder, a spur gear, a cone, a Möbius strip, points on a globe joined
 * to their nearest neighbours, gentle hills, a tesseract turning through the fourth dimension, and a football. The
 * hovered theme (ui/ia.ts) eases into a faster turn, grows a touch and brightens.
 */
import { apply, cross, dot, mul, norm, rx, ry, smooth, type Vec3 } from '../lib/math3d';
import { register, type Frame, type Handle, type Surface } from '../lib/motion';
import { GOLD_RGB, glow } from '../lib/paint';
import type { IaThemes } from '../ui/ia';

interface Face {
  n: Vec3;
  pts: Vec3[];
  two?: boolean;
  a?: number;
}

interface Geo {
  segs: [Vec3, Vec3][];
  dots: Vec3[];
  faces: Face[];
}

const iaCache: Record<number, Geo> = {};
/** Per-theme turn and emphasis (the reference's this._iaA). */
const iaA: { yaw: number; emph: number }[] = [];
let iaLast = 0;
let handle: Handle | null = null;

function iaGeo(i: number, t: number): Geo {
  // One quiet wireframe per IA theme, each scaled to fit a unit sphere. Returns line segments, points and faces.
  if (i !== 6 && iaCache[i]) return iaCache[i];
  const segs: [Vec3, Vec3][] = [], dots: Vec3[] = [], faces: Face[] = [];
  const circle = (f: (a: number) => Vec3, n: number): void => { const pts: Vec3[] = []; for (let k = 0; k <= n; k++) pts.push(f((k / n) * Math.PI * 2)); for (let k = 0; k < n; k++) segs.push([pts[k], pts[k + 1]]); };
  if (i === 0) {
    // Ancient: Archimedes' sphere inside its cylinder, the figure on his tomb.
    const r = 0.72, hh = 0.72;
    circle((a) => [r * Math.cos(a), hh, r * Math.sin(a)], 48);
    circle((a) => [r * Math.cos(a), -hh, r * Math.sin(a)], 48);
    for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3; segs.push([[r * Math.cos(a), hh, r * Math.sin(a)], [r * Math.cos(a), -hh, r * Math.sin(a)]]); }
    circle((a) => [r * Math.cos(a), 0, r * Math.sin(a)], 48);
    circle((a) => [r * Math.cos(a), r * Math.sin(a), 0], 48);
    circle((a) => [0, r * Math.sin(a), r * Math.cos(a)], 48);
  } else if (i === 1) {
    // Engineering: a spur gear, turning on its axle.
    const N = 10, ro = 0.9, rr = 0.72, hz = 0.14, step = (Math.PI * 2) / N, prof: [number, number][] = [];
    for (let k = 0; k < N; k++) { const a = k * step; prof.push([rr, a - step * 0.3], [ro, a - step * 0.15], [ro, a + step * 0.15], [rr, a + step * 0.3]); }
    const P = (r: number, a: number, y: number): Vec3 => [r * Math.cos(a), y, r * Math.sin(a)];
    for (const y of [-hz, hz]) for (let k = 0; k < prof.length; k++) { const p1 = prof[k], p2 = prof[(k + 1) % prof.length]; segs.push([P(p1[0], p1[1], y), P(p2[0], p2[1], y)]); }
    for (const [r, a] of prof) if (r === ro) segs.push([P(r, a, -hz), P(r, a, hz)]);
    for (const y of [-hz, hz]) circle((a) => [0.2 * Math.cos(a), y, 0.2 * Math.sin(a)], 28);
    for (let k = 0; k < 4; k++) { const a0 = (k * Math.PI) / 2 + Math.PI / 4; circle((a) => [0.46 * Math.cos(a0) + 0.11 * Math.cos(a), hz, 0.46 * Math.sin(a0) + 0.11 * Math.sin(a)], 20); }
  } else if (i === 2) {
    // Everyday geometry: a cone, the shape of a party hat or a cup of ice cream.
    const r = 0.72, top: Vec3 = [0, 0.86, 0];
    circle((a) => [r * Math.cos(a), -0.62, r * Math.sin(a)], 48);
    circle((a) => [r * 0.5 * Math.cos(a), 0.12, r * 0.5 * Math.sin(a)], 36);
    for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; segs.push([top, [r * Math.cos(a), -0.62, r * Math.sin(a)]]); }
    dots.push(top);
  } else if (i === 3) {
    // Mathematics and art: a Mobius strip, one edge and one side.
    const P = (u: number, v: number): Vec3 => { const w = 1 + 0.42 * v * Math.cos(u / 2); return [0.66 * w * Math.cos(u), 0.66 * 0.42 * v * Math.sin(u / 2), 0.66 * w * Math.sin(u)]; };
    const edge: Vec3[] = [];
    for (let k = 0; k <= 160; k++) edge.push(P((k / 160) * Math.PI * 4, 1));
    for (let k = 0; k < 160; k++) segs.push([edge[k], edge[k + 1]]);
    for (let k = 0; k < 16; k++) { const u = (k / 16) * Math.PI * 2; segs.push([P(u, -1), P(u, 1)]); }
    for (let k = 0; k < 64; k++) {
      const u1 = (k / 64) * Math.PI * 2, u2 = ((k + 1) / 64) * Math.PI * 2, q = [P(u1, -1), P(u2, -1), P(u2, 1), P(u1, 1)];
      const d1: Vec3 = [q[2][0] - q[0][0], q[2][1] - q[0][1], q[2][2] - q[0][2]], d2: Vec3 = [q[3][0] - q[1][0], q[3][1] - q[1][1], q[3][2] - q[1][2]];
      faces.push({ n: norm(cross(d1, d2)), pts: q, two: true, a: 0.13 });
    }
  } else if (i === 4) {
    // Society: people as points on a globe, each joined to the three nearest.
    const n = 18, ga = Math.PI * (3 - Math.sqrt(5)), pts: Vec3[] = [];
    for (let k = 0; k < n; k++) { const y = 1 - (2 * (k + 0.5)) / n, r = Math.sqrt(1 - y * y), a = ga * k; pts.push([Math.cos(a) * r * 0.86, y * 0.86, Math.sin(a) * r * 0.86]); }
    const seen: Record<string, number> = {};
    pts.forEach((pp, a) => {
      pts.map((q, b): [number, number] => [b, Math.hypot(pp[0] - q[0], pp[1] - q[1], pp[2] - q[2])]).filter((x) => x[0] !== a).sort((x, y) => x[1] - y[1]).slice(0, 3).forEach(([b]) => {
        const key = Math.min(a, b) + '-' + Math.max(a, b);
        if (!seen[key]) { seen[key] = 1; segs.push([pp, pts[b]]); }
      });
    });
    pts.forEach((pp) => dots.push(pp));
  } else if (i === 5) {
    // Environment: a landscape of gentle hills.
    const f = (x: number, z: number): Vec3 => [x * 0.95, 0.24 * Math.sin(2.1 * x + 0.5) * Math.cos(1.7 * z) + 0.1 * Math.sin(3.3 * z) - 0.12, z * 0.95];
    const N = 9, M = 24;
    for (let a = 0; a < N; a++) {
      const v = -1 + (2 * a) / (N - 1), r1: Vec3[] = [], r2: Vec3[] = [];
      for (let b = 0; b <= M; b++) { const u = -1 + (2 * b) / M; r1.push(f(u, v)); r2.push(f(v, u)); }
      for (let b = 0; b < M; b++) { segs.push([r1[b], r1[b + 1]]); segs.push([r2[b], r2[b + 1]]); }
    }
  } else if (i === 6) {
    // Problem-solving: a tesseract, turning through the fourth dimension.
    const V4: number[][] = [];
    for (let k = 0; k < 16; k++) V4.push([k & 1 ? 1 : -1, k & 2 ? 1 : -1, k & 4 ? 1 : -1, k & 8 ? 1 : -1]);
    const a = t * 0.38, b = t * 0.23, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
    const P3 = V4.map(([x, y, z, w]): Vec3 => {
      const x1 = x * ca - w * sa, w1 = x * sa + w * ca, y1 = y * cb - w1 * sb, w2 = y * sb + w1 * cb, k = 2.6 / (3.4 - w2);
      return [x1 * k * 0.5, y1 * k * 0.5, z * k * 0.5];
    });
    for (let p1 = 0; p1 < 16; p1++) for (let q = 0; q < 4; q++) { const p2 = p1 ^ (1 << q); if (p2 > p1) segs.push([P3[p1], P3[p2]]); }
    P3.forEach((pp) => dots.push(pp));
    return { segs, dots, faces };
  } else {
    // Sports: a football, the truncated icosahedron.
    const ph = (1 + Math.sqrt(5)) / 2, base3: Vec3[] = [[0, 1, 3 * ph], [1, 2 + ph, 2 * ph], [ph, 2, 2 * ph + 1]], V: Vec3[] = [];
    for (const bv of base3) for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      const v: Vec3 = [bv[0] * sx, bv[1] * sy, bv[2] * sz];
      for (let c3 = 0; c3 < 3; c3++) { const q: Vec3 = [v[c3 % 3], v[(c3 + 1) % 3], v[(c3 + 2) % 3]]; if (!V.some((w) => Math.hypot(w[0] - q[0], w[1] - q[1], w[2] - q[2]) < 1e-6)) V.push(q); }
    }
    const s = 1 / Math.hypot(V[0][0], V[0][1], V[0][2]), U = V.map((v): Vec3 => [v[0] * s * 0.92, v[1] * s * 0.92, v[2] * s * 0.92]);
    for (let a = 0; a < V.length; a++) for (let b = a + 1; b < V.length; b++) if (Math.abs(Math.hypot(V[a][0] - V[b][0], V[a][1] - V[b][1], V[a][2] - V[b][2]) - 2) < 1e-6) segs.push([U[a], U[b]]);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (let c3 = 0; c3 < 3; c3++) {
      const d0 = [0, sx, sy * ph], d = norm([d0[c3 % 3], d0[(c3 + 1) % 3], d0[(c3 + 2) % 3]]);
      const idx = U.map((u, k): [number, number] => [k, dot(u, d)]).sort((x, y) => y[1] - x[1]).slice(0, 5).map((x) => x[0]);
      const ctr = idx.reduce((acc, k): Vec3 => [acc[0] + U[k][0] / 5, acc[1] + U[k][1] / 5, acc[2] + U[k][2] / 5], [0, 0, 0] as Vec3);
      const r0 = norm(cross(d, [0.3, 1, 0.2])); const u0 = cross(d, r0);
      idx.sort((x, y) => { const p1: Vec3 = [U[x][0] - ctr[0], U[x][1] - ctr[1], U[x][2] - ctr[2]], p2: Vec3 = [U[y][0] - ctr[0], U[y][1] - ctr[1], U[y][2] - ctr[2]]; return Math.atan2(dot(p1, u0), dot(p1, r0)) - Math.atan2(dot(p2, u0), dot(p2, r0)); });
      faces.push({ n: d, pts: idx.map((k) => U[k]) });
    }
  }
  return (iaCache[i] = { segs, dots, faces });
}

function frameIa(s: Surface, f: Frame, ia: IaThemes): void {
  const c = s.ctx, w = s.w, h = s.h;
  if (!c || !w || !h) return;
  const dpr = s.dpr;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);
  const base = s.el.getBoundingClientRect(), hov = ia.hover;
  const now = performance.now(), t = f.t, G = GOLD_RGB, still = f.still;
  const dt = Math.min(0.05, Math.max(0, (now - (iaLast || now)) / 1000));
  iaLast = now;
  const fade = still ? 1 : smooth(0, 1.4, (now - (handle?.seenAt || now)) / 1000), spd = 1;
  c.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const el = document.getElementById('ia-obj-' + i);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 20 || r.height < 20) continue;
    const A = iaA[i] || (iaA[i] = { yaw: i * 0.8, emph: 0 });
    A.emph += ((i === hov ? 1 : 0) - A.emph) * Math.min(1, dt * 5);
    if (!still) A.yaw += dt * spd * (0.22 + 0.9 * A.emph);
    const e = A.emph, cx = r.left - base.left + r.width / 2, cy = r.top - base.top + r.height / 2;
    const R = Math.min(r.width, r.height) * 0.4 * [1, 0.98, 0.98, 1.06, 1, 1, 1, 0.96][i] * (1 + 0.05 * e), D = R * 5;
    const m = mul(rx([0.36, 0.95, 0.3, 0.82, 0.35, 0.55, 0.32, 0.35][i] + Math.sin(t * 0.2 + i) * 0.05), ry(A.yaw));
    const geo = iaGeo(i, still ? 0.8 : t);
    const pr = (q: Vec3): [number, number] => { const k = D / (D - q[2] * R); return [cx + q[0] * R * k, cy - q[1] * R * k]; };
    if (e > 0.01) glow(c, cx, cy, R * 1.6, [[0, 'rgba(66,50,102,' + (0.22 * e * fade).toFixed(3) + ')'], [1, 'rgba(39,29,65,0)']]);
    for (const fc of geo.faces) {
      const n = apply(m, fc.n), vis = fc.two ? Math.abs(n[2]) : n[2];
      if (vis <= 0.05) continue;
      const P = fc.pts.map((q) => pr(apply(m, q)));
      c.beginPath();
      P.forEach((q, k) => (k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])));
      c.closePath();
      c.fillStyle = 'rgba(' + G + ',' + ((fc.a || 0.16) * vis * fade * (0.8 + 0.4 * e)).toFixed(3) + ')';
      c.fill();
    }
    const buckets: [number, number][][][] = [[], [], [], [], []];
    for (const sg of geo.segs) {
      const a = apply(m, sg[0]), b = apply(m, sg[1]);
      const lv = Math.max(0, Math.min(4, Math.floor(((a[2] + b[2]) / 2 + 1) * 2.5)));
      buckets[lv].push([pr(a), pr(b)]);
    }
    buckets.forEach((bk, lv) => {
      if (!bk.length) return;
      c.beginPath();
      for (const [p1, p2] of bk) { c.moveTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); }
      c.strokeStyle = 'rgba(' + G + ',' + Math.min(1, (0.14 + 0.15 * lv) * (0.85 + 0.6 * e) * fade).toFixed(3) + ')';
      c.lineWidth = 0.85 + 0.3 * e;
      c.stroke();
    });
    for (const q of geo.dots) {
      const a = apply(m, q), pp = pr(a), nz = (a[2] + 1) / 2;
      c.beginPath();
      c.arc(pp[0], pp[1], 1.5 + 0.6 * nz, 0, Math.PI * 2);
      c.fillStyle = 'rgba(246,231,193,' + ((0.3 + 0.6 * nz) * fade).toFixed(3) + ')';
      c.fill();
    }
  }
}

export function initIaCanvas(root: HTMLElement, ia: IaThemes): void {
  const canvas = root.querySelector<HTMLCanvasElement>('#ia-canvas');
  if (!canvas) return;
  const h = register({
    canvases: [canvas],
    draw(surfaces, f) {
      frameIa(surfaces[0], f, ia);
    },
  });
  handle = h;
  ia.onChange(() => h.redraw());
}
