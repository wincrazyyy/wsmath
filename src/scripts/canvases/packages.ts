/*
 * The packages canvas, ported from home.js _framePk (L796–930), _netSolid (L748), _satellites (L779) and _rings
 * (L931).
 *
 * One overlay (#pk-canvas, 80px larger than .pk-wrap on every side) draws, per card, the chosen course's topic
 * network beside its topic list (#pk-solid-<i>): an octahedron for A-Level, a simplex for IBDP, a pyramid for IGCSE.
 * The chosen topic's corner turns toward the viewer and carries one small point per subtopic; a leader runs to it
 * from the topic's label (#pk-tl-<i>-<j>); light runs out from it on the card being looked at. A new course spins the
 * model once and grows its subtopic points back in. The one-to-one rings sit in #pk-rings and turn faster while the
 * banner is pointed at. State comes from ui/packages.ts.
 */
import { apply, clamp, cross, dot, ease, mix, mul, norm, axis, rx, ry, smooth, type Vec3 } from '../lib/math3d';
import { register, type Frame, type Handle, type Surface } from '../lib/motion';
import { GOLD_RGB, glow } from '../lib/paint';
import type { Packages, PkTopic } from '../ui/packages';

interface Net {
  V: Vec3[];
  F: number[][];
  E: number[][];
}

/** Per-card model state (the reference's this._pkO[i]). */
interface Model {
  key?: string;
  spinAt?: number;
  born?: number;
  yawT?: number;
  ny?: number;
  np?: number;
  nyv?: number;
  npv?: number;
}

const netCache: Record<string, Net> = {};
const satCache: Record<string, Vec3[][]> = {};
const pkO: Model[] = [{}, {}, {}];
let pkLast = 0;
let rgLast = 0;
let rgYaw = 0;
let handle: Handle | null = null;

function netSolid(kind: string, n: number): Net {
  // Each curriculum has its own solid, with one corner per topic and every pair of topics joined.
  // IBDP: a tetrahedron with a fifth point at its centre, the 3D shadow of a four-dimensional simplex.
  // IGCSE: a square pyramid. A-Level: an octahedron, the four Pure units round its middle, Statistics and Mechanics at the poles.
  const ck = kind + n;
  if (netCache[ck]) return netCache[ck];
  let V: Vec3[], F: number[][];
  if (kind === 'octa' && n === 6) {
    V = [[1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1], [0, 1, 0], [0, -1, 0]];
    F = [];
    for (let k = 0; k < 4; k++) F.push([4, k, (k + 1) % 4], [5, (k + 1) % 4, k]);
  } else if (kind === 'simplex' && n === 5) {
    // Point down, like a crystal: three topics round the top face, one at the tip, Calculus at the core.
    const up = axis([-1, 0, 1], Math.acos(1 / Math.sqrt(3)));
    const T = ([[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]] as Vec3[]).map((q): Vec3 => {
      const r = apply(up, norm(q));
      return [r[0] * 1.08, -r[1] * 1.08 + 0.12, r[2] * 1.08];
    });
    V = [T[1], T[2], T[3], T[0], [0, 0.12 - 0.27, 0]];
    F = [[0, 1, 2], [0, 1, 3], [1, 2, 3], [2, 0, 3]];
  } else if (kind === 'pyramid' && n === 5) {
    // Point up and squat, like the pyramids at Giza: one topic at the apex, four round the base.
    V = ([[0, 0.74, 0]] as Vec3[]).concat([0, 1, 2, 3].map((k): Vec3 => [1.02 * Math.cos(Math.PI / 4 + (k * Math.PI) / 2), -0.46, 1.02 * Math.sin(Math.PI / 4 + (k * Math.PI) / 2)]));
    F = [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1], [1, 2, 3], [1, 3, 4]];
  } else {
    V = Array.from({ length: n }, (_, k): Vec3 => [Math.cos((k * 2 * Math.PI) / n), 0, Math.sin((k * 2 * Math.PI) / n)]);
    F = [];
  }
  const E: number[][] = [];
  for (let x = 0; x < n; x++) for (let y = x + 1; y < n; y++) E.push([x, y]);
  return (netCache[ck] = { V, F, E });
}

function satellites(key: string, topics: PkTopic[]): Vec3[][] {
  // One small point per subtopic listed in the outline, spread over a little sphere around its topic,
  // so a fuller syllabus (HL over SL, say) shows as a denser model.
  if (satCache[key]) return satCache[key];
  const ga = Math.PI * (3 - Math.sqrt(5));
  const out = topics.map((tq, j) => {
    const count = Math.max(3, tq.text.split(/[,;]/).filter((x) => x.trim()).length), pts: Vec3[] = [];
    for (let q = 0; q < count; q++) {
      const y = 1 - (2 * (q + 0.5)) / count, r = Math.sqrt(Math.max(0, 1 - y * y)), th = ga * q + j * 1.3;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    return pts;
  });
  return (satCache[key] = out);
}

function framePk(s: Surface, f: Frame, pk: Packages): void {
  const c = s.ctx, w = s.w, h = s.h;
  if (!c || !w || !h) return;
  const dpr = s.dpr;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);
  const base = s.el.getBoundingClientRect();
  const packs = pk.data.cards, focus = pk.focus;
  const now = performance.now(), t = f.t, G = GOLD_RGB, still = f.still;
  const dt = Math.min(0.05, Math.max(0, (now - (pkLast || now)) / 1000));
  pkLast = now;
  const fade = still ? 1 : smooth(0, 1.2, (now - (handle?.seenAt || now)) / 1000);
  const fam = "'Noto Serif Display', 'Noto Sans Math', Georgia, serif", near = (z: number): number => (z + 1) / 2;
  for (let i = 0; i < packs.length; i++) {
    const el = document.getElementById('pk-solid-' + i);
    if (!el) continue;
    const box = el.getBoundingClientRect();
    if (box.width < 20 || box.height < 20) continue;
    const P = packs[i], k = pk.course(i), C = P.courses[k];
    const n = C.topics.length, act = pk.topic(i), S = netSolid(P.shape, n), O = (pkO[i] = pkO[i] || {}), key = i + ':' + k;
    // A new course spins the model once and grows its subtopic points back in.
    if (O.key !== key) { if (O.key != null) O.spinAt = now; O.key = key; O.born = O.key && O.born ? now : now - 2000; }
    // Turn the chosen topic's corner toward the viewer, with a slow sway; each column sways out of step.
    const v = S.V[act], zp = Math.hypot(v[0], v[2]);
    // Only turn about the upright axis, so each solid keeps its silhouette: IBDP points down, IGCSE up, A-Level both ways.
    if (zp > 0.05) O.yawT = Math.atan2(-v[0], v[2]);
    else if (O.yawT == null) O.yawT = 0.6;
    let yawT = O.yawT ?? 0.6, pitT = 0.22;
    if (!still) { yawT += Math.sin(t * 0.21 + i * 2.1) * 0.38; pitT += Math.sin(t * 0.29 + i) * 0.08; }
    if (O.ny == null || O.np == null || O.nyv == null || O.npv == null || still) { O.ny = yawT; O.np = pitT; O.nyv = 0; O.npv = 0; }
    const dy = ((((yawT - O.ny) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI, om = 3.4;
    O.nyv += (om * om * dy - 2 * om * O.nyv) * dt;
    O.npv += (om * om * (pitT - O.np) - 2 * om * O.npv) * dt;
    O.ny += O.nyv * dt;
    O.np += O.npv * dt;
    const spin = still || !O.spinAt ? 0 : Math.PI * 2 * (1 - ease(clamp((now - O.spinAt) / 1100)));
    const m = mul(rx(O.np), ry(O.ny + spin));
    const grow = still ? 1 : ease(clamp((now - (O.born || 0)) / 800));
    const cx = box.left - base.left + box.width / 2, cy = box.top - base.top + box.height / 2;
    const R = Math.min(box.width, box.height) * 0.38, D = R * 4.6, a0 = fade;
    const RV = S.V.map((q) => apply(m, q));
    const proj = (r: Vec3): Vec3 => { const kk = D / (D - r[2] * R); return [cx + r[0] * R * kk, cy - r[1] * R * kk, kk]; };
    const PV = RV.map(proj);
    glow(c, cx, cy, R * 1.3, [[0, 'rgba(66,50,102,' + (0.14 * a0).toFixed(3) + ')'], [1, 'rgba(39,29,65,0)']]);
    for (const fc of S.F) {
      const A = RV[fc[0]], B = RV[fc[1]], Cc = RV[fc[2]];
      let nrm = cross([B[0] - A[0], B[1] - A[1], B[2] - A[2]], [Cc[0] - A[0], Cc[1] - A[1], Cc[2] - A[2]]);
      if (dot(nrm, [(A[0] + B[0] + Cc[0]) / 3, (A[1] + B[1] + Cc[1]) / 3, (A[2] + B[2] + Cc[2]) / 3]) < 0) nrm = [-nrm[0], -nrm[1], -nrm[2]];
      c.beginPath();
      c.moveTo(PV[fc[0]][0], PV[fc[0]][1]);
      c.lineTo(PV[fc[1]][0], PV[fc[1]][1]);
      c.lineTo(PV[fc[2]][0], PV[fc[2]][1]);
      c.closePath();
      if (nrm[2] < 0) { c.fillStyle = 'rgba(36,27,62,' + (0.08 * a0).toFixed(3) + ')'; c.fill(); }
    }
    c.lineCap = 'round';
    const edges = S.E.map((e) => ({ a: e[0], b: e[1], z: (RV[e[0]][2] + RV[e[1]][2]) / 2 })).sort((p, q) => p.z - q.z);
    for (const e of edges) {
      const hot = e.a === act || e.b === act, nz = near(e.z);
      c.strokeStyle = 'rgba(' + G + ',' + ((hot ? 0.38 + 0.4 * nz : 0.08 + 0.22 * nz) * a0).toFixed(3) + ')';
      c.lineWidth = hot ? 1.05 : 0.75;
      c.beginPath();
      c.moveTo(PV[e.a][0], PV[e.a][1]);
      c.lineTo(PV[e.b][0], PV[e.b][1]);
      c.stroke();
    }
    // The chosen topic carries one small point per subtopic, circling it.
    const sats = satellites(key, C.topics), orb = ry(t * 0.45 + act);
    for (const sp of sats[act]) {
      const o = apply(orb, sp), q: Vec3 = [S.V[act][0] + o[0] * 0.24 * grow, S.V[act][1] + o[1] * 0.24 * grow, S.V[act][2] + o[2] * 0.24 * grow];
      const rq = apply(m, q), pq = proj(rq), nz = near(rq[2]);
      c.beginPath();
      c.arc(pq[0], pq[1], 1.05 * pq[2], 0, Math.PI * 2);
      c.fillStyle = 'rgba(246,231,193,' + ((0.4 + 0.5 * nz) * a0 * grow).toFixed(3) + ')';
      c.fill();
    }
    // Light runs out from the chosen topic in the column being looked at.
    if (!still && i === focus) {
      for (let j = 0; j < n; j++) {
        if (j === act) continue;
        const u = (t * 0.45 + j * 0.29) % 1, q = mix(RV[act], RV[j], smooth(0, 1, u));
        const kk = D / (D - q[2] * R), x = cx + q[0] * R * kk, y = cy - q[1] * R * kk, al = Math.sin(Math.PI * u) * a0 * (0.5 + 0.5 * near(q[2]));
        if (al < 0.02) continue;
        glow(c, x, y, 4.5 * kk, [[0, 'rgba(' + G + ',' + (0.35 * al).toFixed(3) + ')'], [1, 'rgba(' + G + ',0)']]);
        c.beginPath();
        c.arc(x, y, 1.05 * kk, 0, Math.PI * 2);
        c.fillStyle = 'rgba(246,231,193,' + al.toFixed(3) + ')';
        c.fill();
      }
    }
    // A fine leader runs from the chosen topic's name to its corner of the model.
    const lab = document.getElementById('pk-tl-' + i + '-' + act);
    if (lab) {
      const lr = lab.getBoundingClientRect(), x0 = lr.right - base.left + 10, y0 = lr.top - base.top + lr.height / 2, x1 = PV[act][0], y1 = PV[act][1];
      const lg = c.createLinearGradient(x0, y0, x1, y1);
      lg.addColorStop(0, 'rgba(' + G + ',' + (0.45 * a0).toFixed(3) + ')');
      lg.addColorStop(1, 'rgba(' + G + ',' + (0.14 * a0).toFixed(3) + ')');
      c.beginPath();
      c.moveTo(x0, y0);
      c.lineTo(x1, y1);
      c.strokeStyle = lg;
      c.lineWidth = 0.8;
      c.stroke();
      c.beginPath();
      c.arc(x0, y0, 1.5, 0, Math.PI * 2);
      c.fillStyle = 'rgba(' + G + ',' + (0.8 * a0).toFixed(3) + ')';
      c.fill();
    }
    // Topic corners, far ones first, each carrying its number.
    const order = RV.map((_, j) => j).sort((p, q) => RV[p][2] - RV[q][2]);
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    for (const j of order) {
      const nz = near(RV[j][2]), on = j === act, rad = (on ? 10.5 : 7 + 2.5 * nz) * PV[j][2];
      const x = PV[j][0], y = PV[j][1];
      if (on || (P.shape === 'simplex' && j === 4)) glow(c, x, y, rad * 2.4, [[0, 'rgba(' + G + ',' + ((on ? 0.22 : 0.1) * a0).toFixed(3) + ')'], [1, 'rgba(' + G + ',0)']]);
      c.beginPath();
      c.arc(x, y, rad, 0, Math.PI * 2);
      c.fillStyle = on ? 'rgba(' + G + ',' + a0.toFixed(3) + ')' : 'rgba(11,8,16,' + (0.92 * a0).toFixed(3) + ')';
      c.fill();
      if (!on) {
        c.strokeStyle = 'rgba(' + G + ',' + ((0.3 + 0.5 * nz) * a0).toFixed(3) + ')';
        c.lineWidth = 0.8;
        c.stroke();
      }
      const label = C.topics[j].num;
      c.font = 'italic 400 ' + ((label.length > 1 ? 8 : 9.5) + 1.5 * nz + (on ? 1 : 0)).toFixed(1) + 'px ' + fam;
      c.fillStyle = on ? 'rgba(8,6,11,' + a0.toFixed(3) + ')' : 'rgba(' + G + ',' + ((0.45 + 0.55 * nz) * a0).toFixed(3) + ')';
      c.fillText(label, x, y + 0.5);
    }
  }
  rings(c, base, G, fade, t, still, pk.ringOn);
}

function rings(c: CanvasRenderingContext2D, base: DOMRect, G: string, fade: number, t: number, still: boolean, on: boolean): void {
  // One-to-one: two linked rings, turning slowly; quicker while the banner is pointed at.
  const el = document.getElementById('pk-rings');
  if (!el) return;
  const r = el.getBoundingClientRect();
  if (r.width < 20) return;
  const now = performance.now();
  const dt = Math.min(0.05, Math.max(0, (now - (rgLast || now)) / 1000));
  rgLast = now;
  rgYaw = (rgYaw || 0.6) + (still ? 0 : dt * (on ? 1.1 : 0.32));
  const cx = r.left - base.left + r.width / 2, cy = r.top - base.top + r.height / 2, R = Math.min(r.width, r.height) * 0.5, D = R * 5;
  const m = mul(rx(0.55 + Math.sin(t * 0.3) * 0.06), ry(rgYaw));
  const arcs: { run: Vec3[]; z: number }[] = [], N = 96, A = 8;
  for (let ring = 0; ring < 2; ring++) {
    const pts: Vec3[] = [];
    for (let k = 0; k <= N; k++) {
      const a = (k / N) * Math.PI * 2, ca = Math.cos(a) * 0.6, sa = Math.sin(a) * 0.6;
      pts.push(apply(m, ring ? [0.34 + ca, 0, sa] : [-0.34 + ca, sa, 0]));
    }
    for (let k = 0; k < N; k += A) { const run = pts.slice(k, k + A + 1); arcs.push({ run, z: run.reduce((acc, q) => acc + q[2], 0) / run.length }); }
  }
  arcs.sort((p, q) => p.z - q.z);
  const pr = (q: Vec3): [number, number] => { const k = D / (D - q[2] * R); return [cx + q[0] * R * k, cy - q[1] * R * k]; };
  c.lineJoin = 'round';
  for (const arc of arcs) {
    const P = arc.run.map(pr), nz = (arc.z + 1) / 2;
    c.beginPath();
    P.forEach((q, k) => (k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])));
    c.lineCap = 'butt';
    c.strokeStyle = '#0E0916';
    c.lineWidth = 6;
    c.stroke();
    c.strokeStyle = 'rgba(' + G + ',' + ((0.4 + 0.6 * nz) * fade).toFixed(3) + ')';
    c.lineWidth = 1.7;
    c.stroke();
  }
  c.lineCap = 'round';
}

export function initPackagesCanvas(root: HTMLElement, pk: Packages): void {
  const canvas = root.querySelector<HTMLCanvasElement>('#pk-canvas');
  if (!canvas) return;
  const h = register({
    canvases: [canvas],
    draw(surfaces, f) {
      framePk(surfaces[0], f, pk);
    },
  });
  handle = h;
  pk.onChange(() => h.redraw());
}
