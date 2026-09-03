# 03 — Reuse Inventory

What carries over verbatim, what is reimplemented from a spec, and what is deleted.

**Legend**
- 🟢 **Verbatim** — migrate byte-for-byte, do not rewrite
- 🟡 **Spec** — the *behaviour* is worth keeping; reimplement with modern libraries from the spec below
- 🔴 **Delete** — do not carry forward

---

## 1. 🟢 Content — the entire commercial value of the site

**All 1,509 lines of JSON across the seven files.** This is the whole reason a rewrite is worth
doing rather than starting a new site.

| What | Volume | Why it cannot be regenerated |
| --- | --- | --- |
| Student grade records | **93** rows across 6 programmes | Real named outcomes with years, grades and durations |
| Testimonials | **28** (4 featured + 24 carousel) | Written by real students in English, Traditional Chinese, Simplified Chinese and colloquial Cantonese |
| Schools | **30** | Hong Kong + international school names, exact spellings |
| Exam-board course codes | **20** | `YFM01 YMA01 9FM0 9MA0 9231 9709 7367 7357 H240 0606 0607 0580 4PM1 4PM0` + IBDP AA/AI HL/SL + Math IA + IBMYP. Unverifiable from memory |
| FAQ answers | **8** | Objection-handling copy that encodes facts found nowhere else |
| WhatsApp prefills | **7** | Segmented per package and per curriculum |
| IA topics / features | 8 + 6 | |
| Privacy policy | 4 sections | Legally relevant |
| Marketing copy | all headers, bullets, chips, accent cards | |

### Character-level hazards

The content is full of typography that a careless migration will mangle:

| Character | Where |
| --- | --- |
| `’` U+2019 curly apostrophe | Throughout — **and mixed with `'`**, including inside one WhatsApp prefill and across the schools list ("St. Paul's Co-educational College" vs "St. Paul’s Convent School") |
| `–` en dash | "Ages 15–18", "2008–2025", "2020–2025", "8–12 weeks", "6–7 / A–A*" |
| `—` em dash | Subtitles, CTA ribbon heading, every testimonial `role` |
| `·` middle dot | Badges, captions, accent-column joins |
| `•` bullet | Proof pills, About hero eyebrow, save lines |
| `→` arrow | All 7 About stat strings, FAQ item 7 |
| `≥` | Summary card labels |
| `⭐ 📘 🚀 📈 👆 🤩` | `results.json` summary cards + footer note + one testimonial |
| CJK | Tagline, 14 of 28 quotes, 小紅書 label |
| `\n\n` | FAQ items 4 and 7 — **load-bearing**, rendered via `whitespace-pre-line` |
| Trailing space | One testimonial quote |

**Facts that exist in exactly one place** and would be lost if that string were dropped:

- The physical address — *"my centre in Times Square, Causeway Bay"* — appears **only** inside
  FAQ answer 4. It is needed for `LocalBusiness` JSON-LD.
- The hours guidance — *"a Level 6 typically requires around 6 hours per week … a Level 7 usually
  requires 7+ hours per week"* — **only** in FAQ answer 5.
- The language policy — Cantonese/Mandarin delivery, English exam writing, full English on request
  — in About hero and FAQ 3, phrased differently.
- The referral rebate (HKD 3,000) — buried inside a prose bullet, never a field.
- The credentials — *"CityUHK · BBA QFRM (Math Minor) · First Class Honours"* and *"HK A-Level
  Examination Pure Mathematics A (Top 4.8%)"* — only in `home.proofPills`.

---

## 2. 🟡 Algorithms — reimplement from these specs

### 2.1 Grade improvement matrix — the product differentiator

`grade-improvements-section.tsx:16-196`

```
normalizeGrade(grade, scale)  →  1-based index of grade in scale       ← FIX: exact match, throw on miss
getNthTopGrade(scale, n)      →  scale[scale.length - n]               (n=1 is the highest)
diffToBucket4(diff)           →  diff <= 1 → 0 | diff === 2 → 1 | diff === 3 → 2 | diff >= 4 → 3

buildTop4Matrix4Cols():
  rows    = the TOP FOUR grades of that programme's scale
            (IGCSE → A*(9), A(8), B(7), C(6);  IBDP → 7, 6, 5, 4)
  columns = improvement bucket (0–1 / 2 / 3 / 4+)
  cell    = { count, items }

  • students with diff < 0 (regressions) are SKIPPED
  • students whose final grade is not one of the top 4 rows are SKIPPED
  • students who MAINTAINED (diff === 0) land in column 0 — intentional
  • rows where all four cells are 0 are dropped
  • the matrix is then TRANSPOSED into 4 independent column stacks, each
    filtered to count > 0 — so visual row alignment across columns is
    deliberately NOT preserved
```

**Summary cards** (rendered left→right as second, top, improvements, bigJumps — note this differs
from the JSON key order):

```
totalSecondOrAbove = count(score(to) >= secondScore)
totalTop           = count(score(to) === topScore)
improvements       = count(score(to) - score(from) >= 1)
bigJumps           = count(diff >= 2)
```
Each shows the raw count plus `round(count / total × 100)%`, where **`total` is the group's full
student count**, including maintained and regressed students.

**Cell contents:** `makeItems()` sorts by year desc then name asc, and renders
`"Name (Year)"` + optional `" — N month(s)"`, singular **only** when `months === 1`
(so 1.5 renders "1.5 months").

**Two fixes to apply:**
1. Exact-match grade lookup, throwing on a miss. The substring match publishes wrong figures today.
2. Memoise properly — `buildTop4Matrix4Cols()` currently runs every render, which invalidates the
   `useMemo` that depends on it. Better still: compute at build/publish time; the data is static.

**Interaction:** `active = pinned || hovered`. Pointer enter/leave sets hover; click/Enter/Space
toggles pin (pinning clears hover); Escape unpins; switching programme resets both. The active cell
grows `flex-1` → `flex-[4]` (`md:flex-[5]`) inside a fixed-height column, and **only the active
cell renders its body** — that conditional render is load-bearing, it stops compressed siblings
overflowing.

### 2.2 Tab model → replace with data

`results-grade-improvements.tsx:18-39`

`buildTabsModel()` groups the flat `resultGroups[]` by `tab` (Map preserves first-insertion order →
IBDP, A-Level / IAL, IGCSE), sorts sub-items by `subTab.localeCompare`, and builds a composite key
`${tab}__${subTab}__${programLabel}`.

**Default selection depends on that sort:** IBDP → "HL / AAHL / AIHL"; A-Level → "Further Math";
IGCSE → "Additional / Further Pure Math". Preserve those defaults explicitly with an `order` field.

In the new model, `programmes` is already nested and ordered — **delete this function**.

### 2.3 Pricing derivation

`packages.tsx:24-34` — see `docs/02-content-model.md` §2.1 for the full table.

```
groupRatePerLesson = floor(round(price / lessons) / 100) × 100
                   = floor(round(19800/32) / 100) × 100 = floor(619/100)×100 = 600
```
The round-**down**-to-nearest-100 is deliberate marketing. Preserve it.

Discount display is conditional: `hasOriginal = isFinite(originalPrice) && originalPrice > price`.
When true, render `Was HKD 60,000` (line-through) + `Save 67%` + `Save HKD 40,200`.

Value-comparison sentence assembly:
```
privateLinePrefix + " " + money(privateEquivalentTotal) + " vs " + money(groupPrice) + " " + groupLineSuffix
→ "32+ hours 1-to-1 ≈ HKD 48,000 vs HKD 19,800 for 32+ structured group sessions."
```
Compute **once** and pass one derived-pricing object down. Today this arithmetic is duplicated
three times in three components, and `group-package-card.tsx` ignores the props it is given and
re-parses the raw config itself.

### 2.4 Infinite marquee carousel

`testimonial-carousel.tsx:26-150`

```
loopingItems = [...items, ...items]            exactly 2 copies → 48 cards for 24 testimonials
pxPerSec     = 160
each rAF frame:
   loopWidth = el.scrollWidth / 2
   dt   = (t - lastT) / 1000
   pos += 160 * dt
   pos  = ((pos % loopWidth) + loopWidth) % loopWidth
   el.scrollLeft = pos
when paused: resync pos = el.scrollLeft, lastT = t   → no jump on resume
```

Time-based rather than per-frame stepping — deliberate, commented *"consistent across Safari"*.

**The axis-lock drag heuristic is the genuinely valuable part.** It stops a horizontally-draggable
strip hijacking vertical page scroll on iOS Safari:

```
touch:  threshold 6px,  mouse: threshold 4px
while axis is unclaimed, wait until |dx| or |dy| >= threshold
claim 'x' only if |dx| > |dy| + 2
otherwise ABANDON the drag entirely so the page scrolls vertically
once locked to x:  ev.preventDefault()   ← legal only because the listener is non-passive
next = ((scrollLeftAtStart - dx) % loopWidth + loopWidth) % loopWidth    ← content follows the finger
+ touchAction: 'pan-y', overscroll-x-contain, setPointerCapture for mouse
```

**Regressions to fix:** autoscroll pauses only while dragging — not on hover, not under
`prefers-reduced-motion`, and the rAF is never cancelled when the section is off-screen. The
duplicated DOM is announced twice by screen readers; `aria-hidden` the second copy and add a pause
control.

### 2.5 Leaflet slideshow

`group-leaflet-viewer.tsx:24-77`

Modulo prev/next over `pages.length`; `setInterval(autoAdvanceSeconds × 1000)` doing
`(prev + 1) % pageCount`; effect deps `[pageCount, autoSeconds, isFullscreen]` so **opening
fullscreen stops the timer and closing restarts it**; index is shared, so closing fullscreen lands
on the page you were reading. A4 frame `aspect-[210/297]`. Nav row and dots render only when
`pageCount > 1`. Body scroll locked by **saving and restoring** `document.body.style.overflow`
(not blanking it). A `mounted` guard delays the portal until after hydration.

Responsive rule that changes affordances: side arrows are `hidden sm:flex`, and an extra prev/next
row is `sm:hidden` under the image.

**Fix:** `autoAdvanceSeconds` is currently `"1"` — one second per page for 9 pages. Set 5, clamp
`min(2)`, and add a pause control.

### 2.6 Hero count-up

`hero.tsx:42-75`

easeOutCubic `1 - (1-p)³` over **1100 ms**, `prefers-reduced-motion` short-circuits to the target,
formatted `Intl.NumberFormat("en-GB")` + a **`"+"` appended in code**. `"20000"` → `"20,000+"`.
Card is suppressed entirely if `stat.value` is falsy.

**Critical fix:** because this is a static export, the current build ships `"0+"` in the HTML.
Render the **final** value server-side and animate *from* a lower value on mount, never *toward*
the value from zero-in-markup.

### 2.7 Scroll-spy

`nav.tsx:60-72` and `section-dots.tsx:34-49` — two independent observers computing the same thing.

```
IntersectionObserver, rootMargin: "-45% 0px -45% 0px", thresholds [0, .25, .5, .75, 1]
pick the intersecting entry with the highest ratio within the callback batch
```
i.e. *"active when the section crosses the viewport's middle 10% band"*. Well-tuned — keep the
value, extract **one** `useActiveSection(ids)` hook.

Related: `html { scroll-padding-top: 80px }` offsets anchor landings by the 64 px fixed nav. Keep
an equivalent or every anchor jump lands under the header. Set `scroll-behavior: smooth` in CSS
with a reduced-motion guard, not imperatively from a null-rendering client component.

### 2.8 Nav hide-on-scroll

`nav.tsx` — passive + rAF-coalesced scroll listener; `scrolledPast = scrollY > 48`;
`visible = open || hoverTop || hoverNav || !scrolledPast`. Two invisible 20 px strips at the top
reveal it on hover. `onFocusCapture`/`onBlurCapture` reveal it on keyboard tab-in (blur only clears
if `relatedTarget` is outside `currentTarget`) — **that keyboard handling is worth keeping.**

The brand button does `scrollTo({top:0})` then
`history.replaceState(null, '', pathname + search)` to strip the hash without a jump — which is why
clicking the logo does not leave `#faq` in the URL. Keep it.

**Regression to fix:** when hidden, the mobile hamburger is unreachable, so scrolled mobile users
have no section navigation at all (the dot rail is `hidden md:flex`).

### 2.9 Privacy modal a11y contract

`privacy-policy-modal-anchor.tsx` — shadcn `Dialog` gives all of this, but do not regress it:
`preventDefault` the hash jump; `role="dialog"` + `aria-modal`; focus the panel on open; Escape to
close; click-outside via backdrop `mousedown`/`touchstart` with `stopPropagation` on the panel;
**save and restore** the previous body overflow; **return focus to the trigger on close**.

### 2.10 Loom URL rewrite

`student-voices-video.tsx:7-11` — `url.replace('/share/', '/embed/')` guarded by
`url.includes('loom.com/share/')`. One line, load-bearing: the owner pastes a share link straight
from Loom's UI. Generalise to YouTube/Vimeo (the admin help text already promises YouTube).

### 2.11 Atomic GitHub commit

`api/update-content/route.ts:190-342`. Only relevant if git storage is kept. The dance
(ref → commit → blobs → tree → commit → ref-patch) is the **only** way to land N files including
binaries in one commit; the naive Contents API produces one commit per file. Two tricks worth
keeping: `base_tree` so untouched files survive, and `sha: null` on a tree entry to delete.

Fix before reuse: allowlist `slug`, `Promise.all` the blob creations, add a `User-Agent`, retry the
whole cycle on a 409/422 ref race, and stop forwarding raw GitHub error bodies to the browser.

### 2.12 Image magic-byte validation

`route.ts:39-80` — PNG `89 50 4E 47 0D 0A 1A 0A`, JPEG `FF D8 FF`, WebP `RIFF….WEBP` at offsets
0–3 and 8–11. Correct defence against arbitrary bytes with an image extension. **Keep — but derive
the extension from the bytes** rather than asserting bytes against a hardcoded target path. That
inversion is exactly what makes two image fields unusable today.

---

## 3. 🟢 Copy and configuration to harvest

| What | Where | Note |
| --- | --- | --- |
| **~250 admin field labels and help strings** | `admin/_lib/fields/*.ts` | The owner's own vocabulary, written for a non-technical user: *"Digits only, e.g. 1500. Will be parsed as a number."*, *"Use # as a placeholder for the grade."*, *"One selling point per line."*, *"Programme grade scale area (ordered from lowest to highest)."* Migrate verbatim into schema `.describe()` metadata. |
| Root SEO metadata | `layout.tsx:5-35` | `metadataBase https://wsmath.com`, title "WSMath", description, OG image 1200×630, `twitter: summary_large_image` |
| `IMAGE_UPLOAD_TARGETS` notes | `admin/_lib/image-upload-targets.ts` | The per-field guidance strings ("Upload a square-ish PNG with transparent background") are real editor copy |
| Table sort rules | `results-fields.ts`, `packages-fields.ts` | Students: year desc → to desc → from desc → name asc, blanks last. IA topics: title asc. **Keep the rules, but sort for display only** |
| CSV/TSV bulk paste | `table-input.tsx` | The owner pastes 93 rows straight from a spreadsheet. Auto-detects tab-vs-comma, auto-detects and maps a header row, coerces numeric columns. **Fix the naive `split(',')` — it shreds any row containing a comma** |
| Anchor contract | `page.tsx`, `nav.tsx`, `misc.json` | `#content #about #packages #testimonials #results #faq` + pseudo-anchors `#privacy` `#contact` |
| 小紅書 brand SVG | `footer.tsx:300-359` | multi-path, viewBox `0 0 256 256`, `translate(-256,-256)`, fill `#ff2741`. **lucide has no XiaoHongShu icon** — extract to an asset file |
| Rubik typeface | `_lib/fonts.ts` | The actual display face. Geist and Geist_Mono are create-next-app residue and are never rendered |

---

## 4. 🟡 Responsive rules that change *content*, not just styling

Losing these changes the mobile information hierarchy:

- Hero image is **order-1 (above the text)** on mobile, **order-2 (right column)** at `lg`.
- Hero stat renders a **compact inline** label pair below `sm`, a **stacked** pair at `sm+`.
- `coursesSection.strapline` is **hidden entirely** below `sm`.
- Proof pills and About stats: full-width stacked on mobile, inline at `sm+`.
- The results matrix is `min-w-[720px]` inside `overflow-x-auto`, with an `sm:hidden` *"Swipe left
  or right to view the full table"* hint.
- Fullscreen leaflet swaps side arrows for an under-image button row at `sm`.
- `SectionDots` is `hidden md:flex` — **the dot rail does not exist below 768 px at all.**
- Carousel cards `w-[280px]` → `md:w-[340px]`.

---

## 5. 🔴 Delete — do not carry forward

| What | Why |
| --- | --- |
| **All visual styling** | Gradients, glass cards, background glow, conic-gradient borders, the whole palette. New design language. |
| `renderStyledTitle()` | Faux drop-cap that fragments the `<h1>` into per-word spans |
| The entire admin field DSL | `FieldConfig`, `repeatFields`, `json-path.ts`, `json-editor-helpers.ts` — a stringly-typed reimplementation of what Zod + react-hook-form give for free, failing silently in every direction |
| `buildTabsModel()` | The new model is already nested |
| `pagesDir` / `pagesFormat` | Admin plumbing living inside content JSON; not even declared in the type |
| `pending-image-uploads.ts` | Module-level mutable array masquerading as state |
| `IMAGE_UPLOAD_TARGETS["testimonials.testimonialsCta.logoSrc"]` | Points at a section that no longer exists |
| `gradeImprovements.heatmapKeys` reference | No such key — a whole sub-tab UI is permanently inert |
| `PriceRow`, `AboutCtaConfig`, `isUpload` | Dead code |
| `(groupConfig as any).originalPrice` | The type *does* declare it; the cast and its comment are stale |
| Geist / Geist_Mono | Loaded, never rendered — and `globals.css` sets `body { font-family: Arial }`, defeating all three loaded fonts |
| The half-implemented dark mode | `globals.css` defines `prefers-color-scheme: dark` tokens that the hardcoded `bg-white text-neutral-900` on `<main>` completely ignores |
| The idle "auto demo" | Randomly opens matrix cells every 6.5–8.5 s. Undiscoverable, unlabelled, no reduced-motion guard, moves content under the cursor. If kept at all, make it obviously decorative and motion-safe |
| Committed `out/` | 91 build artefacts in git |
| `functions/api/update-content.js` | Already deleted; recoverable from `f8d2b71` if the simple Contents-API approach is ever wanted as reference |
