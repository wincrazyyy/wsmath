// app/_components/sections/packages/group-leaflet-fullscreen-portal.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export interface LeafletFullscreenPortalProps {
  pages: string[];
  index: number;
  isOpen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

export function LeafletFullscreenPortal({
  pages,
  index,
  isOpen,
  onPrev,
  onNext,
  onClose,
}: LeafletFullscreenPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when fullscreen is open
  useEffect(() => {
    if (!mounted || !isOpen) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mounted, isOpen]);

  if (!mounted || !isOpen) return null;

  const pageCount = pages.length;
  const currentSrc = pages[index];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      {/* Backdrop click to close */}
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close fullscreen leaflet"
      />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900/80 text-neutral-200 hover:bg-neutral-800"
        aria-label="Close fullscreen"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
          <path
            d="M5 5l10 10M15 5L5 15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Content with arrows */}
      <div className="relative flex w-full max-w-5xl items-center justify-center gap-4">
        {pageCount > 1 && (
          <button
            type="button"
            onClick={onPrev}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/80 text-neutral-50 hover:bg-neutral-800 sm:flex"
            aria-label="Previous page"
          >
            ←
          </button>
        )}

        <div className="relative w-full max-w-3xl">
          <div className="relative w-full aspect-[210/297] overflow-hidden rounded-2xl bg-neutral-950 shadow-2xl ring-1 ring-neutral-700">
            <Image
              src={currentSrc}
              alt={`Course leaflet page ${index + 1}`}
              fill
              className="object-contain"
              sizes="1024px"
            />
          </div>
          <div className="mt-3 text-center text-xs text-neutral-200">
            Page {index + 1} / {pageCount}
          </div>

          {/* Mobile prev/next under image */}
          {pageCount > 1 && (
            <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-neutral-100 sm:hidden">
              <button
                type="button"
                onClick={onPrev}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-700 px-2.5 py-1 hover:bg-neutral-800"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={onNext}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-700 px-2.5 py-1 hover:bg-neutral-800"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {pageCount > 1 && (
          <button
            type="button"
            onClick={onNext}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/80 text-neutral-50 hover:bg-neutral-800 sm:flex"
            aria-label="Next page"
          >
            →
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
