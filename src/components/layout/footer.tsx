import Image from 'next/image';

import { PrivacyDialog } from '@/components/layout/privacy-dialog';
import { XhsTile } from '@/components/ui/icons';
import { PlateCta, WaTextLink } from '@/components/ui/plate-cta';
import type { Footer as FooterCopy, FooterLink, Legal, Settings, WhatsappPrefills } from '@/content/schema';
import { sectionHash } from '@/lib/anchors';
import { paragraphs } from '@/lib/paragraphs';

import './footer.css';

/** Visible names for the social platforms the settings enum allows. */
const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  xiaohongshu: '小紅書',
};

export interface SiteFooterProps {
  /** `pages.footer`. */
  copy: FooterCopy;
  /** `pages.legal` — the privacy dialog's content. */
  legal: Legal;
  /** The whole settings document (brand, socials, builder). */
  settings: Settings;
  /** All prefills; the footer needs its own and the one for `whatsapp` links. */
  prefills: WhatsappPrefills;
}

function FooterLinkItem({
  link,
  legal,
  phone,
  message,
  ctaKey,
}: {
  link: FooterLink;
  legal: Legal;
  phone: string;
  message: string;
  ctaKey: string;
}) {
  switch (link.kind) {
    case 'anchor':
      return <a href={sectionHash(link.href ?? '#')}>{link.label}</a>;
    case 'external':
      return (
        <a href={link.href} target="_blank" rel="noopener">
          {link.label}
        </a>
      );
    case 'whatsapp':
      return <WaTextLink phone={phone} message={message} ctaKey={ctaKey} label={link.label} />;
    case 'modal':
      return <PrivacyDialog label={link.label} privacy={legal.privacy} />;
  }
}

/**
 * The footer — the page's only `--lac-void` field: brand column, two link
 * columns, the get-in-touch column, then the legal bottom row with the builder
 * credit. Carries `data-plan-avoid` so the fixed "Your plan" panel parks before
 * it can cover the legal bar.
 */
export function SiteFooter({ copy, legal, settings, prefills }: SiteFooterProps) {
  const { brand, builder } = settings;
  const phone = settings.contact.whatsappPhone;
  const footMessage = prefills[copy.getInTouch.ctaKey];

  return (
    <footer id="mvt-s-footer" className="mvt-footer" data-plan-avoid="">
      <div className="mvt-wrap">
        <div className="mvt-foot-grid">
          <div className="mvt-foot-brand">
            <Image src={brand.logo.src} alt={brand.logo.alt} width={40} height={40} />
            <h2>{brand.tutorName}</h2>
            <p>
              {brand.taglineEn} - <span lang="zh-Hant">{brand.taglineZh}</span>
            </p>
            <p>{brand.description}</p>
            <div className="mvt-social" aria-label={copy.socialsLabel}>
              {settings.socials.map((social) => (
                <a key={social.platform} className="mvt-mu" href={social.url} target="_blank" rel="noopener">
                  {social.platform === 'xiaohongshu' ? (
                    <>
                      <XhsTile className="mvt-xhs" />
                      <span lang="zh-Hant">{SOCIAL_LABELS[social.platform]}</span>
                    </>
                  ) : (
                    (SOCIAL_LABELS[social.platform] ?? social.platform)
                  )}
                </a>
              ))}
            </div>
          </div>

          {copy.columns.map((column) => (
            <div key={column.id} className="mvt-foot-col">
              <h3 className="mvt-mu">{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.id}>
                    <FooterLinkItem
                      link={link}
                      legal={legal}
                      phone={phone}
                      message={footMessage}
                      ctaKey={copy.getInTouch.ctaKey}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mvt-foot-cta">
            <h3 className="mvt-mu mvt-brass">{copy.getInTouch.title}</h3>
            <p>{copy.getInTouch.body}</p>
            <PlateCta
              phone={phone}
              message={footMessage}
              ctaKey={copy.getInTouch.ctaKey}
              label={copy.getInTouch.ctaLabel}
              dot
            />
            <div className="mvt-foot-meta">
              {copy.meta.map((row) => (
                <span key={row.id}>
                  {row.label} {row.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mvt-foot-bot">
          <p>
            {copy.bottom.rights} · {copy.bottom.disclaimer}
          </p>
          <div>
            <span>
              {builder.label} {builder.name}
            </span>
            <span>{builder.stack}</span>
          </div>
        </div>

        <PrivacyStatic privacy={legal.privacy} />
      </div>
    </footer>
  );
}

/**
 * The privacy policy printed into the page, for readers without JavaScript.
 *
 * The footer's "Privacy Policy" control is a Radix `Dialog.Trigger`, i.e. a
 * `<button>`: with scripts off it does nothing at all, and this is a static
 * export with no policy route to fall back to — so the only reachable copy of
 * the policy would be none. This block is that copy. It is gated on the same
 * `body.js` flag the reveal system uses (`footer.css`), so it costs a reader
 * with JavaScript nothing and never appears beside the dialog.
 *
 * Both renderings split their paragraphs with the shared `paragraphs()` helper
 * and read the same `pages.legal.privacy`, so they cannot drift.
 */
function PrivacyStatic({ privacy }: { privacy: Legal['privacy'] }) {
  return (
    <div className="mvt-pv-static">
      <h3 className="mvt-pv-static-title">{privacy.modalTitle}</h3>
      <p className="mvt-pv-updated">
        {privacy.lastUpdatedLabel} {privacy.lastUpdated}
      </p>
      <p className="mvt-pv-intro">{privacy.intro}</p>
      <div className="mvt-pv-sections">
        {privacy.sections.map((section) => (
          <section key={section.id}>
            <h4>{section.heading}</h4>
            {paragraphs(section.body).map((text, part) => (
              <p key={`${section.id}-p${part}`}>{text}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
