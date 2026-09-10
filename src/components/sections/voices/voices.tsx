import Image from 'next/image';

import type { Testimonial, Voices as VoicesCopy, WhatsappPrefills } from '@/content/schema';
import { sectionDomId } from '@/lib/anchors';

import { credentialLine, initials, type UniversityShortNames } from './credential';
import { Trough } from './trough';
import { VideoFrame } from './video-frame';

import './voices.css';

export interface VoicesSectionProps {
  /** `pages.voices`. */
  voices: VoicesCopy;
  /** `content.testimonials` — 4 featured + 24 carousel; quotes byte-authoritative. */
  testimonials: readonly Testimonial[];
  /** `settings.contact.whatsappPhone`. */
  phone: string;
  /** All prefills — the optional video CTA uses `prefills[voices.video.ctaKey]`. */
  prefills: WhatsappPrefills;
}

/**
 * One of the four raised plates: portrait in a brass bezel, name, the derived
 * credential line, the university, then the quote at full length.
 *
 * `lang` is on the `<blockquote>` because that is the element whose text is in
 * that language — a screen reader must switch voice for the quote and not for
 * the English name above it. It is also what the type repair keys off: the
 * register's own CJK size rule is `blockquote:is(:lang(zh-Hant), …)`, so a
 * missing `lang` would silently return a card to the Latin metric.
 */
function FeaturedPlate({ testimonial }: { testimonial: Testimonial }) {
  const { avatar } = testimonial;
  return (
    <li className="mvt-raise mvt-rev">
      <div className="mvt-feat-h">
        {avatar === null ? (
          <span className="mvt-bezel mvt-bezel--mono" aria-hidden="true">
            {initials(testimonial.displayName)}
          </span>
        ) : (
          <span className="mvt-bezel">
            <Image src={avatar.src} alt={avatar.alt} width={avatar.width} height={avatar.height} />
          </span>
        )}
        <div>
          <b>
            {testimonial.displayName} <span className="mvt-num">({testimonial.cohortYear})</span>
          </b>
          <p className="mvt-mu">{credentialLine(testimonial)}</p>
          {testimonial.university === undefined ? null : <span>{testimonial.university}</span>}
        </div>
      </div>
      <blockquote lang={testimonial.lang}>{testimonial.quote}</blockquote>
    </li>
  );
}

/**
 * One 340px ruled sheet in the drifting channel. `clone` marks every printing
 * of a quote after the first — the second printing that makes the loop
 * seamless, and any repeat pass inside a printing (see `printing()`). A clone
 * is `aria-hidden` and `inert`, so it is invisible to assistive technology and
 * unreachable by keyboard, and reduced motion removes it from the layout
 * entirely (CSS), which is what "no clones under RM" means here — and is why
 * the reduced-motion scroller holds each quote exactly once.
 */
function Sheet({
  testimonial,
  shortNames,
  clone = false,
}: {
  testimonial: Testimonial;
  shortNames: UniversityShortNames;
  clone?: boolean;
}) {
  const { avatar } = testimonial;
  return (
    <figure
      className={clone ? 'mvt-sheet mvt-sheet--clone' : 'mvt-sheet'}
      aria-hidden={clone || undefined}
      inert={clone || undefined}
    >
      <blockquote lang={testimonial.lang}>{testimonial.quote}</blockquote>
      <figcaption className="mvt-sheet-f">
        <span className="mvt-medal" aria-hidden="true">
          {avatar === null ? (
            initials(testimonial.displayName)
          ) : (
            <Image src={avatar.src} alt="" width={avatar.width} height={avatar.height} />
          )}
        </span>
        <span>
          <b>
            {testimonial.displayName} <span className="mvt-num">({testimonial.cohortYear})</span>
          </b>
          <span>{credentialLine(testimonial, { university: shortNames })}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * ONE PRINTING MUST BE WIDER THAN THE CHANNEL IT DRIFTS THROUGH.
 *
 * The loop travels exactly one printing and then jumps back, which is seamless
 * only while the second printing still reaches past the right end of the trough
 * at the moment of the jump. One printing of N sheets measures
 * `N · (340 + gap)`, and the trough is the viewport less the coin lane:
 *
 *     N = 12 → 4 474px of paper against a 2 474px channel at 2560  ✓
 *     N =  6 → 2 290px against the same channel                    ✗ 184px bare
 *
 * — so at six sheets the row runs dry at the right edge for the last second of
 * every loop above a ~2 390px viewport and then pops full again. It is not a
 * speed problem and pacing does not touch it: it is the printing being shorter
 * than the window. The list is therefore printed as many times as it takes to
 * clear that, and the clone printing repeats the whole run, so the drifting
 * pattern is unchanged and only the loop boundary moves.
 *
 * Ten sheets covers a 3 746px channel (≈3 850px viewport). Six become twelve,
 * which is the geometry the trough had when `sheetIds` listed twelve — the same
 * 24 sheets in the DOM, the same 90s loop.
 *
 * What this cannot buy back is that six quotes are 2 184px of unique paper in a
 * 2 474px window: the sheet clipped by the right edge is the same quote as the
 * one clipped by the left. Only a longer `sheetIds` fixes that, and the
 * collection holds 24 carousel testimonials to draw on.
 */
const MIN_SHEETS_PER_PRINTING = 10;

interface RowSheet {
  /** Stable across renders: the testimonial id plus which pass printed it. */
  key: string;
  testimonial: Testimonial;
  /**
   * Every pass after the first is a repeat and takes the clone treatment —
   * `aria-hidden`, `inert`, and dropped from the layout under reduced motion.
   * Only the first pass is the quote; the rest are paper. Without this a screen
   * reader would read all six quotes twice and the reduced-motion scroller
   * would list them twice.
   */
  clone: boolean;
}

function printing(sheets: readonly Testimonial[]): readonly RowSheet[] {
  if (sheets.length === 0) return [];
  const passes = Math.max(1, Math.ceil(MIN_SHEETS_PER_PRINTING / sheets.length));
  return Array.from({ length: passes }, (_, pass) =>
    sheets.map((testimonial) => ({ key: `${testimonial.id}-${pass}`, testimonial, clone: pass > 0 })),
  ).flat();
}

/**
 * ══ 9 · STUDENT VOICES ══════════════════════════════════════════════════════
 *
 * Head → the video band → four featured plates → the full-bleed channel of
 * drifting sheets. This section carries two of the three client-reported
 * defects; both fixes are structural, not cosmetic.
 *
 * **Issue #1 — the video.** `.mvt-videoband` was a play-glyph banner in the
 * artifact and a click-to-load poster on the live site. It is now a real,
 * eagerly-loaded, autoplaying player in the server-rendered HTML — see
 * `video-frame.tsx` and `embed.ts` for why the URL parameters, not the markup,
 * are the fix. The band is no longer a well: it is a bare two-zone grid, the
 * player beside its heading, so the tray no longer frames a heading that is now
 * the copy column's only occupant.
 *
 * **Issue #2 — the quote typography.** The artifact's global
 * `:lang(zh-Hant){font-size:1.05em}` outranked every card register, so a CJK
 * quote was sized off the ROOT (23.1px at 2560) instead of its card (15px on a
 * sheet, +54%), and its 43.9px leading ignored the paper's 24px ruling. The
 * language rules in `globals.css` now set family only; each register declares
 * its own CJK size in `voices.css`. Every `lang` attribute below is therefore
 * load-bearing — including `yue`, which `testimonials.json` really uses and the
 * artifact hard-coded as `zh-Hant` to dodge.
 *
 * The four featured plates come from `placement: "featured"` in `order`; the
 * sheets are the curated selection in `pages.voices.trough.sheetIds`, in that
 * order — the *editorial* choice of which of the twenty-four drift is page
 * copy, so it lives in `pages.json`; the quotes themselves never leave the
 * collection. How many are listed is therefore a content decision, and two
 * things keep the channel honest whatever that number is: the drift is paced
 * per sheet (`--vc-count`, voices.css) so the row travels at the same pixel
 * speed, and `printing()` above prints the list enough times to fill the
 * channel so the loop still closes seamlessly.
 *
 * `lede`, `video.stamp` and `video.body` are optional in the schema and absent
 * from the current copy: each renders nothing when it is missing rather than
 * being deleted outright, so a line typed into the editor still appears.
 * Without a `.mvt-head-sub` child the foundation collapses the head to a single
 * track (globals.css `:not(:has(.mvt-head-sub))`), which is the composition the
 * comp shows.
 */
export function VoicesSection({ voices, testimonials }: VoicesSectionProps) {
  const featured = testimonials
    .filter((testimonial) => testimonial.placement === 'featured')
    .toSorted((a, b) => a.order - b.order);

  const byId = new Map(testimonials.map((testimonial) => [testimonial.id, testimonial]));
  const sheets = voices.trough.sheetIds
    .map((id) => byId.get(id))
    .filter((testimonial): testimonial is Testimonial => testimonial !== undefined);

  const shortNames: UniversityShortNames = new Map(
    voices.trough.universityShortNames.map((entry) => [entry.full, entry.short]),
  );

  const row = printing(sheets);

  return (
    <section id={sectionDomId('voices')} className="mvt-sec mvt-voices">
      <div className="mvt-wrap">
        <div className="mvt-head">
          <p className="mvt-eyebrow mvt-rev mvt-rev--s">{voices.eyebrow}</p>
          <h2 className="mvt-h2 mvt-rev">{voices.title}</h2>
          <span className="mvt-rule mvt-rev mvt-rev--rule" aria-hidden="true" />
          {voices.lede === undefined ? null : (
            <p className="mvt-head-sub mvt-lead mvt-rev mvt-rev--s">{voices.lede}</p>
          )}
        </div>

        {/* no tray: the player is a slip inlay sitting on the section ground */}
        <div className="mvt-videoband mvt-rev mvt-rev--s">
          <figure className="mvt-vb-slip">
            <VideoFrame provider={voices.video.provider} url={voices.video.url} title={voices.video.heading} />
            {voices.video.stamp === undefined ? null : (
              <figcaption className="mvt-mu mvt-vb-stamp">{voices.video.stamp}</figcaption>
            )}
          </figure>
          <div className="mvt-vb-copy">
            <h3 className="mvt-h3">{voices.video.heading}</h3>
            {voices.video.body === undefined ? null : <p className="mvt-body">{voices.video.body}</p>}
          </div>
        </div>

        <ul className="mvt-feat">
          {featured.map((testimonial) => (
            <FeaturedPlate key={testimonial.id} testimonial={testimonial} />
          ))}
        </ul>
      </div>

      <Trough
        label={voices.trough.label}
        pauseLabel={voices.trough.pauseLabel}
        playLabel={voices.trough.playLabel}
        sheetCount={row.length}
      >
        {row.map(({ key, testimonial, clone }) => (
          <Sheet key={key} testimonial={testimonial} shortNames={shortNames} clone={clone} />
        ))}
        {row.map(({ key, testimonial }) => (
          <Sheet key={`${key}-clone`} testimonial={testimonial} shortNames={shortNames} clone />
        ))}
      </Trough>
    </section>
  );
}
