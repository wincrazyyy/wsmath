# 06 — Design Foundation

> **⚠️ SUPERSEDED 2026-08-18 by `docs/11-locked-design.md`.** The brief below asked for a light,
> white-and-blue direction. The client approved the dark v6.3.2 "The Movement, Gilded" design
> instead, and that is what shipped. The information-architecture and behaviour constraints here
> informed the build; the visual direction did not survive and must not be reintroduced.

Starting point for the redesign session. **The old visual language is discarded entirely.**
This document fixes what must not change (information architecture, behaviour) and proposes a
direction for what should.

---

## 1. The brief

> *"Fully remake how it looks — the whole website. I don't want to keep the original style. Colour
> scheme light: white and something like blue or green. Way better, more creative, more clean.
> Like a portfolio, but with admin customisability."*

So: **premium, editorial, light.** The positioning is *"International Mathematics Exam Strategist"*
for IBDP / A-Level / IGCSE students aged 15–18 and their parents, in Hong Kong and worldwide, at
HKD 1,500/hour. The design has to read like a specialist consultant's portfolio, not a tuition-centre
flyer. Parents are the buyers; students are the users.

---

## 2. Information architecture — the one thing to decide first

Today the entire public site is **one page** with six anchored sections, and only `/` and `/admin`
exist as routes.

| | Single page (current) | Real routes |
| --- | --- | --- |
| SEO | One title, one description for six topics | Per-page titles, descriptions and JSON-LD; each section can rank |
| Sharing | `#results` works | `/results` is cleaner and previews properly |
| Narrative | One continuous scroll — genuinely good for a portfolio | Requires deliberate cross-linking |
| Migration risk | None | Every URL changes; `#anchor` contract breaks; needs redirects |

**Recommendation: a hybrid.** Keep `/` as a strong single-page narrative — it suits the portfolio
framing and it works. Add real routes for the two content-dense sections that deserve to rank and
be shared independently:

- `/results` — the grade-improvement matrix, all 93 records, all 30 schools
- `/packages` — the two priced offers, with `Course` + `Offer` structured data

The home page keeps condensed versions of both with a "See all results →" link. If a full split is
preferred, redirect every legacy `#anchor` to its new route.

**Whatever is chosen, these ids stay resolvable:** `#content` (home — *not* `#home`; the footer's
"Back to top" points at it), `#about`, `#packages`, `#testimonials`, `#results`, `#faq`, plus the
pseudo-anchors `#privacy` and `#contact`.

### Section order to preserve

1. **Hero** — bilingual identity, portrait, one WhatsApp CTA, animated credibility stat
2. **Proof pills** — three credential lines
3. **About** — who I teach, what you get / how I teach, result pills, courses covered, CTA ribbon
4. **Packages** — value comparison, private 1-to-1, group Level 7 Mastery (with leaflet), IA support
5. **Testimonials** — Loom video, 4 featured, 24-item carousel
6. **Results** — grade improvement matrix, schools, CTA
7. **FAQ** — 8 items
8. **Footer** — brand, socials, two link columns, contact CTA, privacy, builder credit

**Consider moving Results above Testimonials.** Data before anecdote is the stronger argument for a
parent, and the matrix is the site's genuine differentiator. Worth testing in the design session.

---

## 3. Colour direction

Light base, **blue primary, green reserved for outcomes.** The rationale matters more than the
exact hex:

- **Blue** for trust, academia, structure — the brand and all primary UI.
- **Green** used *semantically*, not decoratively: grade improvements, upward deltas, the matrix
  heat, "improved" counters. Green means growth, and this site's entire proposition is measurable
  improvement. Reserving it makes the results section read as data rather than decoration.
- **Warm neutrals** for surfaces rather than pure grey — pure white plus cool grey reads clinical;
  a warm off-white reads premium.

```
--background      #FFFFFF
--surface         #FAFAF9   warm off-white — sections, cards
--surface-sunken  #F5F5F4   inset panels, table stripes
--border          #E7E5E4

--primary         #1D4ED8   blue-700   brand, links, primary CTA
--primary-soft    #EFF6FF   blue-50    badges, quiet fills
--accent          #059669   emerald-600  GRADE IMPROVEMENT ONLY
--accent-soft     #ECFDF5   emerald-50

--fg              #1C1917   stone-900
--fg-muted        #57534E   stone-600
--fg-subtle       #A8A29E   stone-400

--whatsapp        #25D366   the one place the brand colour is correct to use
```

**Matrix scale** — a single-hue emerald ramp keyed to jump size, so the "4+ grade improvement"
column is visually the loudest:

```
0–1 → stone-100    2 → emerald-100    3 → emerald-300    4+ → emerald-500
```

**Dark mode:** decide deliberately. The legacy site half-implemented it — `globals.css` defines
`prefers-color-scheme: dark` tokens that the hardcoded `bg-white text-neutral-900` on `<main>`
completely ignores. Either commit to it properly or drop the tokens. For a light-first portfolio,
dropping it is a defensible choice.

---

## 4. Typography

The legacy site loads three Google fonts and then sets `body { font-family: Arial }` in
`globals.css`, defeating all of them. Rubik is the intended display face; Geist and Geist_Mono are
create-next-app residue that never render.

Proposal:

| Role | Face | Notes |
| --- | --- | --- |
| Display | A confident geometric or editorial sans — **Satoshi**, **General Sans** or **Instrument Sans** | Tight tracking at large sizes |
| Body | **Inter** or **Geist Sans** | Excellent at 15–17 px, wide language coverage |
| Numerals | **tabular-nums** everywhere numbers align | Prices, grades, the matrix, the count-up stat |
| CJK | **Noto Sans HK** + **Noto Sans SC** | 14 of 28 testimonials are Chinese; the tagline is 國際數學科考試軍師. The current site has no CJK font stack at all |

Two rules the legacy site breaks:

- **Never fragment a heading for effect.** `renderStyledTitle()` splits the `<h1>` into per-word
  spans to fake a drop-cap. Delete it.
- **Set `lang` on every non-English block.** Chinese quotes under `<html lang="en">` are currently
  read aloud with an English voice, and get the wrong font fallback.

Scale: a fluid `clamp()` ramp, 1.25 modular. Measure capped at ~68ch for prose.

---

## 5. Motion

framer-motion, with three principles:

1. **Scroll-triggered, not mount-triggered.** `SectionReveal` is named for scroll but is actually a
   mount-time CSS keyframe, so on a single-page site *everything animates at once during
   hydration*. Use `whileInView` with `viewport={{ once: true, margin: "-15%" }}`.
2. **`prefers-reduced-motion` is a global gate, not a per-component afterthought.** Today only one
   component (the CTA ribbon) handles it correctly, while an infinite pill float, a 4-second chip
   rotator, a 160 px/s carousel and a random cell-opening demo all ignore it.
3. **Motion carries meaning or it does not exist.** Numbers count up because the number is the
   point. Matrix cells expand because the students inside are the payoff. Nothing bobs decoratively.

Specific decisions:

| Legacy behaviour | Verdict |
| --- | --- |
| Hero stat count-up (1100 ms easeOutCubic) | **Keep.** But render the final value server-side and animate from a lower value — the static export currently ships `"0+"` in the HTML |
| Infinite pill float | **Drop.** Purely decorative, no reduced-motion guard |
| Chip rotation every 4000 ms | **Reconsider.** Text swaps under the reader with no pause and no control. Show all chips statically, or make rotation opt-in and motion-safe |
| Carousel autoscroll at 160 px/s | **Keep the feel.** Add pause-on-hover, pause-on-focus, reduced-motion stop, and a visible pause control. `aria-hidden` the duplicated half |
| Matrix cell expand (200 ms flex grow) | **Keep.** This is the good one |
| Random idle "auto demo" opening cells | **Drop, or make it obviously a hint.** Undiscoverable, unlabelled, moves content under the cursor |
| Leaflet auto-advance every 1 s | **Fix to 5 s** and add a pause control |
| Section reveal | **Keep the idea**, make it scroll-triggered and per-section |

---

## 6. Component map — legacy → shadcn

| Legacy hand-rolled | Replacement |
| --- | --- |
| `<details>/<summary>` FAQ | `Accordion` — fixes missing `aria-expanded` and the lack of exclusivity |
| `results-grade-tabs` (hardcoded `grid-cols-3`) | `Tabs` — and a 4th curriculum stops breaking the layout |
| Privacy modal (151 lines of focus/scroll/Escape handling) | `Dialog` — but do not regress the a11y contract in `docs/03-reuse-inventory.md` §2.9 |
| Leaflet fullscreen portal | `Dialog` + `Carousel` |
| Testimonial carousel | `Carousel` (embla) or a transform marquee — **preserve the iOS axis-lock heuristic** |
| `testimonial-avatar` (`showImage` rule + inline person SVG) | `Avatar` + `AvatarFallback` with initials |
| Proof pills, chips, badges | `Badge` |
| Package cards, accent cards | `Card` |
| `book-button` (5 style variants) | `Button` variants |
| Expand cells | `Collapsible` or `HoverCard` — plus a real semantic table |
| Section dots rail | Keep custom; it is genuinely bespoke |
| ~12 hand-inlined SVG icons | lucide-react |
| 小紅書 icon | **Keep the bespoke SVG** — lucide has no XiaoHongShu mark |
| Admin: everything | `Form`, `Tabs`, `Table`, `Dialog`, `Command`, `Sonner` |

---

## 7. Section-by-section direction

### Hero
Bilingual identity (English positioning line + 國際數學科考試軍師), portrait, one WhatsApp CTA,
one animated stat. **Image above text on mobile, right column at `lg`** — that reorder is
deliberate and should survive. The stat card renders a compact inline label pair below `sm` and a
stacked pair at `sm+`.

The opportunity: the hero currently states *credentials*. The strongest asset is *outcomes* — 93
records, 20,000 hours. Consider leading with an outcome and letting credentials support it.

### Results — the centrepiece
The matrix is the site's genuine differentiator and it is currently buried near the bottom of a
long page behind two levels of tabs, with a `min-w-[720px]` horizontal-scroll table on mobile.

Give it room. Rethink the mobile presentation entirely — a horizontally scrolling table with a
"swipe to see more" hint is a workaround, not a design. Consider a per-grade card stack on small
screens.

**And fix the data.** Three students currently render in the wrong column because of the grade-scale
bug (`docs/00-verdict-and-plan.md` §1.4). Redesigning around wrong numbers would be a waste.

### Packages
Two priced offers plus IA support. The value comparison — "32+ hours 1-to-1 ≈ HKD 48,000 vs
HKD 19,800" — is the core commercial argument and deserves to be the visual anchor, not a thin strip.

Resolve the unit inconsistency first (`docs/07-content-conflicts.md` #3) — the current claim
compares lessons against hours.

### Testimonials
28 quotes in four written languages. Design for that explicitly: `lang` attributes, proper CJK
fonts, and line-height that works for both scripts. 14 of 24 carousel entries deliberately use a
fallback avatar for privacy — the fallback needs to look *intentional*, not like a missing image.

### About
Who I teach, what you get / how I teach, result pills, 20 course codes across 3 groups, CTA ribbon.
The `emphasize` flag on the IBDP group is a merchandising decision that must remain visible in the
design **and** editable in the admin.

The seven result pills should be **derived from the student data**, not restated as prose — they
have already drifted.

### FAQ
Eight strong objection-handling answers. Two rely on `\n\n` paragraph breaks. Mark up as `FAQPage`
JSON-LD — this is free organic reach the site has never claimed.

### Footer
Brand, socials, two link columns, contact CTA, privacy modal, builder credit. Two structural fixes:
socials become an open array (currently a closed `{facebook, instagram, xhs}` type with three
bespoke inline SVGs), and link items get a `kind` (`anchor | modal | whatsapp | external`) instead
of an `href` that is string-matched for magic values.

---

## 8. Conversion design

**Every CTA on this site is a WhatsApp deep link. There is no form, no email, no booking system.**
That is a deliberate, well-suited choice for the Hong Kong market — treat it as the design centre,
not a fallback.

- Seven context-specific prefills already exist, one per package and per curriculum, all following
  *"Hi Winson Siu, I'm interested in … I am (name?) from (school?) in (year?)."* The placeholder
  trio is smart — it tells the enquirer what to say.
- **Give the Results CTA and the floating CTA their own prefills.** They currently use the generic
  one, so those enquiries cannot be attributed.
- **Instrument every click.** Which CTA drives enquiries is the one
  question this business cannot currently answer.
- The floating CTA fades in past `scrollY > 240` but uses `opacity-0` **without
  `pointer-events-none`** — it is an invisible click target before it appears. Fix.

---

## 9. Performance targets

Current: `public/` is **55 MB**, served byte-for-byte (`images.unoptimized: true`).
`avatars/` alone is 44 MB for images rendered at 40×40 px, one of them **17.1 MB**.
`private-package.jpg` is 6.8 MB and carries `priority`.

| Target | |
| --- | --- |
| Total image payload | **< 2 MB** (from 55 MB) |
| Any avatar | < 20 KB, AVIF/WebP, 96 and 128 px |
| Hero image | < 120 KB, AVIF, `priority` |
| Below-fold images | lazy, **no `priority`** — four images carry it today, three of them well below the fold |
| LCP | < 1.8 s on 4G |
| CLS | < 0.05 |
| JS on `/` | < 120 KB gzipped — most sections are static and belong in RSC |

Also: pin one number locale. Fourteen call sites use bare `toLocaleString()` while the hero pins
`en-GB`, which risks a hydration mismatch and renders "HKD 19.800" for European visitors.

---

## 10. Accessibility baseline

Non-negotiable, and all of these are regressions in the current build:

- Every input has a real `<label htmlFor>` — **no input in the admin panel has one today**.
- The results matrix is a real data table with scoped headers, or a list. It is currently a
  `<table>` with a single `<tr>` containing independent stacks.
- The carousel has a pause control, and the duplicated DOM half is `aria-hidden` — screen readers
  currently announce all 24 testimonials twice.
- `lang` on every non-English block.
- Visible focus rings throughout; `globals.css` defines no focus-visible style at all.
- `prefers-reduced-motion` honoured globally.
- Every image has meaningful alt text from content, not hardcoded in JSX — one string
  (`"Tutor pointing upward"`) is currently reused for two different photos.
- Mobile users can reach section navigation while scrolled. Today the dot rail is `hidden md:flex`
  and the hamburger becomes unreachable once the nav hides.
