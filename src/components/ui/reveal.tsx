import type { ElementType, ReactNode } from 'react';

/** Elements `<Reveal>` is allowed to render as. */
export type RevealTag =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'figure'
  | 'p'
  | 'h2'
  | 'h3'
  | 'ul'
  | 'ol'
  | 'li'
  | 'span';

export type RevealVariant = 's' | 'rule' | 'paper';

export interface RevealProps {
  /** Element to render. Defaults to `div`. */
  as?: RevealTag;
  /**
   * Which entrance: default 24px rise (760ms), `s` = 14px rise (520ms),
   * `rule` = scaleX draw from the left, `paper` = clip-path un-inset.
   */
  variant?: RevealVariant;
  /** Extra classes, appended after the reveal classes. */
  className?: string;
  /** Optional element id (anchor targets). */
  id?: string;
  /** Language of the content, when it differs from the page. */
  lang?: string;
  /** Marks the element decorative (the drawn rules are `aria-hidden`). */
  ariaHidden?: boolean;
  children?: ReactNode;
}

/**
 * A scroll-revealed element. Purely presentational — it renders the `.mvt-rev`
 * classes and nothing else, so it stays a Server Component and the markup is
 * complete in the prerendered HTML. The behaviour lives in ONE place:
 * `layout/mvt-root.tsx` observes every `.mvt-rev` under the root
 * (IntersectionObserver + scroll sweep + poll + failsafe; reduced motion and
 * no-JS render complete — see `globals.css`).
 *
 * Builders may also write `className="mvt-rev mvt-rev--s"` directly; this
 * component exists so the common case reads declaratively.
 */
export function Reveal({ as = 'div', variant, className, id, lang, ariaHidden, children }: RevealProps) {
  const classes = ['mvt-rev', variant ? `mvt-rev--${variant}` : null, className].filter(Boolean).join(' ');
  const Tag = as as ElementType;
  return (
    <Tag className={classes} id={id} lang={lang} aria-hidden={ariaHidden || undefined}>
      {children}
    </Tag>
  );
}
