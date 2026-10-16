/*
 * Platonic solids drawn as amethyst glass with gold edges, ported from home.js _solid (L2152) and _drawSolid
 * (L2196–2287). Shared by the hero (dodecahedron, icosahedron, octahedron) and the about step icons (tetrahedron,
 * cube, octahedron).
 */
import { apply, clamp, cross, dot, mix, norm, smooth, type Mat3, type Vec3 } from './math3d';

export type SolidKind = 'dodeca' | 'ico' | 'octa' | 'cube' | 'tetra';

export interface SolidFace {
  idx: number[];
  n: Vec3;
  c: Vec3;
  r0: Vec3;
  u0: Vec3;
}

export interface SolidEdge {
  a: number;
  b: number;
  f: number[];
}

export interface SolidGeo {
  V: Vec3[];
  faces: SolidFace[];
  edges: SolidEdge[];
  formulas: string[];
}

export interface SolidStyle {
  alpha: number;
  blur?: number;
  etch?: boolean;
  formulas?: boolean;
}

const geoCache: Partial<Record<SolidKind, SolidGeo>> = {};

export function solid(kind: SolidKind): SolidGeo {
  // Each solid's faces point at its dual's vertices, so faces come from the dual's directions.
  const hit = geoCache[kind];
  if (hit) return hit;
  const P = (1 + Math.sqrt(5)) / 2, iP = 1 / P, S = [-1, 1];
  const dod: Vec3[] = [], ico: Vec3[] = [], cube: Vec3[] = [];
  for (const a of S) for (const b of S) for (const c of S) { dod.push([a, b, c]); cube.push([a, b, c]); }
  for (const a of S) for (const b of S) {
    dod.push([0, a * iP, b * P], [a * iP, b * P, 0], [a * P, 0, b * iP]);
    ico.push([0, a * P, b], [a, 0, b * P], [a * P, b, 0]);
  }
  const octa: Vec3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const tet: Vec3[] = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], tetD = tet.map((v): Vec3 => [-v[0], -v[1], -v[2]]);
  const pair = ({ dodeca: [dod, ico], ico: [ico, dod], octa: [octa, cube], cube: [cube, octa], tetra: [tet, tetD] } as Record<SolidKind, [Vec3[], Vec3[]]>)[kind];
  const R0 = Math.hypot(pair[0][0][0], pair[0][0][1], pair[0][0][2]);
  const V = pair[0].map((v): Vec3 => [v[0] / R0, v[1] / R0, v[2] / R0]);
  const faces = pair[1].map((d): SolidFace => {
    const n = norm(d);
    const dots = V.map((v) => dot(v, n));
    const top = Math.max(...dots);
    const idx: number[] = [];
    dots.forEach((x, i) => { if (x > top - 1e-6) idx.push(i); });
    const c: Vec3 = [0, 0, 0];
    idx.forEach((i) => { c[0] += V[i][0] / idx.length; c[1] += V[i][1] / idx.length; c[2] += V[i][2] / idx.length; });
    let r0 = cross([0, 1, 0], n);
    if (Math.hypot(r0[0], r0[1], r0[2]) < 1e-3) r0 = [1, 0, 0];
    r0 = norm(r0);
    const u0 = cross(n, r0);
    const ang = (i: number): number => { const q: Vec3 = [V[i][0] - c[0], V[i][1] - c[1], V[i][2] - c[2]]; return Math.atan2(dot(q, u0), dot(q, r0)); };
    idx.sort((i, j) => ang(i) - ang(j));
    return { idx, n, c, r0, u0 };
  });
  const map: Record<string, SolidEdge> = {}, edges: SolidEdge[] = [];
  faces.forEach((fc, fi) => {
    for (let k = 0; k < fc.idx.length; k++) {
      const a = fc.idx[k], b = fc.idx[(k + 1) % fc.idx.length], key = a < b ? a + '-' + b : b + '-' + a;
      if (map[key]) map[key].f.push(fi);
      else { map[key] = { a, b, f: [fi] }; edges.push(map[key]); }
    }
  });
  const formulas = ['φ² = φ + 1', 'V − E + F = 2', 'a² + b² = c²', '∑ 1/n² = π²/6', '∫₀¹ x² dx = ⅓', 'sin²θ + cos²θ = 1', 'i² = −1', 'φ = (1 + √5) / 2', 'd/dx eˣ = eˣ', 'lim (1 + 1/n)ⁿ = e', 'C = 2πr', 'π ≈ 3.14159'];
  return (geoCache[kind] = { V, faces, edges, formulas });
}

/**
 * Draw one solid centred at (cx, cy) with circumradius R, rotated by m. G is the gold as [r, g, b]; dpr is the
 * surface's device pixel ratio (the etched formulas reset the transform to it).
 */
export function drawSolid(
  ctx: CanvasRenderingContext2D, geo: SolidGeo, m: Mat3, cx: number, cy: number, R: number,
  G: [number, number, number], o: SolidStyle, appear: number, dpr: number,
): void {
  const D = R * 4.2;
  const L = norm([-0.5, 0.75, 0.6]), Hh = norm([L[0], L[1], L[2] + 1]);
  const deep: Vec3 = [116, 86, 40], light: Vec3 = [252, 241, 210];
  const rot = (v: Vec3): Vec3 => apply(m, v);
  const scr = (r: Vec3): [number, number] => { const k = D / (D - r[2] * R); return [cx + r[0] * R * k, cy - r[1] * R * k]; };
  const RV = geo.V.map(rot), S = RV.map(scr);
  const faces = geo.faces.map((fc, i) => {
    const n = rot(fc.n), c = rot(fc.c);
    const vd = norm([-c[0] * R, -c[1] * R, D - c[2] * R]);
    return { fc, i, n, c, vd, facing: dot(n, vd) };
  });
  const facing: number[] = [];
  faces.forEach((F) => { facing[F.i] = F.facing; });
  faces.sort((p, q) => p.c[2] - q.c[2]);
  // Each vertex's light, so the gold edges shade from bright to deep along their length like polished metal.
  const vb = RV.map((r) => { const n = norm(r); return clamp(0.28 + 0.45 * Math.max(0, dot(n, L)) + 0.6 * Math.pow(Math.max(0, dot(n, Hh)), 6)); });
  const metal = (x: number): string => { const c = x < 0.5 ? mix(deep, G, x / 0.5) : mix(G, light, (x - 0.5) / 0.5); return 'rgb(' + c.map(Math.round).join(',') + ')'; };
  const poly = (idx: number[]): void => { ctx.beginPath(); ctx.moveTo(S[idx[0]][0], S[idx[0]][1]); for (let j = 1; j < idx.length; j++) ctx.lineTo(S[idx[j]][0], S[idx[j]][1]); ctx.closePath(); };
  const sc = Math.min(1.25, Math.max(0.6, R / 160));
  ctx.save();
  ctx.globalAlpha = o.alpha * appear;
  if (o.blur && 'filter' in ctx) ctx.filter = 'blur(' + o.blur + 'px)';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // The far side, seen through the glass.
  for (const F of faces) if (F.facing < 0) { poly(F.fc.idx); ctx.fillStyle = 'rgba(36,27,62,0.12)'; ctx.fill(); }
  ctx.beginPath();
  for (const e of geo.edges) if (facing[e.f[0]] < 0 && facing[e.f[1]] < 0) { ctx.moveTo(S[e.a][0], S[e.a][1]); ctx.lineTo(S[e.b][0], S[e.b][1]); }
  ctx.strokeStyle = 'rgba(123,113,146,0.22)';
  ctx.lineWidth = sc;
  ctx.stroke();
  // The near side: dark amethyst glass under a key light, a gold sheen as faces turn into it.
  for (const F of faces) {
    if (F.facing < 0) continue;
    const idx = F.fc.idx, d = Math.max(0, dot(F.n, L));
    poly(idx);
    ctx.fillStyle = 'rgba(' + Math.round(5 + 28 * d) + ',' + Math.round(4 + 21 * d) + ',' + Math.round(11 + 46 * d) + ',' + (0.6 + 0.28 * F.facing).toFixed(3) + ')';
    ctx.fill();
    const spec = Math.pow(Math.max(0, dot(F.n, norm([L[0] + F.vd[0], L[1] + F.vd[1], L[2] + F.vd[2]]))), 26);
    if (spec > 0.01) { ctx.fillStyle = 'rgba(' + G.join(',') + ',' + (0.3 * spec).toFixed(3) + ')'; ctx.fill(); }
    if (o.etch && idx.length === 5) {
      ctx.beginPath();
      for (let j = 0; j <= 5; j++) { const q = S[idx[(j * 2) % 5]]; if (j) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }
      ctx.strokeStyle = 'rgba(' + G.join(',') + ',' + (0.05 + 0.13 * F.facing).toFixed(3) + ')';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    if (o.formulas) {
      const a = smooth(0.6, 0.95, F.facing);
      if (a > 0.02) {
        const r = rot(F.fc.r0), u = rot(F.fc.u0), c = F.c, e = 0.01;
        const p0 = scr(c), pr = scr([c[0] + r[0] * e, c[1] + r[1] * e, c[2] + r[2] * e]), pu = scr([c[0] + u[0] * e, c[1] + u[1] * e, c[2] + u[2] * e]);
        ctx.setTransform((pr[0] - p0[0]) * dpr, (pr[1] - p0[1]) * dpr, (p0[0] - pu[0]) * dpr, (p0[1] - pu[1]) * dpr, p0[0] * dpr, p0[1] * dpr);
        const text = geo.formulas[F.i % geo.formulas.length], fam = "'Noto Serif Display', 'Noto Sans Math', Georgia, serif";
        ctx.font = 'italic 400 8.5px ' + fam;
        const tw = ctx.measureText(text).width;
        if (tw > 62) ctx.font = 'italic 400 ' + ((8.5 * 62) / tw).toFixed(2) + 'px ' + fam;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(' + G.join(',') + ',' + (0.82 * a).toFixed(3) + ')';
        ctx.fillText(text, 0, 0);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
  }
  // Gold edges, lit along their length; the silhouette a touch heavier.
  for (const e of geo.edges) {
    const fa = facing[e.f[0]], fb = facing[e.f[1]];
    if (fa < 0 && fb < 0) continue;
    const sil = (fa < 0) !== (fb < 0), A = S[e.a], B = S[e.b];
    const lg = ctx.createLinearGradient(A[0], A[1], B[0], B[1]);
    lg.addColorStop(0, metal(vb[e.a]));
    lg.addColorStop(1, metal(vb[e.b]));
    ctx.strokeStyle = lg;
    ctx.lineWidth = (sil ? 2 : 1.35) * sc;
    ctx.beginPath();
    ctx.moveTo(A[0], A[1]);
    ctx.lineTo(B[0], B[1]);
    ctx.stroke();
  }
  // Vertices catch the light.
  for (let i = 0; i < RV.length; i++) {
    if (RV[i][2] < -0.15) continue;
    ctx.beginPath();
    ctx.arc(S[i][0], S[i][1], (1.2 + 1.5 * vb[i]) * sc, 0, Math.PI * 2);
    ctx.fillStyle = metal(Math.min(1, vb[i] + 0.25));
    ctx.fill();
  }
  ctx.restore();
}
