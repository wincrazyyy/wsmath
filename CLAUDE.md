# WSMath site

Single-page site for Winson Siu's maths coaching (Hong Kong and online). Astro (static) + TypeScript, no UI framework.

## Source of truth

- `design/reference/` is the finished design as a working page. Open `design/reference/index.html` (or the locked `phone-390.html`, `ipad-portrait-820.html`, `ipad-landscape-1180.html`, `desktop-1440.html`) to see any layout or behaviour.
- `design/PLAN.md` is the build plan. Follow its phases (§14) and finish its checklist (§15).
- `design/screens/` has screenshots of every section on every device.
- `design/spec/content/*.json` holds the structured content; `design/spec/tokens.css` the tokens.

## Rules

- Match the reference. Don't redesign, don't change or add copy, keep every Chinese string and its `lang` attribute.
- Keep the section ids (`top`, `about`, `packages`, `ia`, `results`, `students`, `faq`, `contact`), the `<footer>`, and the anchor ids in PLAN.md §2.
- Put state styling in CSS (`[aria-pressed]`, `[aria-expanded]`, classes), not inline styles.
- Every canvas registers with `src/scripts/lib/motion.ts`: drawn only while visible, DPR capped at 2, one still frame under reduced motion.
- Breakpoints are container queries on the page root (`container: wsm / inline-size`) with `cqi` sizes, as in the reference.
- Don't port `design/reference/app/dc-lite.js` or `boot.js`; they only make the reference run.

## Commands

- `npm run dev` serves on http://localhost:4321
- `npm run build && npm run preview`
- `node design/tools/compare.mjs --build http://localhost:4321/` compares every section at 390/820/1180/1440 (add `--motion` to compare with animation). Open `compare/index.html`.
