"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import packagesContent from "@/app/_lib/content/packages.json";

const LEAFLET = packagesContent.group.leaflet ?? {
  label: "Course leaflet preview",
  pages: [] as string[],
  autoAdvanceSeconds: "5",
};

const GROUP_LEAFLET_PAGES: string[] = LEAFLET.pages ?? [];

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

// ---------- Inline viewer (inside card) ----------

interface LeafletInlineViewerProps {
  label: string;
  pages: string[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectPage: (i: number) => void;
  onOpenFullscreen: () => void;
}

function LeafletInlineViewer({
  label,
  pages,
  index,
  onPrev,
  onNext,
  onSelectPage,
  onOpenFullscreen,
}: LeafletInlineViewerProps) {
  const pageCount = pages.length;
  const currentSrc = pages[index];

  return (
    <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/95 px-4 pb-4 pt-3 shadow-md">
      <div className="flex items-center justify-between gap-2 text-[11px] text-neutral-300">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          {label || "Course leaflet preview"}
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-200">
            Page {index + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={onOpenFullscreen}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/70 text-neutral-200 hover:bg-neutral-800"
            aria-label="Open leaflet in fullscreen"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5">
              <path
                d="M4 9V4h5M11 4h5v5M4 11v5h5M11 16h5v-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* A4-ish area */}
      <div className="mt-3 flex justify-center">
        <div className="relative w-full max-w-[420px]">
          <div className="relative w-full aspect-[210/297] overflow-hidden rounded-xl bg-neutral-900 shadow-lg ring-1 ring-neutral-800">
            <Image
              src={currentSrc}
              alt={`Course leaflet page ${index + 1}`}
              fill
              className="object-contain"
              sizes="420px"
            />
          </div>
        </div>
      </div>

      {/* Navigation + page indicators */}
      {pageCount > 1 && (
        <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-neutral-200">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-700 px-2.5 py-1 hover:bg-neutral-800"
          >
            <span aria-hidden>←</span>
            <span>Prev</span>
          </button>

          <div className="flex flex-1 items-center justify-center gap-1.5">
            {pages.map((_, i) => {
              const isActive = i === index;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectPage(i)}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? "w-6 bg-sky-400 shadow-[0_0_0_3px_rgba(56,189,248,0.35)]"
                      : "w-2 bg-neutral-600/70 hover:bg-neutral-400"
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-700 px-2.5 py-1 hover:bg-neutral-800"
          >
            <span>Next</span>
            <span aria-hidden>→</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- Fullscreen portal ----------

interface LeafletFullscreenPortalProps {
  pages: string[];
  index: number;
  isOpen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

function LeafletFullscreenPortal({
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
    document.body
  );
}

// ---------- Container (slideshow logic) ----------

export function GroupLeafletViewer() {
  const pages = GROUP_LEAFLET_PAGES;
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const pageCount = pages.length;
  const autoSeconds = toNumber(LEAFLET.autoAdvanceSeconds, 5);

  // Auto-advance only when NOT in fullscreen
  useEffect(() => {
    if (pageCount <= 1 || isFullscreen) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % pageCount);
    }, autoSeconds * 1000);

    return () => clearInterval(timer);
  }, [pageCount, autoSeconds, isFullscreen]);

  if (pageCount === 0) return null;

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % pageCount);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + pageCount) % pageCount);
  };

  const handleSelectPage = (i: number) => {
    setIndex(i);
  };

  return (
    <>
      <LeafletInlineViewer
        label={LEAFLET.label || "Course leaflet preview"}
        pages={pages}
        index={index}
        onPrev={handlePrev}
        onNext={handleNext}
        onSelectPage={handleSelectPage}
        onOpenFullscreen={() => setIsFullscreen(true)}
      />
      <LeafletFullscreenPortal
        pages={pages}
        index={index}
        isOpen={isFullscreen}
        onPrev={handlePrev}
        onNext={handleNext}
        onClose={() => setIsFullscreen(false)}
      />
    </>
  );
}
