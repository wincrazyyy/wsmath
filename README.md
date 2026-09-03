# WSMath

Marketing site for Winson Siu — international mathematics exam strategist, Hong Kong.
Single page, statically exported, in the locked v6.3.2 "The Movement, Gilded" design
(`docs/11-locked-design.md` §0). The rebuild lives on `working/newdesign`; `main` still
holds the legacy site.

**WhatsApp deep links are the only conversion mechanism on this site.** There is no
contact form, no email capture and no booking system. Treat every `wa.me` CTA as the
funnel and instrument it (`src/lib/cta-beacon.ts`).

## Stack

- **Next.js** (App Router, RSC-first) + **TypeScript strict**, `output: 'export'`
- **Tailwind v4**, plus one plain global stylesheet per section
- **Zod** schemas as the single source of truth for content types and validation
- **Content is JSON in git** (`src/content/*.json`) — no database, no publish API
- **No webfont** — system serif for display, system sans for UI, system mono for data
  (`docs/11-locked-design.md` §0.3). Do not add one.

Server Components by default. `"use client"` only for genuine interactivity, and every
client island receives fully-computed props — the results matrix, ledger, distribution
and summary cards are built at build time and are complete in the prerendered HTML.
**The site works with JavaScript disabled.**

## Commands

```bash
npm run dev          # develop on :3000
npm run build        # prebuild regenerates content.schema.json, then exports to out/
npm run typecheck    # tsc --noEmit
npm run lint         # eslint (flat config)
```

`npm run build` runs `generate:schema` first, so `content.schema.json` is regenerated
from the Zod schemas on every build and the two cannot drift.

## ⚠️ `out/` is ignored here, but still tracked on `main` and served from there

On this branch `/out/` is in `.gitignore` and untracked. On `main` the build output is
still committed and **the live site is currently served from it**. That is why the
cutover is a **sequenced** job. Do these in order; doing them out of order takes the
site down:

1. The Pages project `wsmath` is already connected to GitHub `main` but has **no build
   step** — it uploads the committed `out/` as-is. Set build command `npm run build`,
   output directory `out`, Node 22 (add an `.nvmrc`).
2. Push `working/newdesign` and verify its preview deployment builds green and matches.
3. **Only then** merge `working/newdesign` into `main`. That merge removes `out/` from
   `main`; with no host connected there would be nothing left to serve.

Until step 3 lands, a content-only commit changes `src/content/*.json` and leaves the
served `out/` stale — a content edit (GitHub App commit → host builds → live) changes
nothing the public sees.

`courses/*.pdf` (27.6 MB of owner source material) are also gitignored but still
tracked. Untrack them in their own commit; `public/courses/*.webp` are the durable output.

## Editing

**This repo ships no admin panel.** Content is edited outside this repo and committed
as JSON through a GitHub App. What this repo owes that editor is a four-part contract:

| Leg | Artifact |
| --- | --- |
| Content | `src/content/*.json`, twelve documents |
| Schema | `content.schema.json` at the repo root, generated from Zod |
| Preview | `/preview` — accepts a draft over `postMessage`, renders it, replies |
| Build | a build triggered by a push to `main` — **see the section above** |

Every hardcoded business fact is a **token**. Prices, session minutes, lesson counts,
student counts, tutoring hours, the tutor name, the WhatsApp number and the equipment
list all live in `src/content/settings.json` and are interpolated into copy as
`{{token.path}}`. Nothing is retyped. Resolution is strict — an unknown token throws
and names the field it was written in.

## Environment

Copy `.env.example` to `.env.local`. Both values are optional and both are public
(`NEXT_PUBLIC_*` is inlined into the export at build time — never put a secret there).

- `NEXT_PUBLIC_CTA_ENDPOINT` — where WhatsApp CTA clicks are reported. Unset ⇒ the
  beacon is a silent no-op.
- `NEXT_PUBLIC_EDITOR_ORIGIN` — the one origin allowed to post a draft into
  `/preview`. Unset ⇒ any origin may. **Set this before the editor goes live.**

## Documentation

Read `docs/` before changing behaviour. Start with `CLAUDE.md`, which ranks the docs by
what is current and what is superseded. The ones that bite:

- `docs/11-locked-design.md` — the locked design. Palette, type, scale, a11y floor.
- `docs/02-content-model.md` — schema, tokens, the field-by-field migration map.
- `docs/07-content-conflicts.md` — **known-bad published data.** Migrate verbatim and
  flag; do not "fix" it. Several items are still open with the owner.
- `docs/12-migration-deviations.md` — what the rebuild dropped, changed or restored,
  and what still needs owner sign-off.

## Content provenance

`src/content/*.json` was generated from the pre-rebuild `src/app/_lib/content/json/`
tree by a one-shot migration script. Both the legacy tree and the script
(`scripts/migrate-legacy-content.ts`) were removed on this branch — the script read a
directory that no longer exists and could never run again.

The content is the asset: 93 real student grade records, 28 testimonials in four
written languages, 30 school names, 20 exam-board course codes, 8 FAQ answers and a
privacy policy. **None of it can be regenerated.** It is migrated byte-for-byte,
including curly apostrophes (’), en/em dashes (– —), `·` and `•` separators, `→`
arrows, emoji, all CJK, and the load-bearing `\n\n` in FAQ answers 4 and 7. If you need
to audit the migration, recover the legacy tree from git history.
