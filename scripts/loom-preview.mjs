// Fetches the preview of the Loom video linked from the testimonials (src/content/testimonials.json → video.url) and
// writes it to src/assets/video/, named after the video id:
//
//   <id>-800.webp, <id>-1024.webp   the short animated preview Loom plays on its own pages, as animated WebP
//   <id>.jpg                        Loom's still thumbnail, shown instead under prefers-reduced-motion
//
// Students.astro picks these up by id, so a changed link without a re-run falls back to the plain card (and the build
// warns) rather than showing the old video's preview. Run after changing the link: npm run video:preview
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const { video } = JSON.parse(await readFile(new URL('src/content/testimonials.json', root), 'utf8'));
const id = new URL(video.url).pathname.split('/').filter(Boolean).pop();
const out = new URL('src/assets/video/', root);

const get = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res;
};

const oembed = await (await get(`https://www.loom.com/v1/oembed?url=${encodeURIComponent(video.url)}`)).json();
if (!/\.gif$/.test(oembed.thumbnail_url ?? '')) throw new Error(`Unexpected Loom thumbnail: ${oembed.thumbnail_url}`);
const gif = Buffer.from(await (await get(oembed.thumbnail_url)).arrayBuffer());
const still = Buffer.from(await (await get(oembed.thumbnail_url.replace(/\.gif$/, '.jpg'))).arrayBuffer());

await mkdir(out, { recursive: true });
for (const width of [800, 1024]) {
  const webp = await sharp(gif, { animated: true }).resize({ width, withoutEnlargement: true }).webp({ quality: 65, effort: 6 }).toBuffer();
  await writeFile(new URL(`${id}-${width}.webp`, out), webp);
  console.log(`${id}-${width}.webp  ${(webp.length / 1024).toFixed(0)} KB`);
}
await writeFile(new URL(`${id}.jpg`, out), still);
console.log(`${id}.jpg  ${(still.length / 1024).toFixed(0)} KB  ("${oembed.title}", ${Math.round(oembed.duration)} s)`);
