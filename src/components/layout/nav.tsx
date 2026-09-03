import Image from 'next/image';

import { PlateCta } from '@/components/ui/plate-cta';
import type { MediaRef, Nav as NavCopy, SectionMark } from '@/content/schema';
import { sectionDomId, sectionHash } from '@/lib/anchors';

import './nav.css';

export interface NavProps {
  /** `pages.nav`. */
  nav: NavCopy;
  /** `pages.sectionMarks` — the links, in order. */
  marks: readonly SectionMark[];
  /** `settings.brand.logo`. */
  logo: MediaRef;
  /** `settings.contact.whatsappPhone`. */
  phone: string;
  /** `whatsappPrefills[nav.ctaKey]`, resolved at the page boundary. */
  message: string;
}

/**
 * The machined console rail: brandmark, a stretching brass comb rule, the
 * section links (scroll-spy sets `.is-active` — wired in `MvtRoot`), one CTA.
 * The active link is a debossed slot pressed into the rail, not an underline.
 */
export function Nav({ nav, marks, logo, phone, message }: NavProps) {
  return (
    <nav id="mvt-s-nav" className="mvt-nav" aria-label={nav.menuLabel}>
      <div className="mvt-wrap">
        <div className="mvt-nav-in">
          <a className="mvt-brandmark" href="#mvt-s-hero">
            <Image src={logo.src} alt={logo.alt} width={22} height={22} />
            <span className="mvt-mu">{nav.brandLabel}</span>
          </a>
          <span className="mvt-rule" aria-hidden="true" />
          <div className="mvt-navlinks">
            {marks.map((mark) => (
              <a
                key={mark.id}
                className="mvt-navlink mvt-mu"
                href={sectionHash(mark.id)}
                data-spy={sectionDomId(mark.id)}
              >
                {mark.label}
              </a>
            ))}
          </div>
          <PlateCta phone={phone} message={message} ctaKey={nav.ctaKey} label={nav.ctaLabel} />
        </div>
      </div>
      <div className="mvt-edge" />
    </nav>
  );
}
