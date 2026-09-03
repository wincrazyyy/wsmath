'use client';

import { useState, type ReactNode } from 'react';

import { PauseBars, PlayTriangle } from '@/components/ui/icons';

export interface TroughProps {
  /** `pages.voices.trough.label`. */
  label: string;
  /** `pages.voices.trough.pauseLabel` — shown while the row is drifting. */
  pauseLabel: string;
  /** `pages.voices.trough.playLabel` — shown once the reader has stopped it. */
  playLabel: string;
  /** The twenty-four sheets: the twelve, then the twelve inert clones. */
  children: ReactNode;
}

/**
 * The full-bleed channel of drifting quotes.
 *
 * It sits OUTSIDE `.mvt-wrap` on purpose: a marquee cannot be padded out of a
 * fixed element's way — its sheets travel through the whole viewport — so the
 * channel itself runs off the page on the left and terminates in a machined
 * right end short of the coin lane (`margin-right: var(--coin-w)`, radius on the
 * right corners only). `data-plan-avoid` is the other half of that deal: the
 * fixed "Your plan" panel parks while its corner overlaps this rect, and the
 * coin comes back (foundation's `plan-panel.tsx`).
 *
 * Only two things here need JavaScript, and only one of them is state:
 *
 * - **Hover pause** is pure CSS (`:hover` under `@media (hover:hover)`, so it
 *   cannot stick on a touch device the way a `pointerenter` listener does).
 * - **The pause button** toggles `data-paused` on the channel, which stops the
 *   `animation-play-state`. It is an ATTRIBUTE, not a class: `MvtRoot` adds
 *   `.is-in` to reveal elements from outside React, and a React-owned
 *   `className` on this subtree would silently overwrite it on the next render.
 *
 * ARIA note — the button deliberately does NOT carry `aria-pressed`, although
 * the artifact sets it. Its accessible name changes with its state (Pause ⇄
 * Play), and a button that both renames itself and reports `pressed` announces
 * as "Play, pressed" when the row is stopped, which reverses the meaning. The
 * APG's rule is one or the other; a changing name is the right one for a
 * play/pause control. The visible design is unchanged.
 *
 * Clones live in the server HTML (marked `aria-hidden` + `inert`) rather than
 * being appended by script, so the row is seamless on first paint and no DOM
 * mutation runs on boot. Reduced motion hides them in CSS and turns the channel
 * into a plain horizontal scroller.
 */
export function Trough({ label, pauseLabel, playLabel, children }: TroughProps) {
  const [paused, setPaused] = useState(false);

  return (
    <div className="mvt-trough mvt-well" data-plan-avoid="" data-paused={paused ? 'true' : undefined}>
      <div className="mvt-trough-head">
        <p className="mvt-mu mvt-brass">{label}</p>
        <span className="mvt-knurl" aria-hidden="true" />
        <button className="mvt-pause mvt-mu" type="button" onClick={() => setPaused((value) => !value)}>
          {paused ? <PlayTriangle /> : <PauseBars />}
          <span>{paused ? playLabel : pauseLabel}</span>
        </button>
      </div>
      <div className="mvt-track">{children}</div>
    </div>
  );
}
