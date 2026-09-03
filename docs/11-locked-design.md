# 11 — Locked Design: v6.3.2 "The Movement, Gilded"

> **DECIDED 2026-08-18. Client-approved. This is the design. Do not re-litigate it.**
>
> **v6.3.2 "The Movement, Gilded" supersedes "The Boundary"** (locked 2026-07-28, never built past
> one branch). The Boundary specification is retained below, under a superseded banner, because it
> is the origin of several decisions this design kept — the `--step` wide-screen unit, the
> outcomes-only accent reservation, the grade rail, the folder tabs, the real `<table>` matrix, the
> `prefers-reduced-motion` floor and the accessibility floor. Read §0 first; everything after the
> superseded banner is history, not instruction.
>
> The single source of truth is the client-approved artifact **`4820bc1c…`**, snapshotted for the
> rebuild session as `v6-3-2.html` in that session's scratchpad (346,702 bytes; one page, inline
> CSS + JS, content baked in, every class `mvt-` prefixed). It is a **comp, not a codebase**: the
> shipped site renders the same design out of the content system, and the places where it
> deliberately departs from the comp are listed in `docs/12-migration-deviations.md`.
>
> ⚠ The artifact file has **no `<!DOCTYPE html>`**, so a browser renders it in **quirks mode** while
> any real page renders in standards mode. Measured geometry therefore differs in one specific
> case: a block whose content is *only* inline elements, where an inline child declares a **smaller**
> `line-height` than the block, collapses to the child's box in quirks mode and to the block's strut
> in standards mode. Suspect this before suspecting the CSS whenever a transcribed box measures
> taller than the comp.

---

## 0. v6.3.2 — the locked specification

### 0.1 The identity in one line

**A dark lacquer sheet, machined: deep indigo grounds separated by 2px seams, brass as the only
metal, gold reserved for student outcomes, one carmine band as the page's single material change,
and a serif display face doing the talking.**

Where the Boundary declared the result in signage-scale grotesk on warm paper, this declares it in
depth: every panel is either sunk into the lacquer (`--lac-well`) or lifted out of it
(`.mvt-raise`), and the eye reads the hierarchy as physical relief rather than as contrast.

### 0.2 Colour — locked (`src/app/globals.css`, declared on `.mvt-root`)

```css
/* lacquer — the ground, six depths */
--lac-void:#07031b  --lac-well:#110134  --lac-ground:#1c0848
--lac-face:#28165b  --lac-lit:#35256f   --lac-rise:#443584

/* OUTCOME GOLD — student outcomes only; never a rule, never a bezel */
--au-abyss:#1d1501 --au-nil:#2d2304 --au-deep:#493805 --au-mid:#715713 --au:#b0870f --au-lit:#fad035

--am-deep:#4c3996 --am:#7864d7 --am-lit:#ada2ff      /* amethyst — the emphasised tray */
--ca-deep:#8d182c --ca:#cc3148 --ca-lit:#fb8083      /* carmine — the access ribbon only */

--brass-ink:#7e5312 --brass-deep:#9b722c --brass:#e6bf5d --brass-hi:#f6e8b3
--ink:#f7f3e9 --ink-2:#cac8d8 --ink-3:#9e9cb0
--paper:#f5f2e9 --paper-ink:#201f2a                  /* inlay sheets + the privacy panel */
--wa:#25D366                                          /* WhatsApp disc only */
```

Four brass gradients carry the metal: `--brass-cast` (ornament), **`--brass-cast-cta`** (a
shallower pour whose darkest stop is `#a87f36`, so `--lac-void` on it is 5.54:1 — applied **only**
to `.mvt-plate-cta`, because that plate carries text), `--brass-cast-text` and `--brass-radial`.

**Single theme, committed** — dark only. `color-scheme:dark` on `.mvt-root`; there is no light
variant and no theme toggle.

### 0.3 Typography — system stacks only, no webfont

```css
--f-display:Constantia,"Sitka Heading",Cambria,"Iowan Old Style",Charter,Georgia,ui-serif,serif
--f-ui:Bahnschrift,"Segoe UI Variable Display","Franklin Gothic Medium",Corbel,Avenir,system-ui,sans-serif
--f-data:Consolas,"Cascadia Mono",ui-monospace,"SF Mono",Menlo,monospace
--f-hant:"Microsoft JhengHei","PingFang HK","Noto Sans HK","Segoe UI",sans-serif
--f-hans:"Microsoft YaHei","PingFang SC","Noto Sans SC","Segoe UI",sans-serif
```

**This design ships no webfont. Do not add one** — `src/lib/fonts.ts` and the Roboto Flex payload
were deleted with the Boundary build. The Boundary's "must self-host a variable grotesk" note in
§3 below no longer applies: the display voice here is the *serif*, which is well served on every
platform, and the sans is supporting.

**CJK rules set FAMILY only, never `font-size`.** The comp writes
`.mvt-root :lang(zh-Hant){font-family:…;font-size:1.05em;line-height:1.9}` at specificity (0,2,0),
which out-ranks every card register and is the root cause of the client's reported testimonial
sizing bug. Each register declares its own CJK size against its own base instead — voices owns the
quote registers, the hero owns the inscription, the footer owns its tagline and 小紅書 label, and
generic flowing `.mvt-body` copy keeps the 1.05 optical bump. `:lang(yue)` is matched everywhere
`zh-Hant` is; one testimonial really is Cantonese. **Never put a `font-size` back into a bare
`:lang()` rule.**

### 0.4 Layout and scale — locked

```css
--wrap:1960px                                   /* content max width */
--pad:clamp(18px,3.6vw,92px)                    /* wrap gutter */
--inset:clamp(20px,1.9vw,34px)                  /* panel inner inset */
--sec:clamp(76px,5.6vw,150px)                   /* section padding-block (56px ≤640) */
--step:clamp(0px,(100vw - 1600px) * 0.0055,5px) /* wide-screen growth unit, inherited from Boundary */
--coin-w:86px                                   /* the fixed coin's reserved lane — LOAD-BEARING */
```

`--coin-w` is a reserved *lane*, not a decoration: `.mvt-wrap`'s right padding and the testimonial
trough's `margin-right` both honour it, and the lane stays reserved even while the coin is hidden
behind the plan panel. Removing it lets content slide under the fixed pair.

**The wide-screen tier is still non-negotiable.** The owner reviews on a 2560×1440 monitor at 100%
scaling; verify every change at **2560 / 1920 / 1440 / 1024 / 768 / 390**.

### 0.5 Section order

`nav · hero · about · courses · ribbon · packages · results · voices · faq · footer`

A **2px `.mvt-edge` seam separates every adjacent pair**, rendered by `page-view.tsx` — never by a
section. Sections carry `id="mvt-s-<name>"`; content stores plain ids and `src/lib/anchors.ts` maps
between the two. Results still precedes testimonials: data before anecdote.

Two **fixed** elements live outside the flow, owned by `components/layout/plan-panel/`: the
WhatsApp coin (bottom-right) and the "Your plan" panel. **The panel replaces the coin** — it takes
the coin's corner and the coin cross-fades out, returning 120ms after the panel parks or hides.
Below 1280px the panel is a full-width bottom bar. z-ladder: `2` matrix sticky head · `60` grain ·
`80` nav · `90` fixed pair · `120/130` dialog overlay/panel · `200` skip link.

### 0.6 Signature components

| Component | What it is |
| --- | --- |
| **The lacquer sheet** | Six ground depths plus one tiled 256px turbulence grain at 5.5% overlay. Panels are `.mvt-well` (sunk) or `.mvt-raise` (lifted); nothing floats on a flat card |
| **`.mvt-edge`** | The 2px machined seam between sections — the page's only divider |
| **The access ribbon** | One full-bleed carmine band. The single material change on the page; nothing else may use `--ca-*` |
| **Brass plate CTA** | `.mvt-plate-cta`, the only WhatsApp button shape, with an optional `--wa` disc (hero ✓ ribbon ✓ results ✓ footer ✓ panel ✓ · nav ✗ package plates ✗ IA ✗) |
| **Grade stream** | An SVG ribbon per published record, platinum→gold, drawn left to right on reveal. The dash length is measured in **device** pixels, not user space — see `docs/12` and `results-panel.tsx` |
| **Improvement matrix** | A real semantic `<table>`, mouse/keyboard/touch, that expands to name the students in a cell. Replaces the stream entirely ≤640px |
| **Folder tabs** | The six course groups as ledger tabs, roving tabindex, arrow/Home/End |
| **Testimonial trough** | A seamless CSS marquee of the curated twelve, with a real pause control and hover-pause |
| **Leaflet vitrine** | The nine-page group-course leaflet in a lac-void recess, sized from the page's own aspect ratio. Not in the comp — see `docs/12` §F |
| **Paper inlays** | `--paper` sheets ruled at 24px — the about panels, the FAQ answers, the privacy policy |

**Banned outright:** any second webfont; any use of `--au-*` gold on a rule, bezel or non-outcome
figure; any use of carmine outside the ribbon; a `font-size` inside a bare `:lang()` rule; a fixed
element rendered from inside a section; content imported at module scope inside a component.

### 0.7 Motion

`.mvt-rev` (+ `--s` / `--rule` / `--paper` variants) plus `.is-in`, driven once by `MvtRoot`
(IntersectionObserver + scroll sweep + 120ms poll + 4200ms failsafe + sibling stagger, with a
MutationObserver re-scan so `/preview` drafts animate too). No section runs its own reveal loop.

The hidden state is gated on `body.js` so a reader without JavaScript gets the finished page.
**That gate raises each hidden rule to the same specificity as `.mvt-rev.is-in`, so ORDER decides
the winner: every hidden state must be declared before every settled state.** Getting this backwards
parks every `--s` element 14px low, permanently, on every section of the site — it happened, it was
invisible until the boxes were measured, and `globals.css` now carries the warning inline.

`prefers-reduced-motion` renders everything complete and static: globals forces 1ms durations, and
every piece of behavioural JS branches on it as well (the stream paints drawn, the marquee stops,
the counter shows its final value, the leaflet opens on *Play*).

### 0.8 Accessibility floor

Unchanged from §6 below, plus: `lang` on every non-English run; explicit ARIA roles on the matrix
that survive its `display:block` phone override; a changing accessible **name** rather than
`aria-pressed` on every play/pause control; `aria-live="polite"` only for reader-initiated changes;
focus trapped and returned by both dialogs; and both dialogs portalled **into `.mvt-root`**, never
to `<body>` — every design token is declared on that div, so a body portal renders unstyled.

**Known gap, inherited from the comp and not silently changed:** nav links (32px), footer column
links (15px), social links (14px) and the footer's brass plate (40px) are below the 44px tap-target
floor, at every viewport, exactly as in the artifact. Fixing it is a design change and needs the
owner.

---

<!-- ─────────────────────────────────────────────────────────────────────────
     SUPERSEDED BELOW — "The Boundary", locked 2026-07-28, replaced 2026-08-18.
     Retained because §4's `--step`, §5's grade rail / matrix / folder tabs,
     §6's accessibility floor and §7's motion rules all carried forward into
     v6.3.2. Its palette, typography and section order did NOT. Do not build
     from anything below this line.
     ───────────────────────────────────────────────────────────────────────── -->

# Superseded — "The Boundary" (2026-07-28 → 2026-08-18)

> Chosen from five competing directions plus two hybrids, all built as full working pages and
> independently critiqued. The reference implementation was
> `scratchpad/hybrid-2-boundary.html` (published artifact), a complete, browser-verified
> single-page comp carrying the real content at 2560 / 1440 / 768 / 375 px.
>
> Owner verdict at the time: *"Everything about the Boundary is great … perfect for my screen as
> well."* It was replaced when the owner approved v6.3.2.

---

## 1. The identity in one line

**Near-black on warm off-white, with a saturated blue carrying structure rather than decoration,
signage-scale grotesk numerals used as architecture, and hard ink rules instead of cards.**

It declares the result. The numbers *are* the design — 20,000 hours, 93 records, the 7, the 19,800.
The competing direction ("The Ledger") made its case by showing provenance in warm archival paper;
this one makes it by stating the outcome at scale. Sharp, high-contrast, unmistakably a 2026 page
rather than a printed document.

**Its DNA:** contrast and colossal numerals from *Level 7*; information design (results graph,
matrix, testimonial layout) from *Plotted*; the WhatsApp chat-bubble CTA from *The Markscheme*;
folder tabs and the section spine from *Trajectory*.

---

## 2. Colour — locked

Do not substitute hexes. Green is **semantically reserved for outcomes** and must never be used
decoratively; that reservation is what makes the results section read as data.

```css
/* ground */
--paper:        #FBF9F4   /* page */
--paper-2:      #F2EDE1   /* sunken panels, table stripes */
--paper-3:      #E5DECD   /* deepest inset */

/* ink */
--ink:          #0C0E15   /* body, display type */
--ink-80:       #33353E
--ink-55:       #52545E   /* secondary text */
--ink-40:       #5F616B   /* marginalia — do NOT go lighter, see §6 */

/* rules */
--rule:         #D5CFC0   /* structural 1–2px rules */
--hair:         #E3DDD0   /* hairlines, grid */

/* brand */
--blue:         #1433D6   /* structure, primary CTA, the second display colour */
--blue-deep:    #0B1E8E   /* pressed/active, deep fills */
--blue-tint:    #E1E5FB   /* quiet fills, badges */

/* OUTCOMES ONLY */
--green:        #0A6B3D   /* grade improvement, upward delta */
--green-2:      #12874E   /* matrix heat, graphic marks */
--green-tint:   #E0EFE6

/* the one correct use of a foreign brand colour */
--wa:           #25D366   /* WhatsApp send square only */

/* colossal numerals — tinted, never full strength */
--numeral:      color-mix(in oklab, var(--ink)  15%, var(--paper))
--numeral-blue: color-mix(in oklab, var(--blue) 27%, var(--paper))
```

**Single theme, committed.** Light only. Force the palette under **both**
`@media (prefers-color-scheme: dark)` **and** `:root[data-theme="dark"]` so a viewer's theme toggle
cannot break the page. This is a deliberate commitment, not an omission — the legacy site
half-implemented dark mode and it was one of the audited defects.

---

## 3. Typography — locked, with one production substitution

```css
--sans:  Bahnschrift, "Segoe UI Variable Display", "Franklin Gothic Medium",
         Corbel, Candara, Optima, Avenir, system-ui, sans-serif
--mono:  Consolas, "Cascadia Mono", ui-monospace, "SF Mono", Menlo, monospace
--serif: Constantia, Cambria, "Sitka Text", "Iowan Old Style", Charter, Georgia, ui-serif, serif
--cjk-face: "Microsoft JhengHei","PingFang HK","Noto Sans HK",
            "Hiragino Sans CNS","Microsoft YaHei", sans-serif
```

| Role | Face | Notes |
| --- | --- | --- |
| Display / numerals | `--sans` condensed | The identity. Signage scale, tight tracking |
| Data, labels, marginalia | `--mono` | Grades, prices, provenance, part labels |
| Long-form prose | `--serif` | FAQ answers, testimonial quotes |
| CJK | `--cjk-face` | 14 of 28 testimonials are Chinese |

### ⚠️ The one thing that must change in production

**Bahnschrift is Windows-only.** The comp hangs its condensed-grotesk hierarchy on it, and on
macOS/iOS it falls through to Optima/Avenir — a humanist calligraphic face that reads *spa*, not
*exam paper*. Hong Kong international-school families are heavily iPhone/Mac.

**The real build must self-host a variable grotesk** with a genuine width axis — Roboto Flex,
Recursive, or a licensed Söhne / GT America-class face. Subset it, `woff2`, `font-display: swap`,
preloaded. **Re-approve the design against a render with the real face before shipping**, because
the identity *is* the numerals.

Set `lang` on every non-English block. `tabular-nums` wherever digits align. Never fragment a
heading into per-word spans (the legacy `renderStyledTitle()` did this; it is deleted).

---

## 4. Layout and scale — locked

```css
--step:    clamp(0px, (100vw - 1600px) * 0.0055, 5px);  /* wide-screen growth unit */
--maxw:    min(2040px, 90vw);
--pad:     clamp(16px, 3.4vw, 52px);
--sec-pad: clamp(52px, 7vw, calc(104px + var(--step) * 6));
--gutter:  128px;
```

**The wide-screen tier is non-negotiable.** The owner reviews on a **2560×1440 monitor at 100%
scaling**. Every earlier comp capped its container between 1023 and 1360px, so page height at 2560px
was byte-identical to 1440px — the content occupied half the screen and read undersized. `--step`
exists to grow type and spacing past 1600px **without changing anything at 1440 and below.**

Verify every change at **2560 / 1440 / 768 / 375**. Raising the baseline is a failure, not a fix.

### Section order

`nav · hero · proof · about · packages · results · schools · testimonials · FAQ · footer`

**Results before testimonials.** Data before anecdote is the stronger argument for a parent, and the
matrix is the site's genuine differentiator.

---

## 5. Signature components

| Component | What it is | Origin |
| --- | --- | --- |
| **WhatsApp chat bubble** | The real prefilled message rendered as a chat bubble with dashed `name / school / year` slots and a `#25D366` send square. Reads as a conversation starter, not a checkout button — and makes the placeholder trio legible as an *instruction* | all five comps converged on it independently |
| **Grade rail** | One shared 9-slot rail so one step = one grade step across IBDP 1–7, A-Level F–A\* and IGCSE U(1)–A\*(9), right-anchored to the ceiling | all five converged |
| **Per-student dumbbell** | Hollow dot = starting grade, filled green dot = final, bar between = the climb | Trajectory |
| **Distribution pyramid** | Bin counts 0–1 / 2 / 3 / 4+ with a median bracket | Plotted |
| **Matrix** | Real semantic `<table>`; cell expands to name the students inside. Must work on **mouse, keyboard and touch** — this was broken on all three in an early comp | Plotted |
| **Mobile matrix** | `clip-path`-hidden `thead` + `::before{content:attr(data-bin)}` per-cell labels, plus a flex-proportional bar for the overview | Level 7 + Plotted |
| **Grade-delta privacy avatar** | The 14 withheld students get a `1 → 7` graphic with the start grade struck and the final in green, captioned "photo withheld". **Never a grey silhouette** | Markscheme |
| **Folder tabs** | The six curriculum groups as ledger folder tabs | Trajectory |
| **`.boundary` divider** | 2px ink rule with a mono part label knocked out on paper — grade-boundary as page furniture | Level 7 |
| **Colossal numerals** | Signage-scale figures, tinted via `--numeral`, cropped by the viewport, content sitting against them | Level 7 |

### Banned outright

Chip / tag rows carrying content-free filler (*"Structured skill-building · Clear weekly
progression"*). The owner called them ugly; an independent critique said delete on sight. If a chip
carries real information, promote it into the copy or a real data element.

Also banned: three-evenly-spaced feature grids with an icon in a tinted circle; accent bar on a
rounded card repeated a dozen times; purple→blue gradient heroes; everything centered.

---

## 6. Accessibility floor

- `--ink-40` (#5F616B) is the **lightest tone permitted to carry text**. Marginalia at 10–11px in a
  lighter grey failed WCAG AA across every comp, and marginalia is where the provenance lives.
- Lighter tones (`--hair`, `--rule`, tint colours) are for **graphic marks only** — never text.
- Visible focus rings everywhere. `:focus-visible` must not be out-specified by `:hover`.
- The matrix is a real `<table>` with scoped headers.
- Carousel: pause control, and the duplicated half `aria-hidden` with `role`/`aria-label` stripped.
- `lang` on every non-English block.
- `prefers-reduced-motion` honoured globally; the static state must be a good design on its own.

---

## 7. Motion

Scroll-triggered via `whileInView` / IntersectionObserver with `once: true` — **never
mount-triggered.** The legacy `SectionReveal` animated everything simultaneously during hydration.

Animate `transform` and `opacity` only. Never `width`, `height`, `top` or layout properties. Bars
grow with `scaleX` and `transform-origin: left`.

Motion must carry meaning: numbers count up because the number is the point; matrix cells expand
because the students inside are the payoff. Nothing bobs decoratively.

---

## 8. What this does not settle

Design is locked. These remain **owner decisions** and are tracked in `docs/07-content-conflicts.md`:

1. **93 vs 45.** Only 45 records carry publishable per-student detail. Every comp labelled this
   honestly, but the site's spine visibly shows less than half its claimed weight. Either Winson
   supplies the other 48, or the headline claim changes.
2. **Two central-tendency claims** — `2+ average grade uplift` and `median +3 grades` are computed
   on different bases, one pooled across a 7-point and a 9-point scale. Both defensible; showing
   both is not. Pick one.
3. **Coco Cheng** appears as *2025 F→A* in the ledger and *2024 CAIE Math D→A* in her testimonial.
4. **The price unit conflict** — `32+ hours 1-to-1 ≈ HKD 48,000` compares lessons against hours.
   32 sessions × 90 min = 48 h, so the honest 1-to-1 figure is HKD 72,000.
5. **Real social URLs** and a **real 小紅書 mark** — neither exists in the content today.
