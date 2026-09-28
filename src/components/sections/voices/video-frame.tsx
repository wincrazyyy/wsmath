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
 * CLIENT ISSUE #1, AS REVISED 2026-09-28. The player autoplays (muted) when the
 * reader SCROLLS TO IT, not when the page opens. The owner first asked for
 * autoplay on arrival; a player that starts at the foot of a long page, unseen,
 * and is two minutes in by the time anyone reaches it, is not what they meant.
 *
 * So the iframe is not in the page until it is needed: this component mounts it
 * — with the autoplaying source — the first time the frame has been at least
 * {@link START_THRESHOLD} visible for {@link START_DWELL_MS} (a reader flicking
 * past does not load a third-party player). It is then never unmounted, so
 * scrolling away and back never restarts it. The mistakes this avoids:
 *
 * 1. **`loading="lazy"` as the trigger** — browsers load a lazy frame 1250–2500px
 *    BEFORE it reaches the viewport, so it would start unseen. The observer
 *    measures the frame itself.
 * 2. **Swapping a poster `src` for the autoplaying one** — the frame would load
 *    Loom twice, and the reader would watch it reload.
 * 3. **A bare `…/embed/<id>`** — measured NOT to autoplay. The parameters live
 *    in `embed.ts`.
 * 4. **`allow` without `autoplay`** — the frame is then denied the capability no
 *    matter what its URL says. `allow="autoplay; …"` is the load-bearing part.
 *
 * Without JavaScript there is nothing to notice the scroll, so a `<noscript>`
 * frame carries the NON-autoplay source (Loom's poster and play button): the
 * video is there and plays on a click. With `prefers-reduced-motion: reduce`
 * the mounted frame gets that source too — a 2½-minute video starting itself
 * is motion.
 *
 * The frame's classes are static, which matters more than it looks: the band
 * around it carries `.mvt-rev--s` and `MvtRoot` adds `.is-in` to that element
 * from outside React. Any React-owned `className` on the reveal path would be
 * rewritten on the next render and drop `.is-in`. State here rides the mount
 * and `src` alone, and the reveal animates opacity/transform on an ancestor.
 *
 * ## The focus guard — a third-party frame that takes focus needs one
 *
 * Loom's player takes focus for itself twice without being asked:
 *
 * 1. About three seconds after it loads, having been touched by nobody, its
 *    script focuses the frame. From then on the page is broken for a keyboard:
 *    ArrowDown and Space no longer scroll (Space toggles playback) and Tab
 *    walks the player's own controls. Now that the frame loads ON SCREEN this
 *    steal happens in plain view — and a reader scrolling by keyboard then has
 *    no keyboard way to scroll past it.
 * 2. When the video ends, its end card focuses the "Reply" textarea. Focusing an
 *    element scrolls it into view through every ancestor frame, so a reader who
 *    let the muted autoplay run and kept reading is yanked back to the player
 *    two and a half minutes later, from anywhere on the page. Reported by the
 *    owner 2026-09-03; no embed parameter suppresses the end card.
 *
 * So focus that lands on the frame **without the reader's consent** is handed
 * straight back and the scroll offset restored. Consent is one of:
 *
 * - a Tab keypress in this document in the last {@link TAB_GRACE_MS} — Tab is
 *   the only key that can carry focus from the page into the frame;
 * - the pointer over the frame (`pointerenter`/`pointerleave` fire on the
 *   iframe element in THIS document) — the only way a mouse can reach inside;
 * - on a touch screen, the frame being on screen. A tap inside a cross-origin
 *   frame reaches this document as nothing at all, and a touch screen has no
 *   Space or arrow keys to trap, so there the old rule stands. (The observer's
 *   report lags a paint, and the end card's steal itself scrolls the frame into
 *   view — so it is the previous paint's visibility that counts, plus "on
 *   screen now" only if the page did not move since.)
 *
 * and the guard gives up after {@link MAX_CORRECTIONS} hand-backs in one spell,
 * so a hostile player cannot be fought forever. A reader who did consent is
 * never touched: the guard yields for as long as their focus stays inside. When
 * they scroll the player off screen with focus still in it, focus is returned
 * to the page — Space and the arrows scroll again.
 *
 * Two mechanics, both measured rather than assumed:
 *
 * 1. **The guard polls; it cannot listen.** When a cross-origin frame focuses
 *    itself, Chrome fires no `focus`/`focusin` on the embedding document —
 *    `document.activeElement` simply *is* the iframe at the next tick. So a
 *    `requestAnimationFrame` loop compares `activeElement` once per paint and
 *    remembers the scroll offset of the previous paint, which is by definition
 *    the pre-steal offset. One identity comparison per paint, from the moment
 *    the frame mounts (both steals can now happen on screen).
 * 2. **The parent's scroll can arrive late.** Under site isolation the child
 *    frame asks the parent to scroll over IPC, so the jump may land a paint or
 *    two after the focus change. For {@link SETTLE_MS} after a hand-back the
 *    loop keeps snapping the offset back, unless the reader produces an input
 *    of their own, which ends the window at once.
 */
export function VideoFrame({ provider, url, title }: VideoFrameProps) {
  const [reduced, setReduced] = useState(false);
  const [started, setStarted] = useState(false);
  const slotRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  /* the start trigger: the frame itself in view for a beat, then mount — once */
  useEffect(() => {
    const slot = slotRef.current;
    if (slot === null) return;
    /* no observer, no way to know when it is seen: start after hydration,
       which is the old on-load behaviour rather than no video at all */
    if (typeof IntersectionObserver === 'undefined') {
      const fallback = window.setTimeout(() => setStarted(true), 0);
      return () => window.clearTimeout(fallback);
    }
    let dwell = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries.some((entry) => entry.intersectionRatio >= START_THRESHOLD);
        window.clearTimeout(dwell);
        if (!inView) return;
        dwell = window.setTimeout(() => {
          observer.disconnect();
          setStarted(true);
        }, START_DWELL_MS);
      },
      { threshold: [0, START_THRESHOLD] },
    );
    observer.observe(slot);
    return () => {
      window.clearTimeout(dwell);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!started || frame === null || typeof IntersectionObserver === 'undefined') return;
    const coarse = window.matchMedia('(pointer: coarse)').matches;

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
    /* a mouse can only reach inside the frame from over it */
    let pointerOver = false;
    const onPointerEnter = () => {
      pointerOver = true;
    };
    const onPointerLeave = () => {
      pointerOver = false;
    };
    frame.addEventListener('pointerenter', onPointerEnter);
    frame.addEventListener('pointerleave', onPointerLeave);

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
      const touched = coarse && (visible || (!moved && onScreenNow()));
      if (tabbed || pointerOver || touched || corrections >= MAX_CORRECTIONS) {
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
        /* each on-screen spell gets a fresh allowance of hand-backs */
        if (visible) {
          corrections = 0;
          return;
        }
        /* the reader scrolled the player away with focus still inside it:
           give the page its keys back, and make the end card's later grab a
           fresh steal rather than an invisible move within a focused frame */
        if (document.activeElement === frame) handBack();
      },
      { threshold: 0.1 },
    );
    observer.observe(frame);
    /* armed from the mount: the frame mounts on screen, and its first steal
       comes about three seconds later, in view */
    arm();

    return () => {
      frame.removeEventListener('pointerenter', onPointerEnter);
      frame.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('keydown', onKeydown, options);
      for (const type of GESTURES) window.removeEventListener(type, onGesture, options);
      observer.disconnect();
      disarm();
    };
  }, [started]);

  const frameProps = {
    title,
    allow: 'autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write',
    allowFullScreen: true,
    referrerPolicy: 'strict-origin-when-cross-origin',
  } as const;

  return (
    <div ref={slotRef} className="mvt-video-frame">
      {started ? (
        <iframe ref={frameRef} src={resolveEmbed(provider, url, { noAutoplay: reduced })} {...frameProps} />
      ) : null}
      {/* no script, no scroll trigger: the player without autoplay, one click away */}
      <noscript>
        <iframe src={resolveEmbed(provider, url, { noAutoplay: true })} {...frameProps} />
      </noscript>
    </div>
  );
}

/**
 * How much of the frame must be on screen before it starts. Under half: the
 * player is 668px tall at the full measure, and a reader who has only its top
 * edge in view has not reached it yet.
 */
const START_THRESHOLD = 0.4;

/**
 * How long the frame must stay at {@link START_THRESHOLD} before it mounts, so a
 * reader flicking past does not load a third-party player they never see.
 * Short enough to be imperceptible to one who stops.
 */
const START_DWELL_MS = 300;

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
