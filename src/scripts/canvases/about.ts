/*
 * The about canvas, ported from home.js _frameAbout (L661–733), the spring and spin state of _aboutTick (L644–658),
 * the pointer handlers _aboutMove / _aboutLeave (renderVals L32–38) and everything _frameAbout calls: _shapeScale
 * (L1654), _morphMesh (L1660), _meshGeo (L1708), _etchings (L1767), _drawMesh (L1784), _euler (L1896), _rand (L1941),
 * _glyphDefs (L1948), _glyphSprites (L1954), _spawnGlyph (L2007), _field (L2018), and _solid / _drawSolid via
 * lib/solids.ts.
 *
 * Draws the maths glyphs drifting in depth around Winson, the amethyst lamp behind him, the step solid beside him
 * (tetrahedron, cube, octahedron; it morphs through real polyhedra when the step changes) with Euler's V − E + F = 2
 * under it, and the small solid beside each step in #about-solid-1..3. The active step comes from ui/about-steps.ts.
 */
import { axis, clamp, cross, dot, ease, mix, mul, norm, apply, rx, ry, smooth, type Mat3, type Vec3 } from '../lib/math3d';
import { register, type Frame, type Surface } from '../lib/motion';
import { GOLD, glow, rgb } from '../lib/paint';
import { drawSolid, solid, type SolidKind } from '../lib/solids';
import type { AboutSteps } from '../ui/about-steps';

type RGB = [number, number, number];

const G: RGB = rgb(GOLD);

// Scene state (the reference's this._th, _thv, _twist, _act, _spin, _aptr, _aboutBorn).
let th = 0;
let thSet = false;
let thv = 0;
let twist = 0;
let act: number[] | null = null;
let spin: number[] | null = null;
const aptr = { x: 0, y: 0, tx: 0, ty: 0 };
let aboutBorn = 0;

/** Stand-in when the step list is missing: step 0, never walking on its own. */
const noSteps: AboutSteps = { step: 0, stepAt: 0, auto: false, restart() {}, tick() {}, onChange() {} };

// ---------------------------------------------------------------------------------------------------------------
// Morphing step solid

function shapeScale(t: number): number {
  // Equal circumradii make the tetrahedron look small, so each solid gets a touch of its own scale.
  const k = [1.12, 0.94, 1.02], i = Math.min(2, Math.floor(t)), u = clamp(t - i);
  return k[i] + (k[(i + 1) % 3] - k[i]) * u;
}

interface Mesh {
  P: Vec3[];
  T: number[][];
}

function morphMesh(t: number): Mesh {
  // Between neighbouring solids the shape passes through real polyhedra, so every in-between frame is one:
  // tetrahedron, triakis tetrahedron, cube; cube, tetrakis hexahedron, rhombic dodecahedron, triakis octahedron,
  // octahedron; octahedron, truncated tetrahedron, tetrahedron.
  const seg = Math.min(2, Math.floor(t)), u = clamp(t - seg);
  const tet: Vec3[] = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], S = [-1, 1];
  const P: Vec3[] = [], T: number[][] = [];
  const others = (k: number): number[] => [0, 1, 2, 3].filter((i) => i !== k);
  if (seg === 0) {
    // A pyramid rises on each face of the tetrahedron until the pairs of faces lie flat as the cube's squares.
    const s = 1 / 3 + (2 / 3) * u;
    tet.forEach((v) => P.push([v[0], v[1], v[2]]));
    tet.forEach((v) => P.push([-v[0] * s, -v[1] * s, -v[2] * s]));
    for (let k = 0; k < 4; k++) { const o = others(k); T.push([o[0], o[1], 4 + k], [o[1], o[2], 4 + k], [o[2], o[0], 4 + k]); }
  } else if (seg === 1) {
    // Pyramids rise on the cube's faces; past the rhombic dodecahedron the cube's corners sink into the octahedron's faces.
    const b = 1 + 2 * u, ci: Record<string, number> = {}, oi: Record<number, number>[] = [{}, {}, {}];
    for (const x of S) for (const y of S) for (const z of S) { ci[x + ',' + y + ',' + z] = P.length; P.push([x, y, z]); }
    for (let k = 0; k < 3; k++) for (const sg of S) { const v: Vec3 = [0, 0, 0]; v[k] = sg * b; oi[k][sg] = P.length; P.push(v); }
    if (b <= 2) {
      for (let k = 0; k < 3; k++) for (const sg of S) {
        const k1 = (k + 1) % 3, k2 = (k + 2) % 3;
        const ring = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map((pq) => { const v = [0, 0, 0]; v[k] = sg; v[k1] = pq[0]; v[k2] = pq[1]; return ci[v.join(',')]; });
        for (let j = 0; j < 4; j++) T.push([oi[k][sg], ring[j], ring[(j + 1) % 4]]);
      }
    } else {
      for (const x of S) for (const y of S) for (const z of S) {
        const c = ci[x + ',' + y + ',' + z], ox = oi[0][x], oy = oi[1][y], oz = oi[2][z];
        T.push([ox, oy, c], [oy, oz, c], [oz, ox, c]);
      }
    }
  } else {
    // The tetrahedron's corners are cut back until the cuts meet at the edge midpoints, which is the octahedron.
    const tau = (1 - u) / 2, pi: Record<string, number> = {};
    for (let v = 0; v < 4; v++) for (let x = 0; x < 4; x++) if (v !== x) { pi[v + '' + x] = P.length; P.push(mix(tet[v], tet[x], tau)); }
    for (let v = 0; v < 4; v++) { const o = others(v); T.push([pi[v + '' + o[0]], pi[v + '' + o[1]], pi[v + '' + o[2]]]); }
    for (let x = 0; x < 4; x++) {
      const o = others(x), A = o[0], B = o[1], C = o[2], ctr = P.length;
      P.push([0, 1, 2].map((j) => (tet[A][j] + tet[B][j] + tet[C][j]) / 3) as Vec3);
      const ring = [pi[A + '' + B], pi[B + '' + A], pi[B + '' + C], pi[C + '' + B], pi[C + '' + A], pi[A + '' + C]];
      for (let j = 0; j < 6; j++) T.push([ctr, ring[j], ring[(j + 1) % 6]]);
    }
  }
  let mx = 0;
  P.forEach((p) => { mx = Math.max(mx, Math.hypot(p[0], p[1], p[2])); });
  return { P: P.map((p): Vec3 => [p[0] / mx, p[1] / mx, p[2] / mx]), T };
}

interface MeshFace {
  tris: number[][];
  n: Vec3;
  c: Vec3;
  area: number;
}

interface MeshEdge {
  a: number;
  b: number;
  f: [number, number];
  k: number;
}

interface MeshGeo {
  V: Vec3[];
  faces: MeshFace[];
  edges: MeshEdge[];
}

function meshGeo(mesh: Mesh): MeshGeo {
  // Weld points that meet, drop triangles that have collapsed, then merge flat neighbours into faces.
  const V: Vec3[] = [], seen: Record<string, number> = {};
  const id = mesh.P.map((p) => {
    const k = p.map((x) => Math.round(x * 1e5)).join(',');
    if (seen[k] === undefined) { seen[k] = V.length; V.push(p); }
    return seen[k];
  });
  const tris: { v: number[]; n: Vec3; c: Vec3; area: number; g: number }[] = [];
  for (const tv of mesh.T) {
    const a = id[tv[0]];
    let b = id[tv[1]], c = id[tv[2]];
    if (a === b || b === c || a === c) continue;
    const A = V[a], B = V[b], C = V[c];
    const n = cross([B[0] - A[0], B[1] - A[1], B[2] - A[2]], [C[0] - A[0], C[1] - A[1], C[2] - A[2]]);
    const len = Math.hypot(n[0], n[1], n[2]);
    if (len < 1e-6) continue;
    const ce: Vec3 = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3, (A[2] + B[2] + C[2]) / 3];
    let nn: Vec3 = [n[0] / len, n[1] / len, n[2] / len];
    if (dot(nn, ce) < 0) { nn = [-nn[0], -nn[1], -nn[2]]; const x = b; b = c; c = x; }
    tris.push({ v: [a, b, c], n: nn, c: ce, area: len / 2, g: -1 });
  }
  const emap: Record<string, { a: number; b: number; t: number[]; cos: number }> = {}, elist: { a: number; b: number; t: number[]; cos: number }[] = [];
  tris.forEach((tr, ti) => {
    for (let j = 0; j < 3; j++) {
      const p = tr.v[j], q = tr.v[(j + 1) % 3], key = p < q ? p + '-' + q : q + '-' + p;
      if (!emap[key]) { emap[key] = { a: Math.min(p, q), b: Math.max(p, q), t: [], cos: 0 }; elist.push(emap[key]); }
      emap[key].t.push(ti);
    }
  });
  const par = tris.map((_, i) => i);
  const find = (i: number): number => { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; };
  const FLAT = Math.cos((1.5 * Math.PI) / 180);
  for (const e of elist) {
    if (e.t.length !== 2) continue;
    e.cos = dot(tris[e.t[0]].n, tris[e.t[1]].n);
    if (e.cos > FLAT) { const x = find(e.t[0]), y = find(e.t[1]); if (x !== y) par[x] = y; }
  }
  const gid: Record<number, number> = {}, faces: MeshFace[] = [];
  tris.forEach((tr, ti) => {
    const r = find(ti);
    if (gid[r] === undefined) { gid[r] = faces.length; faces.push({ tris: [], n: [0, 0, 0], c: [0, 0, 0], area: 0 }); }
    const F = faces[gid[r]];
    F.tris.push(tr.v);
    for (let j = 0; j < 3; j++) { F.n[j] += tr.n[j] * tr.area; F.c[j] += tr.c[j] * tr.area; }
    F.area += tr.area;
    tr.g = gid[r];
  });
  faces.forEach((F) => { F.n = norm(F.n); F.c = F.c.map((x) => x / F.area) as Vec3; });
  const edges: MeshEdge[] = [];
  for (const e of elist) {
    if (e.t.length !== 2) continue;
    const g1 = tris[e.t[0]].g, g2 = tris[e.t[1]].g;
    if (g1 === g2) continue;
    // A fold that has nearly flattened fades out with it.
    edges.push({ a: e.a, b: e.b, f: [g1, g2], k: smooth(0.026, 0.16, Math.acos(Math.max(-1, Math.min(1, e.cos)))) });
  }
  return { V, faces, edges };
}

interface Etching {
  dirs: Vec3[];
  text: string[];
  italic: boolean;
  size: number;
  maxW: number;
  depth: number;
}

let etchCache: Etching[] | null = null;

function etchings(kind: number): Etching {
  // What is etched on each face of the settled solid, keyed by the face's outward direction.
  // Tetrahedron, for Diagnose: the maths of finding things out. Cube, for the markscheme: the marks themselves.
  // Octahedron, for Practise: the papers.
  if (!etchCache) {
    const tet: Vec3[] = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
    const oct: Vec3[] = [];
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) oct.push([x, y, z]);
    etchCache = [
      { dirs: tet.map((v) => norm([-v[0], -v[1], -v[2]])), text: ['Δ = b² − 4ac', 'f′(x) = 0', 'P(A | B)', 'x = ?'], italic: true, size: 15, maxW: 74, depth: 1 / 3 },
      { dirs: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], text: ['M1', 'A1', 'R1', 'A1', 'M1', 'AG'], italic: false, size: 26, maxW: 80, depth: 1 / Math.sqrt(3) },
      { dirs: oct.map((v) => norm(v)), text: ['P1', 'P2', 'P3', 'P2', 'P1', 'P3', 'P2', 'P1'], italic: false, size: 21, maxW: 60, depth: 1 / Math.sqrt(3) },
    ];
  }
  return etchCache[kind];
}

interface Etch {
  kind: number;
  alpha: number;
  up: Vec3;
}

function drawMesh(ctx: CanvasRenderingContext2D, M: MeshGeo, m: Mat3, cx: number, cy: number, R: number, appear: number, etch: Etch, dpr: number): void {
  const D = R * 4.2;
  const L = norm([-0.5, 0.75, 0.6]), Hh = norm([L[0], L[1], L[2] + 1]);
  const deep: Vec3 = [116, 86, 40], light: Vec3 = [252, 241, 210];
  const rot = (v: Vec3): Vec3 => apply(m, v);
  const scr = (r: Vec3): [number, number] => { const k = D / (D - r[2] * R); return [cx + r[0] * R * k, cy - r[1] * R * k]; };
  const RV = M.V.map(rot), S = RV.map(scr);
  const faces = M.faces.map((fc) => {
    const n = rot(fc.n), c = rot(fc.c);
    const vd = norm([-c[0] * R, -c[1] * R, D - c[2] * R]);
    return { fc, n, c, vd, facing: dot(n, vd) };
  });
  const vb = RV.map((r) => { const n = norm(r); return clamp(0.28 + 0.45 * Math.max(0, dot(n, L)) + 0.6 * Math.pow(Math.max(0, dot(n, Hh)), 6)); });
  const metal = (x: number): string => { const c = x < 0.5 ? mix(deep, G, x / 0.5) : mix(G, light, (x - 0.5) / 0.5); return 'rgb(' + c.map(Math.round).join(',') + ')'; };
  const path = (F: { fc: MeshFace }): void => {
    ctx.beginPath();
    for (const tv of F.fc.tris) { ctx.moveTo(S[tv[0]][0], S[tv[0]][1]); ctx.lineTo(S[tv[1]][0], S[tv[1]][1]); ctx.lineTo(S[tv[2]][0], S[tv[2]][1]); ctx.closePath(); }
  };
  const sc = Math.min(1.25, Math.max(0.8, R / 110)), corner = M.V.map(() => 0);
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // The far side, seen through the glass.
  ctx.globalAlpha = appear;
  for (const F of faces) if (F.facing < 0) { path(F); ctx.fillStyle = 'rgba(36,27,62,0.16)'; ctx.fill(); }
  ctx.strokeStyle = 'rgba(123,113,146,0.36)';
  ctx.lineWidth = Math.max(1, sc);
  for (const e of M.edges) {
    if (faces[e.f[0]].facing >= 0 || faces[e.f[1]].facing >= 0 || e.k < 0.01) continue;
    ctx.globalAlpha = appear * e.k;
    ctx.beginPath();
    ctx.moveTo(S[e.a][0], S[e.a][1]);
    ctx.lineTo(S[e.b][0], S[e.b][1]);
    ctx.stroke();
  }
  // The near side: dark amethyst glass under a key light, brighter toward the light, a gold sheen as faces turn into it.
  ctx.globalAlpha = appear;
  const E = etch && etch.alpha > 0.01 ? etchings(etch.kind) : null;
  const fam = "'Noto Serif Display', 'Noto Sans Math', Georgia, serif";
  for (const F of faces) {
    if (F.facing < 0) continue;
    const d = Math.max(0, dot(F.n, L)), op = (0.6 + 0.28 * F.facing).toFixed(3);
    const tone = (x: number): string => 'rgba(' + Math.round(5 + 28 * x) + ',' + Math.round(4 + 21 * x) + ',' + Math.round(11 + 46 * x) + ',' + op + ')';
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const tv of F.fc.tris) for (const vi of tv) { const q = S[vi]; x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); }
    const lg = ctx.createLinearGradient(x0, y0, x1, y1);
    lg.addColorStop(0, tone(Math.min(0.8, d + 0.2)));
    lg.addColorStop(1, tone(Math.max(0, Math.min(0.8, d) - 0.14)));
    path(F);
    ctx.fillStyle = lg;
    ctx.fill();
    const spec = Math.pow(Math.max(0, dot(F.n, norm([L[0] + F.vd[0], L[1] + F.vd[1], L[2] + F.vd[2]]))), 26);
    if (spec > 0.01) { ctx.fillStyle = 'rgba(' + G.join(',') + ',' + (0.3 * spec).toFixed(3) + ')'; ctx.fill(); }
  }
  // Etched into the glass of the settled solid, legible only once a face turns toward you.
  if (E) {
    E.dirs.forEach((n0, j) => {
      const n = rot(n0), c = rot([n0[0] * E.depth, n0[1] * E.depth, n0[2] * E.depth]);
      const vd = norm([-c[0] * R, -c[1] * R, D - c[2] * R]);
      const ea = etch.alpha * smooth(0.22, 0.66, dot(n, vd));
      if (ea < 0.02) return;
      let r0 = cross(etch.up || [0, 1, 0], n0);
      if (Math.hypot(r0[0], r0[1], r0[2]) < 1e-3) r0 = cross([1, 0, 0], n0);
      r0 = norm(r0);
      const u0 = cross(n0, r0), r = rot(r0), u = rot(u0), e = 0.01;
      const p0 = scr(c), pr = scr([c[0] + r[0] * e, c[1] + r[1] * e, c[2] + r[2] * e]), pu = scr([c[0] + u[0] * e, c[1] + u[1] * e, c[2] + u[2] * e]);
      ctx.setTransform((pr[0] - p0[0]) * dpr, (pr[1] - p0[1]) * dpr, (p0[0] - pu[0]) * dpr, (p0[1] - pu[1]) * dpr, p0[0] * dpr, p0[1] * dpr);
      const text = E.text[j], style = (E.italic ? 'italic ' : '') + '400 ';
      ctx.font = style + E.size + 'px ' + fam;
      const tw = ctx.measureText(text).width;
      if (tw > E.maxW) ctx.font = style + ((E.size * E.maxW) / tw).toFixed(2) + 'px ' + fam;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = appear * ea;
      ctx.fillStyle = 'rgba(' + G.join(',') + ',0.85)';
      ctx.fillText(text, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    ctx.globalAlpha = appear;
  }
  // Gold edges, lit along their length; the silhouette a touch heavier.
  for (const e of M.edges) {
    const fa = faces[e.f[0]].facing, fb = faces[e.f[1]].facing;
    if (fa < 0 && fb < 0) continue;
    const sil = (fa < 0) !== (fb < 0), k = sil ? Math.max(e.k, 0.7) : e.k;
    if (k < 0.01) continue;
    corner[e.a] = Math.max(corner[e.a], e.k);
    corner[e.b] = Math.max(corner[e.b], e.k);
    const A = S[e.a], B = S[e.b];
    const lg = ctx.createLinearGradient(A[0], A[1], B[0], B[1]);
    lg.addColorStop(0, metal(vb[e.a]));
    lg.addColorStop(1, metal(vb[e.b]));
    ctx.globalAlpha = appear * k;
    ctx.strokeStyle = lg;
    ctx.lineWidth = (sil ? 2 : 1.35) * sc;
    ctx.beginPath();
    ctx.moveTo(A[0], A[1]);
    ctx.lineTo(B[0], B[1]);
    ctx.stroke();
  }
  // Corners catch the light; points that sit flat inside a face are not corners.
  for (let i = 0; i < RV.length; i++) {
    if (RV[i][2] < -0.15 || corner[i] < 0.02) continue;
    ctx.globalAlpha = appear * corner[i];
    ctx.beginPath();
    ctx.arc(S[i][0], S[i][1], (1.2 + 1.5 * vb[i]) * sc, 0, Math.PI * 2);
    ctx.fillStyle = metal(Math.min(1, vb[i] + 0.25));
    ctx.fill();
  }
  ctx.restore();
}

function euler(ctx: CanvasRenderingContext2D, x: number, y: number, Rb: number, t: number, appear: number): void {
  // Euler's formula for whichever solid is showing; the counts roll over as it changes, the 2 never does.
  const vals = [[4, 6, 4], [8, 12, 6], [6, 12, 8]];
  const seg = Math.min(2, Math.floor(t)), u = clamp(t - seg);
  const from = vals[seg], to = vals[(seg + 1) % 3], k = smooth(0.2, 0.8, u);
  const fam = "'Noto Serif Display', 'Noto Sans Math', Georgia, serif";
  const big = Math.max(11, Math.min(23, Rb * 0.25)), small = Math.round(big * 0.76), gap = big * 1.28;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = 'italic 400 ' + big + 'px ' + fam;
  const nw = ctx.measureText('12').width * 1.12, ow = ctx.measureText('+').width + big * 0.9;
  const cols = [nw, ow, nw, ow, nw, ow, ctx.measureText('2').width * 1.12];
  let run = x - cols.reduce((s2, c) => s2 + c, 0) / 2;
  const mid = cols.map((c) => { const v = run + c / 2; run += c; return v; });
  const y2 = y + gap;
  ctx.font = 'italic 400 ' + small + 'px ' + fam;
  ctx.fillStyle = 'rgba(185,175,163,' + (0.8 * appear).toFixed(3) + ')';
  ['V', 'E', 'F'].forEach((c, j) => ctx.fillText(c, mid[j * 2], y));
  ctx.font = 'italic 400 ' + big + 'px ' + fam;
  ctx.fillStyle = 'rgba(' + G.join(',') + ',' + (0.7 * appear).toFixed(3) + ')';
  ([['−', 1], ['+', 3], ['=', 5]] as [string, number][]).forEach((o) => ctx.fillText(o[0], mid[o[1]], y2));
  ctx.fillStyle = 'rgba(234,215,166,' + appear.toFixed(3) + ')';
  ctx.fillText('2', mid[6], y2);
  ctx.save();
  ctx.beginPath();
  ctx.rect(mid[0] - nw, y2 - big * 1.05, mid[4] - mid[0] + nw * 2, big * 1.4);
  ctx.clip();
  for (let j = 0; j < 3; j++) {
    const a0 = from[j], b0 = to[j], X = mid[j * 2];
    if (a0 === b0 || k <= 0 || k >= 1) {
      ctx.fillStyle = 'rgba(' + G.join(',') + ',' + appear.toFixed(3) + ')';
      ctx.fillText(String(k >= 1 ? b0 : a0), X, y2);
      continue;
    }
    const lift = big * 1.05;
    ctx.fillStyle = 'rgba(' + G.join(',') + ',' + ((1 - k) * appear).toFixed(3) + ')';
    ctx.fillText(String(a0), X, y2 - k * lift);
    ctx.fillStyle = 'rgba(' + G.join(',') + ',' + (k * appear).toFixed(3) + ')';
    ctx.fillText(String(b0), X, y2 + (1 - k) * lift);
  }
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------------------------------------------
// The glyph field

interface Glyph {
  g: number;
  z: number;
  x: number;
  y: number;
  rot: number;
  vr: number;
  ph: number;
  size: number;
  vx: number;
  vy: number;
}

interface Sprite {
  levels: HTMLCanvasElement[];
  w: number;
  h: number;
}

let seed = 0;
let gi: Glyph[] | null = null;
let gPrev: number | null = null;
let gs: Sprite[] | null = null;
let gsKey = '';

function rand(): number {
  let a = (seed = (seed + 0x6d2b79f5) | 0);
  a = Math.imul(a ^ (a >>> 15), 1 | a);
  a = (a + Math.imul(a ^ (a >>> 7), 61 | a)) ^ a;
  return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
}

function glyphDefs(): [string, number][] {
  // [glyph, italic]: set as typeset maths, variables and expressions in italic, operators upright.
  return [['∫', 0], ['∑', 0], ['π', 1], ['θ', 1], ['Δ', 0], ['√', 0], ['∞', 0], ['φ', 1], ['λ', 1], ['μ', 1], ['σ', 1], ['∂', 1],
    ['dy/dx', 1], ['f(x)', 1], ['x²', 1], ['sin θ', 1], ['ln x', 1], ['eˣ', 1], ['nCr', 1], ['lim', 0], ['P(A)', 1], ['≈', 0], ['±', 0], ['i', 1]];
}

function glyphSprites(fontsReady: boolean): Sprite[] {
  // Each glyph drawn three ways, sharp with a halo, softly blurred and deeply blurred, for depth of field.
  const key = G.join(',') + (fontsReady ? ':f' : '');
  if (gs && gsKey === key) return gs;
  const fs = 56, pad = 26, fam = "'Noto Serif Display', 'Noto Sans Math', Georgia, serif";
  const meas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
  const dark = 'rgb(' + Math.round(G[0] * 0.6) + ',' + Math.round(G[1] * 0.58) + ',' + Math.round(G[2] * 0.52) + ')';
  gs = glyphDefs().map((d, i): Sprite => {
    const font = (d[1] ? 'italic ' : '') + '400 ' + fs + 'px ' + fam;
    meas.font = font;
    const cw = Math.ceil(meas.measureText(d[0]).width) + pad * 2, ch = Math.ceil(fs * 1.4) + pad * 2;
    const tone = i % 7 === 3 ? 2 : i % 5 === 1 ? 1 : 0;
    const solidFill = tone === 0 ? 'rgb(' + G.join(',') + ')' : tone === 1 ? 'rgb(85,74,114)' : 'rgb(236,228,214)';
    const halo = tone === 0 ? 'rgba(' + G.join(',') + ',0.45)' : tone === 1 ? 'rgba(85,74,114,0.4)' : 'rgba(236,228,214,0.3)';
    const levels = [0, 3, 8].map((blur) => {
      const c = document.createElement('canvas');
      c.width = cw;
      c.height = ch;
      const x = c.getContext('2d') as CanvasRenderingContext2D;
      x.font = font;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      if (!blur) {
        let fill: string | CanvasGradient = solidFill;
        if (tone === 0) {
          const lg = x.createLinearGradient(0, ch / 2 - fs * 0.45, 0, ch / 2 + fs * 0.45);
          lg.addColorStop(0, '#F6E7C1');
          lg.addColorStop(0.5, solidFill);
          lg.addColorStop(1, dark);
          fill = lg;
        }
        x.fillStyle = fill;
        x.shadowColor = halo;
        x.shadowBlur = 12;
        x.fillText(d[0], cw / 2, ch / 2);
        x.shadowBlur = 0;
        x.shadowColor = 'transparent';
        x.fillText(d[0], cw / 2, ch / 2);
      } else {
        const off = cw * 3;
        x.fillStyle = solidFill;
        x.shadowColor = solidFill;
        x.shadowBlur = blur * 2;
        x.shadowOffsetX = off;
        x.fillText(d[0], cw / 2 - off, ch / 2);
      }
      return c;
    });
    return { levels, w: cw, h: ch };
  });
  gsKey = key;
  return gs;
}

function spawnGlyph(any: boolean): Glyph {
  const r = rand;
  const z = any ? 1.4 + r() * 8.2 : 9.2 + r() * 0.6;
  return {
    g: Math.floor(r() * 1000), z,
    x: (r() * 2 - 1) * 0.8 * z, y: (r() * 2 - 1) * 0.55 * z,
    rot: (r() - 0.5) * 0.6, vr: (r() - 0.5) * 0.1, ph: r() * 6.283,
    size: 0.7 + r() * 0.6, vx: (r() - 0.5) * 0.05, vy: (r() - 0.5) * 0.04,
  };
}

interface FieldOpts {
  fx: number;
  fy: number;
  F: number;
  copyR: number;
  copyB: number;
  face: [number, number, number, number];
  solid: [number, number, number];
}

function field(ctx: CanvasRenderingContext2D, w: number, h: number, o: FieldOpts, el: number, pulse: number, q: { x: number; y: number }, f: Frame, dpr: number): void {
  const t = f.t;
  const dT = gPrev == null ? 0 : Math.max(0, t - gPrev);
  gPrev = t;
  const count = Math.round(26 * Math.max(0.45, Math.min(1, w / 1440)));
  if (!gi) { seed = 20261011; gi = []; }
  while (gi.length < count) gi.push(spawnGlyph(true));
  if (gi.length > count) gi.length = count;
  for (const it of gi) {
    it.z -= 0.2 * dT;
    it.x += it.vx * dT;
    it.y += it.vy * dT;
    it.rot += it.vr * dT;
    if (it.z < 1.4) Object.assign(it, spawnGlyph(false));
  }
  const sp = glyphSprites(f.fonts), F = o.F;
  const fadeIn = f.still ? 1 : smooth(0, 2.2, el);
  const camX = q.x * 0.28, camY = -q.y * 0.18;
  const order = gi.slice().sort((a2, b2) => b2.z - a2.z);
  for (const it of order) {
    const z = it.z, S = sp[it.g % sp.length];
    const sx = o.fx + ((it.x - camX) * F) / z;
    const sy = o.fy - ((it.y + 0.05 * Math.sin(t * 0.5 + it.ph) - camY) * F) / z;
    const k = (0.16 * F * it.size) / z / 56;
    if (sx < -S.w * k || sx > w + S.w * k || sy < -S.h * k || sy > h + S.h * k) continue;
    const aIn = 1 - smooth(8.2, 9.8, z), aOut = smooth(1.4, 2.8, z);
    const bright = (0.3 + 0.7 * (1 - smooth(2.6, 9.8, z))) * (1 + 0.45 * pulse);
    const fx = (sx - o.face[0]) / o.face[2], fy = (sy - o.face[1]) / o.face[3];
    const dx = (sx - o.solid[0]) / o.solid[2], dy = (sy - o.solid[1]) / o.solid[2];
    const inCopy = (1 - smooth(o.copyR - 10, o.copyR + 150, sx)) * (1 - smooth(o.copyB - 10, o.copyB + 120, sy));
    const quiet = (1 - inCopy) * (0.12 + 0.88 * smooth(0.7, 1.5, fx * fx + fy * fy)) * (0.2 + 0.8 * smooth(0.6, 1.3, dx * dx + dy * dy));
    const alpha = Math.min(0.8, aIn * aOut * bright * quiet * 0.55 * fadeIn);
    if (alpha < 0.01) continue;
    // Depth of field, focused around z = 4.
    const dz = Math.abs(z - 4);
    let l0 = 2, l1 = 2, mx = 0;
    if (dz < 1) { l0 = 0; l1 = 0; }
    else if (dz < 2.4) { l0 = 0; l1 = 1; mx = (dz - 1) / 1.4; }
    else if (dz < 4.2) { l0 = 1; l1 = 2; mx = (dz - 2.4) / 1.8; }
    const flip = 0.8 + 0.2 * Math.cos(it.ph + t * 0.22);
    const c = Math.cos(it.rot), s = Math.sin(it.rot), kk = k * dpr;
    ctx.setTransform(kk * c * flip, kk * s * flip, -kk * s, kk * c, sx * dpr, sy * dpr);
    if (mx < 1) { ctx.globalAlpha = alpha * (1 - mx); ctx.drawImage(S.levels[l0], -S.w / 2, -S.h / 2); }
    if (mx > 0) { ctx.globalAlpha = alpha * mx; ctx.drawImage(S.levels[l1], -S.w / 2, -S.h / 2); }
  }
  ctx.globalAlpha = 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// ---------------------------------------------------------------------------------------------------------------
// Per-frame state and the frame

function aboutTick(steps: AboutSteps, dt: number, now: number): void {
  const step = steps.step;
  // Walk through the three points on its own until someone points at one.
  steps.tick(now);
  // The solid lives on a loop of shapes, th: 0 tetrahedron, 1 cube, 2 octahedron, 3 the tetrahedron again.
  // A critically damped spring carries it the short way round to the chosen point, even when the choice changes mid-way.
  if (!thSet) { th = step; thv = 0; thSet = true; }
  const d = ((((step - th) % 3) + 4.5) % 3) - 1.5, w = 5.2;
  thv += (w * w * d - 2 * w * thv) * dt;
  th += thv * dt;
  if (Math.abs(d) < 1e-4 && Math.abs(thv) < 1e-3) { th = step; thv = 0; }
  th = ((th % 3) + 3) % 3;
  twist += thv * dt * 1.4;
  const a = act || (act = [0, 1, 2].map((i) => (i === step ? 1 : 0)));
  for (let i = 0; i < 3; i++) a[i] += ((i === step ? 1 : 0) - a[i]) * Math.min(1, dt * 5);
  const sp = spin || (spin = [0, 1.7, 3.4]), s = 1;
  for (let i = 0; i < 3; i++) sp[i] += dt * s * (0.3 + 0.45 * a[i]);
  const q = aptr, k = Math.min(1, dt * 2.2);
  q.x += (q.tx - q.x) * k;
  q.y += (q.ty - q.y) * k;
}

const KINDS: SolidKind[] = ['tetra', 'cube', 'octa'];

function frameAbout(surface: Surface, f: Frame, steps: AboutSteps, photo: HTMLElement | null, copy: HTMLElement | null, icons: (HTMLElement | null)[]): void {
  const a = surface.ctx, w = surface.w, h = surface.h, dpr = surface.dpr;
  a.setTransform(dpr, 0, 0, dpr, 0, 0);
  a.clearRect(0, 0, w, h);
  const base = surface.el.getBoundingClientRect();
  const t = f.t, now = performance.now();
  const step = steps.step;
  if (f.still || !thSet) {
    th = step;
    thv = 0;
    thSet = true;
    act = [0, 1, 2].map((i) => (i === step ? 1 : 0));
  }
  const el = f.still ? 99 : aboutBorn ? (now - aboutBorn) / 1000 : 0;
  const q = aptr;
  const pulse = Math.min(1, Math.abs(thv || 0) * 0.9);
  const ir = photo ? photo.getBoundingClientRect() : null, cr = copy ? copy.getBoundingClientRect() : null;
  if (ir && ir.width > 40) {
    const pl = ir.left - base.left, pt = ir.top - base.top, pw = ir.width, ph = ir.height;
    // The same amethyst lamp as the hero, behind his head.
    glow(a, pl + pw * 0.66, pt + ph * 0.22, Math.max(pw, ph) * 0.62, [[0, 'rgba(44,30,67,0.55)'], [0.5, 'rgba(30,20,47,0.22)'], [1, 'rgba(30,20,47,0)']]);
    const Rb = pw * 0.12, cx = pl + pw * 0.3 - q.x * 9, cy = pt + ph * 0.18 + Math.sin(t * 0.6) * 5 - q.y * 6;
    // Maths drifting through the dark around him, kept clear of the copy, his face and the solid.
    field(a, w, h, {
      fx: pl + pw * 0.56, fy: pt + ph * 0.2, F: Math.max(pw, 420) * 0.78,
      copyR: cr ? cr.right - base.left : -1e9, copyB: cr ? cr.bottom - base.top : -1e9,
      face: [pl + pw * 0.64, pt + ph * 0.27, pw * 0.13, ph * 0.22],
      solid: [cx, cy + Rb * 0.5, Rb * 2.2],
    }, el, pulse, q, f, dpr);
    const appear = f.still ? 1 : ease(clamp((el - 0.3) / 1.5));
    if (appear > 0.001) {
      const R = Rb * (0.88 + 0.12 * appear) * shapeScale(th);
      glow(a, cx, cy, Rb * 2.8, [[0, 'rgba(66,50,102,' + ((0.4 + 0.2 * pulse) * appear).toFixed(3) + ')'], [0.5, 'rgba(48,36,79,' + ((0.14 + 0.08 * pulse) * appear).toFixed(3) + ')'], [1, 'rgba(39,29,65,0)']]);
      // The cube stands on a corner, the octahedron on a point, the tetrahedron on an edge, each spinning upright.
      const stand = (th < 1 ? th : th < 2 ? 2 - th : 0) * Math.acos(1 / Math.sqrt(3));
      // Seen at eye level, none of the three ever turns a face square to the camera, so each always reads as a solid.
      const m = mul(mul(rx(0.06 + Math.sin(t * 0.41) * 0.08 + q.y * 0.15), ry(t * 0.3 + 1.2 + (twist || 0) + q.x * 0.4)), axis([-1, 0, 1], stand));
      const near = Math.round(th) % 3, off = Math.abs(th - Math.round(th));
      const up = apply(axis([-1, 0, 1], -stand), [0, 1, 0]);
      drawMesh(a, meshGeo(morphMesh(th)), m, cx, cy, R, appear, { kind: near, alpha: 1 - smooth(0.02, 0.16, off), up }, dpr);
      euler(a, cx, cy + Rb * 1.18 + Math.max(11, Math.min(23, Rb * 0.25)) * 0.95, Rb, th, appear);
    }
  }
  // Each point keeps a small solid of its own; the chosen one brightens and turns a little faster.
  const auto = !f.still && steps.auto;
  KINDS.forEach((kind, i) => {
    const s = icons[i];
    if (!s) return;
    const r = s.getBoundingClientRect();
    const appear = f.still ? 1 : ease(clamp((el - 0.5 - i * 0.2) / 1.2));
    if (appear <= 0.001) return;
    const ac = act ? act[i] : i === step ? 1 : 0;
    const cx = r.left - base.left + r.width / 2, cy = r.top - base.top + r.height / 2;
    const R = r.width * 0.4 * (0.9 + 0.12 * ac) * (0.88 + 0.12 * appear);
    if (ac > 0.01) glow(a, cx, cy, R * 2.4, [[0, 'rgba(66,50,102,' + (0.34 * ac * appear).toFixed(3) + ')'], [1, 'rgba(39,29,65,0)']]);
    const yaw = spin ? spin[i] : t * (0.35 + i * 0.05) + i * 1.7;
    const m = mul(rx(0.5 + Math.sin(t * 0.3 + i) * 0.15), ry(yaw));
    drawSolid(a, solid(kind), m, cx, cy, R, G, { alpha: 0.36 + 0.64 * ac }, appear, dpr);
    if (auto && i === step) {
      // A hairline of gold runs round the chosen point until the next one takes over.
      const p = clamp((now - steps.stepAt) / 4800);
      a.beginPath();
      a.arc(cx, cy, r.width * 0.53, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
      a.strokeStyle = 'rgba(' + G.join(',') + ',' + (0.5 * ac * appear).toFixed(3) + ')';
      a.lineWidth = 1;
      a.stroke();
    }
  });
}

export function initAboutCanvas(root: HTMLElement, stepsIn: AboutSteps | null): void {
  const canvas = root.querySelector<HTMLCanvasElement>('#about-canvas');
  if (!canvas) return;
  const steps = stepsIn ?? noSteps;
  const photo = root.querySelector<HTMLImageElement>('#about-photo');
  const copy = root.querySelector<HTMLElement>('#about-copy');
  const icons = [1, 2, 3].map((i) => root.querySelector<HTMLElement>('#about-solid-' + i));

  const handle = register({
    canvases: [canvas],
    tick(f) {
      aboutTick(steps, f.dt, f.now);
    },
    draw(surfaces, f) {
      frameAbout(surfaces[0], f, steps, photo, copy, icons);
    },
    onIntersect(en) {
      if (en.isIntersecting && !aboutBorn) {
        aboutBorn = performance.now();
        steps.restart(aboutBorn);
      }
    },
  });

  // Under reduced motion the still frame shows the chosen step; while animating the loop already redraws.
  steps.onChange(() => handle.redraw());

  root.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    aptr.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    aptr.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
  });
  root.addEventListener('pointerleave', () => {
    aptr.tx = 0;
    aptr.ty = 0;
  });

  if (photo && !photo.complete) photo.addEventListener('load', () => handle.redraw());
}
