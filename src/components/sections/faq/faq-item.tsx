'use client';

import { useState } from 'react';

import { Chevron } from '@/components/ui/icons';

export interface FaqItemProps {
  /** `01` … `08` — the engraved index, derived from position. */
  ordinal: string;
  /** Ids linking the button and its answer region. */
  questionId: string;
  answerId: string;
  /** The question, byte-for-byte from `faqs.json`. */
  question: string;
  /** The answer, already split on its blank lines by `paragraphs()`. */
  body: readonly string[];
}

/**
 * One engraved channel in the FAQ grid.
 *
 * Open state rides `data-open` on the `<li>`, NOT a class. The `<li>` also
 * carries `.mvt-rev--s`, and `MvtRoot` adds `.is-in` to it from outside React;
 * a React-owned `className` would be rewritten on the next render and drop that
 * class, leaving the item stuck at `opacity: 0` with no observer left watching
 * it. An attribute cannot collide, and `MutationObserver` in `MvtRoot` only
 * watches `childList`, so toggling it costs nothing.
 *
 * The open/close animation is entirely CSS (grid rows `0fr → 1fr`, 420ms), so
 * there is no height measurement to go stale and reduced motion is handled by
 * the global override. The panel stays in the DOM and is hidden with
 * `visibility`, which is what keeps it out of the accessibility tree and out of
 * the tab order while closed — `overflow:hidden` alone would not.
 *
 * Items are independent: opening one never closes another (behaviours.md §7),
 * and because the two columns are `align-items:start`, an open answer grows
 * only its own column.
 */
export function FaqItem({ ordinal, questionId, answerId, question, body }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <li className="mvt-rev mvt-rev--s" data-open={open ? 'true' : undefined}>
      <h3>
        <button
          className="mvt-qbtn"
          type="button"
          id={questionId}
          aria-expanded={open}
          aria-controls={answerId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="mvt-mu mvt-num">{ordinal}</span>
          <span>{question}</span>
          <Chevron className="mvt-chev" />
        </button>
      </h3>
      <div className="mvt-ansgrid">
        <div>
          <div className="mvt-ans mvt-paper" id={answerId} role="region" aria-labelledby={questionId}>
            {/* index keys: the split is a static, never-reordered list derived
                from one string, and two identical paragraphs in one answer would
                collide on a text key */}
            {body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}
