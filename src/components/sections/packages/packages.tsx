import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';

import { unitFromPer } from '@/components/layout/plan-panel/plan-options';
import { PlateCta, WaTextLink } from '@/components/ui/plate-cta';
import type {
  CourseGroup,
  IaCourse,
  Package,
  PackagesPage,
  WhatsappPrefills,
} from '@/content/schema';

import { IaCourseBlock } from './ia-course';
import { OutlineDialog } from './outline-dialog';

import './packages.css';

export interface PackagesSectionProps {
  /** `pages.packagesPage`. */
  page: PackagesPage;
  /**
   * `content.packages` — the private card followed by every board course, in
   * authored order. The section walks them: the boards fill row 3 with the
   * flagship (the first board authored) lifted into the centre column, and
   * `kind === 'private'` takes row 4 on its own, full width.
   */
  packages: readonly Package[];
  /**
   * `content.courseGroups` — authoritative for the whole catalogue. Each board
   * plate prints the courses of its own group that it does NOT sell as a
   * scheduled group course, as its "also taught 1-to-1" tail.
   */
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

/* ── content ids that presentation has to know ───────────────────────────────
   Two, both documented here rather than hidden in a lookup elsewhere. */

/**
 * Courses that present themselves: the IA course has its own block under the
 * boards, so the IBDP plate's strip does not list it a second time.
 */
const SELF_PRESENTED_COURSE_IDS: readonly string[] = ['math-internal-assessment-ia'];

/**
 * Display codes for courses that have no exam-board code of their own. This
 * replaces the retired `pages.courses.displayCodes`.
 */
const DISPLAY_CODES: Readonly<Record<string, string>> = { 'ib-middle-year-programme': 'IBMYP' };


interface TailRow {
  readonly id: string;
  /** The exam-board code, or a display code — empty only if neither exists. */
  readonly code: string;
  /** The course name with its trailing code stripped. */
  readonly name: string;
}

/**
 * `course-groups.json` stores the code inside the name (`Edexcel IAL Math
 * YMA01`) and the tail prints the two in separate cells, so the split happens
 * here — the same rule, and the same reason, the retired trays used. That file
 * is read-only content; this is presentation.
 */
function tailRow(course: CourseGroup['courses'][number]): TailRow {
  if (course.code === undefined) {
    return { id: course.id, code: DISPLAY_CODES[course.id] ?? '', name: course.name };
  }
  const suffix = ` ${course.code}`;
  const name = course.name.endsWith(suffix) ? course.name.slice(0, -suffix.length) : course.name;
  return { id: course.id, code: course.code, name };
}

/**
 * Every course in this board's group that the board does not sell as a
 * scheduled group course — the plate's "also taught 1-to-1" rows.
 *
 * The group is found by lookup, not by a table: a board's variants each name a
 * `courseId`, and the group holding those ids is this board's catalogue. A
 * board with no variants (or with ids no group claims — `crossCheck` fails the
 * build on that) simply gets no tail.
 */
function catalogueTail(pkg: Package, courseGroups: readonly CourseGroup[]): readonly TailRow[] {
  const sold = new Set(
    (pkg.variants ?? []).flatMap((variant) => (variant.courseId === undefined ? [] : [variant.courseId])),
  );
  if (sold.size === 0) return [];

  const group = courseGroups.find((candidate) => candidate.courses.some((course) => sold.has(course.id)));
  if (group === undefined) return [];

  return group.courses
    .filter((course) => !sold.has(course.id) && !SELF_PRESENTED_COURSE_IDS.includes(course.id))
    .map(tailRow);
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

/**
 * The outcome snapshot beside the ledger. Three stations — the period, the
 * headline count, and the `snapList` rows — spread down the tile
 * (`justify-content:space-between`), so the tile fills the ledger's height
 * without a stretched hole in the middle of it.
 */
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
            <span className="mvt-mu mvt-brass">{row.dt}</span>
            <b className="mvt-num">{row.dd}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── rows 3 and 4 · the four plates ───────────────────────────────────────── */

interface PlateFootProps {
  ctaKey: string;
  ctaLabel: string;
  message: string;
  phone: string;
  /** `Package.footTag` — optional, and absent in the current cut. */
  tag: string | undefined;
}

/**
 * The foot every plate (and the IA block) shares: a knurl filling the leftover
 * run, the WhatsApp plate, the plan pick, and — when one is authored — the
 * plate's small-caps tag. The knurl is `order:9` so it always trails, whatever
 * the wrap.
 */
function PlateFoot({ ctaKey, ctaLabel, message, phone, tag }: PlateFootProps) {
  return (
    <div className="mvt-pack-foot">
      <span className="mvt-knurl" aria-hidden="true" />
      {/* no coin dot on the package plates — artifact-faithful; no plan pick
          either — the boards have no buttons at all, so a pick on the one
          plate that kept its button would be the page's only such control */}
      <PlateCta phone={phone} message={message} ctaKey={ctaKey} label={ctaLabel} />
      {tag === undefined ? null : <span className="mvt-mu mvt-dim">{tag}</span>}
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

/**
 * The private plate — row 4, alone and full width.
 *
 * Two columns: the pitch (`.mvt-pack-main`) beside the 8-lesson intensive's
 * own ledger, with the coverage claim and the foot spanning both underneath.
 * It is the only plate that carries `.mvt-pack-main` beside something rather
 * than above it, which is why the wrapper is here and not inside `Bullets`.
 */
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
    <article className="mvt-pack mvt-pack--private mvt-raise mvt-rev">
      <div className="mvt-pack-main">
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
        <Bullets items={pkg.bullets ?? []} />
      </div>

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
        ctaKey={pkg.ctaKey}
        ctaLabel={pkg.ctaLabel ?? page.ctaLabel}
        message={message}
        phone={phone}
        tag={pkg.footTag}
      />
    </article>
  );
}

/** One chip in a board's drifting course strip. */
interface CourseTag {
  readonly id: string;
  /** The exam-board code; a course without one (IB MYP) prints its name alone. */
  readonly code?: string;
  readonly name: string;
}

/**
 * Every course a board teaches, priced or 1-to-1, as one flat list: the sold
 * variants first (their leaflet page is the board's body), then the rest of
 * the group's catalogue. The strip that renders it has no heading — the
 * leaflet above already says what the board is.
 */
function courseTags(pkg: Package, tail: readonly TailRow[]): readonly CourseTag[] {
  const variants = (pkg.variants ?? []).map((variant) => ({
    id: variant.id,
    code: variant.code,
    name: variant.title,
  }));
  return [...variants, ...tail.map((row) => ({ id: row.id, code: row.code, name: row.name }))];
}

/**
 * A board course — IBDP, International A-Level or International GCSE.
 *
 * The leaflet IS the content. Four regions in DOM order (`main · slip · tags ·
 * strip`): the pitch head (tagline, title, was/now price), the course outline
 * as a full-page vitrine, a headless drifting strip of every course the board
 * teaches, and a decorative rule. The description, the bullets and the priced
 * rows are gone — the leaflet prints the topics, the schedule and the price,
 * so the plate stopped saying them twice.
 *
 * The whole plate is the enquiry: a stretched `WaTextLink` covers it (label
 * kept for assistive tech), and the vitrine trigger sits above that link so
 * the outline viewer still opens on its own. Hovering the plate pauses the
 * strip; reduced motion turns it into a wrapped list with no clones.
 *
 * `variants` and `outline` are both optional on `Package` — `private` has
 * neither. A board without an outline renders no vitrine.
 */
function BoardPlate({
  page,
  pkg,
  tail,
  flagship,
  phone,
  message,
}: {
  page: PackagesPage;
  pkg: Package;
  /** The board's catalogue tail, computed once at the section boundary. */
  tail: readonly TailRow[];
  /** The lifted plate — exactly one on the page, the first board in authored order. */
  flagship: boolean;
  phone: string;
  message: string;
}) {
  const variants = pkg.variants ?? [];
  const first = variants[0];
  const ctaLabel = pkg.ctaLabel ?? page.ctaLabel;
  const tags = courseTags(pkg, tail);

  return (
    <article className={`mvt-pack mvt-pack--board${flagship ? ' mvt-pack--hi' : ''} mvt-raise mvt-rev`}>
      <div className="mvt-pack-main">
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
        {pkg.description === undefined ? null : (
          <p className="mvt-body mvt-dim">{noBreakRatios(pkg.description)}</p>
        )}
      </div>

      {pkg.outline === undefined || first === undefined ? null : (
        /* The leaflet, full page. The frame is the trigger for the outline
           viewer: the first course's page stays server-rendered here and is
           handed to `<OutlineDialog>` as children, so the plate is complete
           (and the image is fetched) with JavaScript off. */
        <figure className="mvt-slip mvt-well mvt-well--shallow">
          <OutlineDialog
            outline={pkg.outline}
            variants={variants}
            copy={page.outline}
            phone={phone}
            message={message}
            ctaKey={pkg.ctaKey}
            ctaLabel={ctaLabel}
          >
            <div className="mvt-slip-frame" style={slipAspect(first.outlinePage.width, first.outlinePage.height)}>
              <Image
                src={first.outlinePage.src}
                alt={first.outlinePage.alt}
                width={first.outlinePage.width}
                height={first.outlinePage.height}
                sizes="(min-width:1280px) 26vw, (min-width:1025px) 46vw, 92vw"
              />
            </div>
          </OutlineDialog>
          {pkg.outline.caption === undefined ? null : (
            <figcaption className="mvt-mu">{pkg.outline.caption}</figcaption>
          )}
        </figure>
      )}

      {tags.length === 0 ? null : (
        /* Two printings of the same tags, the second inert and hidden from the
           tree, so the drift is seamless on first paint. `--tg-count` paces the
           animation per tag: the pixel speed does not depend on how many
           courses a board lists. */
        <div className="mvt-tags" style={{ '--tg-count': tags.length } as CSSProperties}>
          <ul className="mvt-tags-track">
            {tags.map((tag) => (
              <li key={tag.id}>
                {tag.code === undefined ? null : <span className="mvt-code">{tag.code}</span>}
                {tag.name}
              </li>
            ))}
            {tags.map((tag) => (
              <li key={`clone-${tag.id}`} className="mvt-tags-clone" aria-hidden="true" inert>
                {tag.code === undefined ? null : <span className="mvt-code">{tag.code}</span>}
                {tag.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* decorative, and visually the one cue that the card is the enquiry —
          the stretched link below carries the accessible name, so this row
          stays out of the tree */}
      <div className="mvt-pack-strip" aria-hidden="true">
        <span className="mvt-knurl" />
        {page.cardCue === undefined ? null : <span className="mvt-mu mvt-pack-cue">{page.cardCue}</span>}
      </div>

      <WaTextLink
        phone={phone}
        message={message}
        ctaKey={pkg.ctaKey}
        label={ctaLabel}
        className="mvt-pack-link"
        hideLabel
      />
    </article>
  );
}

/* ── the section ──────────────────────────────────────────────────────────── */

/**
 * Packages — "the vault". Four blocks under the section head: the valuation
 * ledger beside the outcome snapshot, the three board plates across one row,
 * the private plate full width beneath them, and the IA course.
 *
 * Reading order is the funnel: *what the course is worth* → the three boards,
 * flagship in the centre → *if none of those fit, here is 1-to-1* → the IA
 * add-on. Each board carries its own catalogue, so the coverage trays that used
 * to answer "what else do you teach?" as a block of their own are gone.
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
  courseGroups,
  iaCourse,
  phone,
  prefills,
}: PackagesSectionProps) {
  const privatePkg = packages.find((pkg) => pkg.kind === 'private');
  const boards = packages.filter((pkg) => pkg.kind === 'board');
  const [flagship, ...rest] = boards;

  /* The flagship is the first board in authored order and the lifted centre
     column of the row, so the boards are re-seated around it: the next board
     authored takes the left cell and everything after it follows on the right.
     Authored order is `ibdp · ial · igcse`, which lands as A-Level | IBDP |
     IGCSE — the artifact's row, without an order typed here. */
  const row =
    flagship === undefined ? [] : [...rest.slice(0, 1), flagship, ...rest.slice(1)];

  return (
    <section id="mvt-s-packages" className="mvt-sec" data-plan-anchor="">
      <div className="mvt-wrap">
        <div className="mvt-head">
          <h2 className="mvt-h2 mvt-rev">{page.title}</h2>
          <span className="mvt-rule mvt-rev mvt-rev--rule" aria-hidden="true" />
          <p className="mvt-head-sub mvt-lead mvt-rev mvt-rev--s">{noBreakRatios(page.sub)}</p>
        </div>

        <div className="mvt-pk-r1">
          <Ledger page={page} />
          <Snapshot page={page} />
        </div>

        {/* Row 3 · the three boards, the flagship lifted between them. */}
        {row.length === 0 ? null : (
          <div className="mvt-pk-r3">
            {row.map((pkg) => (
              <BoardPlate
                key={pkg.id}
                page={page}
                pkg={pkg}
                tail={catalogueTail(pkg, courseGroups)}
                flagship={pkg === flagship}
                phone={phone}
                message={prefills[pkg.ctaKey]}
              />
            ))}
          </div>
        )}

        {/* Row 4 · private coaching, full width. */}
        {privatePkg === undefined ? null : (
          <div className="mvt-pk-r4">
            <PrivatePlate page={page} pkg={privatePkg} phone={phone} message={prefills[privatePkg.ctaKey]} />
          </div>
        )}

        {/* ── the IA course ──────────────────────────────────────────────── */}
        <IaCourseBlock
          ia={iaCourse}
          ctaLabel={iaCourse.ctaLabel ?? page.ctaLabel}
          footTag={page.iaFootTag}
          phone={phone}
          message={prefills[iaCourse.ctaKey]}
        />
      </div>
    </section>
  );
}
