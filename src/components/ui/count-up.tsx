'use client';

import { useEffect, useRef } from 'react';

/**
 * The artifact's counter ease (behaviours.md §3): piecewise-linear
 * interpolation through fixed points — a fast launch and a long
 * decimal-settling tail.
 */
const EASE_P = [0, 0.06, 0.14, 0.23, 0.33, 0.44, 0.56, 0.68, 0.8, 0.9, 1];
const EASE_V = [0, 0.18, 0.42, 0.63, 0.78, 0.875, 0.935, 0.97, 0.988, 0.997, 1];

function ease(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  let i = 1;
  while (i < EASE_P.length && EASE_P[i] < t) i += 1;
  const p0 = EASE_P[i - 1];
  const p1 = EASE_P[i];
  const v0 = EASE_V[i - 1];
  const v1 = EASE_V[i];
  return v0 + ((t - p0) / (p1 - p0)) * (v1 - v0);
}

/** en-US grouping, matching the artifact's `Intl.NumberFormat('en-US')`. */
const groupedFormat = (n: number): string => new Intl.NumberFormat('en-US').format(n);

export interface CountUpProps {
  /** The real, final number. */
  value: number;
  /** Animation length. The artifact runs the hero's 20,000 over 2400ms. */
  durationMs?: number;
  /** IntersectionObserver threshold that starts the count. Artifact: 0.3. */
  threshold?: number;
  /** Display formatter. Defaults to en-US grouping. */
  format?: (n: number) => string;
  /** Extra classes on the `<span>`. */
  className?: string;
}

/**
 * A number that counts up from below when it scrolls into view.
 *
 * **The server HTML contains the final formatted value** — never 0. The
 * animation is a pure enhancement that mutates `textContent` on an
 * already-correct node, so the figure is present and correct with JavaScript
 * disabled, in the prerendered export, and for any crawler. It ends exactly on
 * the formatted target. Skipped entirely under `prefers-reduced-motion` and
 * when IntersectionObserver is missing.
 */
export function CountUp({ value, durationMs = 2400, threshold = 0.3, format = groupedFormat, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const formatRef = useRef(format);
  const final = format(value);

  useEffect(() => {
    formatRef.current = format;
  }, [format]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined' || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let t0: number | null = null;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(el);

          const fmt = formatRef.current;
          // lock the rendered width so the layout cannot jitter mid-count
          el.style.display = 'inline-block';
          el.style.minWidth = `${el.getBoundingClientRect().width}px`;

          const frame = (ts: number) => {
            if (t0 === null) t0 = ts;
            const p = Math.min(1, (ts - t0) / durationMs);
            if (p < 1) {
              el.textContent = fmt(Math.round(ease(p) * value));
              raf = requestAnimationFrame(frame);
            } else {
              el.textContent = fmt(value);
            }
          };
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      // Leave the node holding the true value if we unmount mid-animation.
      el.textContent = formatRef.current(value);
    };
  }, [value, durationMs, threshold]);

  return (
    <span ref={ref} className={className}>
      {final}
    </span>
  );
}
