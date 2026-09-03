'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';

import { Chevron, ExpandGlyph, PauseBars, PlayTriangle } from '@/components/ui/icons';
import { PlateCta } from '@/components/ui/plate-cta';
import type { CourseOutline, CourseVariant, OutlineCopy } from '@/content/schema';

import './outline-dialog.css';

/* Every string this dialog says is content. `packagesPage.outline` holds the
   eight UI labels, the panel's title is `outline.label`, the rail is labelled
   with each course's own exam-board code, and each page is announced by its own
   `alt` from `packages.json`. Nothing is typed here.

   `openLabel` carries a `{count}` placeholder rather than a token — the same
   `{placeholder}` convention `results.stream.drawnTemplate` uses — because the
   page count differs per card. `openLabelSingle` exists because IAL has exactly
   one page and `1 pages` is not shippable. */

/** Substitute `{count}` in the authored open label. */
function openLabelFor(copy: OutlineCopy, count: number): string {
  return count === 1 ? copy.openLabelSingle : copy.openLabel.replace('{count}', String(count));
}

/** Typed inline custom property (same helper as `results-panel.tsx`). */
function cssVar(name: string, value: string): CSSProperties {
  return { [name]: value } as CSSProperties;
}

/* ── prefers-reduced-motion, as an external store ──────────────────────────
   A media query is a subscription to something outside React, which is what
   `useSyncExternalStore` is for: no effect, no setState-in-effect, and the
   server snapshot (`false`) keeps the prerendered HTML stable — the dialog is
   closed at that point, so nothing it decides is visible until a reader opens
   it, by which time the real value is in hand. */
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function readReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION).matches;
}

function reducedMotionOnServer(): boolean {
  return false;
}

export interface OutlineDialogProps {
  /** `packages[board].outline` — viewer title, card caption, auto-advance interval. */
  outline: CourseOutline;
  /**
   * `packages[board].variants` — the pages come from here, in order, one per
   * course. Removing the 1:1 sync hazard entirely: an outline cannot have four
   * pages and three courses, because the courses *are* the pages.
   */
  variants: readonly CourseVariant[];
  /** `pages.packagesPage.outline` — the eight UI labels, tokens already resolved. */
  copy: OutlineCopy;
  /** `settings.contact.whatsappPhone` — for the CTA in the viewer's foot. */
  phone: string;
  /** `whatsappPrefills[pkg.ctaKey]`, already token-interpolated. */
  message: string;
  /** The board's own CTA key — the same one the card's foot CTA fires. */
  ctaKey: string;
  /** `pages.packagesPage.ctaLabel`. */
  ctaLabel: string;
  /**
   * The card's `.mvt-slip-frame`, server-rendered by `packages.tsx` with the
   * first course's page inside it. Passing it in keeps the frame's markup and
   * styling with the plate that owns them, and keeps that page in the HTML with
   * JavaScript off.
   */
  children: ReactNode;
}

/**
 * A board card's course outline, opened from the card's slip — one page per
 * course, one at a time, in a lac-void vitrine.
 *
 * The page rail is labelled with the courses' own exam-board codes
 * (`AASL AAHL AISL AIHL`, not `1 2 3 4`), so the rail *is* the course selector
 * and ties the viewer back to the ledger rows on the card. A one-course board
 * (IAL) degrades to a single-page vitrine: the existing `count < 2` guards
 * suppress the arrows, the transport and the rail, and the foot still renders
 * its CTA — no board should be the one whose viewer has no way to enquire.
 *
 * Notes on the parts that are not obvious:
 *
 * · **Portalled into `.mvt-root`, not into `<body>`.** Every design token in
 *   this system is declared on `.mvt-root`, so a panel portalled to the body
 *   would render with no palette, no type stack and no reduced-motion rule.
 *   The container is resolved from the trigger with `closest()`, which also
 *   keeps `/preview` working if a second root is ever mounted. Portalling is
 *   still worth doing: it lifts the fixed panel out of `.mvt-pack`, an
 *   ancestor that carries a `transform` while its reveal runs — a transformed
 *   ancestor would silently turn `position:fixed` into `position:absolute`.
 *
 * · **Auto-advance is pausable and never starts under reduced motion**
 *   (WCAG 2.2.2). Any manual move — arrow, rail, keyboard — hands control to
 *   the reader and stops it; the toggle starts it again. Hovering the page
 *   pauses it while the pointer rests there.
 *
 * · **Only a window of pages is mounted** (the current page, its two
 *   neighbours and the one just left). The eight outline pages run ~1.7 MB; the
 *   window keeps the next page decoded and ready for an instant cross-fade
 *   without fetching the whole outline the moment the dialog opens.
 */
export function OutlineDialog({
  outline,
  variants,
  copy,
  phone,
  message,
  ctaKey,
  ctaLabel,
  children,
}: OutlineDialogProps) {
  const pages = useMemo(() => variants.map((variant) => variant.outlinePage), [variants]);
  const count = pages.length;
  const first = pages[0];

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  /** The page just left — kept mounted so a rail jump cross-fades instead of blinking. */
  const [previous, setPrevious] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [resting, setResting] = useState(false);
  const [announced, setAnnounced] = useState('');
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const reduced = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, reducedMotionOnServer);

  /** A reader-initiated move: it announces the page and stops the auto-advance. */
  const select = useCallback(
    (next: number) => {
      setPlaying(false);
      if (next === index) return;
      setPrevious(index);
      setIndex(next);
      setAnnounced(pages[next]?.alt ?? '');
    },
    [index, pages],
  );

  const step = useCallback((delta: number) => select((index + delta + count) % count), [count, index, select]);

  /* Auto-advance. A timeout re-armed on every settled page rather than an
     interval, so pausing and resuming never lands mid-tick. */
  useEffect(() => {
    if (!open || !playing || resting || reduced || count < 2) return;
    const id = window.setTimeout(() => {
      setPrevious(index);
      setIndex((index + 1) % count);
    }, outline.autoAdvanceSeconds * 1000);
    return () => window.clearTimeout(id);
  }, [open, playing, resting, reduced, count, index, outline.autoAdvanceSeconds]);

  const onOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) return;
      /* Resolved here rather than in an effect: it is only needed while the
         dialog is open, and the trigger is always mounted by the time this
         runs. `closest` rather than a document query so a second `.mvt-root`
         (the /preview shell) can never capture the wrong one. */
      setContainer(triggerRef.current?.closest<HTMLElement>('.mvt-root') ?? null);
      setIndex(0);
      setPrevious(0);
      setAnnounced('');
      setResting(false);
      setPlaying(!reduced);
    },
    [reduced],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowRight') step(1);
      else if (event.key === 'ArrowLeft') step(-1);
      else if (event.key === 'Home') select(0);
      else if (event.key === 'End') select(count - 1);
      else return;
      event.preventDefault();
    },
    [count, select, step],
  );

  const mounted = useMemo(() => {
    const set = new Set<number>([previous, index]);
    if (index > 0) set.add(index - 1);
    if (index + 1 < count) set.add(index + 1);
    return set;
  }, [count, index, previous]);

  const openLabel = openLabelFor(copy, count);
  /* The stage's shape is the outline page's own shape, and the panel's width
     is derived from it (outline-dialog.css) so the vitrine fits the page at
     every viewport instead of letterboxing it. Falls back to the CSS default
     when a page has no intrinsic size recorded. */
  const ratio = first?.width !== undefined && first.height !== undefined ? first.width / first.height : null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger ref={triggerRef} className="mvt-lf-trigger" aria-label={openLabel}>
        {children}
        <span className="mvt-lf-hint mvt-mu" aria-hidden="true">
          <Chevron />
          {openLabel}
        </span>
      </Dialog.Trigger>

      <Dialog.Portal container={container ?? undefined}>
        <Dialog.Overlay className="mvt-lf-overlay" />
        {/* The title names the panel; each page is described by its own alt, so
            there is no separate description to point at. */}
        <Dialog.Content
          className="mvt-lf-panel mvt-raise"
          aria-describedby={undefined}
          onKeyDown={onKeyDown}
          /* The foot's height is part of the panel's width formula, and a
             one-course board renders neither the transport, the rail nor the
             counter. The count is published so the stylesheet can restate the
             chrome budget for that case instead of reserving a row nothing
             fills. */
          data-pages={count}
          style={ratio === null ? undefined : cssVar('--lf-ar', String(ratio))}
        >
          <div className="mvt-lf-head">
            <Dialog.Title className="mvt-mu mvt-brass">{outline.label}</Dialog.Title>
            <span className="mvt-knurl" aria-hidden="true" />
            <Dialog.Close className="mvt-lf-close mvt-mu">{copy.closeLabel}</Dialog.Close>
          </div>

          <div
            className="mvt-lf-stage"
            onPointerEnter={() => setResting(true)}
            onPointerLeave={() => setResting(false)}
          >
            {pages.map((page, at) =>
              mounted.has(at) ? (
                <div
                  className="mvt-lf-sheet"
                  key={page.src}
                  data-current={at === index}
                  aria-hidden={at !== index}
                >
                  <Image
                    src={page.src}
                    alt={page.alt}
                    width={page.width}
                    height={page.height}
                    sizes="(max-width: 1200px) 92vw, 900px"
                  />
                </div>
              ) : null,
            )}

            {count < 2 ? null : (
              <>
                <button
                  className="mvt-lf-arrow mvt-lf-arrow--prev"
                  type="button"
                  aria-label={copy.previousLabel}
                  onClick={() => step(-1)}
                >
                  <Chevron />
                </button>
                <button
                  className="mvt-lf-arrow mvt-lf-arrow--next"
                  type="button"
                  aria-label={copy.nextLabel}
                  onClick={() => step(1)}
                >
                  <Chevron />
                </button>
              </>
            )}

            {/* ONE control, not one per sheet. `.mvt-lf-sheet` is a stack of
                overlapping absolutely positioned boxes with `aria-hidden` on
                the non-current ones, so anything focusable inside a sheet is
                both an `aria-hidden-focus` violation and a click target over
                the page the reader is actually looking at. This anchor is a
                sibling of the sheets, its href follows the current page, and
                because the element persists across page changes, advancing
                while it holds focus cannot strand focus inside a Radix trap. */}
            {first === undefined ? null : (
              <a
                className="mvt-lf-full mvt-mu"
                href={pages[index]?.src ?? first.src}
                target="_blank"
                rel="noopener"
              >
                <ExpandGlyph aria-hidden="true" />
                {copy.fullSizeLabel}
              </a>
            )}
          </div>

          {/* The foot always renders, and always carries the CTA: a one-course
              board must not be the one card whose viewer has no way to enquire.
              Only the transport, the rail and the counter are suppressed at
              `count < 2`, where they would describe nothing. */}
          <div className="mvt-lf-foot">
            {count < 2 ? null : (
              <>
                {/* A changing label, not `aria-pressed`: "Pause, pressed" is a
                    contradiction to read out, and the APG's media pattern is to
                    rename the control rather than mark it as a toggle. */}
                <button className="mvt-lf-toggle mvt-mu" type="button" onClick={() => setPlaying((was) => !was)}>
                  {playing ? <PauseBars /> : <PlayTriangle />}
                  {playing ? copy.pauseLabel : copy.playLabel}
                </button>

                <ol className="mvt-lf-rail">
                  {variants.map((variant, at) => (
                    <li key={variant.id}>
                      {/* Labelled with the course's own exam-board code, so the
                          rail IS the course selector and ties back to the
                          ledger rows on the card. */}
                      <button
                        className="mvt-lf-dot mvt-code mvt-num"
                        type="button"
                        aria-label={variant.outlinePage.alt}
                        aria-current={at === index ? 'page' : undefined}
                        onClick={() => select(at)}
                      >
                        {variant.code ?? String(at + 1)}
                      </button>
                    </li>
                  ))}
                </ol>

                {/* The rail already carries the state for assistive tech. */}
                <p className="mvt-lf-count mvt-code mvt-num" aria-hidden="true">
                  {index + 1} / {count}
                </p>
              </>
            )}

            <PlateCta
              className="mvt-lf-cta"
              phone={phone}
              message={message}
              ctaKey={ctaKey}
              label={ctaLabel}
              dot
            />
          </div>

          {/* Announces only reader-initiated moves — an auto-advance that spoke
              every few seconds would be noise. */}
          <p className="mvt-visually-hidden" aria-live="polite">
            {announced}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
