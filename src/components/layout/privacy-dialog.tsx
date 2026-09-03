'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useCallback, useRef, useState } from 'react';

import type { Legal } from '@/content/schema';
import { paragraphs } from '@/lib/paragraphs';

import './footer.css';

export interface PrivacyDialogProps {
  /** The footer link's label — this component *is* the link. */
  label: string;
  /** `pages.legal.privacy`. */
  privacy: Legal['privacy'];
}

/**
 * The privacy policy, opened from the footer — a paper inlay lifted out of the
 * void, in the v6.3.2 material language.
 *
 * Radix supplies the dialog contract: focus moves into the panel and returns to
 * the trigger on close, Escape and an overlay click both dismiss, the page
 * behind is scroll-locked and inert, and the panel is a labelled
 * `role="dialog"` with the intro as its description. The content path is
 * unchanged from the previous design: everything renders from
 * `pages.legal.privacy`.
 *
 * **Portalled into `.mvt-root`, not into `<body>`.** Every design token in this
 * system — the palette, the type stacks, the motion durations, the
 * reduced-motion override — is declared on the `.mvt-root` div, which is a
 * child of `<body>`. Radix's default portal target is the body itself, i.e.
 * *outside* that scope, where `var(--paper)`, `var(--f-display)` and the whole
 * `.mvt-pv-*` block resolve to nothing and the policy renders as unstyled text
 * over the page. The container is resolved from the trigger with `closest()`
 * rather than a document query, so a second root (the /preview shell) can never
 * capture the wrong one. Same fix, same reason, as `packages/outline-dialog`.
 */
export function PrivacyDialog({ label, privacy }: PrivacyDialogProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  /* Resolved on open rather than in an effect: it is only needed while the
     dialog is mounted, and the trigger is always in the tree by then. */
  const onOpenChange = useCallback((next: boolean) => {
    if (next) setContainer(triggerRef.current?.closest<HTMLElement>('.mvt-root') ?? null);
  }, []);

  return (
    <Dialog.Root onOpenChange={onOpenChange}>
      <Dialog.Trigger ref={triggerRef} className="mvt-pv-trigger">
        {label}
      </Dialog.Trigger>
      <Dialog.Portal container={container ?? undefined}>
        <Dialog.Overlay className="mvt-pv-overlay" />
        <Dialog.Content className="mvt-pv-panel">
          <div className="mvt-pv-head">
            <div>
              <Dialog.Title className="mvt-pv-title">{privacy.modalTitle}</Dialog.Title>
              <p className="mvt-pv-updated">
                {privacy.lastUpdatedLabel} {privacy.lastUpdated}
              </p>
            </div>
            <Dialog.Close className="mvt-pv-close">{privacy.closeButton}</Dialog.Close>
          </div>

          <Dialog.Description className="mvt-pv-intro">{privacy.intro}</Dialog.Description>

          <div className="mvt-pv-sections">
            {privacy.sections.map((section) => (
              <section key={section.id}>
                <h4>{section.heading}</h4>
                {paragraphs(section.body).map((text, part) => (
                  <p key={`${section.id}-p${part}`}>{text}</p>
                ))}
              </section>
            ))}
          </div>

          <div className="mvt-pv-foot">
            <p>
              {privacy.footerHintPrefix} <kbd>{privacy.footerHintKey}</kbd> {privacy.footerHintSuffix}
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
