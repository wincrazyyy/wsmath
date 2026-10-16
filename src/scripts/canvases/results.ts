/*
 * The results towers, ported from home.js _frameRs (L1003–1225). Lanes and records come from #rs-data (_rsLanes
 * L344, _records L274); the lane and the selection come from the controller (ui/results.ts), which reads
 * `hit()` for its pointer test (_rsPointer L984 reads this._rsHit).
 *
 * Each student is a tower of blocks, one per grade: dark blocks to the predicted or mock grade, gold blocks for the
 * grades gained. The blocks drop in once the stage is a third in view (model.seen), the gold blocks regrow when a
 * tower is picked, a band of light climbs the gold, and the chosen tower lifts with a glow, its name and a
 * "▲ +N" tag. A measuring rod on the left carries the lane's grade scale. Below 640px the camera frames five towers
 * around the selection and slides along the row.
 */
import { clamp, ease, apply, mul, rx, ry } from '../lib/math3d';
import { register, type Frame, type Handle, type Surface } from '../lib/motion';
import { GOLD_RGB, glow } from '../lib/paint';
import type { Lane, ResultRecord } from '../../content/types';

export interface RsRecord extends ResultRecord {
  /** "course · year" */
  label: string;
  /** Grades gained. */
  gain: number;
  /** "+N grade(s)" */
  gainText: string;
}

/** Controller state the frame reads (this.state and the _rs* fields in the reference). */
export interface RsModel {
  lanes: Lane[];
  records: RsRecord[];
  /** state.rsLane */
  lane: number;
  /** state.rsSel: an index into records. */
  sel: number;
  /** _rsSeen: performance.now() when the stage was first ≥30% in view (reset on a lane change), 0 before. */
  seen: number;
  /** _rsPtr: pointer x across the canvas in [-1, 1], or null when the pointer is away. */
  ptr: { x: number } | null;
  /** _rsGrow: performance.now() when each record's gold blocks started regrowing. Cleared on a lane change. */
  grow: Record<number, number>;
}

export interface RsHit {
  ri: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  z: number;
}

export interface ResultsCanvas {
  /** Tower boxes from the last frame, in canvas CSS px (_rsHit); null until the first frame. */
  hits(): RsHit[] | null;
  redraw(): void;
  readonly visible: boolean;
}

type P3 = [number, number, number];
type Rgb = [number, number, number];

interface Cam {
  s: number;
  ox: number;
  oy: number;
  px: number;
  lane?: number;
  lift: Record<number, number>;
  win: Record<number, number>;
}

const sans = "'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif";

// Per-frame state carried between frames (this._rsO, _rsLast, _rsLastSel, _rsDone, _rsDoneSel, _rsHit).
let O: Cam | null = null;
let last = 0;
let lastSel: number | undefined;
let done = 0;
let doneSel = -1;
let hitBoxes: RsHit[] | null = null;

function frameRs(s: Surface, f: Frame, M: RsModel): void {
  const c = s.ctx, w = s.w, h = s.h;
  if (!w || !h) return;
  const dpr = s.dpr;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);
  const recs = M.records, lane = M.lane, Ln = M.lanes[lane], n = Ln.ticks.length;
  const pool = recs.map((_, i) => i).filter((i) => recs[i].lane === lane);
  const sel = pool.indexOf(M.sel) >= 0 ? M.sel : pool[0];
  const now = performance.now(), t = f.t, still = f.still, G = GOLD_RGB;
  const dt = Math.min(0.05, Math.max(0, (now - (last || now)) / 1000));
  last = now;
  const kk = still ? 1 : Math.min(1, dt * 4), since = still ? 99 : M.seen ? (now - M.seen) / 1000 : 0;
  const lvl = (g: string): number => { const a = Ln.ticks.indexOf(g); return a >= 0 ? a : Ln.ticksR ? Ln.ticksR.indexOf(g) : 0; };
  const mix = (p: Rgb, q: Rgb, k: number): string => 'rgb(' + p.map((v, i) => Math.round(v + (q[i] - v) * k)).join(',') + ')';
  if (lastSel !== undefined && lastSel !== sel && since > 0.5 && !still) M.grow[sel] = now;
  lastSel = sel;

  // Layout: one row of towers, one block per grade. A narrow screen frames five towers around the chosen
  // student and slides along the row as the panel steps.
  const N = pool.length, slot = 1.34;
  const T = pool.map((ri, k) => {
    const r = recs[ri];
    return { ri, k, r, x: (k - (N - 1) / 2) * slot, z: 0, a: lvl(r.from), b: lvl(r.to), letters: !!Ln.ticksR && Ln.ticks.indexOf(r.to) < 0 };
  });
  const win = w < 640 ? Math.min(N, 5) : N, selK = Math.max(0, pool.indexOf(sel));
  const c0 = Math.max(0, Math.min(N - win, selK - Math.floor(win / 2)));
  const xMin = T[c0].x - 0.5, xMax = T[c0 + win - 1].x + 0.5, zMin = -0.5, zMax = 0.5;

  // Camera: a fixed three-quarter view from the front right, fitted to the towers and eased between courses.
  const cam: Cam = O || (O = { s: 0, ox: 0, oy: 0, px: 0, lift: {}, win: {} });
  const yaw0 = -0.22, pit = 0.3, Dz = 60, top = 58, bot = 42, rulerX = xMin - 0.75;
  const m0 = mul(rx(pit), ry(yaw0));
  let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9;
  for (const x of [rulerX - 0.9, xMax]) for (const y of [0, n]) for (const z of [zMin, zMax + 0.35]) {
    const q = apply(m0, [x, y - n / 2, z]), k = Dz / (Dz - q[2]);
    a0 = Math.min(a0, q[0] * k); a1 = Math.max(a1, q[0] * k); b0 = Math.min(b0, q[1] * k); b1 = Math.max(b1, q[1] * k);
  }
  const mx = Math.min(44, w * 0.05);
  const ts = Math.min((w - mx * 2) / (a1 - a0), (h - top - bot) / (b1 - b0), 66);
  const tox = -((a0 + a1) / 2) * ts, toy = top + (h - top - bot) / 2 - h / 2 + ((b0 + b1) / 2) * ts;
  if (!cam.s || cam.lane !== lane) Object.assign(cam, { s: ts, ox: tox, oy: toy, lane, win: {} });
  cam.s += (ts - cam.s) * kk;
  cam.ox += (tox - cam.ox) * kk;
  cam.oy += (toy - cam.oy) * kk;
  cam.px += ((M.ptr ? M.ptr.x : 0) - cam.px) * Math.min(1, dt * 2);
  const yaw = yaw0 + (still ? 0 : Math.sin(t * 0.25) * 0.035 + cam.px * 0.06), m = mul(rx(pit), ry(yaw));
  const P = (x: number, y: number, z: number): P3 => {
    const q = apply(m, [x, y - n / 2, z]), k = Dz / (Dz - q[2]);
    return [w / 2 + cam.ox + q[0] * cam.s * k, h / 2 + cam.oy - q[1] * cam.s * k, q[2]];
  };
  const poly = (pts: P3[]): void => { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); };
  const facing = (v: P3): boolean => apply(m, v)[2] > 0.02;
  const showTop = facing([0, 1, 0]), showFront = facing([0, 0, 1]), showRight = facing([1, 0, 0]), showLeft = facing([-1, 0, 0]);
  c.lineJoin = 'round';

  // Floor, and a measuring rod with the grade scale on the left.
  poly([P(rulerX - 0.35, 0, zMin - 0.6), P(xMax + 0.7, 0, zMin - 0.6), P(xMax + 0.7, 0, zMax + 0.8), P(rulerX - 0.35, 0, zMax + 0.8)]);
  c.fillStyle = 'rgba(18,12,27,0.5)';
  c.fill();
  c.strokeStyle = 'rgba(240,233,222,0.07)';
  c.lineWidth = 1;
  c.stroke();
  const curT = T.find((q) => q.ri === sel);

  // Towers, far ones first.
  const order = T.slice().sort((p, q) => P(p.x, 0, p.z)[2] - P(q.x, 0, q.z)[2]);
  const hits: RsHit[] = [];
  let selGrown = 1;
  const face = (pts: P3[], fill: string, edge: string): void => { poly(pts); c.fillStyle = fill; c.fill(); c.strokeStyle = edge; c.stroke(); };
  for (const tw of order) {
    const on = tw.ri === sel;
    const L0 = cam.lift[tw.ri] || 0, L = (cam.lift[tw.ri] = L0 + ((on ? 1 : 0) - L0) * kk);
    const inWin = tw.k >= c0 && tw.k < c0 + win, W0 = cam.win[tw.ri] === undefined ? (inWin ? 1 : 0) : cam.win[tw.ri];
    const Wv = (cam.win[tw.ri] = W0 + ((inWin ? 1 : 0) - W0) * kk);
    if (Wv < 0.02) continue;
    const zz = tw.z + 0.3 * L, A = (0.72 + 0.28 * L) * (0.1 + 0.9 * Wv);
    const grow = M.grow[tw.ri] ? (now - M.grow[tw.ri]) / 1000 : 99, G0 = Math.max(1, tw.b - tw.a);
    let grownSum = 0;
    // a soft pool of light under the chosen tower
    if (L > 0.02) {
      const b = P(tw.x, 0, zz);
      glow(c, b[0], b[1], cam.s * 1.3, [[0, 'rgba(' + G + ',' + (0.22 * L).toFixed(3) + ')'], [1, 'rgba(' + G + ',0)']]);
    }
    for (let g = 0; g <= tw.b; g++) {
      const gold = g > tw.a, j = g - tw.a - 1;
      let rise = 0, hgt = 1, vis = 1;
      if (!still) {
        if (!gold) {
          const p = clamp((since - 0.05 - tw.k * 0.025 - g * 0.035) / 0.3);
          vis = p;
          rise = -(1 - ease(p)) * 0.3;
        } else {
          // Gold blocks grow up out of the stack one at a time: in a wave across the towers when the stage first
          // shows, and again whenever this student is picked.
          const p1 = clamp((since - 0.45 - tw.k * 0.06 - j * 0.12) / 0.3);
          const p2 = on ? clamp((grow - 0.15 - j * 0.16) / 0.3) : 1, p = Math.min(p1, p2);
          hgt = ease(p);
          vis = p > 0 ? 1 : 0;
        }
      }
      if (gold) grownSum += hgt;
      if (vis <= 0.01 || hgt < 0.03) continue;
      // at rest, a band of light keeps climbing each tower's gold blocks
      let glw = 0;
      if (gold && !still && hgt >= 1) {
        const u = (((t * 0.19 + tw.k * 0.618) % 1) + 1) % 1 / 0.42;
        if (u <= 1) glw = Math.max(0, 1 - Math.abs(g + 0.5 - (tw.a + 0.7 + (tw.b - tw.a + 0.6) * u)) / 0.85);
      }
      const e = 0.04, x0 = tw.x - 0.46, x1 = tw.x + 0.46, y0 = g + rise + e, y1 = g + rise + e + (1 - 2 * e) * hgt, z0 = zz - 0.46, z1 = zz + 0.46;
      c.globalAlpha = A * vis;
      c.lineWidth = 1;
      const tf = gold
        ? [mix([244, 226, 176], [255, 250, 232], glw * 0.85), mix([212, 176, 110], [250, 228, 170], glw * 0.75), mix([168, 133, 77], [216, 182, 120], glw * 0.65), 'rgba(255,244,214,' + (0.55 + 0.4 * glw).toFixed(3) + ')']
        : ['rgba(48,39,66,0.62)', 'rgba(32,25,47,0.72)', 'rgba(22,18,34,0.78)', on ? 'rgba(205,169,104,0.55)' : 'rgba(205,169,104,0.32)'];
      if (showLeft) face([P(x0, y0, z0), P(x0, y0, z1), P(x0, y1, z1), P(x0, y1, z0)], tf[2], tf[3]);
      if (showRight) face([P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1), P(x1, y1, z0)], tf[2], tf[3]);
      if (showFront) face([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], tf[1], tf[3]);
      if (showTop) face([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], tf[0], tf[3]);
      // the grade on the block's face: every block of the chosen tower, the top block of the others
      if (((on && L > 0.5) || g === tw.b) && hgt > 0.75) {
        const f0 = P(x0, y0, z1), f1 = P(x1, y1, z1), fh = Math.abs(f1[1] - f0[1]);
        if (fh > 9) {
          c.font = '600 ' + Math.min(17, fh * 0.42).toFixed(1) + 'px ' + sans;
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillStyle = gold ? 'rgba(46,28,12,0.85)' : 'rgba(240,233,222,0.75)';
          c.fillText(tw.letters && Ln.ticksR ? Ln.ticksR[g] : Ln.ticks[g], (f0[0] + f1[0]) / 2, (f0[1] + f1[1]) / 2 + 0.5);
        }
      }
      c.globalAlpha = 1;
    }
    // where the pointer can pick this tower
    let hx0 = 1e9, hx1 = -1e9, hy0 = 1e9, hy1 = -1e9;
    for (const x of [tw.x - 0.5, tw.x + 0.5]) for (const y of [0, tw.b + 1]) for (const z of [zz - 0.5, zz + 0.5]) {
      const p = P(x, y, z);
      hx0 = Math.min(hx0, p[0]); hx1 = Math.max(hx1, p[0]); hy0 = Math.min(hy0, p[1]); hy1 = Math.max(hy1, p[1]);
    }
    hits.push({ ri: tw.ri, x0: hx0, x1: hx1, y0: hy0, y1: hy1, z: P(tw.x, 0, zz)[2] });
    if (on) selGrown = still ? 1 : grownSum / G0;
  }
  hitBoxes = hits;

  // The measuring rod with the grade scale, drawn last so towers sliding past never cover it.
  const rz = zMax, rb = P(rulerX, 0, rz), rt = P(rulerX, n, rz);
  c.beginPath();
  c.moveTo(rb[0], rb[1]);
  c.lineTo(rt[0], rt[1]);
  c.strokeStyle = 'rgba(240,233,222,0.22)';
  c.stroke();
  c.font = '500 12px ' + sans;
  c.textBaseline = 'middle';
  for (let g = 0; g < n; g++) {
    const p = P(rulerX, g + 0.5, rz), hot = curT && (g === curT.a || g === curT.b);
    c.beginPath();
    c.moveTo(p[0] - 4, p[1]);
    c.lineTo(p[0] + 4, p[1]);
    c.strokeStyle = 'rgba(240,233,222,0.3)';
    c.stroke();
    c.textAlign = 'right';
    const lab = curT && curT.letters && Ln.ticksR ? Ln.ticksR[g] : Ln.ticks[g];
    c.fillStyle = hot && curT ? (g === curT.b ? 'rgba(' + G + ',1)' : '#F3ECE1') : g === n - 1 ? 'rgba(' + G + ',0.85)' : 'rgba(185,175,163,0.7)';
    c.fillText(lab, p[0] - 10, p[1]);
  }

  // The chosen student's name above their tower, and once the gold blocks have grown, a tag with the grades
  // gained that pops up and then bobs gently.
  if (curT) {
    const L = cam.lift[curT.ri] || 0, zz = curT.z + 0.3 * L, name = curT.r.name, top = P(curT.x, curT.b + 1, zz);
    const unit = Math.abs(P(curT.x, curT.b + 2, zz)[1] - top[1]);
    let lift = 0;
    if (selGrown >= 0.999 && curT.b > curT.a) {
      if (doneSel !== curT.ri) { done = now; doneSel = curT.ri; }
      const pop = still ? 1 : ease(clamp((now - done) / 320));
      const bob = still ? 0 : Math.sin((now - done) / 420) * 2;
      const txt = '+' + (curT.b - curT.a), y = top[1] - 16 - 10 * pop + bob;
      c.globalAlpha = pop * Math.min(1, L * 1.4);
      c.font = '700 15px ' + sans;
      const tw = c.measureText(txt).width, pw = tw + 30, ph = 24, px = top[0] - pw / 2;
      c.beginPath();
      c.moveTo(px + ph / 2, y - ph / 2);
      c.lineTo(px + pw - ph / 2, y - ph / 2);
      c.arc(px + pw - ph / 2, y, ph / 2, -Math.PI / 2, Math.PI / 2);
      c.lineTo(px + ph / 2, y + ph / 2);
      c.arc(px + ph / 2, y, ph / 2, Math.PI / 2, Math.PI * 1.5);
      c.closePath();
      c.fillStyle = 'rgba(13,9,19,0.92)';
      c.fill();
      c.strokeStyle = 'rgba(' + G + ',0.9)';
      c.lineWidth = 1.2;
      c.stroke();
      c.beginPath();
      c.moveTo(px + 11, y + 4);
      c.lineTo(px + 15.5, y - 4.5);
      c.lineTo(px + 20, y + 4);
      c.closePath();
      c.fillStyle = 'rgba(' + G + ',1)';
      c.fill();
      c.textAlign = 'left';
      c.textBaseline = 'middle';
      c.fillText(txt, px + 23, y + 0.5);
      c.globalAlpha = 1;
      lift = (ph + 8) * pop;
    } else if (doneSel === curT.ri && !still) {
      doneSel = -1;
    }
    const ny = top[1] - Math.max(22, unit * 0.45) - lift;
    c.font = '600 14px ' + sans;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.lineWidth = 5;
    c.strokeStyle = 'rgba(9,6,14,0.92)';
    c.globalAlpha = L;
    c.strokeText(name, top[0], ny);
    c.fillStyle = '#F3ECE1';
    c.fillText(name, top[0], ny);
    c.globalAlpha = 1;
  }
}

/**
 * Register the towers with the motion runtime. `onIntersect` receives the canvas's intersection entries at the
 * thresholds 0 and 0.3 (the reference's own observer, componentDidMount L494–503), for the controller's 30% gate.
 */
export function initResultsCanvas(canvas: HTMLCanvasElement, model: RsModel, onIntersect?: (en: IntersectionObserverEntry) => void): ResultsCanvas {
  const handle: Handle = register({
    canvases: [canvas],
    threshold: [0, 0.3],
    onIntersect,
    draw: (surfaces, f) => frameRs(surfaces[0], f, model),
  });
  return {
    hits: () => hitBoxes,
    redraw: () => handle.redraw(),
    get visible() {
      return handle.visible;
    },
  };
}
