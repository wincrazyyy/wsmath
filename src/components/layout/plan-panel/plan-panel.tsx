'use client';

import { useEffect, useRef, useState } from 'react';

import { PlateCta } from '@/components/ui/plate-cta';

import { usePlan, usePlanVisibilityWriter } from './plan-context';
import './plan-panel.css';

/** Inner content fades for 200ms, then the plan applies (artifact JS §11). */
const SWAP_FADE_MS = 200;
/** The brass confirm ring holds until 560ms. */
const SWAP_RING_MS = 560;
const RESIZE_DEBOUNCE_MS = 220;
/** Vertical slack on the park test. */
const PARK_SLACK = 12;

export interface PlanPanelProps {
  /** `settings.contact.whatsappPhone`. */
  phone: string;
  /** `pages.packagesPage.plan.label` — "Your plan". */
  label: string;
  /** `pages.packagesPage.plan.ctaLabel` — "Get in touch". */
  ctaLabel: string;
}

/**
 * `#mvt-bb`, the fixed "Your plan" panel. Foundation-owned; mounted once by
 * `page-view.tsx`. Behaviour decompiled from the artifact (behaviours.md §9)
 * with the client-required replacement change (issues.md §c):
 *
 * - **Live-once**: hidden until the `[data-plan-anchor]` element (the packages
 *   section) has entered OR passed the viewport — a rect test on scroll, NOT an
 *   IntersectionObserver, because a nav jump from the hero straight to Results
 *   teleports over packages and an observer would never fire.
 * - **Park**: on every scroll frame the panel's ANCHOR rect (computed from its
 *   layout size + the CSS anchors, never its transformed position, so parking
 *   cannot oscillate) is intersected (±12px vertical slack) with every
 *   `[data-plan-avoid]` element; any hit parks the panel.
 * - **Replacement**: the panel occupies the coin's corner (bottom:24 right:24,
 *   z 90). While `live && !parked` it reports itself visible through the plan
 *   context and the coin fades out; the coin returns ~120ms after the panel
 *   leaves. Coin and panel are never visible simultaneously.
 * - **Plan swap**: 200ms inner fade → content rewrite → fade back, with a
 *   560ms brass outline. Instant under reduced motion.
 *
 * The CTA's href AND beacon id are the SELECTED plan's — the panel exists to
 * convert, so it must report which plan it converted.
 */
export function PlanPanel({ phone, label, ctaLabel }: PlanPanelProps) {
  const { options, selected } = usePlan();
  const setVisible = usePlanVisibilityWriter();

  const [displayedKey, setDisplayedKey] = useState(selected);
  const [swap, setSwap] = useState(false);
  const [live, setLive] = useState(false);
  const [parked, setParked] = useState(false);

  const bbRef = useRef<HTMLElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const liveRef = useRef(false);
  const parkedRef = useRef(false);
  const sweepRef = useRef<(() => void) | null>(null);

  /* selection choreography */
  useEffect(() => {
    if (selected === displayedKey) return;
    const inner = innerRef.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || inner === null) {
      // Reduced motion applies the plan instantly — the swap is an animation
      // schedule, not derived state, and this branch is its zero-length case.
      // One state hop, guarded by the equality check above, so it cannot
      // cascade.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayedKey(selected);
      return;
    }
    setSwap(true);
    inner.style.transition = `opacity ${SWAP_FADE_MS}ms linear`;
    inner.style.opacity = '0';
    const t1 = setTimeout(() => {
      setDisplayedKey(selected);
      inner.style.opacity = '1';
    }, SWAP_FADE_MS);
    const t2 = setTimeout(() => setSwap(false), SWAP_RING_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      inner.style.opacity = '1';
    };
  }, [selected, displayedKey]);

  /* content changed → the panel's height may have; keep bbRect() honest */
  useEffect(() => {
    const raf = requestAnimationFrame(() => sweepRef.current?.());
    return () => cancelAnimationFrame(raf);
  }, [displayedKey]);

  /* scroll / resize wiring */
  useEffect(() => {
    const el = bbRef.current;
    if (el === null) return;

    const measure = () => {
      sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
    };
    // The anchor rect from CSS anchors + measured size — NEVER from the
    // element's own (transformed) position. Desktop: the coin's corner.
    // <1280px: the full-width bottom bar.
    const bbRect = () => {
      const vw = window.innerWidth || 0;
      const vh = window.innerHeight || 0;
      if (window.matchMedia('(min-width:1280px)').matches) {
        return { l: vw - 24 - sizeRef.current.w, r: vw - 24, t: vh - 24 - sizeRef.current.h, b: vh - 24 };
      }
      return { l: 0, r: vw, t: vh - sizeRef.current.h, b: vh };
    };
    const hits = (box: { l: number; r: number; t: number; b: number }, zone: Element) => {
      const r = zone.getBoundingClientRect();
      return r.left < box.r && r.right > box.l && r.top < box.b + PARK_SLACK && r.bottom > box.t - PARK_SLACK;
    };
    const sweep = () => {
      if (!liveRef.current) {
        const anchor = document.querySelector('[data-plan-anchor]');
        if (anchor === null) return;
        if (anchor.getBoundingClientRect().top >= (window.innerHeight || 0)) return;
        measure();
        liveRef.current = true;
        setLive(true);
      }
      const box = bbRect();
      let hit = false;
      for (const zone of document.querySelectorAll('[data-plan-avoid]')) {
        if (hits(box, zone)) {
          hit = true;
          break;
        }
      }
      if (hit !== parkedRef.current) {
        parkedRef.current = hit;
        setParked(hit);
      }
    };
    sweepRef.current = () => {
      measure();
      sweep();
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        sweep();
      });
    };
    const boot = () => {
      measure();
      sweep();
    };
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measure();
        sweep();
      }, RESIZE_DEBOUNCE_MS);
    };

    if (document.readyState === 'complete') boot();
    else window.addEventListener('load', boot);
    // early-scroll safety: re-measure on the next frame even if `load` is late
    const raf = requestAnimationFrame(boot);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('load', boot);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      sweepRef.current = null;
    };
  }, []);

  /* the coin keys off this — replacement, not stacking */
  useEffect(() => {
    setVisible(live && !parked);
    return () => setVisible(false);
  }, [live, parked, setVisible]);

  const option = options.find((item) => item.key === displayedKey) ?? options[0];
  if (option === undefined) return null;

  const classes = ['mvt-bb', 'mvt-raise', live ? 'is-live' : null, parked ? 'is-parked' : null, swap ? 'is-swap' : null]
    .filter(Boolean)
    .join(' ');

  return (
    <aside id="mvt-bb" className={classes} aria-label={label} ref={bbRef}>
      <p className="mvt-mu">{label}</p>
      <div className="mvt-bb-inner" id="mvt-bb-inner" ref={innerRef}>
        <p className="mvt-bb-name" id="mvt-bb-name">
          {option.name}
        </p>
        <p className="mvt-bb-price">
          <b className="mvt-num mvt-castxt" id="mvt-bb-price">
            {option.price}
          </b>{' '}
          <span className="mvt-small mvt-dim" id="mvt-bb-unit">
            <span className="mvt-num">{option.unit}</span>
          </span>
        </p>
      </div>
      <PlateCta phone={phone} message={option.message} ctaKey={option.ctaKey} label={ctaLabel} dot />
    </aside>
  );
}
