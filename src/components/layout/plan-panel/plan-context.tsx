'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { CtaKey } from '@/content/schema';

/**
 * The package id the option came from (`private`, `ibdp`, `ial`, `igcse`).
 *
 * Deliberately `string` rather than a closed union: adding a board must be a
 * content edit, not a code change, or the editor premise breaks. Ids are
 * uniqueness-enforced by `crossCheck`, `select()` already checks membership,
 * and `pages.packagesPage.plan.defaultPackageId` is cross-checked against the
 * package list — so a typo fails the build rather than silently preselecting
 * the wrong card.
 */
export type PlanKey = string;

export interface PlanOption {
  key: PlanKey;
  /** Plan name — byte-identical to the package card (`packages[].title`). */
  name: string;
  /** Display price, e.g. `HKD 19,800` (already token-interpolated). */
  price: string;
  /** Display unit, e.g. `/ 90 min` or `32 lessons`. */
  unit: string;
  /** The WhatsApp prefill for this plan (already token-interpolated). */
  message: string;
  /** Beacon id — the SELECTED plan's key is what the panel CTA reports. */
  ctaKey: CtaKey;
}

export interface PlanContextValue {
  options: readonly PlanOption[];
  selected: PlanKey;
  select(key: PlanKey): void;
  /**
   * True while the fixed "Your plan" panel is on screen (live and not parked).
   * The WhatsApp coin hides itself while this is true — the client-required
   * replacement behaviour: panel and coin are never visible simultaneously.
   */
  live: boolean;
}

const PlanContext = createContext<PlanContextValue | null>(null);
const PlanVisibilityContext = createContext<((visible: boolean) => void) | null>(null);

export interface PlanProviderProps {
  /** Derived from `content.packages` at the page boundary — never literals. */
  options: readonly PlanOption[];
  /**
   * Initially selected plan — always `pages.packagesPage.plan.defaultPackageId`,
   * which `crossCheck` proves resolves to a package that has a price.
   * Required, not defaulted: a hard-coded fallback for a content-owned choice is
   * how the artifact's `group` survived into a site that no longer sells one.
   */
  defaultKey: PlanKey;
  children: ReactNode;
}

/**
 * Holds the plan selection and the panel's visibility. Mounted once, by the
 * foundation layer, in `page-view.tsx`. Sections never import the panel — the
 * packages builder's `.mvt-pick` buttons call `usePlan().select(...)` and
 * nothing else.
 */
export function PlanProvider({ options, defaultKey, children }: PlanProviderProps) {
  /* `''` is the empty-options sentinel: it matches no option, so `PlanPick`
     renders nothing active — the correct degenerate state, and one that cannot
     occur while `Packages` is `.min(1)` and the default is cross-checked. */
  const fallback = options.some((option) => option.key === defaultKey)
    ? defaultKey
    : (options[0]?.key ?? '');
  const [selected, setSelected] = useState<PlanKey>(fallback);
  const [live, setLive] = useState(false);

  const select = useCallback(
    (key: PlanKey) => {
      if (options.some((option) => option.key === key)) setSelected(key);
    },
    [options],
  );

  const value = useMemo<PlanContextValue>(
    () => ({ options, selected, select, live }),
    [options, selected, select, live],
  );

  return (
    <PlanContext.Provider value={value}>
      <PlanVisibilityContext.Provider value={setLive}>{children}</PlanVisibilityContext.Provider>
    </PlanContext.Provider>
  );
}

/** @throws {Error} outside a `PlanProvider`. */
export function usePlan(): PlanContextValue {
  const value = useContext(PlanContext);
  if (value === null) {
    throw new Error('usePlan() requires a <PlanProvider> above it — page-view.tsx mounts one.');
  }
  return value;
}

/**
 * Internal: the panel reports its own visibility here so the coin can yield.
 * Only `plan-panel.tsx` should call this.
 */
export function usePlanVisibilityWriter(): (visible: boolean) => void {
  const setter = useContext(PlanVisibilityContext);
  if (setter === null) {
    throw new Error('usePlanVisibilityWriter() requires a <PlanProvider> above it.');
  }
  return setter;
}
