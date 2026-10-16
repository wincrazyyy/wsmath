// Outlines for the brand art (scripts/brand.mjs): contrast strokes drawn as filled shapes, and the sampling used to
// space the logo's letters.
const f = (n) => +n.toFixed(2);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const norm = (v) => {
  const l = Math.hypot(v[0], v[1]);
  return [v[0] / l, v[1] / l];
};
function intersect(p, d, q, e) {
  const den = d[0] * e[1] - d[1] * e[0];
  if (Math.abs(den) < 1e-9) return p;
  const t = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / den;
  return [p[0] + d[0] * t, p[1] + d[1] * t];
}

/**
 * A polyline as one filled outline, each segment with its own width (mitred joins, flat ends). cuts[i] replaces the
 * mitre at the joint pts[i + 1] with a horizontal cut at { y, dir: 1 below / -1 above } where the mitre would be long.
 * Returns closed path data.
 */
export function polyOutline(pts, widths, cuts = []) {
  const n = pts.length - 1;
  const L = [];
  const R = [];
  const dir = [];
  const nrm = [];
  for (let i = 0; i < n; i++) {
    const d = norm(sub(pts[i + 1], pts[i]));
    dir.push(d);
    nrm.push([-d[1], d[0]]);
  }
  const off = (i, s) => [pts[i][0] + (nrm[i][0] * s * widths[i]) / 2, pts[i][1] + (nrm[i][1] * s * widths[i]) / 2];
  for (const [side, out] of [[1, L], [-1, R]]) {
    out.push(off(0, side));
    for (let i = 0; i < n - 1; i++) {
      const p = off(i, side);
      const q = [pts[i + 1][0] + (nrm[i + 1][0] * side * widths[i + 1]) / 2, pts[i + 1][1] + (nrm[i + 1][1] * side * widths[i + 1]) / 2];
      const m = intersect(p, dir[i], q, dir[i + 1]);
      const c = cuts[i];
      if (c && (c.dir > 0 ? m[1] > c.y : m[1] < c.y)) {
        const at = (o, d) => [o[0] + (d[0] * (c.y - o[1])) / d[1], c.y];
        out.push(at(p, dir[i]), at(q, dir[i + 1])); // both sides are built forwards; R is reversed at the end
      } else out.push(m);
    }
    const e = pts[n];
    out.push([e[0] + (nrm[n - 1][0] * side * widths[n - 1]) / 2, e[1] + (nrm[n - 1][1] * side * widths[n - 1]) / 2]);
  }
  const all = [...L, ...R.reverse()];
  return 'M' + all.map((p) => `${f(p[0])} ${f(p[1])}`).join('L') + 'Z';
}

/**
 * A Didone integral sign (the long S) in the box x0..x1, y0..y1: two curved ends joined by a straight stem leaning
 * right, its width swelling from `thin` at the ends to `thick` mid-stem, with ball terminals of radius `ball`.
 */
export function integral({ x0, y0, x1, y1, thick, thin, ball, N = 40 }) {
  const H = y1 - y0;
  const W = x1 - x0;
  const P = [
    [x1 - ball * 0.2, y0 + ball * 1.15], // top ball
    [x1 - W * 0.12, y0 - H * 0.02],
    [x0 + W * 0.62, y0 - H * 0.03],
    [x0 + W * 0.56, y0 + H * 0.22], // stem top
    [x0 + W * 0.44, y1 - H * 0.22], // stem bottom
    [x0 + W * 0.38, y1 + H * 0.03],
    [x0 + W * 0.12, y1 + H * 0.02],
    [x0 + ball * 0.2, y1 - ball * 1.15], // bottom ball
  ];
  const cub = (a, b, c, d, t) => {
    const m = 1 - t;
    return [m * m * m * a[0] + 3 * m * m * t * b[0] + 3 * m * t * t * c[0] + t * t * t * d[0], m * m * m * a[1] + 3 * m * m * t * b[1] + 3 * m * t * t * c[1] + t * t * t * d[1]];
  };
  // centre line: top curve, straight stem, bottom curve
  const C = [];
  for (let i = 0; i <= N; i++) C.push(cub(P[0], P[1], P[2], P[3], i / N));
  for (let i = 1; i <= N; i++) C.push([P[3][0] + ((P[4][0] - P[3][0]) * i) / N, P[3][1] + ((P[4][1] - P[3][1]) * i) / N]);
  for (let i = 1; i <= N; i++) C.push(cub(P[4], P[5], P[6], P[7], i / N));
  const s = [0];
  for (let i = 1; i < C.length; i++) s.push(s[i - 1] + Math.hypot(C[i][0] - C[i - 1][0], C[i][1] - C[i - 1][1]));
  const total = s[s.length - 1];
  const wAt = (u) => thin + (thick - thin) * Math.pow(Math.sin(Math.PI * u), 1.6);
  const Lp = [];
  const Rp = [];
  for (let i = 0; i < C.length; i++) {
    const a = C[Math.max(0, i - 1)];
    const b = C[Math.min(C.length - 1, i + 1)];
    const d = norm(sub(b, a));
    const nn = [-d[1], d[0]];
    const w = wAt(s[i] / total) / 2;
    Lp.push([C[i][0] + nn[0] * w, C[i][1] + nn[1] * w]);
    Rp.push([C[i][0] - nn[0] * w, C[i][1] - nn[1] * w]);
  }
  const body = 'M' + [...Lp, ...Rp.reverse()].map((p) => `${f(p[0])} ${f(p[1])}`).join('L') + 'Z';
  const circ = (c, r) => `M${f(c[0] - r)} ${f(c[1])}a${r} ${r} 0 1 0 ${f(2 * r)} 0a${r} ${r} 0 1 0 ${f(-2 * r)} 0Z`;
  return body + circ(P[0], ball) + circ(P[7], ball);
}

const STEP = 0.08;
const line = (out, a, b) => {
  const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / STEP));
  for (let i = 1; i <= n; i++) out.push([a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]);
};

/** Points every STEP units along path data made of M, L, Z and the full-circle arc pairs integral() draws. */
export function pathPoints(d) {
  const out = [];
  let cur = [0, 0];
  let start = cur;
  for (const [, cmd, args] of d.matchAll(/([MLZa])([^MLZa]*)/g)) {
    const v = args.trim() ? args.trim().split(/[\s,]+/).map(Number) : [];
    if (cmd === 'M') { cur = [v[0], v[1]]; start = cur; out.push(cur); }
    else if (cmd === 'L') { line(out, cur, [v[0], v[1]]); cur = [v[0], v[1]]; }
    else if (cmd === 'Z') { line(out, cur, start); cur = start; }
    else {
      // a r r 0 1 0 dx 0: half a circle from cur; the centre is half-way along dx
      const r = v[0];
      const c = [cur[0] + v[5] / 2, cur[1]];
      const a0 = Math.atan2(cur[1] - c[1], cur[0] - c[0]);
      const n = Math.ceil((Math.PI * r) / STEP);
      for (let i = 1; i <= n; i++) out.push([c[0] + r * Math.cos(a0 - (Math.PI * i) / n), c[1] + r * Math.sin(a0 - (Math.PI * i) / n)]);
      cur = [cur[0] + v[5], cur[1] + v[6]];
    }
  }
  return out;
}

/** Points every ~STEP units along an opentype.js path's commands. */
export function glyphPoints(commands) {
  const out = [];
  let cur = [0, 0];
  let start = cur;
  const curve = (fn, chord) => {
    const n = Math.max(2, Math.ceil((chord * 1.3) / STEP));
    for (let i = 1; i <= n; i++) out.push(fn(i / n));
  };
  for (const c of commands) {
    const to = [c.x, c.y];
    if (c.type === 'M') { cur = to; start = to; out.push(to); }
    else if (c.type === 'L') { line(out, cur, to); cur = to; }
    else if (c.type === 'Q') {
      const a = cur;
      curve((t) => { const m = 1 - t; return [m * m * a[0] + 2 * m * t * c.x1 + t * t * to[0], m * m * a[1] + 2 * m * t * c.y1 + t * t * to[1]]; }, Math.hypot(to[0] - a[0], to[1] - a[1]));
      cur = to;
    } else if (c.type === 'C') {
      const a = cur;
      curve((t) => { const m = 1 - t; return [m ** 3 * a[0] + 3 * m * m * t * c.x1 + 3 * m * t * t * c.x2 + t ** 3 * to[0], m ** 3 * a[1] + 3 * m * m * t * c.y1 + 3 * m * t * t * c.y2 + t ** 3 * to[1]]; }, Math.hypot(to[0] - a[0], to[1] - a[1]));
      cur = to;
    } else if (c.type === 'Z') { line(out, cur, start); cur = start; }
  }
  return out;
}

/**
 * The closest horizontal approach of shape B (on the right) to shape A (on the left), compared row by row (rows of
 * 0.2 units) where both have ink: min over rows of (B's leftmost x − A's rightmost x).
 */
export function closestApproach(aPoints, bPoints) {
  const row = (y) => Math.round(y / 0.2);
  const right = new Map();
  for (const [x, y] of aPoints) right.set(row(y), Math.max(right.get(row(y)) ?? -Infinity, x));
  const left = new Map();
  for (const [x, y] of bPoints) left.set(row(y), Math.min(left.get(row(y)) ?? Infinity, x));
  let gap = Infinity;
  for (const [k, xr] of right) if (left.has(k)) gap = Math.min(gap, left.get(k) - xr);
  return gap;
}
