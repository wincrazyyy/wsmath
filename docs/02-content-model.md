# 02 — Content Model

The new schema, the global token system, and the field-by-field migration map.

---

## 1. What is wrong with the current model

The seven JSON files are **section-shaped, not entity-shaped**. Each file mirrors one page
section's component tree instead of modelling the business's actual entities. Three consequences,
all already visible in production:

1. **The same student exists three times** — as a proper record in `results.json`, as an
   unstructured sentence in `about.stats`, and as an embedded string in a testimonial's
   `name`/`role`. Those three copies have already diverged.
2. **Headline numbers are triplicated** across `home`, `packages` and `results`, and contradict
   each other ("since Sep 2017" vs "Since 2018" vs "8 yrs").
3. **Structured data is buried in prose.** `name: "Alice Gao (2022)"` embeds the year.
   `role: "IBDP AAHL — From Level 6 to 7 [in 7 months]"` embeds the programme, both grades *and*
   the duration. None of it can be sorted, filtered or validated.

The fix is three layers: **Settings/Tokens → Collections → Page composition.**

---

## 2. Layer 1 — Settings and tokens

> This layer is the direct answer to the owner's request: *"have some fields register against all
> places, for example x hours."*

One `settings` document. Every value here is referenced from many places and must never be retyped.

```ts
const Settings = z.object({
  brand: z.object({
    name:        z.string(),   // "WSMath"
    tutorName:   z.string(),   // "Winson Siu"
    tutorNameZh: z.string(),   // "數學軍師"
    taglineEn:   z.string(),   // "International Mathematics Exam Strategist"
    taglineZh:   z.string(),   // "國際數學科考試軍師"
    description: z.string(),   // "Structured learning, exam strategy, measurable progress."
    logo:        MediaRef,
    ogImage:     MediaRef,
  }),

  contact: z.object({
    whatsappPhone: z.string().regex(/^\d{8,15}$/),   // "85269447214" — digits only, no '+'
    timezoneLabel: z.string(),                        // "Hong Kong / Global online"
    centreAddress: z.string(),                        // "Times Square, Causeway Bay"
    // currently buried in a single FAQ answer; needed for LocalBusiness JSON-LD
  }),

  socials: z.array(z.object({                         // was a CLOSED {facebook,instagram,xhs}
    platform: z.enum(["facebook","instagram","xiaohongshu","youtube","tiktok","wechat"]),
    url:      z.string().url(),
  })),

  // ── THE TOKEN BLOCK ───────────────────────────────────────────────
  stats: z.object({
    tutoringHours:   z.number().int(),   // 20000
    studentsCoached: z.number().int(),   // 250
    lessonsTaught:   z.number().int(),   // 11000
    teachingSince:   z.string(),         // "2017-09"  → yearsExperience is DERIVED
    iaStudents:      z.number().int(),   // 80
    iaYearRange:     z.string(),         // "2020–2025"
    questionBankYears: z.string(),       // "2008–2025"
  }),

  pricing: z.object({
    currency:            z.literal("HKD"),
    locale:              z.string().default("en-HK"),  // pin it — see §6
    privateHourlyRate:   z.number().int(),   // 1500
    groupPrice:          z.number().int(),   // 19800
    groupOriginalPrice:  z.number().int(),   // 60000
    referralRebateMax:   z.number().int(),   // 3000 — currently buried in a prose bullet
  }),

  programme: z.object({
    sessionMinutes:        z.number().int(),  // 90
    groupLessonCount:      z.number().int(),  // 32
    intensiveLessonCount:  z.number().int(),  // 8
    curricula:             z.array(z.string()), // ["IBDP","A-Level / IAL","IGCSE"]
  }),

  setup: z.object({
    platform:  z.string(),        // "Zoom"
    equipment: z.array(z.string()), // ["iPad","Apple Pencil","GoodNotes"]
  }),

  outcomes: z.object({            // marketing claims, currently scattered in rightAccent blocks
    hlSixPlusRate:  z.string(),   // "65%+"
    slSixPlusRate:  z.string(),   // "65%+"
    avgUplift:      z.string(),   // "2+"
    improvedOneBand:z.string(),   // "90%+ improved ≥1 band"
    typicalTimeToGain: z.string(),// "Often within 8–12 weeks"
  }),

  seo: z.object({
    siteUrl: z.string().url(),    // "https://wsmath.com"
    title: z.string(),
    description: z.string(),
  }),
});
```

### 2.1 Derived tokens (read-only, computed)

Never stored. Computed once in `lib/tokens/derive.ts` and exposed to the token resolver and to the
admin's token browser as read-only rows.

| Token | Formula | Current value |
| --- | --- | --- |
| `stats.yearsExperience` | `now.year − teachingSince.year` | 8 |
| `pricing.groupSaveAmount` | `groupOriginalPrice − groupPrice` | 40,200 |
| `pricing.groupSavePct` | `round(saveAmount / originalPrice × 100)` | 67 |
| `pricing.groupRatePerLesson` | `floor(round(groupPrice / groupLessonCount) / 100) × 100` | **600** |
| `pricing.privateEquivalentTotal` | `privateHourlyRate × groupLessonCount` | 48,000 |
| `pricing.intensiveBlockCost` | `privateHourlyRate × intensiveLessonCount × (sessionMinutes / 60)` | 18,000 |
| `programme.groupTotalHours` | `groupLessonCount × (sessionMinutes / 60)` | 48 |

> **Preserve the rounding exactly.** `groupRatePerLesson` rounds **down to the nearest 100** so it
> reads "≈ HKD 600 / lesson" rather than 619. That is a deliberate marketing decision, not a bug.
>
> **But fix the unit bug while you are here.** `privateEquivalentTotal` is labelled *"32+ hours
> 1-to-1"* but multiplies the rate by the *lesson count*, not hours. 32 lessons × 90 min = **48
> hours**, so the honest comparison is either "48 hours ≈ HKD 72,000" or "32 lessons ≈ HKD 48,000".
> Ask the owner which claim they intend — see `docs/07-content-conflicts.md`.

### 2.2 Token interpolation in copy

Any string field may contain `{{token.path}}`. Resolved server-side at render.

```
"Approx. {{programme.groupLessonCount}}+ high-quality live {{setup.platform}} lessons."
"{{stats.studentsCoached}}+ students coached · {{stats.lessonsTaught}}+ lessons · {{stats.yearsExperience}} yrs"
"Referral rebate of up to {{money pricing.referralRebateMax}} per student referred."
```

Rules:

- **Resolution is strict.** An unknown token is a *validation error* on save and a *build failure*
  in CI. Never render a raw `{{...}}` or an empty string.
- **Formatters** are declared, not implicit: `{{money x}}` → `HKD 19,800` using the pinned locale;
  `{{num x}}` → `20,000`; `{{plus x}}` → `20,000+`. This kills the current bug where the `"+"` on
  the hero stat exists only in JSX and would vanish in a naive rewrite.
- **A reverse index is maintained.** `lib/tokens/usage.ts` scans all content for `{{...}}` and
  produces `Map<tokenPath, ContentLocation[]>`. The admin uses it for the *"Used in 7 places"*
  panel in the editor.

### 2.3 What this replaces

Every one of these is a value currently retyped in prose and guaranteed to desync:

| Token | Retyped in |
| --- | --- |
| `programme.groupLessonCount` (32) | `comparison.privateLinePrefix`, `comparison.groupLineSuffix`, `group.points[0]`, plus the derivation |
| `programme.intensiveLessonCount` (8) | `intensive.label`, `intensive.points[2]` |
| `programme.sessionMinutes` (90) | `intensive.points[2]`, and a JSX template |
| `stats.studentsCoached` (250) | `home.proofPills[0]`, `packages.rightAccent.mainValue`, `results.resultsCta.bullets[2]` |
| `stats.lessonsTaught` (11000) | `home.proofPills[0]` ("11,000+"), `results.resultsCta.bullets[2]` ("11,000") — inconsistent suffix |
| `stats.tutoringHours` (20000) | `home.hero.stat.value`, `results.resultsCta.bullets[2]` |
| `stats.teachingSince` | "since Sep 2017", "Since 2018", "8 yrs" — **three contradictory values** |
| `setup.equipment` | 4 places, 2 different phrasings (one drops GoodNotes) |
| `setup.platform` (Zoom) | 5 places |
| `programme.curricula` | 8 places in **6 different punctuation variants** |
| `stats.questionBankYears` | 2 places |
| `brand.tutorName` | 11 places, incl. all 7 WhatsApp prefills |
| `contact.whatsappPhone` | 3 hand-built `wa.me` templates |
| `pricing.currency` ("HKD") | **14 hardcoded JSX positions** |

---

## 3. Layer 2 — Collections

Entity tables with stable ids. **Every item gets a `id` at creation and keeps it forever** — asset
filenames, admin deep-links and cross-references all key off it, never off array position.

### 3.1 `gradeScales`

```ts
{ id, name, bands: [{ value: string, label: string, order: number }] }  // order: lowest → highest
```

Three scales exist:

| id | Bands |
| --- | --- |
| `ibdp` | `1 2 3 4 5 6 7` |
| `alevel` | `F E D C B A A*` |
| `igcse` | `U(1) G(2) F(3) E(4) D(5) C(6) B(7) A(8) A*(9)` |

**Lookup must be exact-match on `value`, and must throw on a miss.** The legacy substring match
with a silent `0` fallback is what produces the wrong published figures.

### 3.2 `programmes`

```ts
{ id, family: "IBDP" | "A-Level / IAL" | "IGCSE",
  label,        // "HL / AAHL / AIHL"          (was subTab)
  fullLabel,    // "IBDP · HL / AAHL / AIHL"   (was programLabel)
  gradeScaleId, order }
```

Six programmes. The legacy flat `resultGroups[]` with a repeated `tab` string exists only because
there were no ids; `buildTabsModel()` re-derives the nesting at runtime and can be **deleted**.

### 3.3 `students`

```ts
{ id, name, cohortYear, results: [{ programmeId, gradeFrom, gradeTo, months? }] }
```

93 rows collapse to **~78 people**. These appear in more than one programme today and must be
merged: Bill Zhang (×3), James Chow (×3), Kitty Lam, Ken Chen, Catherine Li, Jacky Nie,
Cissie Ching, Gordon Lo, Evelyn Zhang, Jenny Huang, Michelle Chan, CY Ting, Yuki Lam, Coco Cheng.

`months` is **optional and may be fractional** (1.5 occurs twice). Pluralisation rule:
`months === 1 ? "month" : "months"`, so 1.5 renders "1.5 months".

### 3.4 `testimonials`

```ts
{ id, studentId?, displayName, cohortYear, programmeLabel,
  gradeFrom, gradeTo, months?, university?,
  quote, lang: "en" | "zh-Hant" | "zh-Hans" | "yue",
  avatar: MediaRef | null,          // null means "show the fallback"
  placement: "featured" | "carousel", order }
```

28 rows (4 + 24). `featured` vs `carousel` is a **placement flag, not a different entity** — the
legacy split into two arrays is why they duplicate structure.

Three legacy problems this fixes:
- `name` embedded the year, `role` embedded programme + both grades + duration. Split into fields;
  render the display string.
- `useDefaultAvatar` was `true` ×13, `false` ×4 and **absent** ×5, and several rows had
  `useDefaultAvatar: true` *and* a populated `avatarSrc`. `avatar: null` is unambiguous.
- **`lang` is new and matters.** Emit it on each `<blockquote>`; screen readers currently read
  Chinese with an English voice.

### 3.5 `packages`

```ts
{ id, kind: "private" | "group" | "ia",
  label, tag?, title, description,
  points: [{ id, text }],           // token-interpolated
  media?: MediaRef,
  leaflet?: { pages: MediaRef[], autoAdvanceSeconds: number },
  cta: { label, prefillKey } }
```

Three offers. Pricing fields move to `settings.pricing` — they are tokens, not package properties.

### 3.6 `courseGroups`

```ts
{ id, title, caption?, emphasize: boolean, order,
  courses: [{ id, name, code? }],
  cta: { label, prefillKey } }
```

Three groups (5 / 9 / 6 courses). `emphasize` is a **merchandising flag** — exactly one group
(IBDP) has it, and it drives a "Flagship" badge plus a higher-contrast CTA. It has never been
editable in the admin; it must be.

The 20 exam-board codes (`YFM01 YMA01 9FM0 9MA0 9231 9709 7367 7357 H240 0606 0607 0580 4PM1
4PM0` + IBDP AA/AI HL/SL + Math IA + IBMYP) are business-critical and unverifiable from memory.
**Transcribe, never retype from recall.**

### 3.7 `faqs`, `schools`, `iaTopics`

```ts
faqs:    { id, question, answer /* markdown */, order }   // 8 — answers use \n\n today
schools: { id, name, order }                              // 30 — count is DERIVED, never authored
iaTopics:{ id, title, description, order }                // 8, plus 6 iaFeatures
```

FAQ answers currently use literal `\n\n` rendered with `whitespace-pre-line`. **Markdown is the
honest upgrade** — but the migration must convert, not drop, those breaks (items 4 and 7 depend
on them).

### 3.8 `whatsappPrefills`

```ts
{ key: "generic" | "private" | "group" | "ia" | "courseIbdp" | "courseALevel" | "courseIgcse",
  text: string }   // token-interpolated
```

Seven messages, all following `"Hi {{brand.tutorName}}, … I am (name?) from (school?) in (year?)."`
Normalise the one curly apostrophe in the IBDP variant while migrating.

### 3.9 `ctaEvents` (new — analytics)

```ts
{ id, ts, prefillKey, sectionId, ctaId, path, referrer?, userAgentHash? }
```

The site's only conversion is a `wa.me` deep link and there is **zero attribution today**. One
row per outbound click is what makes the editor's analytics dashboard meaningful.

---

## 4. Layer 3 — Page composition

Thin documents holding only section-specific copy and references to collections.

```ts
const SectionHeader = z.object({          // shared by about, packages, results
  eyebrow: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  chips: z.array(z.string()).default([]),
  accent: z.object({
    heading: z.string().optional(),
    badge: z.string().optional(),
    mainValue: z.string().optional(),
    mainLabel: z.string().optional(),
    columns: z.array(z.object({ id: z.string(), title: z.string(), items: z.array(z.string()) })),
  }).optional(),
});
```

`SectionHeader` composed into three page documents **is** the "field registered against all places"
pattern the owner asked for, done properly. The legacy code already proves the need —
`makeHeaderRightAccentColumnFields()` is imported verbatim by about, packages *and* results.

Two things to fix while normalising:

- **The type currently lives inside a UI component** (`ui/section/section-header.tsx`), and the
  content types import *from* the component. Invert that: schema owns the type, components import
  from schema.
- **`faq.json` carries two headers for one section** (`header` *and* `top`, both with eyebrow
  "FAQ" — it renders twice on screen). The same duplication exists in results and testimonials.
  One header per section; sub-blocks get a title only.

Also normalise the naming: `header.subtitle` vs `schools.subheading` vs `video.subheading` vs
`resultsCta.subheading` all mean the same thing.

---

## 5. Migration map

The migration is a **script**, not a typing exercise. `scripts/migrate-legacy-content.ts` reads the
seven JSON files from git history and writes the new model. Run it, diff, iterate.

| Legacy path | New location | Note |
| --- | --- | --- |
| `home.hero.{title,subtitle,tagline}` | `settings.brand` + `pages.home.hero` | title is `brand.tutorName` uppercased — do not store twice |
| `home.hero.stat.value` `"20000"` | `settings.stats.tutoringHours` (number) | `+` suffix and `en-GB` grouping are added by the `{{plus}}` formatter, not stored |
| `home.hero.stat.subLabel` | `settings.stats.teachingSince` | reconcile with "Since 2018" |
| `home.proofPills[]` (3 strings) | `pages.home.proofPills[]` | each packs 3 facts joined by `•` — split and tokenise |
| `about.header.*` | `pages.about.header` (`SectionHeader`) | |
| `about.hero.{area1,area2}` | `pages.about.pedagogy[]` | 2 areas × 3 bullets |
| `about.stats[]` (7 prose strings) | **derive from `students`** | do not migrate as strings — this is the primary source of drift |
| `about.coursesSection.groups[]` | `courseGroups` | 3 groups; keep `emphasize` |
| `about.ctaRibbon` | `pages.about.ctaRibbon` | untyped in legacy — the type omits it entirely |
| `faq.header` + `faq.top` | `pages.faq.header` | collapse two headers into one |
| `faq.items[]` | `faqs` | `\n\n` → markdown paragraphs |
| `misc.whatsapp` | `settings.contact` + `whatsappPrefills.generic` | |
| `misc.privacyPolicy` | `pages.legal.privacy` | 4 sections; `lastUpdated` is stale (2025-12-22) |
| `misc.footer.brand` | `settings.brand` | `iconSrc` is the one image the CMS cannot upload today |
| `misc.footer.social.links` | `settings.socials[]` | closed object → array |
| `misc.footer.columns[].links[]` | `pages.footer.columns[]` | give each a `kind`: `anchor \| modal \| whatsapp \| external` — see §7 |
| `misc.footer.cta.meta[]` | `settings.contact.{timezoneLabel, platform}` | |
| `misc.footer.bottom.builder` | `settings.builder` | `stack: "Next.js + Tailwind"` will be wrong after the rewrite |
| `packages.comparison.*` | `pages.packages.comparison` | tokenise the hardcoded "32" |
| `packages.private.*` numerics | `settings.pricing` | string → number |
| `packages.group.leaflet.{pagesDir,pagesFormat}` | **drop** | admin plumbing living in content; not even in the type |
| `packages.group.leaflet.autoAdvanceSeconds` `"1"` | `packages.leaflet.autoAdvanceSeconds` | **set to 5**; clamp `min(2)` |
| `packages.iaSupport.*` | `packages[kind:"ia"]` + `iaTopics` + `iaFeatures` | |
| `results.gradeImprovements.resultGroups[]` | `programmes` + `students` + `gradeScales` | the big one — see §5.1 |
| `results.gradeImprovements.summaryCards` | `pages.results.summaryCards` | **keep the `#` placeholder** — see §5.2 |
| `results.gradeImprovements.matrixHeader` | `pages.results.matrixHeader` | |
| `results.schools.items[]` | `schools` | 30; the "30 total schools" figure is derived |
| `results.resultsCta` | `pages.results.cta` | bullets restate stats as prose — tokenise |
| `testimonials.video.embedUrl` | `pages.testimonials.video` | keep the `/share/` → `/embed/` rewrite |
| `testimonials.featured[]` + `.carousel[]` | `testimonials` (one table, `placement` flag) | 28 rows |
| `layout.tsx` metadata | `settings.seo` | currently hardcoded in TSX |
| `nav.tsx` `NAV_SECTIONS` | `settings.navSections` | currently hardcoded in TSX; omits home |

### 5.1 Migrating the 93 student records

```
IBDP HL / AAHL / AIHL        31 students   scale: ibdp
IBDP SL / AASL / AISL        25            scale: ibdp
A-Level Further Math          4            scale: alevel
A-Level Math                 11            scale: alevel
IGCSE Additional / Further    4            scale: igcse
IGCSE Math / Intl Math       18            scale: igcse
                          ─────
                             93 rows → ~78 unique people
```

Migration steps, in order:

1. **Validate every `from` and `to` against its scale, exact match. Fail loudly.**
   This surfaces the three `B(6)` records immediately.
2. Fix those three (`B(6)` → almost certainly `B(7)`; confirm with the owner —
   the same James Chow appears in the sibling group as `B(7)`).
3. Dedupe people by name into `students`, with one `results[]` entry per programme.
4. Assign stable ids.
5. Re-derive `about.stats` from the student table rather than migrating the prose.
6. Link testimonials to `studentId` where the name matches, and **derive** the
   `"(Year)"` and `"From X to Y"` display strings instead of storing them.

### 5.2 Preserve the `#` placeholder

`summaryCards.top` is `"⭐ Final grade =#"` and `.second` is `"📘 Final grade ≥#"`. The `#` is
substituted at render with the active scale's top / second-from-top grade label, so one string
works for IBDP (`=7`) and A-Level (`=A*`).

**Keep the affordance, but fold it into the token system** as `{{scale.topGrade}}` /
`{{scale.secondGrade}}` so there is one interpolation mechanism, not two.

> Note a latent legacy bug: `shortGradeLabel()` splits on whitespace only, so for IGCSE the
> substitution yields `"⭐ Final grade =A*(9)"`, not `"=A*"`. Decide the intended display.

---

## 6. Rules the schema must enforce

| Rule | Why |
| --- | --- |
| Grades are a `{scaleId, bandValue}` reference, looked up by **exact match**, throwing on a miss | The substring match publishes wrong figures today |
| Prices and counts are `z.number().int()` | Four `toNumber()` copies with different fallbacks exist today; `toNumber(lessonMinutes, 60)` silently changes the price if the field is missing |
| Money formatting uses **one pinned locale** | 14 bare `toLocaleString()` calls vs a pinned `en-GB` in the hero → hydration mismatch and "HKD 19.800" for EU visitors |
| Every collection item has a stable `id`; assets are named by id | Index-coupled avatar filenames can overwrite the wrong person's photo |
| Every image path resolves to a real asset at build time | `carousel-1..4.png` are referenced and missing |
| Every `{{token}}` resolves | Silent empty strings in marketing copy are worse than a build failure |
| Every `imageSrc` has a sibling `alt` field | Alt text is hardcoded in JSX today, and one string is reused for two different photos |
| Link items carry a `kind`, not an overloaded `href` | `#privacy` → modal and `#contact` → wa.me are string-matched magic constants |
| Unknown keys are **stripped** on save (`.strict()`) | A typo in a field path silently writes a permanent orphan key today |

---

## 7. Behaviours the model must keep

These are non-obvious and easy to lose. Full algorithm specs in `docs/03-reuse-inventory.md`.

- **WhatsApp is the only conversion mechanism.** `https://wa.me/{phone}?text={encodeURIComponent(prefill)}`.
  No form, no email, no booking system. Seven context-specific prefills.
- **Footer link magic:** `#privacy` opens a modal, `#contact` rewrites to `wa.me`. Neither anchor
  exists in the DOM. Model as `kind`.
- **The home anchor is `#content`, not `#home`** — the footer's "Back to top" points at it.
- **Grade "maintained" cases are intentional** (7→7 ×3, 6→6 ×1). They land in the "0–1" column and
  count toward "=7" but not toward improvements. Do not filter them out.
- **Students with a negative delta are silently excluded** from the matrix. Keep that.
- **Matrix percentages use the full group total as denominator,** including maintained and
  regressed students.
- **Video is stored as a typed provider reference, not a raw URL.** Legacy behaviour: a Loom
  `/share/` link stored in JSON and rewritten to `/embed/` at render. Keep the *affordance* — the
  owner pastes a URL and the system works it out — but generalise the resolver:
  `{provider: "stream"|"loom"|"youtube", id}`. The student-voices video moves to Cloudflare Stream
  (already a paid subscription); keep the Loom branch working through migration. See
  `docs/05-hosting-auth-deploy.md` §5b.
- **`schools` count is derived** (`items.length + " total schools"`), never authored.
- **The copyright year must not be baked in at build time** — it is frozen today.
