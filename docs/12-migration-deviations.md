# 12 · Migration deviations — what changed, and what the owner must sign off

Companion to `docs/02-content-model.md` (the migration map) and
`docs/07-content-conflicts.md` (the data contradictions). This file exists for one
reason: **the irreplaceable content survived the rebuild, but the record of what was
deliberately dropped did not.** Everything below is recoverable only from git history
once the legacy branch is gone, so it is written out in full here.

Nothing in this file is a bug report. Each item is a decision — taken, or waiting on
the owner. Read the **Status** column first.

Provenance of the "legacy" column: the pre-rebuild production render
(`out/index.html` on `main`, 295,075 bytes) and `src/app/_lib/content/json/*.json`
on the same commit. That tree was deleted in this branch; the one-shot migration
script that read it (`scripts/migrate-legacy-content.ts`) was deleted with it, since
its source directory no longer exists and it could never run again.

---

## A · Copy that was dropped and has no home in the Boundary design

The locked design (`docs/11-locked-design.md`) is a different information
architecture from the legacy page. These strings had nowhere to go. **They are owner-
authored marketing copy. None of them is on screen today.**

| # | Legacy string | Where it lived | Status |
| - | ------------- | -------------- | ------ |
| A1 | `A precision-engineered learning system built for ambitious students aiming for the highest performance bands across international exams.` | Results section subtitle | **Dropped** — the Boundary results header is the eyebrow / `.h2` / `.lede` trio, which carries a shorter lede. Owner sign-off needed. |
| A2 | `Structured skill-building · Clear weekly progression` | Results chip 1 of 4 | **Dropped** — no chip row in the locked results section. |
| A3 | `Exam execution · Markscheme-aligned thinking` | Results chip 2 | **Dropped**, as above. |
| A4 | `Efficient practice · High-yield question selection` | Results chip 3 | **Dropped**, as above. |
| A5 | `Clear reasoning · Stronger mathematical writing` | Results chip 4 | **Dropped**, as above. |
| A6 | `Score improvement · Level 7 / A* targets` | Packages chip 1 of 4 | **Dropped** — no chip row in the locked packages section. |
| A7 | `By-topic mastery · Past paper execution` | Packages chip 2 | **Dropped**, as above. |
| A8 | `Private coaching · Personalised strategy` | Packages chip 3 | **Dropped**, as above. |
| A9 | `Hong Kong-based · Online worldwide` | Packages chip 4 | **Partly survives** — the phrase is now inside the packages snapshot provenance line, `since 2018 · 1-to-1 engagements only · Hong Kong-based, online worldwide`. |
| A10 | `Frequently Asked Questions` / `Answers to common questions about WSMath coaching services.` | FAQ header pair | **Replaced** by the comp's `Eight answers` / `Questions parents ask first`. Intentional — it is in the locked comp. |
| A11 | `Questions parents and students ask most` / `Clear expectations. Clear structure. Clear results.` | FAQ subheader pair | **Replaced**, as A10. |

None of the eight chips (A2–A9) exists in `hybrid-2-boundary.html`. Restoring any of
them is a design change, not a content fix.

---

## B · WhatsApp prefills — rewritten, not migrated

`wa.me` deep links are the only conversion mechanism on this site, so this is the
highest-value copy in the repo. **All seven legacy prefills were replaced by nine new
ones; there is zero overlap.** The seven legacy strings, verbatim, for the record:

### B1 · The three per-course-group CTAs — **dropped entirely**

These sat under the IBDP / A-Level / IGCSE course tabs and each carried a **syllabus
picker**, which pre-qualified the inbound lead. The owner now receives enquiries that
do not name the specification.

- **IBDP** — label `Enquire about IBDP tutoring`
  `Hi Winson Siu, I’m interested in IBDP Math tutoring. I am (name?) from (school?) in (year?) and need help with (AAHL / AASL / AIHL / AISL).`
- **A-Level** — label `Enquire about A-Level tutoring`
  `Hi Winson Siu, I'm interested in A-Level Math tutoring. I am (name?) from (school?) in (year?) and need help with (Math / Further Math?).`
- **IGCSE** — label `Enquire about IGCSE tutoring`
  `Hi Winson Siu, I'm interested in IGCSE / IBMYP Math tutoring. I am (name?) from (school?) in (year?) and need help with (0606 / 0607 / 0580 / 4PM1 / 4PM0 / IBMYP).`

**Status: dropped, deliberately, and NOT restored in this pass.** The locked comp has
no per-group CTA — the course tabs are followed immediately by the single
`about-ribbon` WhatsApp bubble (`hybrid-2-boundary.html` lines 1958–2010), which
consolidates all three into "enquire for placement and a recommended plan". Adding
three buttons back would be an unreviewed change to a locked design.

**This is the one item on this page with real commercial cost.** If the owner wants
the syllabus qualifier back, the cheapest design-compatible option is to make the
`about-ribbon` prefill name the curricula, rather than to reintroduce three buttons.
That needs owner-authored copy, so it was not invented here.

### B2 · The four replaced prefills

Legacy on the left, shipped on the right. The new strings are **more** specific in
each case, which is why they were kept — but the substitution was never recorded.

| Legacy | Shipped | cta id |
| ------ | ------- | ------ |
| `Hi Winson Siu, I'm interested in your Math tutoring services. I am (name?) from (school?) in (year?).` | `…I’m interested in 1-to-1 exam coaching. I am (name?) from (school?) in (year?).` | `nav` |
| `Hi Winson Siu, I am interested in booking a private coaching lesson. I am (name?) from (school?) in (year?).` | `…I’m interested in IBDP Private coaching (1-to-1)…` | `private` |
| `Hi Winson Siu, I am interested in joining the group course. I am (name?) from (school?) in (year?).` | `…I’m interested in the IBDP Math Level 7 Mastery System…` | `mastery` |
| `Hi Winson Siu, I'm interested in Math IA support. I am (name?) from (school?) in (year?).` | `…I’m interested in the IBDP Maths IA Instructional Course…` | `ia` |

Note the legacy set mixed straight `'` and curly `’` apostrophes and mixed "I am"
with "I'm". The shipped set standardises both to `’` and "I’m". That normalisation is
deliberate and applies to prefills only — quotes, schools and FAQ answers keep their
original mixed punctuation byte-for-byte.

**Status: shipped. Owner sign-off outstanding.**

---

## C · Derived figures whose published value changed

These are the dangerous ones: the *data* migrated verbatim, but a *derivation* over it
now produces a different number than the legacy site published.

### C1 · The three `B(6)` IGCSE records — distribution moved

`docs/07-content-conflicts.md` §A1. James Chow (2022), Jacky Nie (2021) and Emily Lau
(2018) are recorded as `B(6)`, which is not a band on the IGCSE scale — rung 6 is
`C(6)`. The bytes are preserved (`src/content/students.json` lines 998, 1040, 1061).

- **Legacy** `normalizeGrade()` substring-matched, missed, and returned index `0`, so
  all three scored **+8 / +8 / +9** and rendered in the **4+ grade improvement**
  column. IGCSE · Additional read `[0, 0, 0, 4]`.
- **Now** `gradeIndex()` reads the parenthesised digit as authoritative, so they score
  **+2 / +2 / +3**. IGCSE · Additional reads `[0, 3, 1, 0]`.

The new arithmetic is correct for the data as recorded, and it matches the locked
comp. But it changed a published distribution, and **docs/07 §A1's actual question is
still open**: should these read `B(7)` or `C(6)`? Answering it moves the column again.

**Status: shipped, documented in `src/lib/grades.ts`. Owner decision outstanding.**

### C2 · Years of experience — off by one, now fixed

`stats.teachingSince` is `2017-09`. The derivation ignored the month, so in July 2026
it produced **9 yrs** where the legacy site published **8 yrs** — a credential
overstated by a year, and structurally wrong for the eight months from January to
August of every year. Fixed in `src/lib/tokens.ts`: completed years only.

**Status: fixed (now renders 8). Owner should confirm 8 is the intended claim**, since
either value changes a live number.

### C3 · The IBDP · SL matrix column — the comp is wrong, not the site

The rendered matrix reads `[5, 14, 8, 18]`; the comp's inline fixture yields
`[5, 14, 9, 17]`. The single differing record is **Connie Feng (2021)**. The comp
records `2 → 5` (d = 3); `src/content/students.json` records `1 → 5` (d = 4).
`docs/07-content-conflicts.md` line 112 settles it: the testimonial *role string* said
"From 2 to 5" but `results.json` said `1 → 5`, and docs/07 §B declares `results.json`
the single source of truth. The comp author took the number off the testimonial.

**Status: no change needed. The migrated total is correct.** The comp is now a stale
reference for this one cell and must not be used to "verify" the matrix again.

### C4 · The 8-lesson intensive price is 18,000, not 12,000

Recorded because **two separate reviews proposed changing it to 12,000, and doing so
would understate a live price by HKD 6,000.**

`intensiveBlockCost = privateHourlyRate × intensiveLessonCount × (sessionMinutes / 60)`
= `1500 × 8 × 1.5` = **18,000**. This is corroborated three ways: the legacy
production HTML renders "Around HKD 18,000 for an 8-lesson block (8 × 90 mins)"; the
legacy code (`packages.tsx:34`) uses the identical formula; and
`docs/02-content-model.md` line 118 specifies it.

The comp's `~HKD 12,000` (`hybrid-2-boundary.html` line 2280) is `8 × 1500` with the
90-minute factor dropped — a comp arithmetic error.

**Status: 18,000 is correct and shipped.** The `(8 × 90 mins)` basis has been restored
to the card so the figure is self-justifying, and `src/lib/pricing.ts` now carries a
warning against the "correction".

---

## D · Fields dropped, restored or newly tokenised

| # | Item | Status |
| - | ---- | ------ |
| D1 | Copyright holder — legacy `© 2026 Winson Siu. All rights reserved.` had become `© 2026 WSMath · …` | **Restored to `Winson Siu`** via a new `brand.copyrightHolder` field, kept separate from `brand.name` because a rights notice names a legal person. **Owner should confirm.** |
| D2 | `builder.githubUrl` (`https://github.com/XiniDev`) was dropped | **Restored** as an optional field; the credit now links to both xini.dev and GitHub. |
| D3 | Alice Gao's credential read `IBDP AAHL — From Level 6 to 7`; the derived line dropped `Level` | **Fixed** via an optional `gradePrefix` field. It was the only one of 28 role strings not byte-identical. |
| D4 | `/private-package.jpg` (6.5 MB) was orphaned — no content document referenced it | **Retired.** Re-encoded to `/private-package.webp` (46 KB) and kept in `public/` so a package card can use it via the existing optional `Package.media` field. Delete it if the owner confirms it is gone for good. |
| D5 | The four legacy avatars `carousel-1.png … carousel-4.png` (James Chow, Sharon Deng, Joy Angela Sun, Cassie Luo) | **Set to `avatar: null`** — those files never existed (`docs/07` §A4). They render the grade-delta chip, never a grey silhouette. This closes docs/07 §A4 in the negative: **owner may still supply the four photos.** |
| D6 | `2018` was typed literally in two places while `stats.teachingSince` (2017-09) drove "est. 2017" elsewhere — the page stated two founding years, one of them un-editable | **Tokenised** as `stats.oneToOneSince: 2018`. Both facts are now editable and distinct ("teaching since" vs "1-to-1 engagements since"). **docs/07 §A2 still needs the owner to say whether they are genuinely two different dates.** |
| D7 | `barACap` read `32+ hours 1-to-1 ≈ · Standard 1-to-1 rate` — a dangling `≈`, and *hours* interpolating a *lesson* count | **Fixed** to `32+ sessions 1-to-1 · Standard 1-to-1 rate`, matching `barBCap` and `prov2` which already say "sessions". The 48,000 figure is unchanged — the hours-vs-lessons conflict is docs/07 §A3 and belongs to the owner. |
| D8 | `summaryNote` hardcoded the word "Two" for the predicted-result count | **Tokenised** to `{{content.predictedRecordCount}}`. |
| D9 | Summary card label read `📈 Grade boost (≥1 grades)` | **Fixed** to `(≥1 grade)`. |
| D10 | Private card lost `Around` and the `for an 8-lesson block (8 × 90 mins)` clarifier | **Basis restored** as `(8 × 90 mins)`. `Around` stays dropped — the comp's `~` carries it. |
| D11 | `Course Features` → `Course features`, `Expertise across a range of themes` → `Themes` | **Shipped.** Both are the comp's own strings; the CSS uppercases them anyway. |

---

## E · Computed but deliberately unused

`src/lib/pricing.ts` derives `saveAmount` (40,200), `savePct` (67) and
`groupRatePerLesson` (600). The legacy site rendered `Save 67% · Save HKD 40,200` and
`~HKD 600 / lesson` on the group card. **The locked comp does not**: its mastery price
block is exactly `now` / `was` / `per` (`hybrid-2-boundary.html` lines 2312–2316), and
the site matches it.

This is a deliberate comp omission, not an oversight. The three figures remain exposed
as `{{money pricing.groupSaveAmount}}`, `{{pricing.groupSavePct}}` and
`{{money pricing.groupRatePerLesson}}`, so the owner can put the discount claim back
into any copy field from the editor without a code change.

**Status: no code change. Flagged so the strongest price argument on the page is a
decision rather than an accident.**

---

## F · Two elements added that are not in the locked comp

Both are defensible improvements, but the design is locked, so additions need the same
sign-off as changes.

- **"Back to top"** in the footer bottom bar (`src/content/pages.json` →
  `footer.backToTop`, `src/components/layout/footer.tsx`, `footer.css`). The comp's
  `.foot-bot` has only three `<p>` lines.
- **"— VIEW ALL 9 PAGES"** trigger under the group-course leaflet thumbnail, which
  opens the leaflet dialog.

**Status: shipped. Remove `footer.backToTop` from pages.json to drop the first; the
leaflet dialog has no comp reference at all and was built from the same primitives.**

---

# Part II · v6.3.2 "The Movement, Gilded" (rebuild of 2026-08-18)

Sections A–F above were written against the Boundary design and describe the *content*
migration out of the legacy site; every one of them still stands, because the content
model did not change. What follows records the deviations introduced when the site was
rebuilt in **v6.3.2 "The Movement, Gilded"** (`docs/11-locked-design.md` §0), whose
source of truth is the client-approved artifact `4820bc1c…`.

Two of the entries below (G1, G2) are **client-directed** and have real ongoing cost.
The rest are decisions taken during the build.

---

## G · Client-directed changes to the approved artifact

### G1 · The video: click-to-load gate REMOVED — the Loom embed is eager and autoplaying

The artifact has **no video element at all**. The client's instruction was that the real
site must carry the intro video in the testimonials area and that it must **load and
autoplay on page load**, as the live wsmath.com does — explicitly not click-to-load, not
a poster, not a facade.

Shipped: `voices/video-frame.tsx` server-renders the Loom iframe with
`loading="eager"`, no sandbox, `allow="autoplay; fullscreen; picture-in-picture;
encrypted-media; clipboard-write"`, and the provider parameters
`?autoplay=1&muted=true&hideEmbedTopBar=true&hide_owner=true&hide_share=true&hide_title=true`.
`muted` + `playsinline` are what let mobile browsers start it without a gesture. Verified
under Chrome's strict autoplay policy (`document-user-activation-required`): the
`<video>` inside the cross-origin frame reports `paused:false`, `videoWidth:1920`,
`currentSrc: blob:` — real footage, not the silent 1280×720 thumbnail loop the bare
`/embed/<id>` URL serves behind a poster.

**The costs, stated plainly, because they were accepted rather than avoided:**

- **One Loom connection on every single page load**, for every visitor, whether or not
  anyone watches. That is third-party JS, third-party cookies/localStorage, a measurable
  hit to LCP/TBT on slow connections, and mobile data spent before the reader has asked
  for anything.
- **Loom view counts are inflated** — every page view is now a video view. Any decision
  made from that number is wrong by an unknown factor.
- A click-to-load facade (poster + play button, iframe injected on click) costs nothing
  until used and would have removed all of the above. It was rejected by the client.

**Cloudflare Stream remains the recommended follow-up** and is already the decided stack
(`CLAUDE.md`). It is first-party, has no third-party storage, gives real per-video
analytics for the admin dashboard, and is already paid for in the owner's plan (~5,450
minutes of headroom). Migrating is a change to `voices.video.provider` + `url` and one
embed builder — the content model already carries a `provider` field for exactly this.

**Status: shipped on client instruction. Owner should revisit for Stream.**

### G2 · The "Your plan" panel REPLACES the WhatsApp coin — it no longer stacks above it

In the artifact the fixed panel (`#mvt-bb`, z 85) floats at `bottom:96px` with the coin
still visible at `bottom:24px`, so both are on screen at once. The client reported this
as a defect: two competing round-and-rectangular fixed objects in one corner.

Shipped: the panel takes the coin's corner (`bottom:24px right:24px`, z **90**), the coin
cross-fades out while the panel is live, and returns 120ms after the panel parks or
hides. Below 1280px the panel becomes a full-width bottom bar and there is no coin lane
at all. The `--coin-w` lane stays reserved in `.mvt-wrap` and the testimonial trough
either way — the lane is about content never sliding under the corner, not about the coin
being painted.

**Status: shipped on client instruction. Verified in all three states** (above the plan
anchor → coin only; inside packages → panel only; over a `data-plan-avoid` zone → panel
parks, coin returns).

### G3 · CJK `:lang()` rules are family-only, and `:lang(yue)` rides the Hant stack

The client reported the testimonial typography as looking odd and inconsistent across the
English / 繁體 / 简体 cards. Cause: the artifact writes
`.mvt-root :lang(zh-Hant){font-family:…;font-size:1.05em;line-height:1.9}` — specificity
(0,2,0), which out-ranks every card's own type register, so a Chinese quote ignored the
size its card asked for and the three registers disagreed with each other.

Shipped: the language rules set **family only**; each register declares its own CJK size
against its own base (featured quotes ×1.05 of their clamp; trough sheets pitch-locked to
15.75/24 against the paper's 24px ruling; the footer's tagline and 小紅書 label keep the
1.05 bump in `footer.css`; generic `.mvt-body` copy keeps it in globals). Measured spread
across languages is ≤1px at 2560 / 1440 / 390. `:lang(yue)` is matched everywhere
`zh-Hant` is, because `cherish-chiu-2025` really is Cantonese and the artifact dodged that
by hard-coding `zh-Hant` on it.

Consequence to expect: **the trough and the featured grid are shorter than the artifact**
(trough 350px vs 636px at 2560). That is the bug being removed, not layout drift.

**Status: shipped on client instruction. Do not put a `font-size` back into a bare
`:lang()` rule — the bug returns immediately and site-wide.**

---

## H · Deviations from the artifact taken during the build

### H1 · The video band carries NO WhatsApp CTA

The artifact's testimonial area has no CTA, so omitting one is faithful. It was considered
and rejected: it would be an unapproved brass plate in a section already flanked by the
ribbon, the packages CTAs, the results CTA and the fixed panel, and `pages.json` carries no
label for it, so the copy would have been invented. Conversion in that stretch of the page
is carried by the surrounding CTAs and the coin/panel.

Reversing it is a two-line change: add `voices.video.ctaLabel` to `pages.json` + the Zod
schema and render a `<PlateCta>` in `.mvt-vb-copy`. `ctaKey:"video"` is already plumbed
through and the prefill already exists in `whatsapp-prefills.json`.

**Status: shipped as artifact-faithful. Owner decision if they want it.**

### H2 · The collections beat the artifact's baked arrays, everywhere they disagree

The artifact hard-codes its own copies of the student records, the testimonials and the
course rows. Several have drifted from `src/content/*.json` — names, cohort years, durations
and at least one whole record. **The JSON wins, without exception**, per `CLAUDE.md` §1: the
collections are the asset, the comp is a picture of them.

Visible consequences: a few grade-stream ribbons differ from the artifact by design (the
IBDP HL top band most obviously); the private package renders **seven** intensive rows where
the artifact dropped `improvement-with-consistency`, which makes that plate ~70px taller and
stretches the Mastery plate to match; the trough medals show a **photo** for the five
testimonials that have one, where the artifact shows initials for all twelve (its own CSS
ships `.mvt-medal img{…object-fit:cover}`, a rule with no element in the comp — the
designer's stated intent).

The summary legend counts (19/42%, 39/87%, 40/89%, 45/100%) are **computed** from
`students.json` and happen to equal the artifact's baked numbers, because those were right.

**Status: shipped. No action.**

### H3 · The 8-lesson intensive block is ~HKD 18,000 — the artifact's 12,000 is a comp error

Same finding as §C4 above, restated because the v6.3.2 artifact repeats the mistake and
because **a third review proposed "correcting" it downward.**

`intensiveBlockCost = privateHourlyRate × intensiveLessonCount × (sessionMinutes / 60)` =
`1500 × 8 × 1.5` = **18,000**. The comp's `~HKD 12,000` is `8 × 1500` with the 90-minute
session factor dropped. Shipping 12,000 would understate a live price by HKD 6,000 per
block. `src/lib/pricing.ts` carries the docblock warning against the "fix".

**Status: 18,000 is correct and shipped. Do not change it without the owner changing the
price.**

### H4 · The results closing plate carries the tutor's portrait, not the brand logo

`results.cta.art` migrated as `/icon.png` (512×512, "WSMath logo"). The artifact's plate
renders a 230×302.3 image at aspect 0.7608 — that is `/cta-image.webp` (533×700), the
tutor's cut-out portrait, the same asset the live site's contact block uses.
`spec/sections/results.md`'s claim that the plate shows the logo is wrong. `pages.json` now
points at the portrait.

**Status: fixed.**

### H5 · Six leaflet labels and two landmark/notation strings became content

Strings that had been literals in JSX during the parallel build are now fields, so the
editor can edit them and no component hard-codes copy:

| Field | Value |
| --- | --- |
| `ribbon.ariaLabel` | `Availability` — a `<section>` is only a named landmark if it has one |
| `results.tabsCountLabel` | `n = ` — the prefix on every group tab's record count |
| `packagesPage.leaflet.{openLabel,closeLabel,previousLabel,nextLabel,pauseLabel,playLabel}` | the leaflet viewer's six labels; `openLabel` interpolates `{{content.leafletPageCount}}` |

**Status: shipped, schema regenerated.**

### H6 · Small structural departures, each deliberate

- **All six result panels are server-rendered** (five `hidden`) rather than built in JS, so
  every ribbon path, matrix cell and record label is in the prerendered HTML and survives
  JS-off and crawlers. Cost: ~135 extra `<path>` nodes. No duplicate ids.
- **The grade stream's dash length is measured in device pixels**, by sampling 24
  arc-length points and scaling each step by the SVG's own `sx`/`sy`. The ribbons carry
  `vector-effect="non-scaling-stroke"` inside a `preserveAspectRatio="none"` viewBox, so a
  `getTotalLength()` dash under-covers the on-screen path and the pattern *repeats* — that
  is the v6.1 regression of two sliding segments instead of one growing line.
- **The trough marquee keyframe is `translateX(calc(-50% + var(--pad) - var(--vc-gap)/2))`**,
  not a bare `-50%`. The track's border box is `2·--pad + 24·sheet + 23·gap`, so `-50%`
  lands half a gap and one `--pad` short of one printing and stutters once per cycle.
- **The marquee clones are in the server HTML** (`aria-hidden` + `inert`) rather than cloned
  by script, so the loop is seamless on first paint and reduced motion removes them in CSS.
- **`.mvt-paper` is namespaced to the about section.** It is the one class the artifact puts
  on two different sections' markup (about's inlay sheets and the FAQ's answer sheets); an
  unnamespaced base would leak `height:100%` into the FAQ's `0fr→1fr` accordion.
- **`.mvt-themes em{display:block}`** in the IA block, and `.mvt-who dd{line-height:1.44}`
  in the about panel, both exist to reproduce the artifact's **quirks-mode** geometry in a
  standards-mode page (see the doctype warning in `docs/11` §0). Neither is a style choice.
- **Both dialogs portal into `.mvt-root`**, not `<body>`. Every design token is declared on
  that div; a body portal renders the panel with no palette, no type stack and no
  reduced-motion rule. The privacy dialog shipped with this bug during the parallel build
  and was fixed at integration.
- **A `<figure>` wraps the leaflet slip's frame and caption**, where the artifact strands the
  `<figcaption>` outside its `<figure>`. Identical rendering, valid markup.

**Status: all shipped. Listed so none of them looks like an accident to the next reader.**

### H7 · The leaflet vitrine (carried forward from §F)

§F2 above recorded the "view all 9 pages" trigger as an addition to the Boundary comp. It is
equally an addition to v6.3.2 — the artifact's slip is a static `<figure>` showing page one
and nothing else. `packages.json` nonetheless stores nine pages, a label, a caption and
`autoAdvanceSeconds: 5`, so this is the missing half of an existing content model rather than
a new feature, and it is built entirely from the design's own vocabulary. Auto-advance never
starts under `prefers-reduced-motion`, pauses on hover, and stops the moment the reader takes
control (WCAG 2.2.2).

`footer.backToTop` (§F1) is **gone** in v6.3.2 — the field, the markup and the CSS were all
removed with the Boundary build, and the footer now matches the artifact's three-line bottom bar.

**Status: shipped. Remove `packages[mastery].leaflet.pages[1..8]` to drop it.**
