// Renders the share image (og:image: WhatsApp, Facebook, LinkedIn, X, iMessage previews) from the site's own hero,
// so it always matches the page: the first screen at 1200×630, drawn at 2× and scaled down, as
// src/assets/og.jpg. Base.astro imports it, so the published URL carries a content hash and link-preview caches
// fetch the new image whenever it changes.
//
// Needs the built site running: npm run build && npm run preview, then npm run og:image [url]
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import sharp from 'sharp';

const url = process.argv[2] ?? 'http://localhost:4321/';
const out = new URL('../src/assets/og.jpg', import.meta.url);
// WhatsApp skips preview images over about 300 KB.
const MAX_BYTES = 300 * 1024;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  await page.goto(url, { waitUntil: 'networkidle' });
  // The fixed overlays (section rail, WhatsApp button) are page furniture, not part of the picture.
  await page.addStyleTag({ content: '.rail, .wa { display: none !important; }' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const photo = document.querySelector('#hero-photo');
    if (photo instanceof HTMLImageElement && !photo.complete) await new Promise((r) => photo.addEventListener('load', r, { once: true }));
  });
  await page.waitForTimeout(500);
  const shot = await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } });
  const jpg = await sharp(shot).resize(1200, 630).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  if (jpg.length > MAX_BYTES) throw new Error(`og.jpg is ${(jpg.length / 1024).toFixed(0)} KB; WhatsApp needs it under 300 KB`);
  await writeFile(out, jpg);
  console.log(`src/assets/og.jpg  1200×630  ${(jpg.length / 1024).toFixed(0)} KB`);
} finally {
  await browser.close();
}
