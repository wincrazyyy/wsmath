// Builds the site's icon files in public/ from the two drawn sources:
//
//   public/favicon.svg          the 32-unit tile shown in browser tabs; also rasterised into favicon.ico (16, 32, 48)
//                               for browsers and crawlers that ask for /favicon.ico
//   src/assets/brand/icon.svg   the full-bleed art for app icons: apple-touch-icon.png (180), icon-192.png and
//                               icon-512.png (the web manifest, and the logo in the page's structured data), and
//                               icon-maskable-512.png, its mark shrunk into the centre circle Android may crop to
//
// Run after changing either source: npm run icons
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const pub = new URL('public/', root);
const favicon = await readFile(new URL('favicon.svg', pub));
const icon = await readFile(new URL('src/assets/brand/icon.svg', root), 'utf8');

/** Rasterise a 32-unit SVG at size × size, drawn at 4× and scaled down for clean edges at small sizes. */
const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: (72 * size * 4) / 32 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();

/** An .ico holding PNG images (supported everywhere .ico still matters). */
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(({ size, data }, i) => {
    const at = 6 + 16 * i;
    head.writeUInt8(size >= 256 ? 0 : size, at);
    head.writeUInt8(size >= 256 ? 0 : size, at + 1);
    head.writeUInt16LE(1, at + 4); // colour planes
    head.writeUInt16LE(32, at + 6); // bits per pixel
    head.writeUInt32LE(data.length, at + 8);
    head.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...images.map((im) => im.data)]);
}

// Android's maskable icons are cropped to as little as the centre circle of 80% diameter: shrink the mark to fit it.
const MARK = '<g id="mark">';
if (!icon.includes(MARK)) throw new Error(`src/assets/brand/icon.svg needs its mark wrapped in ${MARK}`);
const maskable = icon.replace(MARK, '<g id="mark" transform="translate(16 16) scale(0.76) translate(-16 -16)">');

const files = {
  'favicon.ico': ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(favicon, size) })))),
  'apple-touch-icon.png': await png(icon, 180),
  'icon-192.png': await png(icon, 192),
  'icon-512.png': await png(icon, 512),
  'icon-maskable-512.png': await png(maskable, 512),
};
for (const [name, data] of Object.entries(files)) {
  await writeFile(new URL(name, pub), data);
  console.log(`${name.padEnd(22)} ${(data.length / 1024).toFixed(1)} KB`);
}
