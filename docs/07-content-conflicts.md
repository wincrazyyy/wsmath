# 07 — Content Conflicts to Resolve

Work through this **with the owner before migrating**. Several of these are published on the live
site right now and are wrong. Migrating them unchanged would carry the errors into the new build.

---

## A. Wrong data, publicly visible

### 1. Three IGCSE grades are not on their own grade scale ⚠️ **highest priority**

The `IGCSE · Additional / Further Pure Math` group declares:

```
gradeScale: ["U(1)","G(2)","F(3)","E(4)","D(5)","C(6)","B(7)","A(8)","A*(9)"]
```

B is paired with **7**. But three of that group's four students carry `from: "B(6)"`:

| Student | Year | Recorded | Renders as |
| --- | --- | --- | --- |
| James Chow | 2022 | `B(6)` → `A(8)` | **+8 grades** (should be +1 or +2) |
| Jacky Nie | 2021 | `B(6)` → `A(8)` | **+8 grades** |
| Emily Lau | 2018 | `B(6)` → `A*(9)` | **+9 grades** |

`normalizeGrade()` matches by substring and returns `0` on no match, silently. All three therefore
appear in the **"4+ grade improvement"** column, and the "Major jumps (≥2 grades)" and
"Grade boost (≥1 grades)" counters are inflated.

**Strong evidence it is a typo:** the same James Chow appears in the sibling
`IGCSE · Math / International Math` group with `from: "B(7)"`.

> **Question for the owner:** should these read `B(7)` (i.e. B → A is a 1-grade jump) or `C(6)`
> (C → A is a 2-grade jump)? The whole IGCSE Additional column changes either way.

### 2. "Since 2018" vs "since Sep 2017" vs "8 yrs"

Three contradictory experience claims:

| Value | Where |
| --- | --- |
| `"since Sep 2017"` | `home.json` hero stat sublabel |
| `"8 yrs"` | `home.json` proof pill (implies 2017→2025 — **already stale in 2026**) |
| `"Since 2018"` | `packages.json` header accent badge |

> **Question:** what is the real start date? It becomes `settings.stats.teachingSince`, and years
> of experience is then **derived** so it can never go stale again.

### 3. The value comparison compares lessons against hours

```
private32Hours = hourlyRate × group.lessons = 1500 × 32 = 48,000
label:           "32+ hours 1-to-1 ≈ HKD 48,000"
```

But `lessons` counts **90-minute** sessions, so 32 lessons is **48 hours**, which at HKD 1,500/hr
is **HKD 72,000**. The very next line in the same file *does* apply the conversion
(`eightLessonBlockCost = rate × 8 × (90/60)`).

> **Question:** is the intended claim *"32 lessons of 1-to-1 ≈ HKD 48,000"* or *"48 hours of 1-to-1
> ≈ HKD 72,000"*? The second is a much stronger argument for the group course, but it must be true.

### 4. Four referenced avatar files do not exist

`testimonials.carousel[0..3].avatarSrc` point at `/avatars/carousel-1.png` … `-4.png`. None exist
in `public/avatars/`. They fail silently only because those entries also set
`useDefaultAvatar: true`. **Unticking that checkbox in the admin produces four 404 images.**

Affected: James Chow (2024), Sharon Deng (2023), Joy Angela Sun (2022), Cassie Luo (2023).

> **Question:** supply the four photos, or set them to no-avatar like the other 14?

### 5. Leaflet auto-advances every 1 second

`packages.group.leaflet.autoAdvanceSeconds` is `"1"` — nine pages flipping once per second. The
component's own fallback default is `5`, and the admin help text says *"e.g. 5"*.

> Almost certainly a leftover test value. Confirming 5 s.

---

## B. The same fact recorded twice, already diverged

`about.json.stats[]` is seven prose restatements of records that also exist structurally in
`results.json`.

| About says | Results says | Conflict |
| --- | --- | --- |
| "Janis (2024) IGCSE 0580 C → A* (4 months)" | Janis Law, **2019**, C(6) → A*(9), **3** months | Year off by 5, duration off by 1 |
| "Kelly (2023) IGCSE 0607 F → A (10 months)" | Kelly Li, 2023, F(3) → A(8), **no months recorded** | Duration exists in one place only |
| "Emily (2018) IGCSE 0606 B → A* (2 months)" | Emily Lau, 2018, **B(6)** → A*(9), 2 months | Depends on #1 |
| "James (2024) IBDP AAHL 1 → 7 (2 years)" | James Chow, 2024, 1 → 7, **no months** | Duration in one place only |
| "Fiona (2022) IBDP AAHL 3 → 6 (3 months)" | Fiona Wan, 2022, 3 → 6, 3 months | ✓ agrees |
| "Sharon (2023) IBDP AASL 3 → 7 (1.5 months)" | Sharon Deng, 2023, 3 → 7, 1.5 months | ✓ agrees |
| "CY (2021) IAL Further Math F → A* (2 years)" | CY Ting, 2021, F → A* | ✓ agrees |

> **Resolution:** `results.json` becomes the single source of truth. The About pills are **derived**
> from the student table, so they can never drift again. Confirm the correct year and duration for
> Janis, and whether Kelly's and James's durations should be recorded.

---

## C. Testimonial metadata vs the results table

Testimonial `role` strings embed programme, both grades and sometimes duration. Several disagree
with `results.json`.

| Testimonial | `role` claims | Results record | Conflict |
| --- | --- | --- | --- |
| Vivian Chen | "(2018) IBDP Math HL 1 → 4" | 2019 | Year |
| Lucia Zhu | "(2018) IBDP Math HL 3 → 6" | 2019 | Year |
| Connie Feng | "IBDP AASL — From **2** to 5" | 1 → 5 | Starting grade |
| Coco Cheng | "(2024) CAIE Math — From **D** to A" | 2025, **F** → A | Year and starting grade |
| Michelle Chan | "IAL Math + Further Math — From F to A*" | Further Math F → A*, **Math B → A\*** | Conflates two programmes |
| Jason Yeung | "From 4 to 7 **[in 16 months]**" | no months recorded | Duration in one place only |
| Bill Zhang | "CAIE Math + Further Math — From F to A*" | appears in 3 groups with different deltas | Conflates programmes |
| **Lucy Han** | "**HKDSE** Math — From 3 to 5" | **no HKDSE programme exists** | Orphan programme |

> **Questions:**
> 1. Which value is correct in each case? Results is presumably authoritative — confirm.
> 2. Lucy Han: add an HKDSE programme, or is this testimonial from a different context?
> 3. For students spanning multiple programmes (Bill Zhang, Michelle Chan, CY Ting), which single
>    result should the testimonial display?
>
> After migration, testimonials **link to a `studentId`** and derive their display string, so this
> class of drift becomes impossible.

---

## D. Editorial decisions

### 6. Yuki Lam is recorded with year **2026**
A future cohort, appearing in both A-Level groups (`F → A*` and `B → A*`).
> **Question:** publish now, or hold until results are confirmed?

### 7. Privacy policy last updated **2025-12-22**
Nineteen months stale, and it will need revising anyway if content moves to a database and
analytics are added.
> **Action:** review the policy, add a line about analytics, update the date.

### 8. Builder credit
`misc.json` footer records `stack: "Next.js + Tailwind"` and credits XiniDev / xini.dev.
> **Action:** the stack string will be wrong after the rewrite. Confirm the credit should carry over
> (it is deliberate attribution, worth keeping consciously rather than dropping by accident).

### 9. Two headers per section
`faq.json` carries **both** `header.{eyebrow,title,subtitle}` and `top.{eyebrow,heading,subheading}`
— both with the eyebrow "FAQ", so it renders twice on screen. The same duplication exists in
results and testimonials.
> **Action:** collapse to one header per section. Confirm which copy to keep.

### 10. Three accent columns rendered in a two-column grid
`results.json` supplies three (`CONSISTENT PROGRESS` / `TOP BANDS` / `FAST INITIAL GAINS`) but
`section-header.tsx` hardcodes `grid-cols-2`, so the third wraps to an orphan row.
> **Action:** the new design should let the column count drive the grid. Confirm all three should
> show.

### 11. The Results CTA and floating CTA have no dedicated WhatsApp prefill
Both use the generic message, so enquiries from the results section cannot be attributed.
> **Action:** write two more prefills. This matters once click tracking exists.

### 12. Two sections' hardcoded copy is not editable today
`"Flagship"` (the badge on the emphasised course group) and `"Premium Quality"` (a chip in the
pricing strip) live in JSX.
> **Action:** confirm both should become editable content.

---

## E. Normalisation to apply during migration (no decision needed)

These are mechanical. Apply them, then show the owner a diff.

| Fix | Detail |
| --- | --- |
| Straight vs curly apostrophes | `about.json` IBDP prefill uses `I’m` while the A-Level and IGCSE prefills use `I'm`. The schools list mixes "St. Paul's Co-educational College" with "St. Paul’s Convent School" |
| Trailing whitespace | One testimonial quote ends with a space |
| `"11,000+ lessons"` vs `"11,000 lessons taught"` | Inconsistent `+` suffix for the same figure |
| Curricula label written six ways | `"IBDP, A-Level / IAL and IGCSE"` · `"IBDP · A-Level / IAL · IGCSE"` · `"IBDP · A-Level · IGCSE"` (drops IAL) · `"IBDP, A-Level / IAL, and IGCSE"` (Oxford comma) · `"IBDP / A-Level / IGCSE"` — across 8 places |
| Equipment written two ways | `"iPad + Apple Pencil + GoodNotes"` (×3) vs `"Zoom · iPad + Apple Pencil recommended"` (drops GoodNotes) |
| `header.subtitle` vs `subheading` | Same concept, two key names across four documents |
| Stale example in admin help | `misc-fields.ts` shows phone `85293199914`; the real number is `85269447214` |
| Duplicate alt text | `"Tutor pointing upward"` used for both `/about-hero.jpg` and `/private-package.jpg` |
| Dead config | `IMAGE_UPLOAD_TARGETS["testimonials.testimonialsCta.logoSrc"]` and `gradeImprovements.heatmapKeys` reference keys that do not exist |
| `footer.brand.iconSrc` | The one image on the site that cannot be uploaded through the CMS — it has no upload target, only a text box |

---

## Migration checklist

Verify these counts survive the migration exactly:

```
93  student records  (31 IBDP HL · 25 IBDP SL · 4 AL Further · 11 AL Math
                      · 4 IGCSE Additional · 18 IGCSE Math)   → ~78 unique people
28  testimonials     (4 featured + 24 carousel)
30  schools
20  course codes     (across 3 groups: 5 / 9 / 6)
 8  FAQ items
 8  IA topics + 6 IA features
 9  leaflet pages
 7  WhatsApp prefills
 7  About stat pills  (to be DERIVED, not copied)
 4  privacy sections
 3  proof pills
 3  rightAccent cards
 3  grade scales
 2  footer columns × 4 links
 2  footer meta rows
```
