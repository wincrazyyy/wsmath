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
 * One 340px ruled sheet in the drifting channel. `clone` marks the second
 * printing of the same twelve — the copy that makes the loop seamless. It is
 * `aria-hidden` and `inert`, so it is invisible to assistive technology and
 * unreachable by keyboard, and reduced motion removes it from the layout
 * entirely (CSS), which is what "no clones under RM" means here.
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
 * ══ 9 · STUDENT VOICES ══════════════════════════════════════════════════════
 *
 * Head → the video band → four featured plates → the full-bleed channel of
 * twelve drifting sheets. This section carries two of the three client-reported
 * defects; both fixes are structural, not cosmetic.
 *
 * **Issue #1 — the video.** `.mvt-videoband` was a play-glyph banner in the
 * artifact and a click-to-load poster on the live site. It is now a real,
 * eagerly-loaded, autoplaying player in the server-rendered HTML — see
 * `video-frame.tsx` and `embed.ts` for why the URL parameters, not the markup,
 * are the fix.
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
 * twelve sheets are the curated selection in `pages.voices.trough.sheetIds`, in
 * that order — the *editorial* choice of which twelve of the twenty-four drift
 * is page copy, so it lives in `pages.json`; the quotes themselves never leave
 * the collection.
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

  return (
    <section id={sectionDomId('voices')} className="mvt-sec mvt-voices">
      <div className="mvt-wrap">
        <div className="mvt-head">
          <p className="mvt-eyebrow mvt-rev mvt-rev--s">{voices.eyebrow}</p>
          <h2 className="mvt-h2 mvt-rev">{voices.title}</h2>
          <span className="mvt-rule mvt-rev mvt-rev--rule" aria-hidden="true" />
          <p className="mvt-head-sub mvt-lead mvt-rev mvt-rev--s">{voices.lede}</p>
        </div>

        {/* the well is the tray; the player is a slip inlay in it, never a raise */}
        <div className="mvt-videoband mvt-well mvt-rev mvt-rev--s">
          <figure className="mvt-vb-slip">
            <VideoFrame provider={voices.video.provider} url={voices.video.url} title={voices.video.heading} />
            <figcaption className="mvt-mu mvt-vb-stamp">{voices.video.stamp}</figcaption>
          </figure>
          <div className="mvt-vb-copy">
            <h3 className="mvt-h3">{voices.video.heading}</h3>
            <p className="mvt-body">{voices.video.body}</p>
            {/* the band's bottom register — see `.mvt-vb-fill` in voices.css */}
            <span className="mvt-knurl mvt-vb-fill" aria-hidden="true" />
          </div>
        </div>

        <ul className="mvt-feat">
          {featured.map((testimonial) => (
            <FeaturedPlate key={testimonial.id} testimonial={testimonial} />
          ))}
        </ul>
      </div>

      <Trough label={voices.trough.label} pauseLabel={voices.trough.pauseLabel} playLabel={voices.trough.playLabel}>
        {sheets.map((testimonial) => (
          <Sheet key={testimonial.id} testimonial={testimonial} shortNames={shortNames} />
        ))}
        {sheets.map((testimonial) => (
          <Sheet key={`${testimonial.id}-clone`} testimonial={testimonial} shortNames={shortNames} clone />
        ))}
      </Trough>
    </section>
  );
}
