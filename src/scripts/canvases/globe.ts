/*
 * The closing globe, ported from home.js _globeDots (L1331) and _frameCta (L1348–1491).
 *
 * A dotted globe turned towards Asia and Europe: land as a dot grid (one bit per cell), a faint graticule, a glass
 * body with a gold rim and atmosphere. Hong Kong pulses, and arcs fly out to cities where students went on to
 * study (London, Edinburgh, Melbourne), each with a comet travelling along it. It fades in over 1.4 s from the
 * moment the canvas first comes into view (handle.seenAt, this._ctaSeen in the reference).
 */
import { apply, clamp, dot, mul, rx, ry, smooth, type Vec3 } from '../lib/math3d';
import { register, type Frame, type Handle, type Surface } from '../lib/motion';
import { GOLD_RGB, glow } from '../lib/paint';

/** A projected point: screen x, screen y, depth, then the rotated x and y on the unit sphere. */
type GP = [number, number, number, number, number];

let gDots: Float32Array | null = null;

function globeDots(): Float32Array {
  // Land as a dot grid: rows of evenly spaced cells over the sphere, one bit per cell (1 = land).
  if (gDots) return gDots;
  const raw = atob('//f/99//D8v/8P8f//wP+D///ABCD///8AACAP///wAAAAAH3/4AAACAAAQCEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAGAAAAAAAAAAAAAAAAAMAAAAAAAAAAACAAAAAAcAAAAAAAAAAAAgAAAAAHAAAAAAAAAAACAQAAAAAB4AAAAAAAAAAAAAgAAAAAH4AAAAAAAAAAAeAAAAAAAAfQAAAAAAAAACA8AgAAAAAAfwAAAB4AAAAB4/gAAAAAAAA/gAAAD4AAAAB//wAAAAAAAA/4AAAD+AAAAAf/8AAAAAAAAB/wAAAH8AAAAAf/8AAAAAAAAB/4AAAD/CAAAAP//AAAAAAAAAH/8AAAP+GAAAAP/8AAAAAAAAAH/4AAAf+GAAAAB/4AAAAAAAAAD//AAAD/5wAAAAH/AAIAAAAAAB//4AAAf/xAAAAALEAAAAAAAAAB//8AAAP/wAAAAABkAAAAAAAAAD//+AAAP/wAAAAAQAAAAAAAAAAA///wAAB/8AAAABgg0AAAAAAAAAf//4AAA//AAAAAAAPUAAAAAAAAB///AAAD/+AAAAMKb4gAAAAAAAAH/7AAAA//4AAABnoQAAAAAAAAAAP/4AAAB//4AAAGfIAAAAAAAAAAA//AAAAH//gAAAwYAAAAAAAAAAAD/4AADx///AAABAgAAAAAAAAAAA/4AAB////wAEAgDAAAAAAAAAABCwAAAf///+ADAJAQAAAAAAAAAAggAAA////wADALgQAAAAAAAAADwAAAA////uAHAPAAAAAAAAAAB4AAAAD///98A8H4IAAAAAAAAA5gQAAAf//+fwPh9AAAAAAAAAB4iAAAA///9/w/n+AAAAAAAAALwAAAAB///3+H//+AAAAAAAAB8AAAAAf//35////AAAAAAAAD4EAAAAf///v///+AAAAAAAD/+AAAAH///////+IAAAAAAD/+AAAAP+Qf////4gAAAAAD//wAAAD8Af////gwAAAAAH//gAAAIQP9////RAAAAAH//gAAA6if7///8AAAAAAf//gAAHiZM////gAAAAB//+AAAHvDf///8wAAAA///gAAP/vf///4AAAAP//mAAf//////4AAAB///AAB//////8AAAH/9+ABX/////+IAAH/98ADE////+CgAP/DwAET////wgDn/hgAA5////4B//4ggB/////8D/+kYQb////8f/7uQO////z/lT4Hnv//IMY8BFv/ABSOAAfAAPnwAcQAn4gAAD8QAAOAAAAAAAA='), rows = 80, out: number[] = [];
  let b = 0;
  for (let i = 0; i < rows; i++) {
    const lat = (-90 + (i + 0.5) * 180 / rows) * Math.PI / 180, n = Math.max(1, Math.round(360 * Math.cos(lat) / (180 / rows)));
    for (let j = 0; j < n; j++, b++) {
      if ((raw.charCodeAt(b >> 3) >> (7 - (b & 7))) & 1) {
        const lon = (-180 + (j + 0.5 + (i % 2) * 0.5) * 360 / n) * Math.PI / 180;
        out.push(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon));
      }
    }
  }
  return (gDots = new Float32Array(out));
}

function frameCta(s: Surface, f: Frame, seenAt: number): void {
  // A dotted globe turned towards Asia and Europe. Hong Kong pulses, and arcs fly out to cities where students went
  // on to study: London, Edinburgh and Melbourne.
  const c = s.ctx, w = s.w, h = s.h;
  if (!w || !h) return;
  const dpr = s.dpr;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);
  const now = performance.now(), t = f.t, still = f.still, G = GOLD_RGB, deg = Math.PI / 180;
  const fade = still ? 1 : smooth(0, 1.4, (now - (seenAt || now)) / 1000);
  if (fade <= 0) return;
  const lam0 = (76 + (still ? 0 : Math.sin(t * 0.12) * 9)) * deg, phi0 = (still ? 12 : 12 + Math.sin(t * 0.08) * 3) * deg;
  const m = mul(rx(phi0), ry(-lam0));
  const R = Math.min(w * 0.4, h * 0.38), cx = w / 2, cy = h / 2, D = 7;
  const sph = (lat: number, lon: number, r: number): Vec3 => [Math.cos(lat) * Math.sin(lon) * r, Math.sin(lat) * r, Math.cos(lat) * Math.cos(lon) * r];
  const P = (v: Vec3): GP => { const q = apply(m, v), k = D / (D - q[2]); return [cx + q[0] * R * k, cy - q[1] * R * k, q[2], q[0], q[1]]; };
  const hidden = (p: GP): boolean => p[2] < 0 && p[3] * p[3] + p[4] * p[4] < 1;
  const al = (a: number): string => (a * fade).toFixed(3);

  // glow, the glass of the globe and a thin atmosphere at the rim
  // (kept inside the canvas so the glow never shows an edge)
  glow(c, cx, cy, Math.min(w, h) * 0.5, [[0, 'rgba(66,50,102,' + al(0.3) + ')'], [0.6, 'rgba(48,36,79,' + al(0.1) + ')'], [1, 'rgba(39,29,65,0)']]);
  const body = c.createRadialGradient(cx - R * 0.35, cy - R * 0.42, R * 0.08, cx, cy, R);
  body.addColorStop(0, 'rgba(39,30,59,' + al(0.5) + ')');
  body.addColorStop(1, 'rgba(9,6,14,' + al(0.7) + ')');
  c.beginPath();
  c.arc(cx, cy, R, 0, Math.PI * 2);
  c.fillStyle = body;
  c.fill();
  const air = c.createRadialGradient(cx, cy, R * 0.86, cx, cy, R * 1.12);
  air.addColorStop(0, 'rgba(' + G + ',0)');
  air.addColorStop(0.55, 'rgba(' + G + ',' + al(0.14) + ')');
  air.addColorStop(1, 'rgba(' + G + ',0)');
  c.beginPath();
  c.arc(cx, cy, R * 1.12, 0, Math.PI * 2);
  c.fillStyle = air;
  c.fill();

  // latitude and longitude lines, the far side fainter
  const front: [GP, GP][] = [], back: [GP, GP][] = [];
  const line = (pts: GP[]): void => { for (let i = 0; i < pts.length - 1; i++) ((pts[i][2] + pts[i + 1][2]) / 2 >= 0 ? front : back).push([pts[i], pts[i + 1]]); };
  for (let la = -60; la <= 60; la += 30) { const pts: GP[] = []; for (let lo = 0; lo <= 360; lo += 5) pts.push(P(sph(la * deg, lo * deg, 1))); line(pts); }
  for (let lo = 0; lo < 360; lo += 30) { const pts: GP[] = []; for (let la = -90; la <= 90; la += 5) pts.push(P(sph(la * deg, lo * deg, 1))); line(pts); }
  c.lineWidth = 1;
  for (const [list, a] of [[back, 0.035], [front, 0.11]] as [[GP, GP][], number][]) {
    c.beginPath();
    for (const [p, q] of list) { c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); }
    c.strokeStyle = 'rgba(' + G + ',' + al(a) + ')';
    c.stroke();
  }

  // land dots, fading and shrinking towards the rim; the far side shows faintly through the glass
  const dots = globeDots(), B = 7, bins: number[][] = [];
  for (let k = 0; k <= B; k++) bins.push([]);
  const r0 = Math.max(0.8, R * 0.0066);
  for (let i = 0; i < dots.length; i += 3) {
    const x = dots[i], y = dots[i + 1], z = dots[i + 2];
    const qx = m[0] * x + m[1] * y + m[2] * z, qy = m[3] * x + m[4] * y + m[5] * z, qz = m[6] * x + m[7] * y + m[8] * z;
    const k = D / (D - qz), px = cx + qx * R * k, py = cy - qy * R * k;
    if (qz < 0) { bins[0].push(px, py, r0 * 0.6); continue; }
    bins[1 + Math.min(B - 1, Math.floor(qz * B))].push(px, py, r0 * (0.5 + 0.5 * Math.sqrt(qz)));
  }
  bins.forEach((list, k) => {
    if (!list.length) return;
    c.beginPath();
    for (let i = 0; i < list.length; i += 3) { c.moveTo(list[i] + list[i + 2], list[i + 1]); c.arc(list[i], list[i + 1], list[i + 2], 0, Math.PI * 2); }
    c.fillStyle = 'rgba(234,215,166,' + al(k === 0 ? 0.07 : 0.16 + 0.7 * Math.pow((k - 0.5) / B, 0.8)) + ')';
    c.fill();
  });

  c.beginPath();
  c.arc(cx, cy, R, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(' + G + ',' + al(0.4) + ')';
  c.lineWidth = 1.2;
  c.stroke();

  // arcs from Hong Kong, lifted above the surface, with a bright head travelling along each one
  const dests = [[51.51, -0.13], [55.95, -3.19], [-37.81, 144.96]];
  const A = sph(22.32 * deg, 114.17 * deg, 1), secs = now / 1000;
  c.lineCap = 'round';
  dests.forEach((d, i) => {
    const Bv = sph(d[0] * deg, d[1] * deg, 1), om = Math.acos(Math.max(-1, Math.min(1, dot(A, Bv)))), lift = 0.08 + 0.26 * (om / Math.PI), N = 64, pts: GP[] = [];
    for (let k = 0; k <= N; k++) {
      const u = k / N, s1 = Math.sin((1 - u) * om) / Math.sin(om), s2 = Math.sin(u * om) / Math.sin(om), r = 1 + lift * Math.sin(Math.PI * u);
      pts.push(P([(A[0] * s1 + Bv[0] * s2) * r, (A[1] * s1 + Bv[1] * s2) * r, (A[2] * s1 + Bv[2] * s2) * r]));
    }
    for (let k = 0; k < N; k++) {
      const p = pts[k], q = pts[k + 1];
      c.beginPath();
      c.moveTo(p[0], p[1]);
      c.lineTo(q[0], q[1]);
      c.strokeStyle = 'rgba(' + G + ',' + al(hidden(p) ? 0.08 : 0.42) + ')';
      c.lineWidth = 1.2;
      c.stroke();
    }
    if (!still) {
      const T = 3.6, u = ((secs + i * 1.2) % T) / 2.4;
      if (u <= 1) {
        const k1 = Math.floor(u * N), k0 = Math.max(0, k1 - 14);
        for (let k = k0; k < k1; k++) {
          const p = pts[k], q = pts[k + 1], fk = (k - k0 + 1) / Math.max(1, k1 - k0);
          if (hidden(p)) continue;
          c.beginPath();
          c.moveTo(p[0], p[1]);
          c.lineTo(q[0], q[1]);
          c.strokeStyle = 'rgba(246,231,193,' + al(fk * 0.95) + ')';
          c.lineWidth = 2;
          c.stroke();
        }
        const hd = pts[Math.min(N, k1)];
        if (!hidden(hd)) { c.beginPath(); c.arc(hd[0], hd[1], 2.4, 0, Math.PI * 2); c.fillStyle = 'rgba(246,231,193,' + al(1) + ')'; c.fill(); }
      } else {
        const land = clamp((u - 1) / 0.35), e = pts[N];
        if (!hidden(e) && land < 1) {
          c.beginPath();
          c.arc(e[0], e[1], 3 + 12 * land, 0, Math.PI * 2);
          c.strokeStyle = 'rgba(' + G + ',' + al((1 - land) * 0.6) + ')';
          c.lineWidth = 1.2;
          c.stroke();
        }
      }
    }
    const e = pts[N];
    if (!hidden(e)) { c.beginPath(); c.arc(e[0], e[1], 2.8, 0, Math.PI * 2); c.fillStyle = 'rgba(' + G + ',' + al(0.95) + ')'; c.fill(); }
  });

  // Hong Kong
  const H0 = P(A);
  if (!hidden(H0)) {
    const pulse = still ? 0.5 : (secs % 2.2) / 2.2;
    c.beginPath();
    c.arc(H0[0], H0[1], 4 + 16 * pulse, 0, Math.PI * 2);
    c.strokeStyle = 'rgba(' + G + ',' + al((1 - pulse) * 0.7) + ')';
    c.lineWidth = 1.2;
    c.stroke();
    glow(c, H0[0], H0[1], 18, [[0, 'rgba(' + G + ',' + al(0.55) + ')'], [1, 'rgba(' + G + ',0)']]);
    c.beginPath();
    c.arc(H0[0], H0[1], 4, 0, Math.PI * 2);
    c.fillStyle = 'rgba(246,231,193,' + al(1) + ')';
    c.fill();
  }
}

export function initGlobe(root: HTMLElement): void {
  const canvas = root.querySelector<HTMLCanvasElement>('#cta-canvas');
  if (!canvas) return;
  let handle: Handle | null = null;
  handle = register({ canvases: [canvas], draw: (surfaces, f) => frameCta(surfaces[0], f, handle ? handle.seenAt : 0) });
}
