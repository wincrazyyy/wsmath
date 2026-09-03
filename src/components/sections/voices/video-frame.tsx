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
 * in the lacquer" object (`spec/issues.md` §b).
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
 * ## The focus guard — why an autoplaying third-party frame needs one
 *
 * Measured: about three seconds after a cold load, with the reader still at
 * `scrollY 0` and having touched nothing, Loom's own player script pulls focus
 * into the frame (`document.activeElement` goes `BODY → IFRAME`). From that
 * moment the *page* is broken for anyone on a keyboard: ArrowDown and Space no
 * longer scroll (Space toggles Loom's playback instead) and the first Tab
 * teleports the viewport eleven thousand pixels down into the player's own
 * controls, past every skip link and nav item. It is not a harness artefact —
 * it reproduces with and without Chrome's autoplay override, and it never
 * happens under `prefers-reduced-motion`, where the src carries no `autoplay`.
 *
 * Dropping autoplay is not available: autoplay on arrival is the client's
 * stated requirement (`spec/issues.md` §b). So the frame is guarded instead —
 * focus that lands on the iframe **while the reader could not possibly have put
 * it there** is handed straight back, and the scroll offset is restored in the
 * same tick.
 *
 * Two mechanics, both measured rather than assumed (`probes/fix-focus-diag.js`):
 *
 * 1. **The guard polls; it cannot listen.** When a cross-origin frame focuses
 *    itself, Chrome fires **no** `focus`/`focusin` on the embedding document —
 *    `document.activeElement` simply *is* the iframe at the next tick. A
 *    listener never runs. So a `requestAnimationFrame` loop watches
 *    `activeElement` while the guard is armed — one identity comparison per
 *    paint, which is the finest sampling available and keeps the window in
 *    which a keystroke could reach the player under a single frame.
 * 2. **`navigator.userActivation` is not the test.** It reads `hasBeenActive:
 *    true` on this page nine seconds in with nothing touched, so it cannot
 *    distinguish a steal from a click. The test that *is* sound is
 *    **`interacted && visible`**: the reader has produced a real input event in
 *    this document AND the player is actually on screen. Pointer events inside
 *    a cross-origin frame never reach us, but reaching the player at all takes
 *    a scroll — a wheel, a touch or a key, all of which do. Until both hold,
 *    nobody can have clicked the player, so focus in it is a steal.
 *
 * The guard disarms the moment both conditions hold, after
 * {@link MAX_CORRECTIONS} hand-backs (so a hostile player cannot be fought
 * forever), and unconditionally after {@link GUARD_MS} — it can never outlive
 * the load it exists for.
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
    if (frame === null) return;

    let interacted = false;
    let visible = false;
    let corrections = 0;
    let frameRequest = 0;

    const markInteracted = () => {
      interacted = true;
    };
    const options = { capture: true, passive: true } as const;
    const GESTURES = ['pointerdown', 'keydown', 'touchstart', 'wheel'] as const;
    for (const type of GESTURES) window.addEventListener(type, markInteracted, options);

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) => {
              visible = entries.some((entry) => entry.isIntersecting);
            },
            { threshold: 0.1 },
          );
    observer?.observe(frame);

    const stop = () => {
      if (frameRequest !== 0) {
        cancelAnimationFrame(frameRequest);
        frameRequest = 0;
      }
    };

    /* A frame callback, not an interval: it is the finest sampling the page can
       offer, so the steal is undone within one paint and no keystroke can be
       delivered to the player in between. The body is one identity comparison. */
    const watch = () => {
      frameRequest = requestAnimationFrame(watch);
      if (document.activeElement !== frame) return;
      if ((interacted && visible) || corrections >= MAX_CORRECTIONS) {
        stop();
        return;
      }
      corrections += 1;

      const x = window.scrollX;
      const y = window.scrollY;
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
      window.scrollTo(x, y);
    };
    frameRequest = requestAnimationFrame(watch);

    const disarm = window.setTimeout(stop, GUARD_MS);

    return () => {
      for (const type of GESTURES) window.removeEventListener(type, markInteracted, options);
      observer?.disconnect();
      window.clearTimeout(disarm);
      stop();
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
 * How long the guard stays armed at most. Long enough to cover the measured
 * steal (~3 s after load) and any retry, short enough that it can never
 * interfere with a reader who reaches the player much later.
 */
const GUARD_MS = 30_000;

/**
 * Hand-backs before the guard concedes. A player that re-takes focus after
 * every correction would otherwise be fought once per frame for the whole of
 * {@link GUARD_MS}; conceding leaves the reader no worse off than before the
 * guard existed.
 */
const MAX_CORRECTIONS = 12;
