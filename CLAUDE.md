# CLAUDE.md — WSMath

## What this repo is

The marketing site for Winson Siu (WSMath), an international mathematics exam strategist in
Hong Kong. One long page with anchored sections, Next.js 16 App Router, statically exported
(`output: 'export'`), content as JSON in git, no server code, no admin panel.

The site was rebuilt from scratch in the client-approved design **v6.3.2 "The Movement, Gilded"**
(`docs/11-locked-design.md`). The rebuild lives on branch **`working/newdesign`**. `main` still
holds the legacy site, with its build output (`out/`) tracked and served in production — see
"Cutover and open items" below.

## Read these first

| Doc | What it answers | Status |
| --- | --- | --- |
| `docs/11-locked-design.md` | The locked design: palette, type, scale, section order, motion, a11y floor. §0 is the spec; everything after the superseded banner is Boundary history | **Current** |
| `docs/12-migration-deviations.md` | What the rebuild dropped, changed or restored, and what still awaits owner sign-off | **Current** |
| `docs/02-content-model.md` | Schema, token system, field-by-field migration map | Current |
| `docs/07-content-conflicts.md` | Published figures that are wrong. Migrate verbatim and flag; never "fix" | Current — items still open with the owner |
| `docs/01-legacy-audit.md`, `docs/03-reuse-inventory.md` | What the legacy site did and which algorithms were reimplemented from spec | Historical |
| `docs/06-design-foundation.md` | The original brief and the IA constraints that survived | **Superseded** by `docs/11` |

## Non-negotiables

1. **The content is the asset.** 93 student grade records, 28 testimonials in four written
   languages, 30 school names, 20 exam-board course codes, 8 FAQ answers, a privacy policy. None
   of it can be regenerated. It lives in `src/content/*.json`, migrated byte-for-byte: curly
   apostrophes (`’`), en/em dashes (`–` `—`), `·` and `•` separators, `→` arrows, emoji, all CJK,
   and the load-bearing `\n\n` in FAQ answers 4 and 7. Never retype it.
2. **The design is locked.** `docs/11-locked-design.md` §0 is the specification and the
   client-approved artifact `4820bc1c…` is the source of truth. Do not re-litigate it. Do not add
   a webfont. Deliberate departures from the comp are recorded in `docs/12`; add to that record
   rather than diverging silently.
3. **Every business fact is a token.** Prices, session minutes, lesson counts, student counts,
   tutoring hours, the tutor name, the WhatsApp number, the equipment list — all live in
   `src/content/settings.json` and are interpolated into copy as `{{token.path}}`. Resolution is
   strict: an unknown token throws and names the field it was written in.
4. **No admin panel, no auth, no server routes here.** Content is edited outside this repo and
   committed as JSON through a GitHub App. This repo owes that editor four things: the content
   JSON, `content.schema.json` (generated from Zod on every build), the `/preview` route (accepts
   a draft over `postMessage`), and build-on-push.
5. **Never commit build output.** `out/` is ignored on this branch. It is still tracked on
   `main` for a reason — see "Cutover and open items".
6. **WhatsApp deep links are the only conversion mechanism.** No form, no email, no booking.
   Every `wa.me` CTA carries `data-cta` and reports through `src/lib/cta-beacon.ts`.
7. **Keep the schema generic.** The editor renders whatever `content.schema.json` declares and
   knows nothing about heroes or testimonials. Site-specific concepts belong in the schema, never
   in the editor.

## Stack — decided 2026-07-25, do not re-litigate

- Next.js 16 App Router, React 19, TypeScript strict, `output: 'export'`, `trailingSlash: true`
- Tailwind v4 for utilities plus one plain CSS file per section or component. Every class is
  `mvt-` prefixed and every design token is declared on `.mvt-root`
- Radix primitives (dialog, accordion, tabs, avatar), `motion`, Embla carousel, lucide-react
- Zod 4 schemas in `src/content/schema/` are the single source of truth for content types and
  validation. `npm run generate:schema` runs on prebuild and emits `content.schema.json`
- No webfont: system serif for display, system sans for UI, system mono for data (docs/11 §0.3)
- Content: JSON in git, committed by the external editor through a GitHub App
- Host: **Cloudflare Pages** — free, commercial use permitted, no adapter for a static export.
  Not Vercel (Hobby is non-commercial). Cloudflare keeps DNS
- Media: Cloudflare Images and Cloudflare Stream are the decided services. The export currently
  ships local WebPs with `images.unoptimized`
- No database, no publish API, no Auth.js, no Cloudflare Access

## Layout and conventions

- `src/app/` (page, layout, `/preview`, robots, sitemap) · `src/components/{layout,sections,ui,seo}`
  · `src/lib/` (content loading, anchors, grades, pricing, results stats, tokens, CTA beacon)
  · `src/content/` (JSON plus Zod schema) · `scripts/` (schema generation, course-outline extraction)
- Section order: `nav · hero · about · courses · ribbon · packages · results · voices · faq · footer`.
  `page-view.tsx` renders the 2px `.mvt-edge` seam between sections; sections never do. Sections
  carry `id="mvt-s-<name>"`; content stores plain ids and `src/lib/anchors.ts` maps between them.
- Server Components by default. `"use client"` only for genuine interactivity, and every client
  island receives fully-computed props. The page works with JavaScript disabled.
- Content is loaded once at the page boundary (`src/lib/content.ts`) and passed down as props.
  No component imports a content file at module scope.
- Every collection item carries a stable `id`. Never key an asset filename off an array index.
- Numbers are numbers in JSON. Derived figures (pricing, results stats) are computed in `src/lib`.
- CJK `:lang()` rules set font family only, never `font-size` (docs/11 §0.3).
- Both dialogs portal into `.mvt-root`, never `<body>`, so tokens and reduced-motion apply.

## Commands

```bash
npm run dev                # :3000
npm run build              # prebuild regenerates content.schema.json, then exports to out/
npm run typecheck
npm run lint
npm run extract:outlines   # regenerates public/courses/*.webp from the PDFs in /courses
```

Environment (`.env.example`, both public, both optional): `NEXT_PUBLIC_CTA_ENDPOINT` (unset ⇒ the
beacon is a silent no-op) and `NEXT_PUBLIC_EDITOR_ORIGIN` (unset ⇒ any origin may post a draft into
`/preview`; set it before the editor goes live).

## Cutover and open items (as of 2026-09-03)

- **Cloudflare Pages project `wsmath` exists and is connected to GitHub `main`, but has no build
  step.** It uploads the committed `out/` as-is (last deploy 2026-07-25, 16 s after the push).
  `wsmath.com` and `wsmath.pages.dev` both serve that legacy build. Nothing has been pushed since
  2026-07-25 and `working/newdesign` has no upstream. Sequence: set the Pages build command
  `npm run build`, output `out`, Node 22 (add `.nvmrc`) → push `working/newdesign` and check its
  preview deployment → merge to `main`. Merging before the build command exists removes `out/`
  from `main` and deploys an empty site.
- **`courses/*.pdf`** (27.6 MB) are gitignored but still tracked. Untrack them in their own commit.
- **Loom → Cloudflare Stream.** `pages.json` still has `provider: "loom"`, whose pause overlay
  cannot be suppressed. `video-frame.tsx` already supports `stream`; it needs an upload and one
  field change.
- **CTA analytics are dark** until an endpoint exists for `NEXT_PUBLIC_CTA_ENDPOINT`.
- **Owner decisions** still open: `docs/07`, `docs/11` §8, and every "owner sign-off" row in
  `docs/12`.

## Working style

- The audit and the design are done. Trust `docs/`, but re-read the actual file before changing
  behaviour it describes.
- Legacy algorithms worth keeping (grade matrix, pricing derivation, carousel physics, scroll-spy
  tuning) are specced in `docs/03-reuse-inventory.md`. The rebuild reimplemented them from spec;
  never copy the old code.
- Content changes go through the schema first: add the field to the Zod schema, regenerate
  `content.schema.json`, then use it.
