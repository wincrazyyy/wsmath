/*
 * The floating WhatsApp button's solid (WhatsAppFloat.astro): the hero's glass-and-gold icosahedron at medallion
 * size, turning slowly about a gently rocking tilt over a soft gold glow. Hover or focus spins it up and brightens
 * the glow, easing back after. Under reduced motion it is one still frame (motion.ts).
 */
import { mul, rx, ry } from '../lib/math3d';
import { register } from '../lib/motion';
import { GOLD, glow, rgb } from '../lib/paint';
import { drawSolid, solid } from '../lib/solids';

const G = rgb(GOLD);
const REST = 0.5; // rad/s
const EAGER = 2.2;

export function initWhatsAppSolid(link: HTMLElement, canvas: HTMLCanvasElement): void {
  let angle = 0.7;
  let speed = REST;
  let target = REST;
  let lift = 0; // 0 at rest, 1 hovered
  let liftTarget = 0;

  const scene = register({
    canvases: [canvas],
    tick(f) {
      const k = Math.min(1, f.dt * 4);
      speed += (target - speed) * k;
      lift += (liftTarget - lift) * Math.min(1, f.dt * 6);
      angle += speed * f.dt;
    },
    draw([s], f) {
      const { ctx, w, h, dpr } = s;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2 + (f.still ? 0 : Math.sin(f.t * 1.4) * 1.2);
      const gold = G.join(',');
      glow(ctx, cx, cy, w * 0.5, [[0, `rgba(${gold},${(0.14 + 0.16 * lift).toFixed(3)})`], [1, `rgba(${gold},0)`]]);
      const m = mul(rx(0.45 + (f.still ? 0 : Math.sin(f.t * 0.6) * 0.1)), ry(angle));
      drawSolid(ctx, solid('ico'), m, cx, cy, w * (0.29 + 0.02 * lift), G, { alpha: 1 }, 1, dpr);
    },
  });

  const on = (): void => {
    target = EAGER;
    liftTarget = 1;
    scene.redraw();
  };
  const off = (): void => {
    target = REST;
    liftTarget = 0;
    scene.redraw();
  };
  link.addEventListener('pointerenter', on);
  link.addEventListener('pointerleave', off);
  link.addEventListener('focus', on);
  link.addEventListener('blur', off);
}
