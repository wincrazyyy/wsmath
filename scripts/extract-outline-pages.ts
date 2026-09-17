/**
 * Render the owner's three course-outline PDFs to the eleven `.webp` pages the
 * board cards and the outline viewer use.
 *
 * The PDFs themselves are **not tracked** (`.gitignore` → `/courses/`): they are
 * input material used once, 27.6 MB of it, on a repo whose entire deploy trigger
 * is a push. This script is what makes that safe — the pipeline is reproducible
 * from the repo, so re-exporting after an owner edit (see the QR-code question
 * in `spec/course-merge-design.md` §7.6) is one command rather than an
 * archaeology exercise.
 *
 *     npm run extract:outlines -- --probe        # report page sizes, write nothing
 *     npm run extract:outlines                   # write public/courses/**.webp
 *
 * Two rules it enforces, both from CLAUDE.md:
 *
 * 1. **Filenames are course ids, never page ordinals.** A page ordinal is an
 *    array index, and keying an asset off an index is the most dangerous latent
 *    bug in the legacy system. `PAGES` below maps each board's page order to the
 *    `variants[].id` in `src/content/packages.json`; `crossCheck` asserts the
 *    same relationship from the other side, so a rename in either place fails
 *    the build rather than silently serving the wrong document.
 * 2. **The covers ship (owner, 2026-09-17).** Page 1 of each PDF is the
 *    marketing cover, carrying `No.1 …` and `超過 75% 學生勇奪 A/A* 佳績` at
 *    ~200px type. The first build dropped them because rendering a claim as an
 *    image publishes it as surely as typing it and those claims are unverified
 *    (docs/07); the owner asked for the covers back, so they render as
 *    `cover.webp` and the concern stands recorded in docs/12 §J.
 *
 * `pdf-to-img` and `sharp` are devDependencies: `next.config.ts` sets
 * `images:{unoptimized:true}` on an `output:'export'` build, so sharp has no
 * runtime or build-time role on this site — it exists for this script alone.
 */
import fs from "node:fs/promises";
import path from "node:path";

import { pdf } from "pdf-to-img";
import sharp from "sharp";

/** Rendered width in px. The viewer paints ~813 CSS px at 2560, so this is 2x-ish. */
const TARGET_WIDTH = 1500;
const QUALITY = 82;

const SOURCE_DIR = path.join(process.cwd(), "courses");
const OUTPUT_DIR = path.join(process.cwd(), "public", "courses");

interface Job {
  /** Output folder under `public/courses/`, and the package id. */
  readonly board: string;
  /** The owner's PDF, in `courses/`. */
  readonly file: string;
  /**
   * Output ids in PDF page order, starting at page 1: `cover`, then the course
   * ids, which must match `variants[].id` for this package in `packages.json`.
   */
  readonly pages: readonly string[];
}

const JOBS: readonly Job[] = [
  { board: "ibdp", file: "IBDP Course Outline.pdf", pages: ["cover", "aasl", "aahl", "aisl", "aihl"] },
  { board: "ial", file: "IAL Course Outline.pdf", pages: ["cover", "ial-math"] },
  { board: "igcse", file: "IGCSE Course Outline.pdf", pages: ["cover", "0607", "0606", "4ma1"] },
];

/** The byte table this pipeline produced, so a re-run is verifiable against it. */
const EXPECTED_BYTES: Readonly<Record<string, number | undefined>> = {
  "ibdp/cover.webp": 153_564,
  "ibdp/aasl.webp": 190_014,
  "ibdp/aahl.webp": 227_218,
  "ibdp/aisl.webp": 188_378,
  "ibdp/aihl.webp": 238_908,
  "ial/cover.webp": 147_648,
  "ial/ial-math.webp": 199_228,
  "igcse/cover.webp": 140_600,
  "igcse/0607.webp": 226_456,
  "igcse/0606.webp": 197_988,
  "igcse/4ma1.webp": 224_776,
};

function argValue(flag: string, fallback: string): string {
  const argv = process.argv.slice(2);
  const at = argv.indexOf(flag);
  const next = at >= 0 ? argv.at(at + 1) : undefined;
  return next ?? fallback;
}

async function naturalWidth(source: string): Promise<number> {
  const probe = await pdf(source, { scale: 1 });
  for await (const page of probe) {
    const meta = await sharp(page).metadata();
    return meta.width ?? 0;
  }
  return 0;
}

async function run(): Promise<void> {
  const probeOnly = process.argv.slice(2).includes("--probe");
  const width = Number(argValue("--width", String(TARGET_WIDTH)));
  const quality = Number(argValue("--quality", String(QUALITY)));

  let total = 0;
  const drift: string[] = [];

  for (const job of JOBS) {
    const source = path.join(SOURCE_DIR, job.file);
    const outDir = path.join(OUTPUT_DIR, job.board);

    // Render at a scale that lands at or just above the target, then downsample
    // with sharp — never upscale, which would only add bytes.
    const natural = await naturalWidth(source);
    const scale = natural > 0 ? Math.max(1, Math.ceil((width / natural) * 100) / 100) : 1;
    console.log(`${job.board}: ${natural}pt wide → render scale ${scale} → resize ${width}px q${quality}`);
    if (probeOnly) continue;

    await fs.mkdir(outDir, { recursive: true });

    const document = await pdf(source, { scale });
    let ordinal = 0;
    for await (const buffer of document) {
      ordinal += 1;
      const id = job.pages.at(ordinal - 1);
      if (id === undefined) {
        throw new Error(
          `${job.file}: page ${ordinal} has no id in JOBS.pages. ` +
            `Add it, or the page is one the site does not sell.`,
        );
      }

      const target = path.join(outDir, `${id}.webp`);
      const info = await sharp(buffer)
        .resize({ width, withoutEnlargement: true, fit: "inside" })
        .webp({ quality, effort: 6 })
        .toFile(target);

      total += info.size;
      const key = `${job.board}/${id}.webp`;
      const expected = EXPECTED_BYTES[key];
      const delta = expected === undefined ? "" : ` (was ${(expected / 1024).toFixed(0)} KB)`;
      if (expected !== undefined && Math.abs(info.size - expected) > expected * 0.05) {
        drift.push(`${key}: ${info.size} B vs ${expected} B recorded`);
      }
      console.log(`  ${id}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB${delta}`);
    }

    if (!probeOnly && ordinal !== job.pages.length) {
      throw new Error(`${job.file}: ${ordinal} page(s), but ${job.pages.length} id(s) declared.`);
    }
  }

  if (probeOnly) return;

  console.log(`\nTOTAL ${(total / 1024 / 1024).toFixed(2)} MB`);
  if (drift.length > 0) {
    console.log("\nSize drift against the recorded table (re-check the source PDFs):");
    for (const line of drift) console.log(`  - ${line}`);
  }
}

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
