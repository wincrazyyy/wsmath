/**
 * Structured data.
 *
 * Every value is read out of the content set: a `LocalBusiness` for the
 * practice, a `Person` for the tutor, a `FAQPage` carrying all eight answers,
 * and one `Course` per board package (IBDP, International A-Level,
 * International GCSE). Nothing here is typed in — change the WhatsApp number or
 * the course price in `settings.json` and the markup follows, exactly as the
 * visible copy does.
 *
 * A Server Component: it emits `<script>` tags into the prerendered HTML and
 * ships no JavaScript.
 */
import type { Package, Settings } from '@/content/schema';
import type { SiteContent } from '@/lib/content';
import { interpolate } from '@/lib/tokens';

/** The shape `JSON.stringify` is allowed to see. Keeps `any` out of the builders. */
type JsonValue = string | number | boolean | null | readonly JsonValue[] | { readonly [key: string]: JsonValue };
type JsonObject = { readonly [key: string]: JsonValue };

/**
 * The one geographic literal on the page. `settings.contact.centreAddress`
 * carries the street and district a reader needs; the ISO 3166 country code a
 * search engine needs is not a sentence anybody would edit, so it lives here
 * rather than as a content field nobody would understand.
 */
const ADDRESS_COUNTRY = 'HK';

/**
 * The price band shown to search engines. A format string, not a figure: both
 * numbers resolve from `settings.pricing` and `settings.programme`, through the
 * same `money` formatter the visible copy uses, so the two can never disagree.
 */
const PRICE_RANGE_TEMPLATE = '{{money pricing.privateHourlyRate}} / {{programme.sessionMinutes}} min';

/** Join a site root with a `/`-prefixed public path, tolerating a trailing slash on the root. */
function absolute(siteUrl: string, path: string): string {
  return `${siteUrl.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Collapse an answer to a single plain-text run: the blank lines that separate
 * its paragraphs on the page become spaces, and the emphasis markers markdown
 * would use are dropped. Structured data wants prose, not layout.
 */
function plainText(markdown: string): string {
  return markdown
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|\*|_)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** E.164 from the digits-only WhatsApp number: `85269447214` → `+85269447214`. */
function telephone(settings: Settings): string {
  return `+${settings.contact.whatsappPhone}`;
}

function localBusiness(content: SiteContent): JsonObject {
  const { brand, contact, socials, seo } = content.settings;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${seo.siteUrl.replace(/\/+$/, '')}/#business`,
    name: brand.name,
    legalName: brand.name,
    description: brand.description,
    url: seo.siteUrl,
    telephone: telephone(content.settings),
    priceRange: interpolate(PRICE_RANGE_TEMPLATE, content.tokens, 'json-ld.priceRange'),
    image: absolute(seo.siteUrl, brand.ogImage.src),
    logo: absolute(seo.siteUrl, brand.logo.src),
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.centreAddress,
      addressCountry: ADDRESS_COUNTRY,
    },
    founder: {
      '@type': 'Person',
      name: brand.tutorName,
      alternateName: brand.tutorNameZh,
      jobTitle: brand.taglineEn,
    },
    sameAs: socials.map((social) => social.url),
  };
}

function person(content: SiteContent): JsonObject {
  const { brand, socials, seo } = content.settings;

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${seo.siteUrl.replace(/\/+$/, '')}/#person`,
    name: brand.tutorName,
    alternateName: brand.tutorNameZh,
    jobTitle: brand.taglineEn,
    description: brand.description,
    url: seo.siteUrl,
    telephone: telephone(content.settings),
    image: absolute(seo.siteUrl, brand.ogImage.src),
    worksFor: { '@type': 'Organization', name: brand.name, url: seo.siteUrl },
    knowsAbout: content.settings.programme.curricula,
    sameAs: socials.map((social) => social.url),
  };
}

function faqPage(content: SiteContent): JsonObject {
  const questions = [...content.faqs].sort((a, b) => a.order - b.order);

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${content.settings.seo.siteUrl.replace(/\/+$/, '')}/#faq`,
    mainEntity: questions.map((faq) => ({
      '@type': 'Question',
      name: plainText(faq.question),
      acceptedAnswer: { '@type': 'Answer', text: plainText(faq.answer) },
    })),
  };
}

/**
 * One `Course` node per board package.
 *
 * The offer is an `AggregateOffer` because a board can sell several courses at
 * two tiers. The bounds come from THIS board's own courses — each `variant.tier`
 * names a figure in `settings.pricing`, so no price is retyped and none is
 * parsed back out of the per-course display strings, which are copy rather than
 * numbers. Reading the two settings figures directly, as this did, published the
 * same 16,800–19,800 range for every board: IAL sells exactly one course at one
 * price and was shipping a range whose upper bound exists nowhere in its source
 * document. `highPrice` is omitted when a board has a single price, because a
 * range with equal ends is a range that should not have been asserted.
 */
function course(content: SiteContent, item: Package): JsonObject {
  const { brand, pricing, seo } = content.settings;
  const variants = item.variants ?? [];
  const prices = variants.map((variant) =>
    variant.tier === 'higher' ? pricing.coursePriceHigher : pricing.coursePrice,
  );
  /* `crossCheck` refuses a board with no courses, so the fallback is unreachable
     in any build that passes — it exists so the bound is never `Infinity`. */
  const lowPrice = prices.length > 0 ? Math.min(...prices) : pricing.coursePrice;
  const highPrice = prices.length > 0 ? Math.max(...prices) : pricing.coursePrice;

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${seo.siteUrl.replace(/\/+$/, '')}/#course-${item.id}`,
    name: item.title,
    description: plainText(item.description),
    url: absolute(seo.siteUrl, '/#packages'),
    provider: { '@type': 'Organization', name: brand.name, url: seo.siteUrl },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice,
      ...(highPrice > lowPrice ? { highPrice } : {}),
      offerCount: variants.length,
      priceCurrency: pricing.currency,
      url: absolute(seo.siteUrl, '/#packages'),
      availability: 'https://schema.org/InStock',
    },
  };
}

/**
 * `<` is escaped so a stray `</script>` inside a testimonial or an FAQ answer
 * can never close the block early. JSON's `<` is the same character to
 * every parser, and the escape is invisible to search engines.
 */
function serialize(node: JsonObject): string {
  return JSON.stringify(node).replace(/</g, '\\u003c');
}

export interface JsonLdProps {
  /** The validated, token-resolved content set. */
  content: SiteContent;
}

export function JsonLd({ content }: JsonLdProps) {
  const blocks: JsonObject[] = [
    localBusiness(content),
    person(content),
    faqPage(content),
    ...content.packages.filter((item) => item.kind === 'board').map((item) => course(content, item)),
  ];

  return (
    <>
      {blocks.map((block) => (
        <script
          key={String(block['@id'])}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialize(block) }}
        />
      ))}
    </>
  );
}
