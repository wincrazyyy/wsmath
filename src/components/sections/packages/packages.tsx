import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';

import { unitFromPer } from '@/components/layout/plan-panel/plan-options';
import { PlateCta } from '@/components/ui/plate-cta';
import type {
  CourseGroup,
  Courses as CoursesCopy,
  EmphasisLine,
  IaCourse,
  Package,
  PackagesPage,
  WhatsappPrefills,
} from '@/content/schema';

import { CoursesCovered } from './courses-covered';
import { IaCourseBlock } from './ia-course';
import { OutlineDialog } from './outline-dialog';
import { PlanPick } from './plan-pick';

import './packages.css';

export interface PackagesSectionProps {
  /** `pages.packagesPage`. */
  page: PackagesPage;
  /**
   * `content.packages` — the private card followed by every board course, in
   * authored order. The section walks them: `kind === 'private'` takes the
   * left cell of row 3, and the boards fill the rest, flagship first.
   */
  packages: readonly Package[];
  /** `pages.courses` — head copy, the group-course marker label, display codes. */
  courses: CoursesCopy;
  /** `content.courseGroups` — the absorbed coverage trays' rows, authoritative. */
  courseGroups: readonly CourseGroup[];
  /** `content.iaCourse`. */
  iaCourse: IaCourse;
  /** `settings.contact.whatsappPhone`. */
  phone: string;
  /** All prefills — the cards use `prefills[pkg.ctaKey]`, the IA block `prefills[iaCourse.ctaKey]`. */
  prefills: WhatsappPrefills;
}

/* ── string shaping ───────────────────────────────────────────────────────
   Two authored strings carry two facts each. The figures are content; the
   joining words are the legacy card's presentation, so the plate splits them
   rather than asking an editor to maintain two copies of the same number. Both
   degrade to "print the whole string" if the shape ever changes.

   The third — `price.per` → the unit — is `unitFromPer`, imported from
   `plan-panel/plan-options.ts`. The floating panel prints that same unit from
   that same authored string, so there is exactly one copy of the rule. */

/**
 * `price.was` is authored as `was HKD 60,000` because the legacy card printed
 * the word. This plate strikes the figure through instead, so the leading
 * label word is dropped — a rule and a word saying the same thing is noise.
 */
function figureFromWas(was: string | undefined): string {
  return was === undefined ? '' : was.replace(/^was\s+/i, '');
}

/**
 * `includedTitle` is authored as
 * `8-lesson intensive · ~HKD 18,000 (8 × 90 mins)` — one string holding the
 * block's name, its price and the arithmetic behind it. The sub-well prints
 * them as the same label / figure / unit triple the price rows above use.
 *
 * 18,000 is the CORRECT figure (`pricing.ts` docblock: 8 × 90 min × HKD 1,500
 * per hour). The artifact's `~HKD 12,000` drops the 90/60 session factor —
 * do not retype it.
 */
function splitIncludedTitle(title: string): { label: string; figure: string; unit: string } {
  const [label, ...rest] = title.split(' · ');
  const remainder = rest.join(' · ');
  if (remainder === '') return { label: title, figure: '', unit: '' };
  const paren = remainder.indexOf(' (');
  if (paren === -1) return { label: label ?? '', figure: remainder, unit: '' };
  return {
    label: label ?? '',
    figure: remainder.slice(0, paren),
    unit: remainder.slice(paren + 1),
  };
}

/**
 * The outline page's own shape, handed to the card's vitrine as a custom
 * property so the recess is cut to the document rather than to whatever height
 * the plate happens to be. Above 1800 `packages.css` gives the frame this
 * aspect ratio, which is what stops `object-fit:contain` from having anything
 * to letterbox; below it the frame is a shallow band and the value is unused.
 * Intrinsic size is content (`MediaRef.width` / `.height`), never measured.
 */
function slipAspect(width: number | undefined, height: number | undefined): CSSProperties | undefined {
  /* `MediaRef.width` / `.height` are optional, so an outline page authored
     without its intrinsic size falls through to the stylesheet's A4 default
     rather than to no ratio at all — which above 1800, where the frame has
     `min-height:0`, would collapse the vitrine to nothing. */
  if (width === undefined || height === undefined) return undefined;
  return { '--slip-ar': `${width} / ${height}` } as CSSProperties;
}

/**
 * Wrap every `1-to-1` in `.mvt-nb` so the ratio never breaks across its own
 * hyphens (artifact line 1709 does this by hand). The copy in `pages.json`
 * stays plain text — this is typesetting, not content.
 */
function noBreakRatios(value: string): ReactNode {
  const parts = value.split('1-to-1');
  if (parts.length === 1) return value;
  return parts.map((part, index) => (
    <span key={index}>
      {index > 0 ? <span className="mvt-nb">1-to-1</span> : null}
      {part}
    </span>
  ));
}

/** A line whose bold runs are authored, not guessed (`EmphasisLine`). */
function EmphasisText({ line }: { line: EmphasisLine }) {
  return (
    <>
      {line.parts.map((part) =>
        part.strong ? (
          <b key={part.id} className="mvt-num">
            {part.text}
          </b>
        ) : (
          <span key={part.id} className="mvt-num">
            {part.text}
          </span>
        ),
      )}
    </>
  );
}

/* ── row 1 · the valuation ledger + the outcome snapshot ──────────────────── */

function Ledger({ page }: { page: PackagesPage }) {
  return (
    <div className="mvt-ledger mvt-well mvt-rev">
      {/* Authored, not taken from a package's title: the ledger is a claim
          about the flagship course, and which course that is belongs in copy
          rather than in whichever card happens to sort first. */}
      <p className="mvt-mu mvt-brass">{page.ledger.title}</p>
      <dl>
        {page.ledger.rows.map((row) => (
          <div className="mvt-ledger-row" key={row.id}>
            <dt>{row.dt}</dt>
            {/* the three rows are a list price, the price paid, and a count —
                struck, cast in brass, and plain, in that order */}
            <dd
              className={
                row.id === 'was'
                  ? 'mvt-num mvt-strike'
                  : row.id === 'now'
                    ? 'mvt-num mvt-castxt'
                    : 'mvt-num'
              }
            >
              {row.dd}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Snapshot({ page }: { page: PackagesPage }) {
  return (
    <div className="mvt-snap mvt-well mvt-well--shallow mvt-rev">
      <p className="mvt-mu mvt-brass">{page.snapshot.label}</p>
      <div>
        <span className="mvt-snap-big mvt-num mvt-castxt">{page.snapshot.value}</span>
        <p className="mvt-body mvt-dim mvt-snap-sub">{page.snapshot.sub}</p>
      </div>
      <div>
        {page.snapList.map((row) => (
          <div className="mvt-snap-row" key={row.id}>
            <span className="mvt-mu mvt-dim">{row.dt}</span>
            <b className="mvt-num">{row.dd}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── row 2 · the value comparison — depth encodes cost, never hue ─────────── */

function Comparison({ page }: { page: PackagesPage }) {
  return (
    <div className="mvt-cmp">
      <p className="mvt-cmp-h mvt-rev mvt-rev--s">
        <EmphasisText line={page.cmp.heading} />
      </p>
      <div className="mvt-cmp-grid">
        {page.cmp.cells.map((cell, index) => {
          /* The first cell is the cost being argued against — it sits in the
             carmine well. Every cell after it is the offer: a shallow well
             with its figure cast in brass. Position carries the argument, so
             reordering the cells in the editor swaps the roles too. */
          const isCost = index === 0;
          return (
            <div
              className={`mvt-cmp-cell mvt-well ${isCost ? 'mvt-well--ca' : 'mvt-well--shallow'} mvt-rev mvt-rev--s`}
              key={cell.id}
            >
              <p className="mvt-mu">{cell.label}</p>
              <p className={isCost ? 'mvt-cmp-fig mvt-num' : 'mvt-cmp-fig mvt-num mvt-castxt'}>{cell.fig}</p>
              <p className="mvt-small mvt-dim">
                <span className="mvt-num">{cell.sub}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── rows 3 and 4 · the four plates ───────────────────────────────────────── */

interface PlateFootProps {
  /** The package id — the plan key `PlanPick` resolves its option by. */
  planKey: string;
  ctaKey: string;
  ctaLabel: string;
  message: string;
  phone: string;
  plan: PackagesPage['plan'];
  tag: string;
}

/**
 * The foot every plate (and the IA block) shares: a knurl filling the leftover
 * run, the WhatsApp plate, the plan pick, and the plate's small-caps tag.
 * The knurl is `order:9` so it always trails, whatever the wrap.
 */
function PlateFoot({ planKey, ctaKey, ctaLabel, message, phone, plan, tag }: PlateFootProps) {
  return (
    <div className="mvt-pack-foot">
      <span className="mvt-knurl" aria-hidden="true" />
      {/* no coin dot on the package plates — artifact-faithful */}
      <PlateCta phone={phone} message={message} ctaKey={ctaKey} label={ctaLabel} />
      <PlanPick planKey={planKey} showLabel={plan.pickShow} activeLabel={plan.pickActive} />
      <span className="mvt-mu mvt-dim">{tag}</span>
    </div>
  );
}

function Bullets({ items }: { items: readonly { id: string; text: string }[] }) {
  return (
    <ul className="mvt-bullets">
      {items.map((item) => (
        <li key={item.id}>
          <span className="mvt-li mvt-num">{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

function PrivatePlate({
  page,
  pkg,
  phone,
  message,
}: {
  page: PackagesPage;
  pkg: Package;
  phone: string;
  message: string;
}) {
  const included = splitIncludedTitle(pkg.includedTitle ?? '');
  return (
    <article className="mvt-pack mvt-raise mvt-rev">
      {pkg.tagline === undefined ? null : <p className="mvt-mu mvt-brass">{pkg.tagline}</p>}
      <h3 className="mvt-h3">{pkg.title}</h3>
      {pkg.price === undefined ? null : (
        <div className="mvt-price">
          <span className="mvt-mu mvt-dim">{page.rateLabel}</span>
          <b className="mvt-num mvt-castxt">{pkg.price.now}</b>
          <span className="mvt-small mvt-dim mvt-num">{unitFromPer(pkg.price.per)}</span>
        </div>
      )}
      <p className="mvt-body mvt-dim">{pkg.description}</p>
      <Bullets items={pkg.bullets} />

      {pkg.included.length === 0 ? null : (
        <div className="mvt-sub mvt-well mvt-well--shallow">
          <div className="mvt-price">
            <span className="mvt-mu mvt-brass">{included.label}</span>
            <b className="mvt-num mvt-sub-fig">{included.figure}</b>
            {included.unit === '' ? null : <span className="mvt-small mvt-dim mvt-num">{included.unit}</span>}
          </div>
          <ul>
            {pkg.included.map((item) => (
              <li key={item.id}>
                <span className="mvt-li mvt-num">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* The coverage claim the retired courses strip used to make, on the one
          card that genuinely earns it: only 8 of the courses are sold as
          scheduled group courses, all of them are taught 1-to-1. */}
      {pkg.coverage === undefined ? null : (
        <p className="mvt-cover mvt-mu">
          <span className="mvt-brass">{pkg.coverage.label}</span>
          <span className="mvt-num">{pkg.coverage.value}</span>
        </p>
      )}

      <PlateFoot
        planKey={pkg.id}
        ctaKey={pkg.ctaKey}
        ctaLabel={page.ctaLabel}
        message={message}
        phone={phone}
        plan={page.plan}
        tag={pkg.footTag}
      />
    </article>
  );
}

/**
 * A board course — IBDP, International A-Level or International GCSE.
 *
 * Four regions in DOM order (`main · lineup · slip · foot`), which is also the
 * visual order at every width: the pitch, then one engraved ledger row per
 * course sold under it, then the outline vitrine, then the foot.
 *
 * `variants` and `outline` are both optional on `Package` — `private` has
 * neither, and `CourseOutline`'s own fields are required, so a required
 * `outline` would force the private card to author a viewer it does not have.
 * The `null` branches below satisfy TypeScript without a non-null assertion and
 * are **unreachable in any build that passes**: `crossCheck` requires a
 * `kind:'board'` package to carry both, and any package with an `outline` to
 * carry courses. A board plate with no rows and no vitrine is a content mistake
 * that fails the build, not a layout the CSS has to survive.
 */
function BoardPlate({
  page,
  pkg,
  flagship,
  phone,
  message,
}: {
  page: PackagesPage;
  pkg: Package;
  /** The lifted plate — exactly one on the page, the first board in authored order. */
  flagship: boolean;
  phone: string;
  message: string;
}) {
  const variants = pkg.variants ?? [];
  const first = variants[0];

  return (
    <article className={`mvt-pack mvt-pack--board${flagship ? ' mvt-pack--hi' : ''} mvt-raise mvt-rev`}>
      <div className="mvt-pack-main">
        {pkg.tag === undefined ? null : <p className="mvt-nameplate mvt-mu">{pkg.tag}</p>}
        {pkg.tagline === undefined ? null : <p className="mvt-mu mvt-brass">{pkg.tagline}</p>}
        <h3 className="mvt-h3">{pkg.title}</h3>
        {pkg.price === undefined ? null : (
          <div className="mvt-price">
            {pkg.price.was === undefined ? null : (
              <span className="mvt-num mvt-strike mvt-price-was">{figureFromWas(pkg.price.was)}</span>
            )}
            <b className="mvt-num mvt-castxt">{pkg.price.now}</b>
            <span className="mvt-small mvt-dim">
              <span className="mvt-num">{unitFromPer(pkg.price.per)}</span>
            </span>
          </div>
        )}
        <p className="mvt-body mvt-dim">{pkg.description}</p>
        <Bullets items={pkg.bullets} />
      </div>

      {variants.length === 0 ? null : (
        <ul className="mvt-lineup mvt-well mvt-well--shallow">
          {variants.map((variant) => (
            <li key={variant.id}>
              {variant.code === undefined ? null : (
                <span className="mvt-lineup-code mvt-code">{variant.code}</span>
              )}
              <span className="mvt-lineup-name">{variant.title}</span>
              <b className="mvt-lineup-fig mvt-num">{variant.price}</b>
              <p className="mvt-lineup-meta">
                {/* Delivery is depth, not hue: `live` and `video` are the same
                    debossed slot at two brass depths. Colour-coding it would
                    spend a hue the palette has already assigned. */}
                <span className="mvt-deliv mvt-mu" data-delivery={variant.delivery}>
                  {page.deliveryLabels[variant.delivery]}
                </span>
                <span className="mvt-num">{variant.meta}</span>
                {variant.badges.length === 0 ? null : (
                  <span className="mvt-lineup-badges">
                    {variant.badges.map((badge) => (
                      <span key={badge.id}>
                        <i aria-hidden="true" />
                        {badge.text}
                      </span>
                    ))}
                  </span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}

      {pkg.outline === undefined || first === undefined ? null : (
        /* The outline slip. A <figure> wrapping frame + caption, rather than
           the artifact's figcaption stranded outside its figure — same
           rendering, valid markup.

           The frame is the trigger for the outline viewer: the first course's
           page stays server-rendered here and is handed to `<OutlineDialog>` as
           children, so the card is complete (and the image is fetched) with
           JavaScript off. The caption is the outline's own, so each board says
           what its own document contains. */
        <figure className="mvt-slip mvt-well mvt-well--shallow">
          <OutlineDialog
            outline={pkg.outline}
            variants={variants}
            copy={page.outline}
            phone={phone}
            message={message}
            ctaKey={pkg.ctaKey}
            ctaLabel={page.ctaLabel}
          >
            <div className="mvt-slip-frame" style={slipAspect(first.outlinePage.width, first.outlinePage.height)}>
              <Image
                src={first.outlinePage.src}
                alt={first.outlinePage.alt}
                width={first.outlinePage.width}
                height={first.outlinePage.height}
                sizes="(max-width: 1799px) 92vw, 420px"
              />
            </div>
          </OutlineDialog>
          <figcaption className="mvt-mu">{pkg.outline.caption}</figcaption>
        </figure>
      )}

      <PlateFoot
        planKey={pkg.id}
        ctaKey={pkg.ctaKey}
        ctaLabel={page.ctaLabel}
        message={message}
        phone={phone}
        plan={page.plan}
        tag={pkg.footTag}
      />
    </article>
  );
}

/* ── the section ──────────────────────────────────────────────────────────── */

/**
 * Packages — "the vault". Six blocks under the section head: the valuation
 * ledger beside the outcome snapshot, the value comparison, the private plate
 * beside the flagship board, the two remaining boards, the absorbed coverage
 * trays, and the IA course.
 *
 * Reading order is the funnel: *what fits me* → the flagship board → the two
 * bridge/alternative boards → *here is everything I cover* → the IA add-on.
 *
 * `data-plan-anchor` is load-bearing: the fixed "Your plan" panel goes live
 * once this section's top passes the viewport, and the WhatsApp coin yields
 * the corner to it. Nothing fixed is rendered from here.
 *
 * Every figure on this section is either a token-interpolated string from
 * content or a derivation in `lib/pricing.ts`. No price is typed in JSX.
 */
export function PackagesSection({
  page,
  packages,
  courses,
  courseGroups,
  iaCourse,
  phone,
  prefills,
}: PackagesSectionProps) {
  const privatePkg = packages.find((pkg) => pkg.kind === 'private');
  const boards = packages.filter((pkg) => pkg.kind === 'board');
  const [flagship, ...rest] = boards;

  return (
    <section id="mvt-s-packages" className="mvt-sec" data-plan-anchor="">
      <div className="mvt-wrap">
        <div className="mvt-head">
          <p className="mvt-eyebrow mvt-rev mvt-rev--s">{page.eyebrow}</p>
          <h2 className="mvt-h2 mvt-rev">{page.title}</h2>
          <span className="mvt-rule mvt-rev mvt-rev--rule" aria-hidden="true" />
          <p className="mvt-head-sub mvt-lead mvt-rev mvt-rev--s">{noBreakRatios(page.sub)}</p>
          <ul className="mvt-reschips mvt-rev mvt-rev--s">
            {page.chips.map((chip) => (
              <li key={chip.id}>{chip.text}</li>
            ))}
          </ul>
        </div>

        <div className="mvt-pk-r1">
          <Ledger page={page} />
          <Snapshot page={page} />
        </div>

        <Comparison page={page} />

        {/* Row 3 keeps its locked 48/52 geometry: the private plate keeps its
            exact cell and its exact width, and the flagship board inherits the
            lifted slot beside it. */}
        <div className="mvt-pk-r3">
          {privatePkg === undefined ? null : (
            <PrivatePlate page={page} pkg={privatePkg} phone={phone} message={prefills[privatePkg.ctaKey]} />
          )}
          {flagship === undefined ? null : (
            <BoardPlate
              page={page}
              pkg={flagship}
              flagship
              phone={phone}
              message={prefills[flagship.ctaKey]}
            />
          )}
        </div>

        {rest.length === 0 ? null : (
          <div className="mvt-pk-r4">
            {rest.map((pkg) => (
              <BoardPlate
                key={pkg.id}
                page={page}
                pkg={pkg}
                flagship={false}
                phone={phone}
                message={prefills[pkg.ctaKey]}
              />
            ))}
          </div>
        )}

        {/* ── the absorbed coverage trays (was #mvt-s-courses) ───────────── */}
        <CoursesCovered courses={courses} courseGroups={courseGroups} packages={packages} />

        {/* ── the IA course ──────────────────────────────────────────────── */}
        <IaCourseBlock
          ia={iaCourse}
          ctaLabel={page.ctaLabel}
          footTag={page.iaFootTag}
          phone={phone}
          message={prefills[iaCourse.ctaKey]}
        />
      </div>
    </section>
  );
}
