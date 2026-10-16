// Draws the WSMath brand art, all on the same 32-unit grid so the pieces match exactly:
//
//   public/favicon.svg          the icon (WS) as a rounded 32-unit tile, with heavier strokes for tab sizes
//   src/assets/brand/icon.svg   the icon (WS) as full-bleed art for app icons; the mark is in <g id="mark">
//   src/assets/brand/logo.svg   the full logo (WSMath), used by the header and footer (ui/Wordmark.astro)
//
// The mark is a W drawn as a radical sign (a tick, then a W whose last stroke rises to the bar) over a Didone integral
// sign, the long S: W and S, Winson Siu. The full logo runs the radical's bar on over "Math", set in the site's display
// face (Noto Serif Display italic) and outlined, so the logo never waits for a web font or changes with one.
//
// Needs network (the face is fetched from Google Fonts, as the build does). After running it, rebuild the raster
// icons from the new art: npm run brand && npm run icons
import { writeFile } from 'node:fs/promises';
import opentype from 'opentype.js';
import { closestApproach, glyphPoints, integral, pathPoints, polyOutline } from './brand/shapes.mjs';

const BG = '#07050A';
const GOLD = '#CDA968';
const CREAM = '#F3ECE1';

// The radical: tick, W, the rise to the bar, and the bar. B is the baseline (the W's points), T the bar's centre line.
const B = 25.8;
const T = 6.4;
const rootPts = (barEnd) => [[4.0, 17.2], [6.9, 15.5], [10.3, B], [13.5, 12.6], [16.8, B], [21.6, T], [barEnd, T]];
const cuts = [null, { y: B, dir: 1 }, { y: 11.7, dir: -1 }, { y: B, dir: 1 }, null];
const root = (thick, thin, barEnd = 28.2) => polyOutline(rootPts(barEnd), [thin, thick, thin, thick, thin, thin], cuts);
// The integral sits under the bar, its tail tucked under the W's last stroke.
const box = { x0: 21.0, y0: 10.0, x1: 27.8, y1: 25.6 };

// Tab tile: heavier strokes, since it is mostly seen at 16–32 pixels.
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${BG}"/><path fill="${GOLD}" d="${root(3.0, 1.7)}"/><path fill="${CREAM}" d="${integral({ ...box, thick: 2.6, thin: 1.1, ball: 1.12, N: 14 })}"/></svg>\n`;

// App icon art and the logo share these weights.
const ROOT_THICK = 2.6;
const ROOT_THIN = 1.0;
const INTEGRAL = { ...box, thick: 2.3, thin: 0.75, ball: 1.0, N: 40 };
const integralPath = integral(INTEGRAL);

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><radialGradient id="lamp" cx="0.42" cy="0.4" r="0.75"><stop offset="0" stop-color="#1A1228"/><stop offset="0.55" stop-color="#0D0914"/><stop offset="1" stop-color="${BG}"/></radialGradient></defs><rect width="32" height="32" fill="url(#lamp)"/><g id="mark"><path fill="${GOLD}" d="${root(ROOT_THICK, ROOT_THIN)}"/><path fill="${CREAM}" d="${integralPath}"/></g></svg>\n`;

/*
 * The full logo. "Math" is italic, so its slant runs with the integral's and the two read as one word, ∫Math; weight
 * 500 matches the integral's stem. Its cap line is at CAP_TOP, so the integral rises above it like a long s, under
 * a bar that clears the h. The integral and the M are as close as the font sets its own M and a (measured at the
 * closest point, row by row), and the bar runs BAR_PAST beyond the h.
 */
const CAP_TOP = 11.6;
const BAR_PAST = 0.7;
const css = await (await fetch('https://fonts.googleapis.com/css2?family=Noto+Serif+Display:ital,wdth,wght@1,87.5,500&text=Math')).text();
const fontUrl = css.match(/url\((https:[^)]+)\)/)?.[1];
if (!fontUrl) throw new Error(`No font URL in the Google Fonts response:\n${css.slice(0, 300)}`);
const font = opentype.parse(await (await fetch(fontUrl)).arrayBuffer());
const size = (B - CAP_TOP) / (font.tables.os2.sCapHeight / font.unitsPerEm);

const [M, a] = font.stringToGlyphs('Math');
const fontGap = closestApproach(glyphPoints(M.getPath(0, B, size).commands), glyphPoints(a.getPath((M.advanceWidth * size) / font.unitsPerEm + (font.getKerningValue(M, a) * size) / font.unitsPerEm, B, size).commands));
const mathX = fontGap - closestApproach(pathPoints(integralPath), glyphPoints(M.getPath(0, B, size).commands));
const math = font.getPath('Math', mathX, B, size, { kerning: true });
const mathBox = math.getBoundingBox();
const rootPath = root(ROOT_THICK, ROOT_THIN, mathBox.x2 + BAR_PAST);

// The view box is the ink's bounds, so the logo can be placed by its edges.
const ink = [...pathPoints(rootPath), ...pathPoints(integralPath), [mathBox.x1, mathBox.y1], [mathBox.x2, mathBox.y2]];
const xs = ink.map((p) => p[0]);
const ys = ink.map((p) => p[1]);
const x0 = Math.floor(Math.min(...xs) * 100) / 100;
const y0 = Math.floor(Math.min(...ys) * 100) / 100;
const x1 = Math.ceil(Math.max(...xs) * 100) / 100;
const y1 = Math.ceil(Math.max(...ys) * 100) / 100;
const r2 = (n) => +n.toFixed(2);
const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${r2(x1 - x0)} ${r2(y1 - y0)}"><path fill="${GOLD}" d="${rootPath}"/><path fill="${CREAM}" d="${integralPath}"/><path fill="${CREAM}" d="${math.toPathData(2)}"/></svg>\n`;

const root_ = new URL('../', import.meta.url);
for (const [file, svg] of [['public/favicon.svg', favicon], ['src/assets/brand/icon.svg', icon], ['src/assets/brand/logo.svg', logo]]) {
  await writeFile(new URL(file, root_), svg);
  console.log(`${file.padEnd(28)} ${svg.length} B`);
}
console.log(`logo: ${r2(x1 - x0)} × ${r2(y1 - y0)} units, "Math" at ${r2(size)} units (M→a gap ${r2(fontGap)})`);
