// app/_components/sections/packages/group-leaflet-inline-viewer.tsx
"use client";

import Image from "next/image";

export interface LeafletInlineViewerProps {
  label: string;
  pages: string[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectPage: (i: number) => void;
  onOpenFullscreen: () => void;
}

export function LeafletInlineViewer({
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

      {/* A4-ish area – CLICKABLE to open fullscreen */}
      <div className="mt-3 flex justify-center">
        <div
          className="relative w-full max-w-[420px] cursor-zoom-in"
          onClick={onOpenFullscreen}
          role="button"
          tabIndex={0}
          aria-label="Open course leaflet in fullscreen"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenFullscreen();
            }
          }}
        >
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
