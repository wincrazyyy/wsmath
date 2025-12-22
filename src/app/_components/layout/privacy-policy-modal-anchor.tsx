"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  href?: string;          // keep for semantics / right-click copy link
  label?: string;         // link text in footer
  className?: string;     // same styling as other footer links
};

export function PrivacyPolicyModalAnchor({
  href = "#privacy",
  label = "Privacy Policy",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLAnchorElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const prevBodyOverflowRef = useRef<string>("");

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    // lock scroll
    prevBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus the panel for accessibility
    setTimeout(() => panelRef.current?.focus(), 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevBodyOverflowRef.current || "";
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <a
        ref={triggerRef}
        href={href}
        className={className}
        onClick={(e) => {
          e.preventDefault(); // stop hash jump
          setOpen(true);
        }}
      >
        {label}
      </a>

      {open && (
        <div
          className="fixed inset-0 z-[70]"
          onMouseDown={close}
          onTouchStart={close}
          aria-hidden={!open}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Privacy Policy"
              tabIndex={-1}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white shadow-xl outline-none"
            >
              <div className="flex items-start justify-between gap-4 border-b border-neutral-200 p-5">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Privacy Policy
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Last updated: 2025-12-22
                  </p>
                </div>

                <button
                  type="button"
                  onClick={close}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-900"
                  aria-label="Close"
                  title="Close"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-5 text-sm text-neutral-700">
                <p className="leading-relaxed">
                  This Privacy Policy explains how WSMath handles information
                  when you visit our website or contact us.
                </p>

                <div className="mt-5 space-y-4">
                  <section>
                    <p className="font-medium text-neutral-900">
                      What we collect
                    </p>
                    <p className="mt-1 leading-relaxed">
                      If you contact us (e.g. via WhatsApp), we may receive
                      information you provide such as your name, contact details,
                      school year, and message content.
                    </p>
                  </section>

                  <section>
                    <p className="font-medium text-neutral-900">
                      How we use information
                    </p>
                    <p className="mt-1 leading-relaxed">
                      We use information to respond to enquiries, schedule
                      lessons, and provide tutoring services.
                    </p>
                  </section>

                  <section>
                    <p className="font-medium text-neutral-900">Sharing</p>
                    <p className="mt-1 leading-relaxed">
                      We do not sell your information. We may use service
                      providers required to operate the website (e.g. hosting),
                      and only when necessary.
                    </p>
                  </section>

                  <section>
                    <p className="font-medium text-neutral-900">
                      Retention & requests
                    </p>
                    <p className="mt-1 leading-relaxed">
                      We keep enquiry details only as long as needed for
                      communication and service delivery. You may request access
                      to or deletion of your messages by contacting us.
                    </p>
                  </section>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-neutral-200 p-4">
                <p className="text-xs text-neutral-500">
                  Click outside or press <span className="font-medium">Esc</span>{" "}
                  to close.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
