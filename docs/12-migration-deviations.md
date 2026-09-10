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

Since 2026-09-03 `ibdpPrivateEquivalent` (35,000) joins them: the value comparison states
the hourly rate instead (§G6), and the total stays exposed as
`{{money pricing.ibdpPrivateEquivalent}}` for the same reason.

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

### G4 · The video's end card no longer drags the page back to the player

Reported 2026-09-03: with the muted autoplay running unwatched, a reader who had scrolled
on was pulled back to the video section roughly two and a half minutes into the visit.
Cause: when the video ends, Loom's end card focuses its "Reply" textarea, and focusing an
element scrolls it into view through every ancestor frame. No embed parameter suppresses
the end card. Loom already stole focus once, ~3 s after load, and `video-frame.tsx` had a
guard for that; it disarmed after 30 s and could not see the second grab.

Shipped: the guard in `voices/video-frame.tsx` now runs for as long as the frame is off
screen. Focus that lands on the frame while it was not on screen at the previous paint,
and with no Tab keypress in the last quarter second, is handed back to the page and the
scroll offset is restored — then held for 400 ms so a late cross-process scroll is undone
too. A reader with the player on screen, or who tabbed into it, is never touched. A reader
who scrolls the player away with focus still inside it gets focus back on the page, so the
end card's later grab is a fresh, catchable steal rather than a move inside a focused frame.
Watched to the end with the player on screen, the end card behaves as before.

**Status: shipped on client instruction. Cloudflare Stream (G1) removes the cause outright.**

### G5 · Row 4 of the packages section height-matches its two boards

Reported 2026-09-03 with screenshots at 2560: the IAL and IGCSE plates ended ~280px apart,
which the owner read as misalignment. Row 4 had shipped with `align-items:start` on the
reasoning recorded in `packages.css` — IAL sells one course, IGCSE three, and matching the
plates leaves IAL ~300px of ground with no designed sink.

Shipped: row 4 stretches like row 3. The ground sits on the plate under IAL's one-row ledger
and above the foot; `.mvt-lineup` and `.mvt-slip` both refuse to grow, so no well or vitrine
is stretched around it. At ≥1800 the two plates subgrid into three shared row tracks, so the
pitch, the ledger and the foot each start on one line across both plates. Below 1800 the
slip's `flex` dropped from `1 1 auto` to `0 0 auto` for the same reason: a growing vitrine
had made the IAL frame half again the height of the IGCSE one beside it.

**Status: shipped on client instruction. Verify at 2560 and 1440 before merge.**

### G6 · The value comparison states the 1-to-1 rate, not a multiplied total

Reported 2026-09-03: the owner does not want "the same hours 1-to-1 would be HKD 35,000"
on the page. The figure was `privateHourlyRate × ibdpTeachingHoursExact` — 1,500 an hour
× 23.33 hours — and the arithmetic is right; the objection is to publishing a 1-to-1
total at all. The rate is HKD 1,500 an hour (`docs/06` §1), and that is what the
comparison now says.

Shipped, in `pages.json` only: the heading reads "23+ hours of live teaching. 1-to-1 is
**HKD 1,500 an hour** — the group course is **HKD 16,800**." and the first cell prints
`{{money pricing.privateHourlyRate}}` over "per hour · typical rate" in place of the
23-hour total over "23+ hours at HKD 1,500 / hour". No derivation changed:
`ibdpPrivateEquivalent` is still computed and is now unused (§E), the 8-lesson block is
still 18,000 (§C4), and the token name is unchanged.

The private card's price line and the JSON-LD price range had read "HKD 1,500 / 90 min",
which at an hourly rate understates a 90-minute lesson by 750. Owner confirmed the rate
is per hour (2026-09-03): both now read "HKD 1,500 / hour". `programme.sessionMinutes`
still describes the lesson — the intensive block's "(8 × 90 mins)" and its 18,000 are
unchanged.

Consequence to weigh: the first cell is the cost argued against and sits in the carmine
well; the second is the offer. With a rate on the left and a course total on the right
the smaller number is now on the cost side. A like-for-like rate on the right — the
course's `16,800 ÷ 23.33 h ≈ HKD 720 an hour` — would restore the reading but is a new
derived figure the owner has not seen; it is a two-line change if wanted.

**Status: shipped on client instruction.**

### G7 · Fraunces replaces the system serif as the display face

Reported 2026-09-03 with a capture of the nameplate: the display voice as rendered on
Windows — Constantia Bold, the first face in the §0.3 stack — is not good enough for a
204px name. docs/11 §0.3 shipped no webfont on the reasoning that a serif is "well served
on every platform"; it is served, but by five different faces, and the one Hong Kong's
Windows readers get is the plainest of them.

Shipped: **Fraunces** (SIL OFL, Undercase Type), the latin subset of the variable font with
the `opsz` 9–144 and `wght` 100–900 axes, a 67 KB woff2 self-hosted from `src/app/fonts/`
through `next/font/local` — no request leaves the site, `font-display: swap`, preloaded,
and a metrics-matched Times fallback so the swap does not shift layout. It is the whole
display voice, not the name alone: `--f-display` now leads with it, so the h2s, the FAQ
questions, the testimonial quotes and the leads change with the nameplate, and the
optical-size axis gives the 15px quotes a text cut while the 204px name gets the display
cut. The system serif stack stays behind it as the fallback. `--f-ui` and `--f-data` are
untouched, and the "no second webfont" ban in §0 now means exactly that.

The nameplate's tracking moved from the comp's `-.042em` to `-.012em`. The comp's figure was
set on Constantia; Fraunces at display optical size carries long hairline serifs, and at
`-.042em` the W runs into the I and the S into the O at 204px. `-.012em` clears every pair
and widens "WINSON" at the 44px floor from 183px to 191px, which still fits a 390px phone.

**Status: shipped on client instruction. Checked at 2560 and 898; re-approve the nameplate on
a real phone before merge.**

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


---

# Part III · The trimmed build (2026-09-10)

The owner reviewed the v6.3.2 page and said it was too wordy, too much, overwhelming, repeated
itself, and carried information nobody needed — and that the *previous* site had the same
fault. A two-round content audit (252 findings, 80 confirmed; then 88 descriptive paragraphs
judged four ways) found the mechanism: the rebuild promoted the same subtitle sentences from
12–16px grey sans into 26px display serif, so copy that was skimmable small print became
assertions the reader has to process. Three of the five section subtitles were word-for-word
legacy and still occupied 2.64× the ink. The type scale is correct and did not change; what
changed is which sentences ride it, and how the survivors are recomposed.

Everything below is applied on `working/trimmed`. Nothing in the collections
(`students.json`, `testimonials.json`, `schools.json`, `faqs.json`, the privacy policy) was
edited. Every business fact is still a token.

## I · Copy removed (no owner sign-off needed — rebuild-authored UI copy)

| Where | What went | Why |
| --- | --- | --- |
| Section heads | `results.sub`, `packagesPage.sub` (replaced), `voices.lede`, `faqPage.sub`, `packagesPage.eyebrow`, `gradeHead.sub`, `schoolsHead.prov` | Word-for-word legacy captions promoted to display scale; none carried a fact the heading and the content below did not |
| Chip rows | `packagesPage.chips` ×4, `results.chips` ×4 | Banned by `docs/11` §5; recorded as dropped in §A2–A9 yet on the page |
| Ribbon | `body`, `waLabel` | 5th statement of the curricula trio; a label naming the channel above a button carrying its disc |
| Results | `uplift.note` ("Very high satisfaction"), both hand-typed snap cards, the stream read-out well, the emoji hover note, the 4th legend card (45/100% by construction), `cta.body`, two of three plate rows | Slogans beside the one hard number; instructions given twice; duplicates of hero stats |
| Packages | the value-comparison cells, all four `footTag`s, both leaflet captions, the outcomes hedge and the referral row in the private plate's included list, "Live answers in class" ×3, the papers badge on four IBDP rows (now one board line), "Market-exclusive" ×4 of 5, "· N live Zoom lessons" on row metas | Each fact now stated once, where the product is |
| About | `whoBlock.chip` (equipment, printed 4×), `whoBlock.rows[1]`, three of seven journey pills, every pill duration | Durations were hand-typed and disagreed with `students.json` for three students |
| Hero | "Question bank 2008–2025" (contradicted the boards' 2008–2026), the "9 yrs" clause | Tenure was stated twice 30px apart |
| Voices | `video.stamp`, `video.body`, `video.clips` (never rendered), six of twelve trough sheets | The body described "short clips" that do not exist |
| Footer | "Group Classes" and "Contact" links, `builder.stack`, "WSMath is a premium tutoring brand.", the brand slogan, one meta row | |
| Courses covered | **the whole section** | Its 21 rows now live inside the three boards as "Also taught 1-to-1" ledgers — one catalogue, not two |

`packagesPage.sub` is now the value comparison: `{{programme.ibdpTeachingTime}} of live teaching.
1-to-1 would cost {{money pricing.ibdpPrivateEquivalent}}; the course is {{money pricing.coursePrice}}.`
`programme.ibdpTeachingTime` is a new token ("23 hours 20 minutes") so the arithmetic reproduces
exactly — the legacy "32+ hours ≈ HKD 48,000" frame was a withdrawn price claim (`docs/07`) and was
deliberately **not** restored.

## J · Structure changed (re-opens the comp — the owner asked for it)

- **Section heads with no subtitle** put the eyebrow on the title's baseline in the second
  track (`globals.css`, `.mvt-head:not(:has(.mvt-head-sub))`), so a short title never sits over a
  full-width empty bar.
- **Results is one visual.** The improvement matrix, its read-out and its phone alternate are
  deleted; the stream is taller (`clamp(360px,32vw,460px)`) and the three legend cards are its
  caption, **computed for the selected group** with `legendScope` as the template
  `Over the {n} published records in {group}`. The `2+` uplift sits in the head's second track.
- **Packages is two rows.** Row 3 is A-Level | **IBDP** | IGCSE, one-word titles set at
  `clamp(40px,4vw,68px)`: the centre column 16% wider, lifted, brass-ringed, 18px taller top and
  bottom, no "Most popular" tag. Each board is head · full-page leaflet (opens the outline
  dialog) · drifting course-tag strip · decorative rule, and the whole plate is the WhatsApp
  enquiry (a stretched link). The "Courses covered" section is gone; the tag strip is the
  catalogue. Price figures scale with the side column (`--pk-side-w`) and the description
  reserves three lines, so the three stacks align to the pixel. Below 1500px the row breaks: the
  flagship takes the top row landscape (pitch left, page right at `clamp(360px,30vw,460px)`
  tall) over the two boards; below 1025px everything stacks, flagship first, pages capped at
  80vh. Row 4 is private coaching full width: pitch beside the intensive ledger.
- **The snapshot tile** carries "Often within 8–12 weeks" as its third station.
- **The IA block** is intro | themes (`38fr 62fr`); the six-feature well is gone.
- **The video band** is no longer a well; the heading sits beside the player on the ground.
- **Footer links** are a ruled two-column ledger; the rights line prints `© year holder`.
- **Measure and gutters:** `--wrap` 1960 → 1800, `--pad` 3.6vw → 5.5vw; display sizes down ~8%
  (`.mvt-d0` 184, `.mvt-h2` 88, `.mvt-h3` 42, `.mvt-lead` 24). Body text unchanged.
  `--sec` `clamp(76px,5.6vw,150px)` → `clamp(64px,4vw,104px)`: two sections' padding either side
  of the seam was 288px at 2560 and read as a hole between the IA block and the results head;
  it is 206px now. The ≤640 override is unchanged.
- **The desktop scale is .85.** The owner's own test was the browser at 80–90%; `.mvt-root`
  now carries `zoom:var(--scale)` with `--scale:.85` from 1280px up (`globals.css`), so every
  clamp, gutter, seam and plate scales together and the measure at 2560 is 1530px with 515px of
  ground either side. Below 1280 the page is 1:1 — those layouts were tuned there and a phone at
  85% is 12px text. Two things do not follow `zoom` and were rewritten: media queries read the
  real viewport, so breakpoints at or above 1280 are in real pixels (`1800 → 1530`, `1679 →
  1427`, `1499`/`1420 → 1279`), and `vw` is scaled after it resolves, so the packages row
  measures itself with container units (`100cqi`) instead of `100vw`. One number to tune.
- **CTAs are labelled by intent** (nav and footer stay neutral); the hero has its own `hero` key
  and prefill; the nav/coin prefill is curriculum-neutral; the results prefill asks for the same
  three things its visible prompt does.

## K · Still the owner's call

| # | Question | Where it bites |
| - | --- | --- |
| K1 | Which six testimonials stay in the trough. The developer's pick is in `voices.trough.sheetIds`; it keeps all four written languages. The HKDSE record (`lucy-han-2019`) is the only Traditional-Chinese sheet — dropping it makes the label false | `pages.json` |
| K2 | The journey pills print no durations because `students.json` holds none for three of the four. Add durations to the data or accept the pills without | `pages.json`, `students.json` |
| K3 | Is 0606 32 hours or 64? The row prints "32 hrs" twice | `packages.json` |
| K4 | "Since 2018" (snapshot) vs "since Sep 2017" (hero) — `docs/07` §A2 | `settings.json` |
| K5 | What "65%+" measured. It is gone from the page; the computed 87% is survivorship-biased and was **not** put beside the price | — |
| K6 | "Supported by a PhD in Pure Mathematics" — owner copy, kept, never on the type ramp | `ia-course.json` |
| K8 | **Accessibility regression to sign off.** The matrix was the results section's only accessible data path — a real `<table>` that named students per cell. With it gone the stream is `aria-hidden` and the three per-group legend cards are all assistive technology can reach; no named record is exposed. Either accept that, or restore a visually-hidden table of the 45 published records | `results-panel.tsx` |
| K7 | The "Your plan" panel still wakes over the ribbon and rides through results, voices and FAQ (round-1 A1). Confining it to packages is a behaviour change not made in this pass | `plan-panel.tsx` |
