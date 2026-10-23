// Builds the face the hero name is set in, src/assets/fonts/archivo-name.woff2: Archivo at width 62 and weight 800 as
// a static face (no variation axes left), holding only the letters of HERO_NAME (src/lib/site.ts) in both cases. Next
// to it, archivo-name.json records those letters; Hero.astro fails the build if the name has letters the face lacks.
//
// Why static: Google serves Archivo with its width axis live (62–125) and leaves the browser to apply font-stretch.
// WebKit's Windows build spaces the letters for width 62 but draws them at 100, so they overlap; a face with the
// width baked in draws the same in every engine. Served from the site, it can also be preloaded (Base.astro).
//
// Needs network (the face comes from Google Fonts, as the build's do). Run it after changing HERO_NAME:
// npm run font:name
import { writeFile } from 'node:fs/promises';
import subsetFont from 'subset-font';
import { HERO_NAME } from '../src/lib/site.ts';

// Google tailors its CSS to the user agent; as a current Chrome it serves woff2.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const AXES = { wdth: 62 };

const text = [...new Set(HERO_NAME + HERO_NAME.toUpperCase())].sort().join('');
const cssUrl = `https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@${AXES.wdth},800&text=${encodeURIComponent(text)}`;
const css = await (await fetch(cssUrl, { headers: { 'user-agent': UA } })).text();
const src = css.match(/src:\s*url\(([^)]+)\)\s*format\('woff2'\)/)?.[1];
if (!src) throw new Error(`No woff2 in Google's response for ${cssUrl}:\n${css}`);
const source = Buffer.from(await (await fetch(src)).arrayBuffer());

const face = await subsetFont(source, text, { targetFormat: 'woff2', variationAxes: AXES });
await writeFile(new URL('../src/assets/fonts/archivo-name.woff2', import.meta.url), face);
await writeFile(new URL('../src/assets/fonts/archivo-name.json', import.meta.url), `${JSON.stringify({ text }, null, 2)}\n`);
console.log(`src/assets/fonts/archivo-name.woff2  "${text}"  ${face.length} bytes`);
