import type { ReactNode } from 'react';

/**
 * Wrap every `1-to-1` in `.mvt-nb` so the ratio never breaks across its own
 * hyphens (artifact line 1709 does this by hand). The copy in content stays
 * plain text — this is typesetting, not content.
 */
export function noBreakRatios(value: string): ReactNode {
  const parts = value.split('1-to-1');
  if (parts.length === 1) return value;
  return parts.map((part, index) => (
    <span key={index}>
      {index > 0 ? <span className="mvt-nb">1-to-1</span> : null}
      {part}
    </span>
  ));
}
