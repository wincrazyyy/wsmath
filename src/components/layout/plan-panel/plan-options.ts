/**
 * Derive the "Your plan" panel's options from the packages collection, at the
 * page boundary. The prices and prefills come through the token system, so the
 * panel and the package cards CANNOT disagree — which is exactly the failure
 * the artifact's duplicated `PLANS` literal invited.
 *
 * Pure and isomorphic: runs in the RSC page and in the /preview browser tree.
 */
import type { Package, WhatsappPrefills } from '@/content/schema';

import type { PlanOption } from './plan-context';

/**
 * `price.per` as authored reads `/ 90 min · typical rate` (private),
 * `· 28 live lessons` (IBDP) and `· video + live options` (International
 * GCSE). The panel shows only the unit part: everything before the first
 * ` · ` separator, with any leading `· ` stripped — which reproduces the
 * artifact's `/ 90 min` and `32 lessons` byte-for-byte.
 *
 * Exported because the packages plates print the same unit from the same
 * authored string. One rule, one call site each — two copies of a
 * string-splitting rule is exactly the drift this module exists to prevent.
 */
export function unitFromPer(per: string | undefined): string {
  if (per === undefined) return '';
  const head = per.split(' · ')[0] ?? per;
  return head.replace(/^·\s*/, '').trim();
}

/**
 * One option per package that carries a price, keyed on the package's own id.
 *
 * There is no kind→key table any more: four paths (private, IBDP, IAL,
 * International GCSE) all reach the panel, and a board added in the editor
 * must appear here without a code change. A multi-price board reads
 * `from HKD 16,800` because the word "from" is **authored** into `price.now`
 * on the cards that need it — no code decides when to say it, and because the
 * panel prints `price.now` verbatim, the card and the bar cannot disagree.
 */
export function planOptionsFromPackages(
  packages: readonly Package[],
  prefills: WhatsappPrefills,
): PlanOption[] {
  const options: PlanOption[] = [];
  for (const pkg of packages) {
    if (pkg.price === undefined) continue;
    options.push({
      key: pkg.id,
      name: pkg.title,
      price: pkg.price.now,
      unit: unitFromPer(pkg.price.per),
      message: prefills[pkg.ctaKey],
      ctaKey: pkg.ctaKey,
    });
  }
  return options;
}
