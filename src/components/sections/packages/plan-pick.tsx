'use client';

import { usePlan } from '@/components/layout/plan-panel/plan-context';

export interface PlanPickProps {
  /**
   * The package's own `id`, which is also its plan key. The option is resolved
   * from the panel's own options (derived from `packages.json` at the page
   * boundary), so this button and the panel can never disagree about which card
   * is which — the failure the artifact's duplicated `PLANS` literal invited.
   *
   * Keyed on the id rather than the `ctaKey`: with four cards, two packages
   * sharing a `ctaKey` would light up the wrong plate. One identifier, one
   * lookup — and `crossCheck` enforces uniqueness on both as belt and braces.
   */
  planKey: string;
  /** `packagesPage.plan.pickShow` — the label before this plan is chosen. */
  showLabel: string;
  /** `packagesPage.plan.pickActive` — the label once it is. */
  activeLabel: string;
}

/**
 * The debossed slot button in a package plate's foot that puts that plate into
 * the fixed "Your plan" panel. The only interactive part of the packages
 * section, and the only reason any of it is a Client Component.
 *
 * It never imports the panel — it calls `usePlan().select()` and stops there.
 * Renders nothing when the package has no plan (a package with no price never
 * reaches the panel), so a content edit cannot produce a dead button.
 */
export function PlanPick({ planKey, showLabel, activeLabel }: PlanPickProps) {
  const { options, selected, select } = usePlan();
  const option = options.find((candidate) => candidate.key === planKey);
  if (option === undefined) return null;

  const active = option.key === selected;
  return (
    <button
      className="mvt-pick"
      type="button"
      data-plan={option.key}
      aria-pressed={active}
      onClick={() => select(option.key)}
    >
      {active ? activeLabel : showLabel}
    </button>
  );
}
