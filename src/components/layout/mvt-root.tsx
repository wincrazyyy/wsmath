'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Stagger step between sibling reveals, capped at ×5 (artifact JS §1). */
const STAGGER_MS = 72;
const STAGGER_CAP = 5;
/** Timer poll period — scroll events can be coalesced away on a busy thread. */
const POLL_MS = 120;
/** Absolute failsafe: nothing may stay invisible past this. */
const FAILSAFE_MS = 4200;

export interface MvtRootProps {
  /** The keyboard skip link's label, from `pages.nav.skipLabel`. */
  skipLabel?: string;
  /** Where the skip link lands. */
  skipHref?: string;
  children: ReactNode;
}

/**
 * The `.mvt-root` shell — design tokens, the grain overlay (both in
 * `globals.css`) — plus the page-wide behaviour boot decompiled from the
 * v6.3.2 artifact's inline script:
 *
 * 1 · Scroll-triggered reveals. Every `.mvt-rev` under the root is revealed by
 *     FOUR cooperating mechanisms, all deliberate (spec/behaviours.md §1):
 *     an IntersectionObserver (threshold 0, rootMargin `0px 0px -10% 0px`,
 *     sibling stagger), an rAF-coalesced scroll sweep (IO delivery can be
 *     coalesced away during a fast programmatic jump — in BOTH directions),
 *     a 120ms timer poll (scroll events ride the rendering loop and can vanish
 *     entirely on a busy main thread), and a 4200ms failsafe. Nothing may ever
 *     stay invisible after being scrolled past. Do not ship IO-only.
 *
 * 2 · Nav scroll-spy: `[data-spy]` links follow the section occupying the
 *     40–45% viewport band (rootMargin `-40% 0px -55% 0px`).
 *
 * Reduced motion renders everything complete immediately.
 *
 * The hidden pre-reveal state is gated on `body.js` in `globals.css`, so a
 * reader without JavaScript gets the finished page. A MutationObserver re-scans
 * for `.mvt-rev` and `[data-spy]` added after mount — that is what keeps
 * `/preview` working when the editor posts a new draft into an already-booted
 * tree.
 */
export function MvtRoot({ skipLabel = 'Skip to content', skipHref = '#mvt-s-hero', children }: MvtRootProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasIO = typeof IntersectionObserver !== 'undefined';

    /* ── 1 · reveals ─────────────────────────────────────────────────── */
    const wired = new WeakSet<Element>();
    let pending: HTMLElement[] = [];
    let poll: ReturnType<typeof setInterval> | null = null;
    let failsafe: ReturnType<typeof setTimeout> | null = null;
    let ticking = false;
    let deepest = 0;

    const fire = (t: HTMLElement, stagger: boolean) => {
      if (t.classList.contains('is-in')) return;
      if (stagger && t.parentElement) {
        const sibs = Array.from(t.parentElement.querySelectorAll('.mvt-rev'));
        const idx = Math.max(0, sibs.indexOf(t));
        t.style.transitionDelay = `${Math.min(idx, STAGGER_CAP) * STAGGER_MS}ms`;
      }
      t.classList.add('is-in');
    };

    const io = hasIO
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              fire(entry.target as HTMLElement, true);
              io?.unobserve(entry.target);
            }
          },
          { threshold: 0, rootMargin: '0px 0px -10% 0px' },
        )
      : null;

    const sweep = () => {
      ticking = false;
      if (pending.length === 0) return;
      const vh = window.innerHeight || 800;
      const sy = window.pageYOffset || 0;
      if (sy > deepest) deepest = sy;
      // If the viewport jumped BACKWARDS past the deepest point reached, the
      // reader has already been through everything above it — land all of it
      // at once, with no transition delay.
      const jumped = sy < deepest - vh * 0.5;
      const seenTo = jumped ? deepest + vh * 1.6 : sy + vh * 0.92;
      let lit = false;
      for (let i = pending.length - 1; i >= 0; i--) {
        const t = pending[i];
        const rect = t.getBoundingClientRect();
        if (rect.top + sy >= seenTo) continue;
        if (jumped || rect.bottom < 0) t.style.transitionDelay = '0ms';
        fire(t, false);
        io?.unobserve(t);
        pending.splice(i, 1);
        lit = true;
      }
      // Flush style once per batch so the reveal starts this frame rather than
      // at the next idle recalc — on a cold first paint that deferral is what
      // leaves a block blank.
      if (lit) void root.offsetHeight;
      if (pending.length === 0 && poll !== null) {
        clearInterval(poll);
        poll = null;
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(sweep);
    };

    const fireAll = () => {
      for (const t of pending) {
        fire(t, false);
        io?.unobserve(t);
      }
      pending = [];
      if (poll !== null) {
        clearInterval(poll);
        poll = null;
      }
    };

    const scanReveals = () => {
      const found = root.querySelectorAll<HTMLElement>('.mvt-rev');
      let added = false;
      for (const el of found) {
        if (wired.has(el)) continue;
        wired.add(el);
        if (rm || io === null) {
          el.classList.add('is-in');
          continue;
        }
        pending.push(el);
        io.observe(el);
        added = true;
      }
      if (!added) return;
      if (poll === null) {
        poll = setInterval(() => {
          ticking = false;
          sweep();
        }, POLL_MS);
      }
      if (failsafe !== null) clearTimeout(failsafe);
      failsafe = setTimeout(fireAll, FAILSAFE_MS);
      requestAnimationFrame(sweep);
    };

    /* ── 2 · nav scroll-spy ──────────────────────────────────────────── */
    let spy: IntersectionObserver | null = null;
    const wireSpy = () => {
      spy?.disconnect();
      spy = null;
      if (!hasIO) return;
      const links = Array.from(root.querySelectorAll<HTMLElement>('[data-spy]'));
      if (links.length === 0) return;
      const byId = new Map(links.map((a) => [a.getAttribute('data-spy') ?? '', a]));
      const targets = Array.from(byId.keys())
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);
      if (targets.length === 0) return;
      spy = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const link = byId.get(entry.target.id);
            if (!link) continue;
            for (const l of links) {
              l.classList.remove('is-active');
              l.removeAttribute('aria-current');
            }
            link.classList.add('is-active');
            link.setAttribute('aria-current', 'true');
          }
        },
        { rootMargin: '-40% 0px -55% 0px' },
      );
      for (const t of targets) spy.observe(t);
    };

    scanReveals();
    wireSpy();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Content mounted after boot (a /preview draft, client-built panels) must
    // still reveal; re-scan on subtree changes, coalesced to one rAF.
    let mutationQueued = false;
    const mo = new MutationObserver(() => {
      if (mutationQueued) return;
      mutationQueued = true;
      requestAnimationFrame(() => {
        mutationQueued = false;
        scanReveals();
        wireSpy();
      });
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io?.disconnect();
      spy?.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (poll !== null) clearInterval(poll);
      if (failsafe !== null) clearTimeout(failsafe);
    };
  }, []);

  return (
    <div ref={rootRef} className="mvt-root">
      <a className="mvt-skip" href={skipHref}>
        {skipLabel}
      </a>
      {children}
    </div>
  );
}
