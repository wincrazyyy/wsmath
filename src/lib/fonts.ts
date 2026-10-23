/*
 * Build-time: the Google Fonts stylesheets for the page (same families, axes and weights as the reference).
 *
 * The Chinese families are requested with `text=` so that only the glyphs the page uses download. Google's
 * unicode-range slicing alone pulls ~3 MB for the testimonials, because their characters land in dozens of slices.
 * The character sets are collected from the sources at build time, so new content can't fall outside the subset:
 *   Noto Serif TC (zh-Hant, zh-HK): the full text of every zh-Hant/zh-HK string (testimonials and lang="zh-…"
 *     elements in the markup, Latin and digits included, since those render in the Chinese face too), plus every other
 *     CJK character in the component markup and the content JSON outside the zh-Hans quotes.
 *     Weights 500 and 600 only ever set markup, so they get the markup's characters alone.
 *   Noto Serif SC (zh-Hans): the full text of the zh-Hans strings, and the 「」 the quotes are wrapped in.
 *
 * The hero name's face (Archivo) is not requested here: it is a static instance served from the site (Hero.astro,
 * scripts/name-font.mjs).
 *
 * Noto Sans Math is only a per-glyph fallback for canvas labels (after Noto Serif Display), so it gets a text=
 * subset of every non-ASCII character in the canvas sources (191 KB → a few KB).
 *
 * Noto Serif Display is requested over the axis ranges the page renders, not the full 62.5–100 / 300–800: the DOM
 * uses widths 75% and 87.5% at weights 400 and 600 (italic only at 400), and the canvases draw at the default 100%
 * width, weight 400. One canvas glyph (ˣ in "eˣ") pulls in the italic latin-ext slice, which is 389 KB over the full
 * axes and 118 KB over these.
 */
import fs from 'node:fs';
import path from 'node:path';
import testimonials from '../content/testimonials.json';
import type { TestimonialsFile, Voice } from '../content/types';

const CJK = /[\u2E80-\u2FFF\u3000-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/gu;
const QUOTE_MARKS = '「」';

const cjkOf = (text: string): Set<string> => new Set(text.match(CJK) ?? []);

const filesUnder = (dir: string, ext: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? filesUnder(p, ext) : p.endsWith(ext) ? [p] : [];
  });

const src = path.join(process.cwd(), 'src');
const read = (f: string): string => fs.readFileSync(f, 'utf8');
const sorted = (chars: Iterable<string>): string => [...new Set(chars)].sort().join('');

const components = filesUnder(path.join(src, 'components'), '.astro').map(read);
const t = testimonials as TestimonialsFile;
const voices: Voice[] = [...t.featured, ...t.rowA, ...t.rowB];
// A testimonial shows as its card's pull quote and in full behind "Read full".
const said = (v: Voice): string[] => [v.quote, v.full];
const simplified = voices.filter((v) => v.lang === 'zh-Hans').flatMap(said);
const traditional = voices.filter((v) => v.lang !== 'zh-Hans' && v.lang !== 'en').flatMap(said);

// Text written directly inside a lang="zh-…" element in the markup, e.g. <p lang="zh-HK">IA 高分攻略</p>. Latin
// letters, digits and spaces in these strings render in the Chinese face too, so the subset needs them.
const zhMarkup = (simplifiedOnly: boolean): string =>
  components
    .flatMap((c) => [...c.matchAll(/lang="(zh-[A-Za-z]+)"[^>]*>([^<{]*)</g)])
    .filter((m) => (m[1] === 'zh-Hans') === simplifiedOnly)
    .map((m) => m[2])
    .join('');

// Any other CJK character in the markup or the content (outside the zh-Hans quotes) renders in TC.
const elsewhere = [
  ...components,
  ...filesUnder(path.join(src, 'content'), '.json').map((f) => {
    let text = read(f);
    for (const q of simplified) text = text.split(JSON.stringify(q).slice(1, -1)).join('');
    return text;
  }),
].join('');

const math = sorted(
  filesUnder(path.join(src, 'scripts', 'canvases'), '.ts')
    .concat(filesUnder(path.join(src, 'scripts', 'lib'), '.ts'))
    .flatMap((f) => [...read(f)].filter((c) => c.codePointAt(0)! > 0x7f)),
);
const tc = sorted([...traditional.join(''), ...zhMarkup(false), ...cjkOf(elsewhere), ...QUOTE_MARKS]);
// The heavier TC weights only set markup (section lines, the hero line, tags), never a quote: give them the markup's
// characters alone, so the face the hero needs first is a fraction of the size.
const tcMarkup = sorted([...zhMarkup(false), ...cjkOf(components.join(''))]);
const sc = sorted([...simplified.join(''), ...zhMarkup(true), ...QUOTE_MARKS]);

const css2 = (query: string): string => `https://fonts.googleapis.com/css2?${query}&display=swap`;

/** The stylesheets as `<link>` URLs (the fallback when they can't be inlined). */
export const FONT_STYLESHEETS: string[] = [
  css2(
    'family=Noto+Serif+Display:ital,wdth,wght@0,75..100,400..600;1,75..100,400&family=Schibsted+Grotesk:ital,wght@0,400..700;1,400..700',
  ),
  css2(`family=Noto+Sans+Math&text=${encodeURIComponent(math)}`),
  css2(`family=Noto+Serif+TC:wght@400&text=${encodeURIComponent(tc)}`),
  css2(`family=Noto+Serif+TC:wght@500;600&text=${encodeURIComponent(tcMarkup)}`),
  css2(`family=Noto+Serif+SC:wght@400;500&text=${encodeURIComponent(sc)}`),
];

/*
 * The same stylesheets fetched once at build time, to inline in <head>. That takes four render-blocking requests to
 * a second origin off the critical path; the font files still come from fonts.gstatic.com. Google tailors the CSS to
 * the user agent, so ask as a current Chrome to get the woff2 rules every supported browser uses. If the fetch fails
 * (offline build), return null and the page falls back to the <link>s.
 */
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
let inlined: Promise<string | null> | undefined;

export function inlineFontCss(): Promise<string | null> {
  inlined ??= Promise.all(
    FONT_STYLESHEETS.map(async (url) => {
      const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(10_000) });
      const css = await res.text();
      if (!res.ok || !css.includes('@font-face')) throw new Error(`${res.status} for ${url}`);
      return css.replace(/\/\*[^*]*\*\//g, '').replace(/\s*\n\s*/g, '');
    }),
  )
    .then((parts) => parts.join(''))
    .catch((err: unknown) => {
      console.warn(`[fonts] inlining the Google Fonts CSS failed, falling back to <link>s: ${String(err)}`);
      return null;
    });
  return inlined;
}
