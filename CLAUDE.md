# WSMath site

Single-page site for Winson Siu's maths coaching (Hong Kong and online). Astro (static) + TypeScript, no UI framework.

## Source of truth

- `design/reference/` is the finished design as a working page. Open `design/reference/index.html` (or the locked `phone-390.html`, `ipad-portrait-820.html`, `ipad-landscape-1180.html`, `desktop-1440.html`) to see any layout or behaviour.
- `design/PLAN.md` is the build plan. Follow its phases (§14) and finish its checklist (§15).
- `design/screens/` has screenshots of every section on every device.
- `design/spec/content/*.json` is the design's sample content, not the site's data (see Real data below);
  `design/spec/tokens.css` holds the tokens.

## Real data: never lost in a rework

`src/content/results.json` and `src/content/testimonials.json` are real records: every exam result Winson has on
record and every testimonial a student gave him. They are not design content. A redesign, migration or refactor
must carry every record across unchanged. This rule outranks matching the reference.

- **Count before you merge.** On 2026-10-22: 114 results (106 students) and 28 testimonials. If a rework ends with
  fewer, it has lost data: stop and find it. Earlier versions: `git log -p -- src/content/`, and before the Astro
  rebuild `git show 7b62174:src/content/students.json` and `7b62174:src/content/testimonials.json`.
- **Never fit the data to a design.** Don't drop, filter, sample, shorten or reword records because a layout holds
  fewer or shorter ones; change the layout instead (the results towers slide, "All named results" scrolls in its
  own box, each card's "Read full" opens the whole testimonial). The October 2026 redesign copied its sample
  content and shipped 29 of the 114 results with every quote cut to an excerpt; that is the failure this rule
  exists to prevent.
- **Quotes are verbatim.** `full` is the testimonial as the student gave it. A card's `quote` may only be cut from
  it, with cuts marked "…"; the build fails otherwise.
- **Figures are counted, not typed.** The Results stats, "Results by course" and "All named results" are computed
  from `results.json`. Don't hard-code a count.
- **Winson decides.** Removing a record, or choosing between two sources that disagree (a year, a grade), is his
  call. Ask, and say whose decision it was in the commit message.

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
