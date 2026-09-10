'use client';

import { useEffect, useRef, useState } from 'react';

import type { VideoProvider } from '@/content/schema';

import { resolveEmbed } from './embed';

export interface VideoFrameProps {
  /** `pages.voices.video.provider`. */
  provider: VideoProvider;
  /** `pages.voices.video.url` — the share link, verbatim from content. */
  url: string;
  /** `pages.voices.video.heading` — the iframe's accessible name. */
  title: string;
}

/**
 * The intro video, inlaid into the voices band as a *slip* — the same treatment
 * the board cards' course outlines get, this design's canonical "foreign media
 * in the lacquer" object.
 *
 * CLIENT ISSUE #1. The player is in the initial server-rendered HTML with the
 * autoplaying source, eagerly loaded, with no click-to-load gate: the visitor's
 * arrival is the trigger, exactly as the owner asked. The three ways this is
 * usually got wrong, and why none of them happen here:
 *
 * 1. **`loading="lazy"`** — a lazy iframe below the fold does not start until it
 *    scrolls near the viewport, which is precisely "does not autoplay on load".
 *    Absent here, deliberately.
 * 2. **A bare `…/embed/<id>`** — the live site's URL, measured NOT to autoplay.
 *    The parameters live in `embed.ts` and are the actual fix.
 * 3. **`allow` without `autoplay`** — the frame is then denied the capability no
 *    matter what its URL says. `allow="autoplay; …"` is the load-bearing part.
 *
 * `'use client'` buys exactly one thing: `prefers-reduced-motion`. A media query
 * cannot pick a `src` on a statically exported page, so the server renders the
 * autoplaying source — the safe default is the *requested* behaviour, and a
 * reader with JavaScript off still gets it — and this component swaps to the
 * non-autoplay source (Loom's poster + play button) only when the reader has
 * asked for reduced motion. No state changes for anyone else, so the common
 * path renders once and the frame is never reloaded.
 *
 * The frame's classes are static, which matters more than it looks: the band
 * around it carries `.mvt-rev--s` and `MvtRoot` adds `.is-in` to that element
 * from outside React. Any React-owned `className` on the reveal path would be
 * rewritten on the next render and drop `.is-in`. State here rides `src` alone,
 * and the reveal animates opacity/transform on an ancestor — the iframe is
 * never remounted, so playback is never interrupted.
 *
 * ## The focus guard — an autoplaying third-party frame needs one
 *
 * Loom's player takes focus for itself twice without being asked:
 *
 * 1. About three seconds after a cold load, with the reader still at `scrollY 0`
 *    and having touched nothing, its script focuses the frame. From then on the
 *    page is broken for a keyboard: ArrowDown and Space no longer scroll (Space
 *    toggles playback) and the first Tab teleports the viewport eleven thousand
 *    pixels down into the player's own controls.
 * 2. When the video ends, its end card focuses the "Reply" textarea. Focusing an
 *    element scrolls it into view through every ancestor frame, so a reader who
 *    let the muted autoplay run and kept reading is yanked back to the player
 *    two and a half minutes later, from anywhere on the page. Reported by the
 *    owner 2026-09-03; no embed parameter suppresses the end card.
 *
 * Dropping autoplay is not available: autoplay on arrival is the client's
 * stated requirement. So focus that lands on the frame **while the reader
 * cannot have put it there** is handed straight back and the scroll offset is
 * restored. "Cannot have put it there" is all three of:
 *
 * - the frame was not on screen at the previous paint (the observer's report,
 *   which lags one frame — the steal itself scrolls the frame into view, so the
 *   *current* rectangle is not evidence), and if the page did not move since
 *   that paint, the frame is not on screen now either;
 * - no Tab key was pressed in this document in the last {@link TAB_GRACE_MS}.
 *   Tab is the only key that can carry focus from the page into the frame; a
 *   wheel or a touch cannot, and a pointer needs the frame on screen;
 * - fewer than {@link MAX_CORRECTIONS} hand-backs this off-screen spell, so a
 *   hostile player cannot be fought forever.
 *
 * A reader who has the player on screen, or who tabbed into it, is never
 * touched: the guard yields for as long as their focus stays inside. When they
 * scroll the player off screen with focus still in it, focus is returned to the
 * page — Space and the arrows scroll again, and the end card's later grab is
 * then a fresh steal the rule above catches.
 *
 * Two mechanics, both measured rather than assumed:
 *
 * 1. **The guard polls; it cannot listen.** When a cross-origin frame focuses
 *    itself, Chrome fires no `focus`/`focusin` on the embedding document —
 *    `document.activeElement` simply *is* the iframe at the next tick. So a
 *    `requestAnimationFrame` loop compares `activeElement` once per paint and
 *    remembers the scroll offset of the previous paint, which is by definition
 *    the pre-steal offset. One identity comparison per paint, armed only while
 *    the frame is off screen.
 * 2. **The parent's scroll can arrive late.** Under site isolation the child
 *    frame asks the parent to scroll over IPC, so the jump may land a paint or
 *    two after the focus change. For {@link SETTLE_MS} after a hand-back the
 *    loop keeps snapping the offset back, unless the reader produces an input
 *    of their own, which ends the window at once.
 */
export function VideoFrame({ provider, url, title }: VideoFrameProps) {
  const [reduced, setReduced] = useState(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (frame === null || typeof IntersectionObserver === 'undefined') return;

    /* the observer's last report — one paint behind, which is what makes it
       evidence about the moment *before* a steal */
    let visible = false;
    let frameRequest = 0;
    let corrections = 0;
    let settleUntil = 0;
    let lastTabAt = Number.NEGATIVE_INFINITY;
    /* `rest` is where the reader was before focus moved; `last` is where the
       page was at the previous paint, so a move between paints is detectable */
    let restX = window.scrollX;
    let restY = window.scrollY;
    let lastX = restX;
    let lastY = restY;
    /* focus is inside the frame with the reader's consent — leave it alone */
    let yielded = false;

    const options = { capture: true, passive: true } as const;
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') lastTabAt = performance.now();
      settleUntil = 0;
    };
    const onGesture = () => {
      settleUntil = 0;
    };
    const GESTURES = ['pointerdown', 'touchstart', 'wheel'] as const;
    window.addEventListener('keydown', onKeydown, options);
    for (const type of GESTURES) window.addEventListener(type, onGesture, options);

    const onScreenNow = () => {
      const rect = frame.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
    };

    const handBack = () => {
      frame.blur();
      /* `blur()` alone can leave `activeElement` on the frame; a momentarily
         focusable <body> parks focus back at the top of the tab order without
         inventing a visible target for it to land on. */
      if (document.activeElement === frame) {
        const body = document.body;
        const had = body.hasAttribute('tabindex');
        if (!had) body.setAttribute('tabindex', '-1');
        body.focus({ preventScroll: true });
        if (!had) body.removeAttribute('tabindex');
      }
    };

    const restore = () => {
      window.scrollTo({ left: restX, top: restY, behavior: 'instant' });
    };

    const watch = () => {
      frameRequest = requestAnimationFrame(watch);
      const now = performance.now();
      const x = window.scrollX;
      const y = window.scrollY;
      const moved = x !== lastX || y !== lastY;
      lastX = x;
      lastY = y;

      if (document.activeElement !== frame) {
        yielded = false;
        if (now < settleUntil) {
          if (x !== restX || y !== restY) restore();
        } else {
          restX = x;
          restY = y;
        }
        return;
      }
      if (yielded) return;

      const tabbed = now - lastTabAt < TAB_GRACE_MS;
      const consented = visible || (!moved && onScreenNow());
      if (tabbed || consented || corrections >= MAX_CORRECTIONS) {
        yielded = true;
        return;
      }

      corrections += 1;
      handBack();
      restore();
      settleUntil = now + SETTLE_MS;
    };

    const arm = () => {
      if (frameRequest !== 0) return;
      restX = lastX = window.scrollX;
      restY = lastY = window.scrollY;
      frameRequest = requestAnimationFrame(watch);
    };
    const disarm = () => {
      if (frameRequest !== 0) {
        cancelAnimationFrame(frameRequest);
        frameRequest = 0;
      }
      settleUntil = 0;
      yielded = false;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) {
          corrections = 0;
          disarm();
          return;
        }
        /* the reader scrolled the player away with focus still inside it:
           give the page its keys back, and make the end card's later grab a
           fresh steal rather than an invisible move within a focused frame */
        if (document.activeElement === frame) handBack();
        arm();
      },
      { threshold: 0.1 },
    );
    observer.observe(frame);

    return () => {
      window.removeEventListener('keydown', onKeydown, options);
      for (const type of GESTURES) window.removeEventListener(type, onGesture, options);
      observer.disconnect();
      disarm();
    };
  }, []);

  return (
    <div className="mvt-video-frame">
      <iframe
        ref={frameRef}
        src={resolveEmbed(provider, url, { noAutoplay: reduced })}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        loading="eager"
      />
    </div>
  );
}

/**
 * How long after a Tab keypress focus arriving on the frame counts as the
 * reader's own. Tab is the only key that can move focus from the page into
 * the frame; a quarter second covers a slow repeat.
 */
const TAB_GRACE_MS = 250;

/**
 * How long after a hand-back the loop keeps undoing scroll changes the reader
 * did not make. Long enough for a late cross-process scroll to land and be
 * reverted; short enough to be over before anyone notices, and ended early by
 * any input of the reader's own.
 */
const SETTLE_MS = 400;

/**
 * Hand-backs per off-screen spell before the guard concedes. A player that
 * re-takes focus after every correction would otherwise be fought once per
 * paint; conceding leaves the reader no worse off than before the guard
 * existed. Reset each time the frame comes back on screen.
 */
const MAX_CORRECTIONS = 12;
