import Image from 'next/image';
import { Fragment } from 'react';

import { CountUp } from '@/components/ui/count-up';
import { PlateCta } from '@/components/ui/plate-cta';
import type { EmphasisLine, Hero as HeroCopy } from '@/content/schema';

import './hero.css';

export interface HeroProps {
  /** `pages.hero`. */
  hero: HeroCopy;
  /** `settings.stats.tutoringHours` — the 20,000 counter's real value. */
  tutoringHours: number;
  /** `settings.contact.whatsappPhone`. */
  phone: string;
  /** `whatsappPrefills[hero.ctaKey]`, resolved at the page boundary. */
  message: string;
}

/**
 * One credential line. The bold runs in an `EmphasisLine` are the `•`
 * separators — brass, weight 400 (`.mvt-cp-cred li b`), never actual bold. The
 * runs carry their own leading/trailing spaces, so they are emitted verbatim.
 */
function ProofLine({ line }: { line: EmphasisLine }) {
  return (
    <li>
      <i aria-hidden="true" />
      <span>
        {line.parts.map((part) =>
          part.strong ? (
            <b key={part.id}>{part.text}</b>
          ) : (
            <Fragment key={part.id}>{part.text}</Fragment>
          ),
        )}
      </span>
    </li>
  );
}

/**
 * The masthead — "The Counterpoint, Re-measured".
 *
 * Two storeys inside one five-column grid. The upper storey carries the
 * right-aligned eyebrow pair and the stacked nameplate; the lower storey packs
 * portrait, the 20,000 ensemble and the facts/CTA counterweight onto one
 * implied baseline. Between them, a single brass horizon terminates into the
 * full-height seam the CJK inscription is seated against — the hero's only
 * drawn ornament, and the two `.mvt-rev` elements with a hero-private draw
 * (seam scaleY from the top at 140ms, horizon scaleX out of the shared joint at
 * 520ms). Everything else uses the shared reveal vocabulary; the closing
 * cluster animates on load instead, because at common folds it sits below the
 * observer's 92% line.
 */
export function Hero({ hero, tutoringHours, phone, message }: HeroProps) {
  const { portrait } = hero;

  return (
    <header id="mvt-s-hero" className="mvt-hero">
      <div className="mvt-wrap">
        <div className="mvt-cp">
          <div className="mvt-cp-upper">
            <div className="mvt-cp-mast mvt-rev mvt-rev--s">
              <p className="mvt-eyebrow mvt-cp-eyebrow">{hero.eyebrow}</p>
              <p className="mvt-mu mvt-cp-place">{hero.place}</p>
            </div>
            <h1 className="mvt-cp-h1 mvt-rev">
              {hero.nameLine1}
              <br />
              {hero.nameLine2}
            </h1>
          </div>

          <span className="mvt-cp-vrule mvt-rev" aria-hidden="true" />
          <span className="mvt-cp-hrule mvt-rev" aria-hidden="true" />

          <div className="mvt-cp-col">
            <b lang="zh-Hant" className="mvt-cp-cjk mvt-rev mvt-rev--s">
              {hero.inscription}
            </b>
          </div>

          <div className="mvt-cp-lower">
            <figure className="mvt-cp-photo mvt-rev">
              <Image
                src={portrait.src}
                alt={portrait.alt}
                width={portrait.width}
                height={portrait.height}
                priority
              />
            </figure>

            <div className="mvt-cp-ens">
              <CountUp value={tutoringHours} className="mvt-cp-count mvt-num" />
              <p className="mvt-cp-hours">
                <strong>{hero.band.statLabel}</strong>
                <span className="mvt-mu">{hero.band.statSublabel}</span>
              </p>
              <ul className="mvt-cp-cred">
                {hero.band.proof.map((line) => (
                  <ProofLine key={line.id} line={line} />
                ))}
              </ul>
            </div>

            <div className="mvt-cp-close">
              <p className="mvt-mu mvt-cp-scope">{hero.scope}</p>
              <div className="mvt-cp-anchor">
                <div className="mvt-cp-facts">
                  {hero.facts.map((fact) => (
                    <p key={fact.id} className="mvt-cp-fact mvt-num">
                      {fact.text}
                    </p>
                  ))}
                </div>
                <PlateCta
                  phone={phone}
                  message={message}
                  ctaKey={hero.ctaKey}
                  label={hero.ctaLabel}
                  dot
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
