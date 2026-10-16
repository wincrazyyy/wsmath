/* Colour and glow helpers, ported from home.js (_glow, _rgb, _gold). */

/** The design's gold accent (the reference exposes it as a tweak; production uses the default). */
export const GOLD = '#CDA968';

export const rgb = (hex: string): [number, number, number] => {
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** "205,169,104": the gold as an rgba() channel list, the form every canvas module builds its colours from. */
export const GOLD_RGB = rgb(GOLD).join(',');

export type Stop = [number, string];

export const glow = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, stops: Stop[]): void => {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  stops.forEach((st) => g.addColorStop(st[0], st[1]));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
};
